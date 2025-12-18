
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HabboPhoto {
  id: string;
  photo_id: string;
  imageUrl: string;
  date: string;
  likes: number;
  timestamp?: number;
  roomName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, hotel = 'br', forceRefresh = false, uniqueId: incomingUniqueId } = await req.json();
    
    console.log(`[habbo-photos-scraper] ====== NEW API APPROACH ======`);
    console.log(`[habbo-photos-scraper] Username: ${username}`);
    console.log(`[habbo-photos-scraper] Hotel: ${hotel}`);
    console.log(`[habbo-photos-scraper] Force refresh: ${forceRefresh}`);
    console.log(`[habbo-photos-scraper] Incoming uniqueId: ${incomingUniqueId}`);
    
    if (!username && !incomingUniqueId) {
      console.error('[habbo-photos-scraper] No username or uniqueId provided');
      return new Response(JSON.stringify({ error: 'Username or uniqueId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Resolver hotelDomain
    const hotelDomain = hotel === 'br' ? 'com.br' : hotel;
    let resolvedUniqueId: string | null = incomingUniqueId || null;

    // Step 1: Se não recebemos uniqueId, buscar via API pública por nome
    if (!resolvedUniqueId) {
      const userApiUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(username)}`;
      
      console.log(`[habbo-photos-scraper] Fetching user data from: ${userApiUrl}`);
      
      const userResponse = await fetch(userApiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });

      if (!userResponse.ok) {
        console.error(`[habbo-photos-scraper] Failed to fetch user data by name: ${userResponse.status}`);
        // Usuário não encontrado ou erro na API: retornar lista vazia em vez de 404
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const userData = await userResponse.json();
      resolvedUniqueId = userData.uniqueId || null;
    }

    if (!resolvedUniqueId) {
      console.error(`[habbo-photos-scraper] No uniqueId available for user: ${username}`);
      // Sem uniqueId válido: tratar como \"sem fotos\" em vez de erro 404
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[habbo-photos-scraper] Using uniqueId: ${resolvedUniqueId}`);

    // Step 2: Get photos using the discovered API endpoint
    const photosApiUrl = `https://www.habbo.${hotelDomain}/extradata/public/users/${resolvedUniqueId}/photos`;
    
    console.log(`[habbo-photos-scraper] Fetching photos from: ${photosApiUrl}`);
    
    const photosResponse = await fetch(photosApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!photosResponse.ok) {
      console.error(`[habbo-photos-scraper] Failed to fetch photos: ${photosResponse.status}`);
      // Mesmo se a API de fotos falhar, responder com lista vazia e status 200
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const photosData = await photosResponse.json();
    console.log(`[habbo-photos-scraper] Raw photos data (first 2):`, photosData.slice(0, 2));
    console.log(`[habbo-photos-scraper] Total photos: ${photosData.length}`);

    // Step 3: Transform photos to our format
    const photos: HabboPhoto[] = photosData.map((photo: any) => {
      // Determinar o timestamp correto da foto
      let timestamp = Date.now();
      
      // Priorizar timestamp em milissegundos
      if (photo.creationTime) {
        const parsedTime = new Date(photo.creationTime).getTime();
        if (!isNaN(parsedTime)) {
          timestamp = parsedTime;
        }
      } else if (photo.time) {
        // Se há campo 'time', pode ser timestamp em segundos ou milissegundos
        const parsedTime = parseInt(photo.time);
        if (!isNaN(parsedTime)) {
          // Se menor que timestamp de 2000, provavelmente está em segundos
          timestamp = parsedTime < 946684800000 ? parsedTime * 1000 : parsedTime;
        }
      } else if (photo.url || photo.imageUrl) {
        // Extrair timestamp do nome do arquivo se não houver timestamp explícito
        // Padrão: p-464837-1760409069755.png (o último número é o timestamp)
        const url = photo.url || photo.imageUrl;
        const match = url.match(/p-\d+-(\d+)\./);
        if (match && match[1]) {
          const extractedTimestamp = parseInt(match[1]);
          if (!isNaN(extractedTimestamp) && extractedTimestamp > 946684800000) {
            // Verificar se é um timestamp válido (após 2000)
            timestamp = extractedTimestamp;
            console.log(`[habbo-photos-scraper] Extracted timestamp ${timestamp} (${new Date(timestamp).toLocaleDateString('pt-BR')}) from URL: ${url.substring(0, 100)}`);
          }
        }
      }
      
      // Formatar a data corretamente
      const formattedDate = new Date(timestamp).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      return {
        id: photo.id || `photo-${Date.now()}-${Math.random()}`,
        photo_id: photo.id || photo.photoId || '',
        imageUrl: photo.url || photo.imageUrl || '',
        date: formattedDate,
        likes: photo.likesCount || photo.likes || 0,
        timestamp: timestamp,
        roomName: photo.roomName || photo.room?.name || 'Quarto do jogo'
      };
    });

    console.log(`[habbo-photos-scraper] ====== SUCCESS ======`);
    console.log(`[habbo-photos-scraper] Processed ${photos.length} photos for ${username}`);
    console.log(`[habbo-photos-scraper] Sample photo:`, photos[0] || 'No photos');

    return new Response(JSON.stringify(photos), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`[habbo-photos-scraper] Fatal error:`, error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      photos: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

