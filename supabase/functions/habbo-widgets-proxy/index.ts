
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

    // Proxy request to HabboWidgets
    const habboWidgetsUrl = `https://www.habbowidgets.com/habinfo_xml/xml_get.php?username=${encodeURIComponent(username)}`;
    
    console.log(`🌐 [Proxy] Fetching data from HabboWidgets for user: ${username}`);
    console.log(`🔗 [URL] ${habboWidgetsUrl}`);
    
    const response = await fetch(habboWidgetsUrl, {
      headers: {
        'User-Agent': 'HabboHub-Console/1.0',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    console.log(`📡 [Response] Status: ${response.status}`);

    if (!response.ok) {
      console.error(`❌ [Error] HabboWidgets responded with status ${response.status}`);
      throw new Error(`HabboWidgets responded with status ${response.status}`);
    }

    const xmlData = await response.text();
    console.log(`📄 [XML] Received ${xmlData.length} characters of XML data`);
    
    // Parse XML to extract ticker information
    const tickerMatches = xmlData.match(/<ticker>(.*?)<\/ticker>/gs);
    const activities = [];
    
    if (tickerMatches) {
      console.log(`🎯 [Parse] Found ${tickerMatches.length} ticker entries`);
      
      for (const match of tickerMatches) {
        const content = match.replace(/<\/?ticker>/g, '');
        const timeMatch = content.match(/\[(\d{2}:\d{2})\]/);
        const time = timeMatch ? timeMatch[1] : 'Unknown';
        const activity = content.replace(/\[\d{2}:\d{2}\]/, '').trim();
        
        if (activity) {
          activities.push({
            time,
            activity,
            timestamp: new Date().toISOString()
          });
        }
      }
    } else {
      console.log(`ℹ️ [Parse] No ticker entries found in XML`);
    }

    console.log(`✅ [Success] Processed ${activities.length} activities for user ${username}`);

    return new Response(
      JSON.stringify({ 
        username,
        activities,
        success: true,
        totalActivities: activities.length
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
