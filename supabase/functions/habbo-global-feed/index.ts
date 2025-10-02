import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para fazer scraping do feed oficial do Habbo
async function scrapeHabboPhotosFeed(hotel: string = 'br', limit: number = 20) {
  try {
    console.log(`[🌍 GLOBAL FEED] Scraping official Habbo photos feed for hotel: ${hotel}`);
    
    const hotelDomain = hotel === 'br' ? 'com.br' : hotel;
    const feedUrl = `https://www.habbo.${hotelDomain}/community/photos`;
    
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Connection': 'keep-alive',
      },
    });

    if (!response.ok) {
      console.error(`[🌍 GLOBAL FEED] Failed to fetch feed: ${response.status}`);
      return [];
    }

    const html = await response.text();
    console.log(`[🌍 GLOBAL FEED] Received HTML content, length: ${html.length}`);

    // Extrair fotos do HTML usando regex
    const photoRegex = /<img[^>]*ng-src="(https:\/\/habbo-stories-content\.s3\.amazonaws\.com\/[^"]+)"[^>]*>/g;
    const dateRegex = /<time[^>]*class="card__date"[^>]*>([^<]+)<\/time>/g;
    const userRegex = /<h6[^>]*class="avatar__title"[^>]*>([^<]+)<\/h6>/g;
    const likesRegex = /<span[^>]*class="like__count"[^>]*>(\d+)<\/span>/g;

    // Extrair dados
    const photoUrls = [];
    const dates = [];
    const users = [];
    const likes = [];

    let match;
    while ((match = photoRegex.exec(html)) !== null && photoUrls.length < limit) {
      photoUrls.push(match[1]);
    }
    while ((match = dateRegex.exec(html)) !== null) {
      dates.push(match[1]);
    }
    while ((match = userRegex.exec(html)) !== null) {
      users.push(match[1]);
    }
    while ((match = likesRegex.exec(html)) !== null) {
      likes.push(parseInt(match[1]) || 0);
    }

    console.log(`[🌍 GLOBAL FEED] Extracted: ${photoUrls.length} photos, ${dates.length} dates, ${users.length} users, ${likes.length} likes`);

    // Converter para o formato EnhancedPhoto
    const enhancedPhotos = [];
    for (let i = 0; i < photoUrls.length && i < limit; i++) {
      const photoUrl = photoUrls[i];
      const photoId = photoUrl.split('/').pop()?.split('.')[0] || `scraped-${Date.now()}-${i}`;
      
      enhancedPhotos.push({
        id: `scraped-${photoId}`,
        photo_id: photoId,
        userName: users[i] || `User${i + 1}`,
        imageUrl: photoUrl,
        date: dates[i] || new Date().toLocaleDateString('pt-BR'),
        timestamp: new Date().toISOString(),
        likes: [],
        likesCount: likes[i] || 0,
        userLiked: false,
        type: 'PHOTO' as 'SELFIE' | 'PHOTO' | 'USER_CREATION',
        contentWidth: undefined,
        contentHeight: undefined,
        caption: '',
        roomName: 'Quarto do jogo',
        s3_url: photoUrl,
        preview_url: photoUrl,
        taken_date: new Date().toISOString(),
        photo_type: 'PHOTO'
      });
    }

    console.log(`[🌍 GLOBAL FEED] Successfully scraped ${enhancedPhotos.length} photos from official feed`);
    return enhancedPhotos;

  } catch (error) {
    console.error(`[🌍 GLOBAL FEED] Error scraping official feed:`, error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { cursor, limit = 20, hotel = 'br' } = await req.json();

    console.log('[🌍 GLOBAL FEED] Request:', { cursor, limit, hotel });

    // Buscar fotos ordenadas por timestamp (mais recentes primeiro)
    const startIndex = cursor ? parseInt(cursor) : 0;
    const endIndex = startIndex + limit - 1;

    const { data: photos, error } = await supabaseClient
      .from('habbo_photos')
      .select(`
        id,
        photo_id,
        habbo_name,
        hotel,
        s3_url,
        preview_url,
        taken_date,
        caption,
        room_name,
        likes_count,
        photo_type,
        created_at,
        updated_at
      `)
      .eq('hotel', hotel)
      .not('s3_url', 'is', null)
      .not('taken_date', 'is', null)
      .order('taken_date', { ascending: false })
      .range(startIndex, endIndex);

    if (error) {
      console.error('[🌍 GLOBAL FEED] Database error:', error);
      throw error;
    }

    console.log(`[🌍 GLOBAL FEED] Found ${photos?.length || 0} photos in database`);

    let enhancedPhotos = [];

    // Se não há fotos no banco ou são poucas, fazer scraping do feed oficial
    const hasPhotos = photos && photos.length > 0;
    const shouldScrape = !hasPhotos || (startIndex === 0 && photos.length < 5);

    if (shouldScrape) {
      console.log('[🌍 GLOBAL FEED] Scraping official feed for fresh photos');
      const scrapedPhotos = await scrapeHabboPhotosFeed(hotel, limit);
      
      if (scrapedPhotos.length > 0) {
        enhancedPhotos = scrapedPhotos;
        console.log(`[🌍 GLOBAL FEED] Using ${scrapedPhotos.length} scraped photos`);
      } else if (photos && photos.length > 0) {
        // Fallback para fotos do banco se scraping falhar
        enhancedPhotos = photos.map(photo => formatPhoto(photo));
        console.log('[🌍 GLOBAL FEED] Using database photos as fallback');
      }
    } else {
      // Usar fotos do banco
      enhancedPhotos = photos?.map(photo => formatPhoto(photo)) || [];
      console.log('[🌍 GLOBAL FEED] Using database photos');
    }

    const hasMore = photos && photos.length === limit;
    const nextCursor = hasMore ? (startIndex + limit).toString() : null;

    console.log(`[🌍 GLOBAL FEED] Response: ${enhancedPhotos.length} photos, hasMore: ${hasMore}`);

    return new Response(
      JSON.stringify({
        photos: enhancedPhotos,
        nextCursor,
        hasMore,
        totalCount: enhancedPhotos.length,
        cursor: startIndex.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[🌍 GLOBAL FEED] Error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        photos: [],
        nextCursor: null,
        hasMore: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Função auxiliar para formatar fotos do banco de dados
function formatPhoto(photo: any) {
  // Formatar timestamps como o Habbo
  const formatHabboTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    
    // Formato do Habbo: DD/MM/YY
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  return {
    id: photo.id,
    photo_id: photo.photo_id,
    userName: photo.habbo_name,
    imageUrl: photo.s3_url,
    date: formatHabboTimestamp(photo.taken_date),
    timestamp: photo.taken_date,
    likes: [],
    likesCount: photo.likes_count || 0,
    userLiked: false,
    type: (photo.photo_type || 'PHOTO') as 'SELFIE' | 'PHOTO' | 'USER_CREATION',
    contentWidth: undefined,
    contentHeight: undefined,
    caption: photo.caption,
    roomName: photo.room_name,
    s3_url: photo.s3_url,
    preview_url: photo.preview_url,
    taken_date: photo.taken_date,
    photo_type: photo.photo_type
  };
}
