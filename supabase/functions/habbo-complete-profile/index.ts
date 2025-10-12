// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { username, hotel = 'com.br' } = await req.json();
    
    if (!username) {
      return new Response(JSON.stringify({ error: 'Username is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const hotelDomain = hotel === 'br' ? 'com.br' : hotel;
    const userApiUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(username)}`;
    
    const userResponse = await fetch(userApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return new Response(JSON.stringify({ error: `User '${username}' not found` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userData = await userResponse.json();
    const uniqueId = userData.uniqueId;

    console.log('🔍 [Debug] Dados básicos da API:', {
      name: userData.name,
      motto: userData.motto,
      mottoType: typeof userData.motto,
      mottoLength: userData.motto?.length
    });

    // Fetch all data in parallel
    const [badgesResponse, friendsResponse, groupsResponse, roomsResponse] = await Promise.allSettled([
      fetch(`https://www.habbo.${hotelDomain}/api/public/users/${uniqueId}/badges`, {
        headers: { 'Accept': 'application/json' }
      }),
      fetch(`https://www.habbo.${hotelDomain}/api/public/users/${uniqueId}/friends`, {
        headers: { 'Accept': 'application/json' }
      }),
      fetch(`https://www.habbo.${hotelDomain}/api/public/users/${uniqueId}/groups`, {
        headers: { 'Accept': 'application/json' }
      }),
      fetch(`https://www.habbo.${hotelDomain}/api/public/users/${uniqueId}/rooms`, {
        headers: { 'Accept': 'application/json' }
      })
    ]);

    const badges = badgesResponse.status === 'fulfilled' ? await badgesResponse.value.json().catch(() => []) : [];
    const friends = friendsResponse.status === 'fulfilled' ? await friendsResponse.value.json().catch(() => []) : [];
    const groups = groupsResponse.status === 'fulfilled' ? await groupsResponse.value.json().catch(() => []) : [];
    const rooms = roomsResponse.status === 'fulfilled' ? await roomsResponse.value.json().catch(() => []) : [];

    const completeProfile = {
      uniqueId: userData.uniqueId,
      name: userData.name,
      figureString: userData.figureString,
      motto: userData.motto || '',
      online: userData.online || false,
      lastAccessTime: userData.lastAccessTime || '',
      memberSince: userData.memberSince || '',
      profileVisible: userData.profileVisible !== false,
      photos: [],
      badges: badges,
      selectedBadges: userData.selectedBadges || [],
      friends: friends,
      groups: groups,
      rooms: rooms,
      stats: {
        level: userData.starGemCount || userData.currentLevel || 0,
        levelPercent: userData.currentLevelCompletePercent || 0,
        photosCount: 0,
        badgesCount: badges.length || 0,
        friendsCount: friends.length || 0,
        groupsCount: groups.length || 0,
        roomsCount: rooms.length || 0
      }
    };

    return new Response(JSON.stringify(completeProfile), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});