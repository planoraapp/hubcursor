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
    const url = new URL(req.url);
    const username = url.searchParams.get('username');
    
    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username parameter is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Proxy request to HabboWidgets
    const habboWidgetsUrl = `https://www.habbowidgets.com/habinfo_xml/xml_get.php?username=${encodeURIComponent(username)}`;
    
    console.log(`Fetching data from HabboWidgets for user: ${username}`);
    
    const response = await fetch(habboWidgetsUrl, {
      headers: {
        'User-Agent': 'HabboHub-Console/1.0',
      }
    });

    if (!response.ok) {
      throw new Error(`HabboWidgets responded with status ${response.status}`);
    }

    const xmlData = await response.text();
    
    // Parse XML to extract ticker information
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
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    console.log(`Found ${activities.length} activities for user ${username}`);

    return new Response(
      JSON.stringify({ 
        username,
        activities,
        success: true 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in habbo-widgets-proxy:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});