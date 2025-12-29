
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
  roomId?: string | number;
}

// Função auxiliar para buscar nome do quarto via API
async function getRoomName(roomId: string | number, hotelDomain: string): Promise<string | null> {
  try {
    const url = `https://www.habbo.${hotelDomain}/api/public/rooms/${roomId}`;
    console.log(`[habbo-photos-scraper] 🔍 Buscando nome do quarto ${roomId} no hotel ${hotelDomain}`);
    
    const response = await fetch(url, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HabboHubBot/1.0'
      }
    });
    
    if (response.ok) {
      const roomData = await response.json();
      if (roomData && roomData.name) {
        console.log(`[habbo-photos-scraper] ✅ Nome do quarto ${roomId} encontrado: "${roomData.name}"`);
        return roomData.name;
      } else {
        console.log(`[habbo-photos-scraper] ⚠️ Quarto ${roomId} retornou sem nome`);
      }
    } else if (response.status === 404) {
      // Quarto não existe mais - retornar null para usar fallback
      console.log(`[habbo-photos-scraper] ⚠️ Quarto ${roomId} não encontrado (404)`);
    } else {
      console.log(`[habbo-photos-scraper] ❌ Erro ${response.status} ao buscar quarto ${roomId}: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`[habbo-photos-scraper] ❌ Erro de rede ao buscar quarto ${roomId}:`, error);
  }
  return null;
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

    // Step 3: Transform photos to our format (primeiro mapear sem buscar nomes de quartos)
    const photosWithRoomIds: Array<HabboPhoto & { _roomIdToFetch?: string | number; _hotelDomain: string }> = photosData.map((photo: any) => {
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
      
      // Tentar obter room_id de diferentes fontes (priorizar room_id com underscore como na API global)
      let roomId: string | number | null = photo.room_id || photo.roomId || photo.room?.id || photo.room?.room_id || null;
      
      // Converter para string se existir
      if (roomId !== null && roomId !== undefined) {
        roomId = String(roomId);
      }
      
      // Formatar roomName: se houver room_id, usar "Room {room_id}", senão usar roomName original ou fallback
      const roomName = roomId ? `Room ${roomId}` : (photo.roomName || photo.room?.name || 'Quarto do jogo');
      
      return {
        id: photo.id || `photo-${Date.now()}-${Math.random()}`,
        photo_id: photo.id || photo.photoId || '',
        imageUrl: photo.url || photo.imageUrl || '',
        date: formattedDate,
        likes: photo.likesCount || photo.likes || 0,
        timestamp: timestamp,
        roomName: roomName,
        roomId: roomId, // Incluir roomId como string se disponível
        _roomIdToFetch: roomId || undefined, // Para busca posterior
        _hotelDomain: hotelDomain // Para busca posterior
      };
    });

    // Step 4: Buscar nomes dos quartos em paralelo (limitando concorrência)
    console.log(`[habbo-photos-scraper] Buscando nomes de quartos para ${photosWithRoomIds.length} fotos...`);
    const CONCURRENT_ROOM_FETCHES = 5;
    const roomFetchPromises: Promise<void>[] = [];
    let roomsFound = 0;
    let roomsNotFound = 0;
    let roomsError = 0;
    
    for (let i = 0; i < photosWithRoomIds.length; i += CONCURRENT_ROOM_FETCHES) {
      const batch = photosWithRoomIds.slice(i, i + CONCURRENT_ROOM_FETCHES);
      const batchPromises = batch.map(async (photo) => {
        if (photo._roomIdToFetch && photo._hotelDomain) {
          const roomName = await getRoomName(photo._roomIdToFetch, photo._hotelDomain);
          if (roomName) {
            photo.roomName = roomName;
            roomsFound++;
          } else {
            roomsNotFound++;
          }
        } else {
          roomsError++;
        }
      });
      roomFetchPromises.push(...batchPromises);
    }
    
    // Aguardar todas as buscas de nomes de quartos
    await Promise.allSettled(roomFetchPromises);
    
    console.log(`[habbo-photos-scraper] Resultado da busca de nomes: ${roomsFound} encontrados, ${roomsNotFound} não encontrados, ${roomsError} sem roomId`);
    
    // Remover campos auxiliares antes de retornar
    const photos: HabboPhoto[] = photosWithRoomIds.map(({ _roomIdToFetch, _hotelDomain, ...photo }) => photo);

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

