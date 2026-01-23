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
    const { username, uniqueId, hotel = 'com.br' } = await req.json();
    
    if (!username && !uniqueId) {
      return new Response(JSON.stringify({ error: 'Username or uniqueId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const hotelDomain = hotel === 'br' ? 'com.br' : hotel;
    let userData: any;
    let resolvedUniqueId: string;
    
    // ESTRATÉGIA: Se temos username, SEMPRE buscar por username primeiro para obter o uniqueId correto
    // Se não temos username mas temos uniqueId, usar o uniqueId diretamente
    if (username) {
      // Prioridade 1: Buscar por username para obter o uniqueId correto
      const userApiUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(username)}`;
      
      console.log(`[habbo-complete-profile] 🔍 Buscando usuário por username: ${username} no hotel ${hotelDomain}`);
      
      const userResponse = await fetch(userApiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });

      if (!userResponse.ok) {
        // Se não encontrou no hotel especificado, tentar em todos os hotéis
        console.log(`[habbo-complete-profile] Usuário não encontrado no hotel ${hotelDomain}, tentando em todos os hotéis`);
        const allHotels = ['com.br', 'com', 'es', 'fr', 'de', 'it', 'nl', 'fi', 'com.tr'];
        
        for (const domain of allHotels) {
          try {
            const fallbackUrl = `https://www.habbo.${domain}/api/public/users?name=${encodeURIComponent(username)}`;
            const fallbackResponse = await fetch(fallbackUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
              },
            });
            
            if (fallbackResponse.ok) {
              userData = await fallbackResponse.json();
              resolvedUniqueId = userData.uniqueId;
              console.log(`[habbo-complete-profile] ✅ Usuário encontrado no hotel ${domain}: ${userData.name}, uniqueId: ${resolvedUniqueId}`);
              break;
            }
          } catch (error) {
            continue;
          }
        }
        
        if (!userData) {
          return new Response(JSON.stringify({ error: `User '${username}' not found in any hotel` }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        userData = await userResponse.json();
        resolvedUniqueId = userData.uniqueId;
        console.log(`[habbo-complete-profile] ✅ Usuário encontrado: ${userData.name}, uniqueId: ${resolvedUniqueId}`);
      }
    } else if (uniqueId) {
      // Prioridade 2: Se não temos username, usar uniqueId diretamente
      console.log(`[habbo-complete-profile] 🔍 Buscando usuário por uniqueId: ${uniqueId}`);
      
      // Tentar diferentes formatos de uniqueId
      const uniqueIdFormats = [
        uniqueId, // Formato original
        uniqueId.includes('-') ? uniqueId.split('-').slice(1).join('-') : uniqueId, // Apenas hash
      ];
      
      // Tentar em todos os hotéis
      const allHotels = ['com.br', 'com', 'es', 'fr', 'de', 'it', 'nl', 'fi', 'com.tr'];
      
      for (const domain of allHotels) {
        for (const idFormat of uniqueIdFormats) {
          try {
            const userByIdUrl = `https://www.habbo.${domain}/api/public/users/${encodeURIComponent(idFormat)}`;
            const userByIdResponse = await fetch(userByIdUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
              },
            });
            
            if (userByIdResponse.ok) {
              userData = await userByIdResponse.json();
              resolvedUniqueId = userData.uniqueId || uniqueId;
              console.log(`[habbo-complete-profile] ✅ Usuário encontrado por uniqueId no hotel ${domain}: ${userData.name}, uniqueId: ${resolvedUniqueId}`);
              break;
            }
          } catch (error) {
            continue;
          }
        }
        if (userData) break;
      }
      
      if (!userData) {
        return new Response(JSON.stringify({ error: `User with uniqueId '${uniqueId}' not found` }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    if (!userData || !resolvedUniqueId) {
      return new Response(JSON.stringify({ error: 'Failed to resolve user data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Usar o hotelDomain do usuário encontrado, ou o especificado
    const finalHotelDomain = userData.hotelDomain || hotelDomain;

    console.log('🔍 [Debug] Dados básicos da API:', {
      name: userData.name,
      uniqueId: resolvedUniqueId,
      motto: userData.motto,
      mottoType: typeof userData.motto,
      mottoLength: userData.motto?.length,
      hotelDomain: finalHotelDomain
    });

    // Fetch all data in parallel usando o uniqueId resolvido
    const [badgesResponse, friendsResponse, groupsResponse, roomsResponse] = await Promise.allSettled([
      fetch(`https://www.habbo.${finalHotelDomain}/api/public/users/${encodeURIComponent(resolvedUniqueId)}/badges`, {
        headers: { 'Accept': 'application/json' }
      }),
      fetch(`https://www.habbo.${finalHotelDomain}/api/public/users/${encodeURIComponent(resolvedUniqueId)}/friends`, {
        headers: { 'Accept': 'application/json' }
      }),
      fetch(`https://www.habbo.${finalHotelDomain}/api/public/users/${encodeURIComponent(resolvedUniqueId)}/groups`, {
        headers: { 'Accept': 'application/json' }
      }),
      fetch(`https://www.habbo.${finalHotelDomain}/api/public/users/${encodeURIComponent(resolvedUniqueId)}/rooms`, {
        headers: { 'Accept': 'application/json' }
      })
    ]);

    const badges = badgesResponse.status === 'fulfilled' ? await badgesResponse.value.json().catch(() => []) : [];
    const friends = friendsResponse.status === 'fulfilled' ? await friendsResponse.value.json().catch(() => []) : [];
    const groups = groupsResponse.status === 'fulfilled' ? await groupsResponse.value.json().catch(() => []) : [];
    const rooms = roomsResponse.status === 'fulfilled' ? await roomsResponse.value.json().catch(() => []) : [];
    
    console.log(`[habbo-complete-profile] ✅ Dados obtidos:`, {
      badges: badges.length,
      friends: friends.length,
      groups: groups.length,
      rooms: rooms.length,
      uniqueId: resolvedUniqueId
    });

    const completeProfile = {
      uniqueId: resolvedUniqueId,
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
      hotelDomain: finalHotelDomain,
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