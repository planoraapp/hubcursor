
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
    const { username, hotel = 'br', forceRefresh = false } = await req.json();
    
    console.log(`[habbo-photos-scraper] ====== NEW API APPROACH ======`);
    console.log(`[habbo-photos-scraper] Username: ${username}`);
    console.log(`[habbo-photos-scraper] Hotel: ${hotel}`);
    console.log(`[habbo-photos-scraper] Force refresh: ${forceRefresh}`);
    
    if (!username) {
      console.error('[habbo-photos-scraper] No username provided');
      return new Response(JSON.stringify({ error: 'Username is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Get user's uniqueId from official API
    const hotelDomain = hotel === 'br' ? 'com.br' : hotel;
    const userApiUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(username)}`;
    
    console.log(`[habbo-photos-scraper] Fetching user data from: ${userApiUrl}`);
    
    const userResponse = await fetch(userApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!userResponse.ok) {
      console.error(`[habbo-photos-scraper] Failed to fetch user data: ${userResponse.status}`);
      return new Response(JSON.stringify({ error: `User '${username}' not found` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userData = await userResponse.json();
    const uniqueId = userData.uniqueId;

    if (!uniqueId) {
      console.error(`[habbo-photos-scraper] No uniqueId found for user: ${username}`);
      return new Response(JSON.stringify({ error: `User '${username}' has no uniqueId` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[habbo-photos-scraper] Found uniqueId: ${uniqueId}`);

    // Step 2: Get photos using the discovered API endpoint
    const photosApiUrl = `https://www.habbo.${hotelDomain}/extradata/public/users/${uniqueId}/photos`;
    
    console.log(`[habbo-photos-scraper] Fetching photos from: ${photosApiUrl}`);
    
    const photosResponse = await fetch(photosApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!photosResponse.ok) {
      console.error(`[habbo-photos-scraper] Failed to fetch photos: ${photosResponse.status}`);
      return new Response(JSON.stringify([]), {
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

