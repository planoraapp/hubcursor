
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
        // First get user profile to get uniqueId
        const userProfileForBadges = await fetchUserProfile(username, hotel);
        if (!userProfileForBadges) {
          throw new Error('User not found');
        }
        apiUrl = `https://www.habbo.${hotel}/api/public/users/${userProfileForBadges.uniqueId}/profile`;
        break;

      case 'getUserPhotos':
        if (!username) {
          throw new Error('Username is required for getUserPhotos');
        }
        // First get user profile to get uniqueId
        const userProfileForPhotos = await fetchUserProfile(username, hotel);
        if (!userProfileForPhotos) {
          throw new Error('User not found');
        }
        apiUrl = `https://www.habbo.${hotel}/api/public/users/${userProfileForPhotos.uniqueId}/photos`;
        break;

      case 'getUserFriends':
        if (!username) {
          throw new Error('Username is required for getUserFriends');
        }
        // First get user profile to get uniqueId
        const userProfileForFriends = await fetchUserProfile(username, hotel);
        if (!userProfileForFriends) {
          throw new Error('User not found');
        }
        apiUrl = `https://www.habbo.${hotel}/api/public/users/${userProfileForFriends.uniqueId}/friends`;
        break;

      case 'getHotelTicker':
        // Mock hotel ticker data - fallback when widgets proxy fails
        const mockHotelActivities = [
          { username: 'Beebop', description: 'entrou no hotel', time: new Date().toISOString() },
          { username: 'HabboFan', description: 'conquistou o emblema "Primeira semana!"', time: new Date(Date.now() - 300000).toISOString() },
          { username: 'GameMaster', description: 'fez amizade com NewPlayer', time: new Date(Date.now() - 600000).toISOString() },
          { username: 'StarPlayer', description: 'entrou no hotel', time: new Date(Date.now() - 900000).toISOString() },
          { username: 'ProGamer', description: 'conquistou o emblema "Mestre dos jogos!"', time: new Date(Date.now() - 1200000).toISOString() },
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
            { username: 'Beebop', description: 'entrou no hotel', time: new Date().toISOString() },
            { username: 'HabboFan', description: 'conquistou o emblema "Primeira semana!"', time: new Date(Date.now() - 300000).toISOString() },
            { username: 'GameMaster', description: 'fez amizade com NewPlayer', time: new Date(Date.now() - 600000).toISOString() }
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

async function fetchUserProfile(username: string, hotel: string) {
  try {
    const apiUrl = `https://www.habbo.${hotel}/api/public/users?name=${encodeURIComponent(username)}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[Habbo API Proxy] Error fetching user profile for ${username}:`, error);
    return null;
  }
}
