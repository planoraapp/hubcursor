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
      const { username, hotel, limit = 300, offset = 0 } = await req.json();
      
      if (!username) {
        return new Response(JSON.stringify({ error: "Username is required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Normalizar hotel: 'ptbr' -> 'br' (a API do Habbo usa 'com.br' para Brasil/Portugal)
      const normalizedHotel = hotel === 'ptbr' ? 'br' : hotel;

      console.log(`[habbo-optimized-friends-photos] Fetching ${limit} photos (offset: ${offset}) for ${username} on ${normalizedHotel} (original: ${hotel})`);

      // 1. Buscar dados do usuário para obter uniqueId
      const userApiUrl = `https://www.habbo.${normalizedHotel === "br" ? "com.br" : normalizedHotel}/api/public/users?name=${encodeURIComponent(username)}`;
      const userResponse = await fetch(userApiUrl);
      
      if (!userResponse.ok) {
        throw new Error(`User not found: ${username}`);
      }

      const userData = await userResponse.json();
      const uniqueId = userData.uniqueId;

      // 2. Buscar perfil completo para obter lista de amigos
      const profileUrl = `https://www.habbo.${normalizedHotel === "br" ? "com.br" : normalizedHotel}/api/public/users/${uniqueId}/profile`;
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

      // 4. PROCESSAR TODOS OS AMIGOS - necessário para encontrar fotos mais recentes em ordem correta
      const friendsToProcess = publicFriends; // Processar TODOS os amigos públicos
      const allPhotosWithMeta = [];

      console.log(`[habbo-optimized-friends-photos] Processing ${friendsToProcess.length} public friends`);
      console.log(`[habbo-optimized-friends-photos] Friends list (first 10):`, friendsToProcess.slice(0, 10).map(f => f.name));

      // 5. Processar amigos em paralelo com limitação de concorrência
      const CONCURRENT_LIMIT = 10; // 10 por batch para melhor performance
      for (let i = 0; i < friendsToProcess.length; i += CONCURRENT_LIMIT) {
        const batch = friendsToProcess.slice(i, i + CONCURRENT_LIMIT);
        
        // Processar batch em paralelo
        await Promise.all(batch.map(async (friend) => {
          try {
            const friendPhotosUrl = `https://www.habbo.${normalizedHotel === "br" ? "com.br" : normalizedHotel}/extradata/public/users/${friend.uniqueId}/photos`;
            const photosResponse = await fetch(friendPhotosUrl);
            
            if (photosResponse.ok) {
              const photosData = await photosResponse.json();
              if (photosData && photosData.length > 0) {
                // OTIMIZAÇÃO: Processar apenas as primeiras 10 fotos de cada amigo (as mais recentes)
                const maxPhotosPerFriend = 10;
                const recentPhotos = photosData.slice(0, maxPhotosPerFriend);
                
                // Mapear apenas fotos recentes com timestamps
                const photosWithTimestamps = recentPhotos.map(photo => {
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
                  } else if (photo.url) {
                    // Extrair timestamp do nome do arquivo se não houver timestamp explícito
                    // Padrão: p-464837-1760409069755.png (o último número é o timestamp)
                    const match = photo.url.match(/p-\d+-(\d+)\./);
                    if (match && match[1]) {
                      const extractedTimestamp = parseInt(match[1]);
                      if (!isNaN(extractedTimestamp) && extractedTimestamp > 946684800000) {
                        timestamp = extractedTimestamp;
                      }
                    }
                  }
                  
                  return {
                    photo,
                    friend,
                    realTimestamp: timestamp
                  };
                });
                
                // ORDENAR as fotos por timestamp (mais recente primeiro) - SEM FILTRO DE DATA
                const sortedPhotos = photosWithTimestamps
                  .sort((a, b) => b.realTimestamp - a.realTimestamp);
                
                // Adicionar fotos processadas
                allPhotosWithMeta.push(...sortedPhotos);
              }
            }
          } catch (error) {
            console.log(`[habbo-optimized-friends-photos] Could not fetch photos for friend: ${friend.name}`);
          }
        }));
      }
      
      // 6. ORDENAÇÃO CRONOLÓGICA GLOBAL - mais recente primeiro
      allPhotosWithMeta.sort((a, b) => b.realTimestamp - a.realTimestamp);
      
      console.log(`[habbo-optimized-friends-photos] ====== TOTAL COLLECTED: ${allPhotosWithMeta.length} photos ======`);
      
      // 7. SEM FILTRO DE DATA - mostrar todas as fotos ordenadas por data
      const photosToShow = allPhotosWithMeta;
      
      console.log(`[habbo-optimized-friends-photos] ====== SHOWING ALL PHOTOS ======`);
      console.log(`[habbo-optimized-friends-photos] Total collected: ${allPhotosWithMeta.length}`);
      console.log(`[habbo-optimized-friends-photos] No date filter applied - showing all photos`);
      
      // Log das primeiras 3 fotos para debug
      if (allPhotosWithMeta.length > 0) {
        const first3 = allPhotosWithMeta.slice(0, 3);
        console.log(`[habbo-optimized-friends-photos] First 3 photos (most recent):`);
        first3.forEach((p, i) => {
          const date = new Date(p.realTimestamp);
          const now = Date.now();
          const diffHours = Math.floor((now - p.realTimestamp) / (1000 * 60 * 60));
          console.log(`  ${i + 1}. ${p.friend.name} - ${date.toLocaleString('pt-BR')} (há ~${diffHours}h)`);
        });
      }
      
      // 8. Aplicar paginação nas fotos selecionadas
      const startIndex = offset;
      const endIndex = Math.min(startIndex + limit, photosToShow.length);
      const paginatedPhotos = photosToShow.slice(startIndex, endIndex);
      
      console.log(`[habbo-optimized-friends-photos] Pagination: showing photos ${startIndex} to ${endIndex} of ${photosToShow.length}`);
      
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
          userAvatar: `https://www.habbo.${normalizedHotel === "br" ? "com.br" : normalizedHotel}/habbo-imaging/avatarimage?figure=${friend.figureString}&size=s&direction=2&head_direction=3&action=std`,
          timestamp: realTimestamp,
          roomName: photo.roomName || "Quarto do jogo",
          caption: photo.caption || ""
        };
      });

      const hasMore = endIndex < photosToShow.length;
      const nextOffset = hasMore ? endIndex : 0;
      
      console.log(`[habbo-optimized-friends-photos] ====== PHOTOS SUMMARY ======`);
      console.log(`[habbo-optimized-friends-photos] Total friends processed: ${friendsToProcess.length}`);
      console.log(`[habbo-optimized-friends-photos] Total photos collected: ${allPhotosWithMeta.length}`);
      console.log(`[habbo-optimized-friends-photos] Photos returned: ${finalPhotos.length}`);
      console.log(`[habbo-optimized-friends-photos] Most recent photo: ${finalPhotos[0]?.userName || 'N/A'} - ${finalPhotos[0]?.date || 'N/A'}`);

      console.log(`[habbo-optimized-friends-photos] Returning ${finalPhotos.length} photos (hasMore: ${hasMore}, nextOffset: ${nextOffset})`);
      console.log(`[habbo-optimized-friends-photos] First photo timestamp: ${finalPhotos[0]?.timestamp ? new Date(finalPhotos[0].timestamp).toISOString() : 'N/A'}`);
      console.log(`[habbo-optimized-friends-photos] Limit requested: ${limit}, Total photos available: ${allPhotosWithMeta.length}`);

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