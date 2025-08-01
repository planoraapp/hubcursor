
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let username;
    
    // Handle both GET and POST requests
    if (req.method === 'GET') {
      const url = new URL(req.url);
      username = url.searchParams.get('username');
      console.log(`📨 [GET Request] Username from query: ${username}`);
    } else if (req.method === 'POST') {
      const body = await req.json();
      username = body.username;
      console.log(`📨 [POST Request] Username from body: ${username}`);
    }
    
    if (!username) {
      console.error('❌ [Error] Username parameter is required');
      return new Response(
        JSON.stringify({ error: 'Username parameter is required', success: false }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // First try to get the general hotel ticker from habbowidgets
    const tickerUrl = 'https://www.habbowidgets.com/ticker/xml.php';
    
    console.log(`🌐 [Proxy] Fetching hotel ticker from HabboWidgets`);
    console.log(`🔗 [URL] ${tickerUrl}`);
    
    const response = await fetch(tickerUrl, {
      headers: {
        'User-Agent': 'HabboHub-Console/1.0',
        'Accept': 'text/xml, application/xml, */*',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    console.log(`📡 [Response] Status: ${response.status}`);

    if (!response.ok) {
      console.error(`❌ [Error] HabboWidgets ticker responded with status ${response.status}`);
      // Fallback to user-specific ticker if general ticker fails
      return await getUserSpecificTicker(username);
    }

    const xmlData = await response.text();
    console.log(`📄 [XML] Received ${xmlData.length} characters of ticker XML data`);
    
    // Parse XML to extract ticker information
    const activities = parseTickerXML(xmlData);
    
    console.log(`✅ [Success] Processed ${activities.length} activities from hotel ticker`);

    return new Response(
      JSON.stringify({ 
        username: 'hotel-ticker',
        activities,
        success: true,
        totalActivities: activities.length,
        source: 'hotel-ticker'
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('💥 [Fatal Error] in habbo-widgets-proxy:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false,
        details: error.stack
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function getUserSpecificTicker(username: string) {
  try {
    const habboWidgetsUrl = `https://www.habbowidgets.com/habinfo_xml/xml_get.php?username=${encodeURIComponent(username)}`;
    
    console.log(`🔄 [Fallback] Trying user-specific ticker for: ${username}`);
    console.log(`🔗 [URL] ${habboWidgetsUrl}`);
    
    const response = await fetch(habboWidgetsUrl, {
      headers: {
        'User-Agent': 'HabboHub-Console/1.0',
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`User ticker responded with status ${response.status}`);
    }

    const xmlData = await response.text();
    const tickerMatches = xmlData.match(/<ticker>(.*?)<\/ticker>/gs);
    const activities = [];
    
    if (tickerMatches) {
      for (const match of tickerMatches) {
        const content = match.replace(/<\/?ticker>/g, '');
        const timeMatch = content.match(/\[(\d{2}:\d{2})\]/);
        const time = timeMatch ? timeMatch[1] : 'Unknown';
        const activity = content.replace(/\[\d{2}:\d{2}\]/, '').trim();
        
        if (activity) {
          activities.push({
            time,
            activity,
            timestamp: new Date().toISOString(),
            username: username
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        username,
        activities,
        success: true,
        totalActivities: activities.length,
        source: 'user-specific'
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    throw error;
  }
}

function parseTickerXML(xmlData: string) {
  const activities = [];
  
  try {
    // Look for different XML patterns that HabboWidgets might use
    const patterns = [
      /<ticker[^>]*>(.*?)<\/ticker>/gs,
      /<activity[^>]*>(.*?)<\/activity>/gs,
      /<item[^>]*>(.*?)<\/item>/gs
    ];
    
    for (const pattern of patterns) {
      const matches = xmlData.match(pattern);
      if (matches && matches.length > 0) {
        console.log(`📊 [Parse] Found ${matches.length} matches with pattern`);
        
        for (const match of matches) {
          // Extract username if present
          const usernameMatch = match.match(/user[="']([^"']+)["']/i) || 
                               match.match(/>([^<]+)\s+(entrou|saiu|ganhou|comprou|fez)/i);
          const username = usernameMatch ? usernameMatch[1].trim() : `Usuario${Math.floor(Math.random() * 1000)}`;
          
          // Extract time
          const timeMatch = match.match(/\[?(\d{1,2}:\d{2})\]?/) || 
                           match.match(/time[="']([^"']+)["']/i);
          const time = timeMatch ? timeMatch[1] : new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          
          // Extract activity text
          const content = match.replace(/<[^>]*>/g, '').trim();
          const activity = content.replace(/\[\d{1,2}:\d{2}\]/, '').trim();
          
          if (activity && activity.length > 3) {
            activities.push({
              time,
              activity,
              timestamp: new Date().toISOString(),
              username: username
            });
          }
        }
        
        if (activities.length > 0) break; // Use first successful pattern
      }
    }
    
    // If no structured data found, try to extract any meaningful text
    if (activities.length === 0) {
      console.log('🔍 [Parse] No structured data found, trying text extraction...');
      const lines = xmlData.split('\n').filter(line => line.trim().length > 10);
      
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const line = lines[i].replace(/<[^>]*>/g, '').trim();
        if (line && !line.includes('<?xml') && !line.includes('<!')) {
          activities.push({
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            activity: line,
            timestamp: new Date(Date.now() - (i * 60000)).toISOString(),
            username: `HabboUser${i + 1}`
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ [Parse] Error parsing ticker XML:', error);
  }
  
  console.log(`📊 [Parse] Final activities extracted: ${activities.length}`);
  return activities.slice(0, 50); // Limit to 50 activities
}
