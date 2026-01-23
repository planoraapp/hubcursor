import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Tipos do endpoint JSON oficial /extradata/public/photos
interface HabboRawPhoto {
  room_id: number;
  creator_id: number;
  creator_name: string;
  time: number;
  version: number;
  url: string;
  type: 'PHOTO' | 'SELFIE' | 'USER_CREATION' | string;
  creator_uniqueId: string;
  tags: string[];
  previewUrl: string;
  id: string;
  likes: string[];
  hotel?: string;
  hotelDomain?: string;
}

interface EnhancedPhoto {
  id: string;
  photo_id: string;
  userName: string;
  imageUrl: string;
  date: string;
  timestamp: string;
  likes: any[];
  likesCount: number;
  userLiked: boolean;
  type: 'SELFIE' | 'PHOTO' | 'USER_CREATION';
  contentWidth?: number;
  contentHeight?: number;
  caption: string;
  roomName: string;
  roomId?: number | string;
  s3_url: string;
  preview_url: string;
  taken_date: string;
  photo_type: 'SELFIE' | 'PHOTO' | 'USER_CREATION';
  hotel?: string;
  hotelDomain?: string;
}

function formatHabboDateFromTime(time: number): string {
  const date = new Date(time);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Função auxiliar para buscar nome do quarto via API
async function getRoomName(roomId: number, hotelDomain: string): Promise<string | null> {
  try {
    const url = `https://www.habbo.${hotelDomain}/api/public/rooms/${roomId}`;
    console.log(`[habbo-global-feed] 🔍 Buscando nome do quarto ${roomId} no hotel ${hotelDomain}`);
    
    const response = await fetch(url, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HabboHubBot/1.0'
      }
    });
    
    if (response.ok) {
      const roomData = await response.json();
      if (roomData && roomData.name) {
        console.log(`[habbo-global-feed] ✅ Nome do quarto ${roomId} encontrado: "${roomData.name}"`);
        return roomData.name;
      } else {
        console.log(`[habbo-global-feed] ⚠️ Quarto ${roomId} retornou sem nome`);
      }
    } else if (response.status === 404) {
      // Quarto não existe mais - retornar null para usar fallback
      console.log(`[habbo-global-feed] ⚠️ Quarto ${roomId} não encontrado (404)`);
    } else {
      console.log(`[habbo-global-feed] ❌ Erro ${response.status} ao buscar quarto ${roomId}: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`[habbo-global-feed] ❌ Erro de rede ao buscar quarto ${roomId}:`, error);
  }
  return null;
}

function mapRawToEnhancedPhoto(raw: HabboRawPhoto): EnhancedPhoto {
  const httpsUrl = raw.url.startsWith('//') ? `https:${raw.url}` : raw.url;
  const httpsPreview = raw.previewUrl.startsWith('//')
    ? `https:${raw.previewUrl}`
    : raw.previewUrl;

  const timestamp = new Date(raw.time).toISOString();
  const date = formatHabboDateFromTime(raw.time);

  let photoType: 'SELFIE' | 'PHOTO' | 'USER_CREATION' = 'PHOTO';
  const typeLower = (raw.type || 'PHOTO').toLowerCase();
  if (typeLower === 'selfie') photoType = 'SELFIE';
  else if (typeLower === 'user_creation') photoType = 'USER_CREATION';

  return {
    id: raw.id,
    photo_id: raw.id,
    userName: raw.creator_name,
    imageUrl: httpsUrl,
    date,
    timestamp,
    likes: [],
    likesCount: Array.isArray(raw.likes) ? raw.likes.length : 0,
    userLiked: false,
    type: photoType,
    contentWidth: undefined,
    contentHeight: undefined,
    caption: '',
    roomName: `Room ${raw.room_id}`, // Fallback - será substituído se encontrarmos o nome real
    roomId: raw.room_id, // Incluir roomId explícito
    s3_url: httpsUrl,
    preview_url: httpsPreview,
    taken_date: timestamp,
    photo_type: photoType,
    hotel: raw.hotel,
    hotelDomain: raw.hotelDomain,
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { cursor, limit = 20, hotel = 'br' } = await req.json();

    console.log('[🌍 GLOBAL FEED] Request:', { cursor, limit, hotel });

    // Cursor = índice de página dentro da lista completa retornada
    const pageOffset = cursor ? parseInt(cursor) : 0;
    const safeLimit = Math.max(1, Math.min(limit, 100));

    // Lista de hotéis suportados para feed global
    const hotelCodes = ['br', 'com', 'de', 'fr', 'it', 'es', 'nl', 'fi', 'tr'];

    let rawPhotos: HabboRawPhoto[] = [];

    if (hotel === 'all') {
      console.log('[🌍 GLOBAL FEED] Fetching photos for ALL hotels');

      const results = await Promise.allSettled(
        hotelCodes.map(async (code) => {
          // Normalizar domínios: br -> com.br, tr -> com.tr
          let domain = code;
          if (code === 'br') domain = 'com.br';
          if (code === 'tr') domain = 'com.tr';
          const apiUrl = `https://www.habbo.${domain}/extradata/public/photos`;

          console.log(`[🌍 GLOBAL FEED] Fetching JSON photos from: ${apiUrl}`);

          const response = await fetch(apiUrl, {
            headers: {
              Accept: 'application/json, text/plain, */*',
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HabboHubBot/1.0',
            },
          });

          if (!response.ok) {
            console.warn(
              `[🌍 GLOBAL FEED] Failed to fetch JSON photos from ${apiUrl}: ${response.status} ${response.statusText}`,
            );
            return [];
          }

          const photos = (await response.json()) as HabboRawPhoto[];
          // Anotar origem do hotel em cada foto
          const annotated = photos.map((p) => ({
            ...p,
            hotel: code,
            hotelDomain: domain,
          }));
          console.log(
            `[🌍 GLOBAL FEED] Received ${annotated.length} raw photos from ${apiUrl}`,
          );
          return annotated;
        }),
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          rawPhotos = rawPhotos.concat(result.value);
        }
      }

      console.log(
        `[🌍 GLOBAL FEED] Combined ${rawPhotos.length} raw photos from all hotels`,
      );

      // Ordenar por time (cronológico decrescente)
      rawPhotos.sort((a, b) => b.time - a.time);
    } else {
      // Normalizar domínios: br -> com.br, tr -> com.tr
      let hotelDomain = hotel;
      if (hotel === 'br') hotelDomain = 'com.br';
      if (hotel === 'tr') hotelDomain = 'com.tr';
      const apiUrl = `https://www.habbo.${hotelDomain}/extradata/public/photos`;

      console.log(`[🌍 GLOBAL FEED] Fetching JSON photos from: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HabboHubBot/1.0',
        },
      });

      if (!response.ok) {
        console.error(
          `[🌍 GLOBAL FEED] Failed to fetch JSON photos: ${response.status} ${response.statusText}`,
        );
        throw new Error('Failed to fetch photos from Habbo API');
      }

      rawPhotos = ((await response.json()) as HabboRawPhoto[]).map((p) => ({
        ...p,
        hotel,
        hotelDomain,
      }));
      console.log(
        `[🌍 GLOBAL FEED] Received ${rawPhotos.length} raw photos from Habbo API`,
      );
    }

    if (!Array.isArray(rawPhotos) || rawPhotos.length === 0) {
      console.warn('[🌍 GLOBAL FEED] No photos returned from Habbo API');
      return new Response(
        JSON.stringify({
          photos: [],
          nextCursor: null,
          hasMore: false,
          totalCount: 0,
          cursor: pageOffset.toString(),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

    const totalCount = rawPhotos.length;
    const startIndex = pageOffset * safeLimit;
    const endIndex = Math.min(totalCount, startIndex + safeLimit);

    if (startIndex >= totalCount) {
      console.log(
        `[🌍 GLOBAL FEED] Page offset ${pageOffset} is beyond available photos (total: ${totalCount})`,
      );
      return new Response(
        JSON.stringify({
          photos: [],
          nextCursor: null,
          hasMore: false,
          totalCount,
          cursor: pageOffset.toString(),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

    const pageRaw = rawPhotos.slice(startIndex, endIndex);
    const enhancedPhotos = pageRaw.map(mapRawToEnhancedPhoto);

    console.log(`[🌍 GLOBAL FEED] Buscando nomes de quartos para ${enhancedPhotos.length} fotos...`);
    
    // Buscar nomes dos quartos em paralelo (limitando concorrência para evitar rate limiting)
    const CONCURRENT_ROOM_FETCHES = 5;
    const roomFetchPromises: Promise<void>[] = [];
    let roomsFound = 0;
    let roomsNotFound = 0;
    let roomsError = 0;
    
    for (let i = 0; i < enhancedPhotos.length; i += CONCURRENT_ROOM_FETCHES) {
      const batch = enhancedPhotos.slice(i, i + CONCURRENT_ROOM_FETCHES);
      const batchPromises = batch.map(async (photo) => {
        if (photo.roomId && photo.hotelDomain) {
          const roomName = await getRoomName(Number(photo.roomId), photo.hotelDomain);
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
    
    console.log(`[🌍 GLOBAL FEED] Resultado da busca de nomes: ${roomsFound} encontrados, ${roomsNotFound} não encontrados, ${roomsError} sem roomId`);

    const uniqueUsers = [
      ...new Set(enhancedPhotos.map(p => p.userName.toLowerCase())),
    ];

    console.log(
      `[🌍 GLOBAL FEED] Page ${pageOffset}: ${enhancedPhotos.length} photos, ${uniqueUsers.length} unique users`,
    );

    const hasMore = endIndex < totalCount;
    const nextCursor = hasMore ? (pageOffset + 1).toString() : null;

    console.log(
      `[🌍 GLOBAL FEED] Response: ${enhancedPhotos.length} photos, hasMore: ${hasMore}, nextCursor: ${nextCursor}, totalCount: ${totalCount}`,
    );

    return new Response(
      JSON.stringify({
        photos: enhancedPhotos,
        nextCursor,
        hasMore,
        totalCount,
        cursor: pageOffset.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error('[🌍 GLOBAL FEED] Error:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        photos: [],
        nextCursor: null,
        hasMore: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
