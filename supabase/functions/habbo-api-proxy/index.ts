
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
    let action: string | null = null;
    let username: string | null = null;
    let hotel: string = 'com.br';

    // Handle both GET (with URL params) and POST (with JSON body)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      action = url.searchParams.get('action');
      username = url.searchParams.get('username');
      hotel = url.searchParams.get('hotel') || 'com.br';
    } else if (req.method === 'POST') {
      try {
        const body = await req.json();
        action = body.action;
        username = body.username;
        hotel = body.hotel || 'com.br';
      } catch (e) {
        console.error('[Habbo API Proxy] Error parsing JSON body:', e);
      }
    }

    console.log(`[Habbo API Proxy] Action: ${action}, Username: ${username}, Hotel: ${hotel}`);

    if (!action) {
      throw new Error('Action parameter is required');
    }

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

      case 'getUserFriends':
        if (!username) {
          throw new Error('Username is required for getUserFriends');
        }
        apiUrl = `https://www.habbo.${hotel}/api/public/users/${encodeURIComponent(username)}/friends`;
        break;

      case 'getHotelTicker':
        // Mock hotel ticker data - replace with real API when available
        const mockHotelActivities = [
          { type: 'login', username: 'Beebop', time: new Date().toISOString() },
          { type: 'achievement', username: 'HabboFan', achievement: 'Primeira semana!', time: new Date(Date.now() - 300000).toISOString() },
          { type: 'friend', username: 'GameMaster', friend: 'NewPlayer', time: new Date(Date.now() - 600000).toISOString() },
          { type: 'login', username: 'StarPlayer', time: new Date(Date.now() - 900000).toISOString() },
          { type: 'achievement', username: 'ProGamer', achievement: 'Mestre dos jogos!', time: new Date(Date.now() - 1200000).toISOString() },
        ];
        
        return new Response(JSON.stringify({
          activities: mockHotelActivities
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'getTicker':
        // Mock ticker data for general use
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
