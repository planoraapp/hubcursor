
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
    const action = url.searchParams.get('action');
    const username = url.searchParams.get('username');
    const hotel = url.searchParams.get('hotel') || 'com.br';

    console.log(`[Habbo API Proxy] Action: ${action}, Username: ${username}, Hotel: ${hotel}`);

    let apiUrl = '';
    let response;

    switch (action) {
      case 'getUserProfile':
        if (!username) {
          throw new Error('Username is required for getUserProfile');
        }
        apiUrl = `https://www.habbo.${hotel}/api/public/users?name=${encodeURIComponent(username)}`;
        break;

      case 'getUserBadges':
        if (!username) {
          throw new Error('Username is required for getUserBadges');
        }
        apiUrl = `https://www.habbo.${hotel}/api/public/users/${encodeURIComponent(username)}/profile`;
        break;

      case 'getUserPhotos':
        if (!username) {
          throw new Error('Username is required for getUserPhotos');
        }
        apiUrl = `https://www.habbo.${hotel}/api/public/users/${encodeURIComponent(username)}/photos`;
        break;

      case 'getTicker':
        // Mock ticker data for now - replace with real API when available
        return new Response(JSON.stringify({
          activities: [
            { type: 'login', username: 'Beebop', time: new Date().toISOString() },
            { type: 'achievement', username: 'HabboFan', achievement: 'Primeira semana!', time: new Date(Date.now() - 300000).toISOString() },
            { type: 'friend', username: 'GameMaster', friend: 'NewPlayer', time: new Date(Date.now() - 600000).toISOString() }
          ]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`[Habbo API Proxy] Fetching: ${apiUrl}`);

    response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[Habbo API Proxy] HTTP error: ${response.status} ${response.statusText}`);
      
      if (response.status === 404) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Habbo API Proxy] Success for ${action}`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`[Habbo API Proxy] Error:`, error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
