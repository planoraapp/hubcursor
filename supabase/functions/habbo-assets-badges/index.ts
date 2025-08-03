
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Badge {
  code: string;
  name: string;
  image_url: string;
  category: 'official' | 'achievements' | 'fansites' | 'others';
}

// Categorização baseada em padrões comuns
const categorizeBadge = (code: string): Badge['category'] => {
  const upperCode = code.toUpperCase();
  
  // Emblemas oficiais (staff, moderadores, etc)
  if (/^(ADM|MOD|STAFF|VIP|SUP|GUIDE|HELPER|ADMIN|MODERATOR|SUPERVISOR|AMBASSADOR)/.test(upperCode)) {
    return 'official';
  }
  
  // Conquistas (achievements, jogos, etc)
  if (/^(ACH_|GAME|WIN|VICTORY|CHAMPION|WINNER|QUEST|MISSION|COMPLETE|FINISH|SUCCESS)/.test(upperCode)) {
    return 'achievements';
  }
  
  // Fã-sites (eventos, promoções, parcerias)
  if (/^(FANSITE|PARTNER|EVENT|SPECIAL|EXCLUSIVE|LIMITED|PROMO|COLLAB|COLLABORATION)/.test(upperCode) || 
      /20\d{2}/.test(upperCode)) {
    return 'fansites';
  }
  
  return 'others';
};

const fetchBadgesFromHabboAssets = async (page: number): Promise<Badge[]> => {
  try {
    console.log(`🔍 [HabboAssets] Fetching page ${page}`);
    
    // HabboAssets tem estrutura de páginas com cerca de 50 emblemas cada
    const response = await fetch(`https://habboassets.com/badges/page/${page}`, {
      headers: {
        'User-Agent': 'HabboHub-BadgeSystem/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      console.warn(`❌ [HabboAssets] Page ${page} not found or error`);
      return [];
    }
    
    const html = await response.text();
    
    // Parse HTML para extrair códigos de emblemas
    const badgeMatches = html.match(/\/c_images\/album1584\/([A-Za-z0-9_]+)\.gif/g) || [];
    const badges: Badge[] = [];
    
    const processedCodes = new Set<string>();
    
    for (const match of badgeMatches) {
      const codeMatch = match.match(/\/([A-Za-z0-9_]+)\.gif$/);
      if (codeMatch) {
        const code = codeMatch[1];
        
        // Evitar duplicatas
        if (processedCodes.has(code)) continue;
        processedCodes.add(code);
        
        const badge: Badge = {
          code,
          name: `Badge ${code}`,
          image_url: `https://habboassets.com/c_images/album1584/${code}.gif`,
          category: categorizeBadge(code)
        };
        
        badges.push(badge);
      }
    }
    
    console.log(`✅ [HabboAssets] Found ${badges.length} badges on page ${page}`);
    return badges;
    
  } catch (error) {
    console.error(`❌ [HabboAssets] Error fetching page ${page}:`, error);
    return [];
  }
};

const getAllBadges = async (): Promise<Badge[]> => {
  console.log('🚀 [HabboAssets] Starting full badge collection');
  
  const allBadges: Badge[] = [];
  const maxPages = 190; // Baseado na informação do usuário
  const concurrentPages = 5; // Processar 5 páginas por vez para não sobrecarregar
  
  for (let i = 1; i <= maxPages; i += concurrentPages) {
    const pagePromises: Promise<Badge[]>[] = [];
    
    for (let j = 0; j < concurrentPages && (i + j) <= maxPages; j++) {
      pagePromises.push(fetchBadgesFromHabboAssets(i + j));
    }
    
    try {
      const results = await Promise.all(pagePromises);
      for (const pageBadges of results) {
        allBadges.push(...pageBadges);
      }
      
      console.log(`📊 [HabboAssets] Progress: ${Math.min(i + concurrentPages - 1, maxPages)}/${maxPages} pages, ${allBadges.length} badges total`);
      
      // Pequena pausa para não sobrecarregar o servidor
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ [HabboAssets] Error in batch starting at page ${i}:`, error);
    }
  }
  
  // Remover duplicatas finais baseado no código
  const uniqueBadges = Array.from(
    new Map(allBadges.map(badge => [badge.code, badge])).values()
  );
  
  console.log(`🎯 [HabboAssets] Collection complete: ${uniqueBadges.length} unique badges`);
  return uniqueBadges;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { search = '', category = 'all', page = 1, limit = 100 } = await req.json();
    
    console.log(`🔧 [HabboAssets] Request: search="${search}", category=${category}, page=${page}, limit=${limit}`);
    
    // Buscar todos os emblemas (com cache futuro)
    const allBadges = await getAllBadges();
    
    // Filtrar por categoria
    let filteredBadges = category === 'all' 
      ? allBadges 
      : allBadges.filter(badge => badge.category === category);
    
    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBadges = filteredBadges.filter(badge => 
        badge.code.toLowerCase().includes(searchLower) ||
        badge.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Paginação para scroll infinito
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBadges = filteredBadges.slice(startIndex, endIndex);
    
    const response = {
      success: true,
      badges: paginatedBadges,
      metadata: {
        total: filteredBadges.length,
        page,
        limit,
        hasMore: endIndex < filteredBadges.length,
        source: 'HabboAssets',
        categories: {
          all: allBadges.length,
          official: allBadges.filter(b => b.category === 'official').length,
          achievements: allBadges.filter(b => b.category === 'achievements').length,
          fansites: allBadges.filter(b => b.category === 'fansites').length,
          others: allBadges.filter(b => b.category === 'others').length
        }
      }
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ [HabboAssets] Function error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        badges: [],
        metadata: { total: 0, fallbackMode: true }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
