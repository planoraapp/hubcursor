import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

if (import.meta.main) {
  serve(async (req) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const { username, hotel, limit = 50, offset = 0 } = await req.json();
      
      if (!username) {
        return new Response(JSON.stringify({ error: "Username is required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      console.log(`[habbo-optimized-friends-photos] Fetching ${limit} photos (offset: ${offset}) for ${username} on ${hotel}`);

      // 1. Buscar dados do usuário para obter uniqueId
      const userApiUrl = `https://www.habbo.${hotel === "br" ? "com.br" : hotel}/api/public/users?name=${encodeURIComponent(username)}`;
      const userResponse = await fetch(userApiUrl);
      
      if (!userResponse.ok) {
        throw new Error(`User not found: ${username}`);
      }

      const userData = await userResponse.json();
      const uniqueId = userData.uniqueId;

      // 2. Buscar perfil completo para obter lista de amigos
      const profileUrl = `https://www.habbo.${hotel === "br" ? "com.br" : hotel}/api/public/users/${uniqueId}/profile`;
      const profileResponse = await fetch(profileUrl);
      
      if (!profileResponse.ok) {
        throw new Error(`Profile not found for user: ${username}`);
      }

      const profileData = await profileResponse.json();
      const friends = profileData.friends || [];

      console.log(`[habbo-optimized-friends-photos] Found ${friends.length} friends for ${username}`);

      // 3. Filtrar apenas amigos com perfil público
      const publicFriends = friends.filter(friend => friend.profileVisible !== false);
      console.log(`[habbo-optimized-friends-photos] Found ${publicFriends.length} public friends out of ${friends.length} total`);

      if (publicFriends.length === 0) {
        return new Response(JSON.stringify({ 
          photos: [], 
          hasMore: false, 
          nextOffset: 0 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // 4. Configurações otimizadas - buscar mais fotos para melhor ordenação cronológica
      const batchSize = Math.min(publicFriends.length, 10); // Processar até 10 amigos por vez
      const photosPerFriend = 5; // Máximo 5 fotos por amigo para diversidade
      const allPhotosWithMeta = [];

      // 5. Processar amigos em lotes
      for (let i = 0; i < batchSize; i++) {
        const friend = publicFriends[i];
        try {
          const friendPhotosUrl = `https://www.habbo.${hotel === "br" ? "com.br" : hotel}/extradata/public/users/${friend.uniqueId}/photos`;
          const photosResponse = await fetch(friendPhotosUrl);
          
          if (photosResponse.ok) {
            const photosData = await photosResponse.json();
            if (photosData && photosData.length > 0) {
              // Pegar apenas as fotos mais recentes (limitadas)
              const recentPhotos = photosData
                .slice(0, photosPerFriend)
                .map(photo => {
                  let timestamp = Date.now();
                  
                  // Priorizar timestamp mais preciso
                  if (photo.time) {
                    let parsedTime = parseInt(photo.time);
                    if (!isNaN(parsedTime)) {
                      // Converter de segundos para milissegundos se necessário
                      if (parsedTime < 946684800000) { // Antes de 2000
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
                  
                  return {
                    photo,
                    friend,
                    realTimestamp: timestamp
                  };
                });
              
              allPhotosWithMeta.push(...recentPhotos);
              console.log(`[habbo-optimized-friends-photos] Added ${recentPhotos.length} photos from ${friend.name}`);
            }
          }
        } catch (error) {
          console.log(`[habbo-optimized-friends-photos] Could not fetch photos for friend: ${friend.name}`);
        }
      }
      
      // 6. ORDENAÇÃO CRONOLÓGICA CORRETA - mais recente primeiro
      allPhotosWithMeta.sort((a, b) => b.realTimestamp - a.realTimestamp);
      
      console.log(`[habbo-optimized-friends-photos] Total photos collected: ${allPhotosWithMeta.length}`);
      
      // 7. Aplicar paginação
      const startIndex = offset;
      const endIndex = Math.min(startIndex + limit, allPhotosWithMeta.length);
      const paginatedPhotos = allPhotosWithMeta.slice(startIndex, endIndex);
      
      // 8. Converter para formato final
      const finalPhotos = paginatedPhotos.map((item) => {
        const { photo, friend, realTimestamp } = item;
        
        return {
          id: photo.id,
          photo_id: photo.id,
          imageUrl: photo.url.startsWith("//") ? `https:${photo.url}` : photo.url,
          date: new Date(realTimestamp).toLocaleDateString("pt-BR"),
          likes: photo.likesCount || 0,
          userName: friend.name,
          userAvatar: `https://www.habbo.${hotel === "br" ? "com.br" : hotel}/habbo-imaging/avatarimage?figure=${friend.figureString}&size=s&direction=2&head_direction=3&action=std`,
          timestamp: realTimestamp,
          roomName: photo.roomName || "Quarto do jogo",
          caption: photo.caption || ""
        };
      });

      const hasMore = endIndex < allPhotosWithMeta.length;
      const nextOffset = hasMore ? endIndex : 0;

      console.log(`[habbo-optimized-friends-photos] Returning ${finalPhotos.length} photos (hasMore: ${hasMore}, nextOffset: ${nextOffset})`);
      console.log(`[habbo-optimized-friends-photos] First photo timestamp: ${finalPhotos[0]?.timestamp ? new Date(finalPhotos[0].timestamp).toISOString() : 'N/A'}`);

      return new Response(JSON.stringify({
        photos: finalPhotos,
        hasMore,
        nextOffset
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } catch (error) {
      console.error("[habbo-optimized-friends-photos] Error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  });
}
