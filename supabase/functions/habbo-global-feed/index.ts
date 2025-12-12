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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        // Removido Accept-Encoding - Deno pode não descomprimir automaticamente
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      },
    });

    if (!response.ok) {
      console.error(`[🌍 GLOBAL FEED] Failed to fetch feed: ${response.status} ${response.statusText}`);
      return [];
    }

    const html = await response.text();
    console.log(`[🌍 GLOBAL FEED] Received HTML content, length: ${html.length}`);

    // Extrair cards individuais usando a estrutura real do Habbo
    // Cada card está dentro de <habbo-card> e tem estrutura <div class="card">
    // IMPORTANTE: Resetar o regex para evitar problemas com lastIndex
    const cardRegex = /<habbo-card[^>]*>([\s\S]*?)<\/habbo-card>/gi;
    const cards = [];
    let cardMatch;
    
    // Resetar regex
    cardRegex.lastIndex = 0;
    
    while ((cardMatch = cardRegex.exec(html)) !== null && cards.length < limit * 2) {
      cards.push(cardMatch[1]);
    }

    console.log(`[🌍 GLOBAL FEED] Found ${cards.length} habbo-card elements in HTML`);
    
    // Se não encontrou cards, verificar se o HTML contém a estrutura esperada
    if (cards.length === 0) {
      const hasHabboStructure = html.includes('habbo-card') || html.includes('card__link') || html.includes('habbo-columns-channel');
      if (hasHabboStructure) {
        console.warn(`[🌍 GLOBAL FEED] HTML contém estrutura Habbo mas nenhum card foi encontrado. Tentando regex alternativo...`);
        // Tentar regex alternativo que pega o card completo incluindo a tag
        const altCardRegex = /<habbo-card[\s\S]*?<\/habbo-card>/gi;
        altCardRegex.lastIndex = 0;
        let altMatch;
        while ((altMatch = altCardRegex.exec(html)) !== null && cards.length < limit * 2) {
          // Extrair apenas o conteúdo interno (sem as tags habbo-card)
          const contentMatch = /<habbo-card[^>]*>([\s\S]*?)<\/habbo-card>/i.exec(altMatch[0]);
          if (contentMatch && contentMatch[1]) {
            cards.push(contentMatch[1]);
          } else {
            cards.push(altMatch[0]);
          }
        }
        console.log(`[🌍 GLOBAL FEED] Regex alternativo encontrou ${cards.length} cards`);
      } else {
        console.warn(`[🌍 GLOBAL FEED] HTML não contém estrutura esperada do Habbo. Pode estar bloqueado ou a página mudou.`);
        console.log(`[🌍 GLOBAL FEED] HTML preview (first 1000 chars): ${html.substring(0, 1000)}`);
      }
    }
    
    // Debug: mostrar preview dos primeiros cards
    if (cards.length > 0) {
      console.log(`[🌍 GLOBAL FEED] First card preview (first 500 chars): ${cards[0].substring(0, 500)}`);
    }

    const enhancedPhotos = [];

    // Processar cada card individualmente
    for (let i = 0; i < Math.min(cards.length, limit); i++) {
      const cardHtml = cards[i];
      
      try {
        // 1. Extrair URL da foto (ng-src ou src)
        const photoMatch = /(?:ng-src|src)="(https:\/\/habbo-stories-content\.s3\.amazonaws\.com\/[^"]+)"/i.exec(cardHtml);
        if (!photoMatch) {
          console.log(`[🌍 GLOBAL FEED] Card ${i}: No photo URL found`);
          continue;
        }
        
        const photoUrl = photoMatch[1];
        const photoIdFromUrl = photoUrl.match(/\/p-(\d+)-(\d+)\./);
        const photoId = photoIdFromUrl ? `${photoIdFromUrl[1]}-${photoIdFromUrl[2]}` : photoUrl.split('/').pop()?.split('.')[0] || `scraped-${Date.now()}-${i}`;
        
        // 2. PRIORIZAR: Extrair nome do usuário do criador da foto
        // Ordem de prioridade baseada no HTML real fornecido:
        // 1. href do card__link (mais específico e confiável)
        // 2. user attribute do habbo-avatar card__creator
        // 3. h6 avatar__title dentro do card__creator
        // 4. Qualquer href="/profile/.../photo" como último recurso
        let userName = null;
        
        // PRIORIDADE 1: href do card__link (link da foto - contém username do criador)
        const cardLinkMatch = /class="card__link"[^>]*href="\/profile\/([^"\/]+)\/photo/i.exec(cardHtml);
        if (cardLinkMatch && cardLinkMatch[1]) {
          userName = decodeURIComponent(cardLinkMatch[1]).trim();
          console.log(`[🌍 GLOBAL FEED] Card ${i}: Username from card__link href: ${userName}`);
        }
        
        // PRIORIDADE 2: atributo user="USERNAME" no habbo-avatar class="card__creator"
        if (!userName) {
          const userAttrMatch = /<habbo-avatar[^>]*class="[^"]*card__creator[^"]*"[^>]*user="([^"]+)"/i.exec(cardHtml);
          if (userAttrMatch && userAttrMatch[1]) {
            userName = userAttrMatch[1].trim();
            console.log(`[🌍 GLOBAL FEED] Card ${i}: Username from user attribute: ${userName}`);
          }
        }
        
        // PRIORIDADE 3: h6 dentro do card__creator
        if (!userName) {
          const creatorSection = /<habbo-avatar[^>]*class="[^"]*card__creator[^"]*"[^>]*>([\s\S]*?)<\/habbo-avatar>/i.exec(cardHtml);
          if (creatorSection) {
            const h6Match = /<h6[^>]*class="[^"]*avatar__title[^"]*"[^>]*>([^<]+)<\/h6>/i.exec(creatorSection[1]);
            if (h6Match && h6Match[1]) {
              userName = h6Match[1].trim();
              console.log(`[🌍 GLOBAL FEED] Card ${i}: Username from h6: ${userName}`);
            }
          }
        }
        
        // PRIORIDADE 4: Qualquer href="/profile/USERNAME/photo" no card (último recurso)
        if (!userName) {
          const hrefMatch = /href="\/profile\/([^"\/]+)\/photo/i.exec(cardHtml);
          if (hrefMatch && hrefMatch[1]) {
            userName = decodeURIComponent(hrefMatch[1]).trim();
            console.log(`[🌍 GLOBAL FEED] Card ${i}: Username from href (fallback): ${userName}`);
          }
        }
        
        if (!userName) {
          console.warn(`[🌍 GLOBAL FEED] Card ${i}: Could not extract username, skipping. Card HTML preview: ${cardHtml.substring(0, 200)}`);
          continue;
        }
        
        // 3. Extrair data (dentro de <time class="card__date">)
        const dateMatch = /<time[^>]*class="[^"]*card__date[^"]*"[^>]*>([^<]+)<\/time>/i.exec(cardHtml);
        const dateStr = dateMatch ? dateMatch[1].trim() : new Date().toLocaleDateString('pt-BR');
        
        // Converter data do formato DD/MM/YY para timestamp
        let timestamp = new Date().toISOString();
        if (dateMatch) {
          try {
            const dateParts = dateStr.match(/(\d+)\/(\d+)\/(\d+)/);
            if (dateParts) {
              const day = parseInt(dateParts[1]);
              const month = parseInt(dateParts[2]) - 1; // JavaScript months are 0-indexed
              const year = parseInt('20' + dateParts[3]); // Assume 20XX
              timestamp = new Date(year, month, day).toISOString();
            }
          } catch (e) {
            // Se falhar, usar data atual
          }
        }
        
        // 4. Extrair likes (dentro de <span class="like__count">)
        const likesMatch = /<span[^>]*class="[^"]*like__count[^"]*"[^>]*>(\d+)/i.exec(cardHtml);
        const likesCount = likesMatch ? parseInt(likesMatch[1]) : 0;
        
        // 5. Extrair tipo de foto (SELFIE, PHOTO, USER_CREATION) do ng-class
        let photoType: 'SELFIE' | 'PHOTO' | 'USER_CREATION' = 'PHOTO';
        const typeMatch = /ng-class="[^"]*card__image--(selfie|photo|wide|tall)/i.exec(cardHtml);
        if (typeMatch) {
          if (typeMatch[1].toLowerCase() === 'selfie') {
            photoType = 'SELFIE';
          } else if (typeMatch[1].toLowerCase() === 'wide' || typeMatch[1].toLowerCase() === 'tall') {
            photoType = 'USER_CREATION';
          } else {
            photoType = 'PHOTO';
          }
        }

        enhancedPhotos.push({
          id: `scraped-${photoId}`,
          photo_id: photoId,
          userName: userName,
          imageUrl: photoUrl,
          date: dateStr,
          timestamp: timestamp,
          likes: [],
          likesCount: likesCount,
          userLiked: false,
          type: photoType,
          contentWidth: undefined,
          contentHeight: undefined,
          caption: '',
          roomName: 'Quarto do jogo',
          s3_url: photoUrl,
          preview_url: photoUrl,
          taken_date: timestamp,
          photo_type: photoType
        });
        
        console.log(`[🌍 GLOBAL FEED] Card ${i}: Added photo from user ${userName}, date ${dateStr}, likes ${likesCount}`);
        
      } catch (cardError) {
        console.warn(`[🌍 GLOBAL FEED] Error processing card ${i}:`, cardError);
        continue;
      }
    }

    // Remover duplicatas baseado no photo_id
    const uniquePhotos = [];
    const seenPhotoIds = new Set();
    for (const photo of enhancedPhotos) {
      if (!seenPhotoIds.has(photo.photo_id)) {
        seenPhotoIds.add(photo.photo_id);
        uniquePhotos.push(photo);
      }
    }

    // Ordenar por timestamp (mais recentes primeiro)
    uniquePhotos.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });

    // Limitar ao número solicitado
    const finalPhotos = uniquePhotos.slice(0, limit);

    // Log estatísticas
    const uniqueUsers = [...new Set(finalPhotos.map(p => p.userName))];
    console.log(`[🌍 GLOBAL FEED] Successfully scraped ${finalPhotos.length} unique photos from official feed`);
    console.log(`[🌍 GLOBAL FEED] Unique users found: ${uniqueUsers.length} (${uniqueUsers.slice(0, 10).join(', ')})`);
    
    return finalPhotos;

  } catch (error) {
    console.error(`[🌍 GLOBAL FEED] Error scraping official feed:`, error);
    return [];
  }
}

// Função para obter início e fim do dia
function getDayBounds(dayOffset: number = 0): { start: string; end: string } {
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() - dayOffset);
  
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);
  
  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
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

    // O cursor representa quantos dias atrás estamos buscando (0 = hoje, 1 = ontem, etc.)
    const dayOffset = cursor ? parseInt(cursor) : 0;
    const dayBounds = getDayBounds(dayOffset);

    console.log(`[🌍 GLOBAL FEED] Fetching photos from day offset ${dayOffset} (${dayBounds.start} to ${dayBounds.end})`);

    // Buscar fotos do dia específico, ordenadas por timestamp (mais recentes primeiro)
    let query = supabaseClient
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
      .gte('taken_date', dayBounds.start)
      .lte('taken_date', dayBounds.end)
      .order('taken_date', { ascending: false })
      .limit(limit);

    const { data: photos, error } = await query;

    if (error) {
      console.error('[🌍 GLOBAL FEED] Database error:', error);
      throw error;
    }

    console.log(`[🌍 GLOBAL FEED] Found ${photos?.length || 0} photos for day offset ${dayOffset}`);

    let enhancedPhotos = [];

    // SEMPRE usar scraping da página community para exibir fotos reais da comunidade
    // O banco de dados está com dados antigos/incorretos (fotos do Beebop)
    console.log('[🌍 GLOBAL FEED] Fetching photos from official community feed (scraping)');
    const scrapedPhotos = await scrapeHabboPhotosFeed(hotel, limit);
    
    if (scrapedPhotos.length > 0) {
      enhancedPhotos = scrapedPhotos;
      console.log(`[🌍 GLOBAL FEED] Using ${scrapedPhotos.length} scraped photos from community feed`);
    } else {
      // Fallback apenas se scraping falhar completamente
      console.log('[🌍 GLOBAL FEED] Scraping returned no photos, falling back to database');
      if (photos && photos.length > 0) {
        enhancedPhotos = photos.map(photo => formatPhoto(photo));
        console.log(`[🌍 GLOBAL FEED] Using ${photos.length} database photos as fallback`);
      }
    }

    // Determinar se há mais fotos para buscar
    // Como estamos usando scraping, sempre tentamos buscar mais se retornamos o limite completo
    let hasMore = false;
    let nextCursor = null;

    // Se retornamos exatamente o limite, provavelmente há mais fotos
    // Podemos continuar buscando do mesmo dia ou dias anteriores
    if (enhancedPhotos.length >= limit) {
      // Por enquanto, vamos avançar para o próximo dia como cursor
      // Isso permite scroll infinito navegando pelos dias
      hasMore = true;
      nextCursor = (dayOffset + 1).toString();
    } else {
      // Se retornamos menos que o limite, chegamos ao final do feed disponível
      hasMore = false;
    }

    console.log(`[🌍 GLOBAL FEED] Response: ${enhancedPhotos.length} photos, hasMore: ${hasMore}, nextCursor: ${nextCursor}`);

    return new Response(
      JSON.stringify({
        photos: enhancedPhotos,
        nextCursor,
        hasMore,
        totalCount: enhancedPhotos.length,
        cursor: dayOffset.toString()
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
