
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
  if (/^(ADM|MOD|STAFF|VIP|SUP|GUIDE|HELPER|ADMIN|MODERATOR|SUPERVISOR|AMBASSADOR|AMB)/.test(upperCode)) {
    return 'official';
  }
  
  // Conquistas (achievements, jogos, etc)
  if (/^(ACH_|GAME|WIN|VICTORY|CHAMPION|WINNER|QUEST|MISSION|COMPLETE|FINISH|SUCCESS|LEVEL|SCORE|POINT)/.test(upperCode)) {
    return 'achievements';
  }
  
  // Fã-sites (eventos, promoções, parcerias)
  if (/^(FANSITE|PARTNER|EVENT|SPECIAL|EXCLUSIVE|LIMITED|PROMO|COLLAB|COLLABORATION|BUNDLE)/.test(upperCode) || 
      /20\d{2}/.test(upperCode)) {
    return 'fansites';
  }
  
  return 'others';
};

const fetchBadgesFromHabboAssets = async (page: number): Promise<Badge[]> => {
  try {
    console.log(`🔍 [HabboAssets] Fetching page ${page}`);
    
    // Usar nova estrutura do HabboAssets baseada no exemplo fornecido
    const response = await fetch(`https://www.habboassets.com/badges?page=${page}`, {
      headers: {
        'User-Agent': 'HabboHub-BadgeSystem/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      console.warn(`❌ [HabboAssets] Page ${page} returned ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    console.log(`📄 [HabboAssets] HTML length: ${html.length}`);
    
    // Parse HTML para extrair emblemas usando estrutura do exemplo
    const badges: Badge[] = [];
    
    // Buscar por padrão de imagens do HabboAssets
    const imageRegex = /https:\/\/www\.habboassets\.com\/assets\/badges\/([A-Za-z0-9_]+)\.gif/g;
    const titleRegex = /title="([^"]+)\s*\(([^)]+)\)[^"]*"/g;
    
    let imageMatch;
    const foundCodes = new Set<string>();
    
    while ((imageMatch = imageRegex.exec(html)) !== null) {
      const code = imageMatch[1];
      
      if (foundCodes.has(code)) continue;
      foundCodes.add(code);
      
      // Tentar extrair nome do title próximo
      let name = `Badge ${code}`;
      
      // Buscar por title próximo na string HTML
      const startPos = Math.max(0, imageMatch.index - 500);
      const endPos = Math.min(html.length, imageMatch.index + 500);
      const contextHtml = html.substring(startPos, endPos);
      
      const titleMatch = /title="([^"]+)\s*\(([^)]+)\)/.exec(contextHtml);
      if (titleMatch && titleMatch[2] === code) {
        name = titleMatch[1].trim();
      }
      
      const badge: Badge = {
        code,
        name,
        image_url: `https://www.habboassets.com/assets/badges/${code}.gif`,
        category: categorizeBadge(code)
      };
      
      badges.push(badge);
    }
    
    console.log(`✅ [HabboAssets] Found ${badges.length} badges on page ${page}`);
    return badges;
    
  } catch (error) {
    console.error(`❌ [HabboAssets] Error fetching page ${page}:`, error);
    return [];
  }
};

const getAllBadges = async (): Promise<Badge[]> => {
  console.log('🚀 [HabboAssets] Starting badge collection');
  
  const allBadges: Badge[] = [];
  const maxPages = 50; // Começar com menos páginas para teste
  const concurrentPages = 3; // Reduzir concorrência
  
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
      
      // Pausa entre batches
      await new Promise(resolve => setTimeout(resolve, 200));
      
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
    
    // Buscar todos os emblemas
    const allBadges = await getAllBadges();
    
    if (allBadges.length === 0) {
      console.warn('⚠️ [HabboAssets] No badges found, trying fallback');
      // Fallback com alguns emblemas estáticos para teste
      const fallbackBadges: Badge[] = [
        { code: 'ADM', name: 'Administrador', image_url: 'https://www.habboassets.com/assets/badges/ADM.gif', category: 'official' },
        { code: 'MOD', name: 'Moderador', image_url: 'https://www.habboassets.com/assets/badges/MOD.gif', category: 'official' },
        { code: 'VIP', name: 'VIP', image_url: 'https://www.habboassets.com/assets/badges/VIP.gif', category: 'official' },
        { code: 'HC1', name: 'Habbo Club', image_url: 'https://www.habboassets.com/assets/badges/HC1.gif', category: 'others' },
        { code: 'ARM01', name: 'Medic Private', image_url: 'https://www.habboassets.com/assets/badges/ARM01.gif', category: 'achievements' },
        { code: 'ARM02', name: 'Medic Sergeant', image_url: 'https://www.habboassets.com/assets/badges/ARM02.gif', category: 'achievements' },
        { code: 'AME01', name: 'Chess Set Bundle', image_url: 'https://www.habboassets.com/assets/badges/AME01.gif', category: 'fansites' },
      ];
      
      return new Response(
        JSON.stringify({
          success: true,
          badges: fallbackBadges,
          metadata: {
            total: fallbackBadges.length,
            page: 1,
            limit: 100,
            hasMore: false,
            source: 'HabboAssets-Fallback',
            categories: {
              all: fallbackBadges.length,
              official: fallbackBadges.filter(b => b.category === 'official').length,
              achievements: fallbackBadges.filter(b => b.category === 'achievements').length,
              fansites: fallbackBadges.filter(b => b.category === 'fansites').length,
              others: fallbackBadges.filter(b => b.category === 'others').length,
            }
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
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
    
    // Paginação
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
          others: allBadges.filter(b => b.category === 'others').length,
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
