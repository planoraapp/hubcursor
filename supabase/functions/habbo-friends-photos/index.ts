
Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { username, hotel } = await req.json();
    
    if (!username) {
      return new Response(JSON.stringify({ error: 'Username is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`[habbo-friends-photos] Fetching friends photos for ${username} on ${hotel}`);

    // 1. Buscar dados do usuário para obter uniqueId
    const userApiUrl = `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/api/public/users?name=${encodeURIComponent(username)}`;
    const userResponse = await fetch(userApiUrl);
    
    if (!userResponse.ok) {
      throw new Error(`User not found: ${username}`);
    }

    const userData = await userResponse.json();
    const uniqueId = userData.uniqueId;

    // 2. Buscar perfil completo para obter lista de amigos
    const profileUrl = `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/api/public/users/${uniqueId}/profile`;
    const profileResponse = await fetch(profileUrl);
    
    if (!profileResponse.ok) {
      throw new Error(`Profile not found for user: ${username}`);
    }

    const profileData = await profileResponse.json();
    const friends = profileData.friends || [];

    console.log(`[habbo-friends-photos] Found ${friends.length} friends for ${username}`);

    // 3. Buscar fotos dos primeiros 20 amigos
    const friendsToProcess = friends.slice(0, 20);
    const allPhotos: any[] = [];

    for (const friend of friendsToProcess) {
      try {
        const friendPhotosUrl = `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/extradata/public/users/${friend.uniqueId}/photos`;
        const photosResponse = await fetch(friendPhotosUrl);
        
        if (photosResponse.ok) {
          const photosData = await photosResponse.json();
          
          // Pegar apenas as 5 fotos mais recentes de cada amigo
          const recentPhotos = photosData.slice(0, 5).map((photo: any) => {
            // Parse timestamp correctly - use 'time' field instead of 'creationTime'
            let timestamp = Date.now();
            if (photo.time) {
              // Handle Unix timestamp (seconds) vs milliseconds
              let parsedTime = parseInt(photo.time);
              if (!isNaN(parsedTime)) {
                // If timestamp is in seconds (less than year 2000 in milliseconds), convert to milliseconds
                if (parsedTime < 946684800000) {
                  parsedTime = parsedTime * 1000;
                }
                timestamp = parsedTime;
              }
            } else if (photo.creationTime) {
              const parsedTime = new Date(photo.creationTime).getTime();
              if (!isNaN(parsedTime)) {
                timestamp = parsedTime;
              }
            }
            
            console.log(`[habbo-friends-photos] Photo ${photo.id} time: ${photo.time} -> ${new Date(timestamp).toISOString()}`);
            
            return {
              id: photo.id,
              imageUrl: photo.url.startsWith('//') ? `https:${photo.url}` : photo.url,
              date: new Date(timestamp).toLocaleDateString('pt-BR'),
              likes: photo.likesCount || 0,
              userName: friend.name,
              userAvatar: `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/habbo-imaging/avatarimage?figure=${friend.figureString}&size=s&direction=2&head_direction=3&action=std`,
              timestamp: timestamp
            };
          });
          
          allPhotos.push(...recentPhotos);
        }
      } catch (error) {
        console.log(`[habbo-friends-photos] Could not fetch photos for friend: ${friend.name}`);
      }
    }

    // 4. Ordenar todas as fotos por data (mais recentes primeiro)
    allPhotos.sort((a, b) => b.timestamp - a.timestamp);

    // 5. Limitar a 100 fotos para performance
    const finalPhotos = allPhotos.slice(0, 100);

    console.log(`[habbo-friends-photos] Returning ${finalPhotos.length} photos from ${friendsToProcess.length} friends`);

    return new Response(JSON.stringify(finalPhotos), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('[habbo-friends-photos] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
