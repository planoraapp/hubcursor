
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

    // 3. Enhanced chronological photo system with alphabetical diversity
    const totalFriends = friends.length;
    console.log(`[habbo-friends-photos] Analisando fotos cronológicas de ${totalFriends} amigos`);
    
    // Alphabetical diversity system - rotate hourly
    const currentHour = new Date().getHours();
    const alphabetGroups = [
      ['A', 'B', 'C', 'D', 'E'], // Group 0
      ['F', 'G', 'H', 'I', 'J'], // Group 1
      ['K', 'L', 'M', 'N', 'O'], // Group 2
      ['P', 'Q', 'R', 'S', 'T'], // Group 3
      ['U', 'V', 'W', 'X', 'Y', 'Z'] // Group 4
    ];
    
    const currentGroup = currentHour % alphabetGroups.length;
    const targetLetters = alphabetGroups[currentGroup];
    
    console.log(`[habbo-friends-photos] Hora ${currentHour}, grupo ${currentGroup}, letras: ${targetLetters.join(',')}`);
    
    // Prioritize friends from current alphabetical group
    const priorityFriends = friends.filter(friend => 
      targetLetters.some(letter => friend.name.toUpperCase().startsWith(letter))
    );
    
    const otherFriends = friends.filter(friend => 
      !targetLetters.some(letter => friend.name.toUpperCase().startsWith(letter))
    );
    
    // Combine priority friends first, then others
    const orderedFriends = [...priorityFriends, ...otherFriends];
    
    // Primeiro, coletar todas as fotos com timestamps reais
    const allPhotosWithMeta: Array<{
      photo: any,
      friend: any,
      realTimestamp: number
    }> = [];

    // Processar em lotes menores para performance - priorizar primeiros 30 amigos
    const batchSize = 30;
    for (let i = 0; i < Math.min(orderedFriends.length, batchSize); i++) {
      const friend = orderedFriends[i];
      try {
        const friendPhotosUrl = `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/extradata/public/users/${friend.uniqueId}/photos`;
        const photosResponse = await fetch(friendPhotosUrl);
        
        if (photosResponse.ok) {
          const photosData = await photosResponse.json();
          if (photosData && photosData.length > 0) {
            // Process ALL photos to get real timestamps (not just metadata)
            for (const photo of photosData) {
              let timestamp = Date.now();
              if (photo.time) {
                let parsedTime = parseInt(photo.time);
                if (!isNaN(parsedTime)) {
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
              
              allPhotosWithMeta.push({
                photo,
                friend,
                realTimestamp: timestamp
              });
            }
          }
        }
      } catch (error) {
        console.log(`[habbo-friends-photos] Could not fetch photos for friend: ${friend.name}`);
      }
    }
    
    // 4. Sort ALL collected photos by real timestamp (most recent first)
    allPhotosWithMeta.sort((a, b) => b.realTimestamp - a.realTimestamp);
    
    console.log(`[habbo-friends-photos] Total photos collected: ${allPhotosWithMeta.length}, now sorting chronologically`);
    
    // 5. Convert to final format
    const allPhotos = allPhotosWithMeta.map((item) => {
      const { photo, friend, realTimestamp } = item;
      
      console.log(`[habbo-friends-photos] Photo ${photo.id} final time: ${photo.time} -> ${new Date(realTimestamp).toISOString()}`);
      
      return {
        id: photo.id,
        imageUrl: photo.url.startsWith('//') ? `https:${photo.url}` : photo.url,
        date: new Date(realTimestamp).toLocaleDateString('pt-BR'),
        likes: photo.likesCount || 0,
        userName: friend.name,
        userAvatar: `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/habbo-imaging/avatarimage?figure=${friend.figureString}&size=s&direction=2&head_direction=3&action=std`,
        timestamp: realTimestamp
      };
    });

    // 6. Limit to 100 most recent photos for performance
    const finalPhotos = allPhotos.slice(0, 100);

    console.log(`[habbo-friends-photos] Returning ${finalPhotos.length} chronologically sorted photos from ${batchSize} friends with alphabetical diversity`);

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
