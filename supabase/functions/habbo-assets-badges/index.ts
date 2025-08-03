
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
  metadata?: {
    year?: number;
    event?: string;
    rarity?: string;
    source_info?: string;
  };
}

// Sistema de categorização inteligente e expandido
const categorizeBadge = (code: string, name?: string): Badge['category'] => {
  const upperCode = code.toUpperCase();
  const upperName = name ? name.toUpperCase() : '';
  
  // Emblemas oficiais (staff, administração, moderação)
  const officialPatterns = [
    /^(ADM|ADMIN|ADMINISTRATOR)/,
    /^(MOD|MODERATOR)/,
    /^(STAFF|STF)/,
    /^(SUP|SUPERVISOR)/,
    /^(GUIDE|GDE)/,
    /^(HELPER|HLP)/,
    /^(AMB|AMBASSADOR)/,
    /^(VIP|VVIP)/,
    /^(CEO|CTO|CMO)/,
    /^(DEV|DEVELOPER)/,
    /^(OWNER|OWN)/,
    /^(FOUNDER|FND)/,
    // Padrões específicos de hierarquia
    /(CHIEF|HEAD|LEAD|SENIOR|JUNIOR)/,
    /(TRAINEE|INTERN|APPRENTICE)/,
  ];
  
  // Conquistas (achievements, jogos, missões)
  const achievementPatterns = [
    /^ACH_/,
    /^(GAME|GAM)/,
    /^(WIN|WINNER|VICTORY|CHAMPION)/,
    /^(LEVEL|LVL|LEV)/,
    /^(SCORE|SCR|POINT|PNT)/,
    /^(QUEST|QST|MISSION|MSN)/,
    /^(COMPLETE|FINISH|DONE)/,
    /^(SUCCESS|ACHIEVE|UNLOCK)/,
    /^(COLLECT|GATHER|FIND)/,
    /^(EXPLORE|DISCOVER|ADVENTURE)/,
    // Jogos específicos do Habbo
    /(BATTLEBALL|BB_|SNOWSTORM|SS_)/,
    /(WOBBLE|WBB|HABBO_STORIES)/,
    /(FREEZE|ICE|SNOW)/,
    // Conquistas de atividade
    /(LOGIN|VISIT|DAILY|WEEKLY|MONTHLY)/,
    /(FRIEND|SOCIAL|CHAT|TALK)/,
    /(ROOM|ENTER|EXIT|STAY)/,
    /(FURNITURE|FURNI|DECORATE)/,
  ];
  
  // Habbo Club e memberships
  const clubPatterns = [
    /^HC[A-Z]?[0-9]*$/,
    /^(CLUB|CLB)/,
    /^(MEMBER|MBR)/,
    /^(SUBSCRIPTION|SUB)/,
  ];
  
  // Eventos e sazonais
  const eventPatterns = [
    /^(XMAS|CHRISTMAS|NATAL)/,
    /^(EASTER|PASCOA)/,
    /^(HALLOWEEN|HWN)/,
    /^(VALENTINE|AMOR|LOVE)/,
    /^(SUMMER|VERAO|SUN)/,
    /^(WINTER|INVERNO|COLD)/,
    /^(SPRING|PRIMAVERA)/,
    /^(AUTUMN|OUTONO|FALL)/,
    /^(BIRTHDAY|ANIVERSARIO|BDAY)/,
    /^(CARNIVAL|CARNAVAL)/,
    /^(NEWYEAR|ANO_NOVO)/,
    /^(PARTY|FESTA|CELEBRATION)/,
    // Eventos específicos do Habbo
    /(PALOOZA|FESTIVAL|CONCERT)/,
    /(COMPETITION|CONTEST|TOURNAMENT)/,
    /(ANNIVERSARY|YEARS)/,
  ];
  
  // Fã-sites e parcerias
  const fansitePatterns = [
    /^(FAN|FANSITE)/,
    /^(PARTNER|PTN|PARTNERSHIP)/,
    /^(EVENT|EVT|SPECIAL|SPC)/,
    /^(EXCLUSIVE|EXC|LIMITED|LTD)/,
    /^(PROMO|PROMOTION|PROMOTIONAL)/,
    /^(COLLAB|COLLABORATION)/,
    /^(BUNDLE|PACK|KIT)/,
    // Sites conhecidos
    /(HABBOX|HABBLET|HABBOON)/,
    /(FANSITE|COMMUNITY|COMM)/,
    // Promoções especiais
    /(GIVEAWAY|FREE|BONUS)/,
    /(SPONSORED|SPONSOR)/,
  ];
  
  // Países e regiões (frequentemente eventos especiais)
  const regionPatterns = [
    /^(BR|BRASIL|BRAZIL)/,
    /^(US|USA|AMERICA)/,
    /^(UK|BRITAIN|ENGLAND)/,
    /^(DE|GERMAN|DEUTSCHLAND)/,
    /^(FR|FRANCE|FRENCH)/,
    /^(ES|SPAIN|ESPANA)/,
    /^(IT|ITALY|ITALIA)/,
    /^(FI|FINLAND|SUOMI)/,
  ];
  
  // Profissões e roles específicos
  const professionPatterns = [
    /^(ARMY|ARM|MILITARY|MIL)/,
    /^(POLICE|POL|COP)/,
    /^(DOCTOR|DOC|MEDIC|MED)/,
    /^(NURSE|NUR)/,
    /^(TEACHER|TCH|PROFESSOR)/,
    /^(STUDENT|STD|PUPIL)/,
    /^(CHEF|COOK|KITCHEN)/,
    /^(PILOT|PLT|CAPTAIN)/,
    /^(WIZARD|WIZ|MAGIC)/,
    /^(PIRATE|PIR|SAILOR)/,
    /^(NINJA|SAMURAI|WARRIOR)/,
  ];
  
  // Verificar emblemas oficiais
  for (const pattern of officialPatterns) {
    if (pattern.test(upperCode) || pattern.test(upperName)) {
      return 'official';
    }
  }
  
  // Verificar conquistas
  for (const pattern of achievementPatterns) {
    if (pattern.test(upperCode) || pattern.test(upperName)) {
      return 'achievements';
    }
  }
  
  // Verificar Habbo Club (considerar como achievements para usuários)
  for (const pattern of clubPatterns) {
    if (pattern.test(upperCode) || pattern.test(upperName)) {
      return 'achievements';
    }
  }
  
  // Verificar eventos e fã-sites
  for (const pattern of [...eventPatterns, ...fansitePatterns]) {
    if (pattern.test(upperCode) || pattern.test(upperName)) {
      return 'fansites';
    }
  }
  
  // Verificar regiões (normalmente eventos especiais)
  for (const pattern of regionPatterns) {
    if (pattern.test(upperCode) || pattern.test(upperName)) {
      return 'fansites';
    }
  }
  
  // Verificar profissões (considerar como achievements)
  for (const pattern of professionPatterns) {
    if (pattern.test(upperCode) || pattern.test(upperName)) {
      return 'achievements';
    }
  }
  
  // Padrões baseados em anos (2010-2024) - eventos temporais
  if (/20[1-2][0-9]/.test(upperCode) || /20[1-2][0-9]/.test(upperName)) {
    return 'fansites';
  }
  
  // Emblemas com números sequenciais são geralmente achievements
  if (/^[A-Z]{2,5}\d{2,4}$/.test(upperCode)) {
    return 'achievements';
  }
  
  // Emblemas com padrão de 3 letras + números (ex: ARM01, POL02)
  if (/^[A-Z]{3}\d{2}$/.test(upperCode)) {
    return 'achievements';
  }
  
  // Caso contrário, categorizar como "outros"
  return 'others';
};

// Cache global simples (em produção, usar Redis ou similar)
const badgeCache = new Map<string, { data: Badge[], timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

const fetchBadgesFromHabboAssets = async (page: number): Promise<Badge[]> => {
  try {
    console.log(`🔍 [HabboAssets] Fetching page ${page}`);
    
    const response = await fetch(`https://www.habboassets.com/badges?page=${page}`, {
      headers: {
        'User-Agent': 'HabboHub-BadgeSystem/2.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      console.warn(`❌ [HabboAssets] Page ${page} returned ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    const badges: Badge[] = [];
    
    // Parse HTML para extrair emblemas
    const imageRegex = /https:\/\/www\.habboassets\.com\/assets\/badges\/([A-Za-z0-9_]+)\.gif/g;
    let imageMatch;
    const foundCodes = new Set<string>();
    
    while ((imageMatch = imageRegex.exec(html)) !== null) {
      const code = imageMatch[1];
      
      if (foundCodes.has(code)) continue;
      foundCodes.add(code);
      
      // Tentar extrair nome do contexto
      let name = `Badge ${code}`;
      const startPos = Math.max(0, imageMatch.index - 500);
      const endPos = Math.min(html.length, imageMatch.index + 500);
      const contextHtml = html.substring(startPos, endPos);
      
      const titleMatch = /title="([^"]+)\s*\(([^)]+)\)/.exec(contextHtml);
      if (titleMatch && titleMatch[2] === code) {
        name = titleMatch[1].trim();
      }
      
      // Extrair ano se presente
      const yearMatch = /20[1-2][0-9]/.exec(code + name);
      const year = yearMatch ? parseInt(yearMatch[0]) : undefined;
      
      const badge: Badge = {
        code,
        name,
        image_url: `https://www.habboassets.com/assets/badges/${code}.gif`,
        category: categorizeBadge(code, name),
        metadata: {
          year,
          source_info: 'HabboAssets'
        }
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

const getAllBadges = async (forceRefresh = false): Promise<Badge[]> => {
  const cacheKey = 'all_badges';
  const cached = badgeCache.get(cacheKey);
  
  // Verificar cache válido
  if (!forceRefresh && cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log('📦 [HabboAssets] Using cached badges');
    return cached.data;
  }
  
  console.log('🚀 [HabboAssets] Starting fresh badge collection');
  
  const allBadges: Badge[] = [];
  const maxPages = 30; // Reduzido para melhor performance inicial
  const concurrentPages = 2; // Reduzido para evitar rate limiting
  
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
      
      // Pausa menor entre batches
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ [HabboAssets] Error in batch starting at page ${i}:`, error);
    }
  }
  
  // Remover duplicatas
  const uniqueBadges = Array.from(
    new Map(allBadges.map(badge => [badge.code, badge])).values()
  );
  
  // Atualizar cache
  badgeCache.set(cacheKey, { data: uniqueBadges, timestamp: Date.now() });
  
  console.log(`🎯 [HabboAssets] Collection complete: ${uniqueBadges.length} unique badges`);
  return uniqueBadges;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { search = '', category = 'all', page = 1, limit = 100, forceRefresh = false } = await req.json();
    
    console.log(`🔧 [HabboAssets] Request: search="${search}", category=${category}, page=${page}, limit=${limit}, forceRefresh=${forceRefresh}`);
    
    // Buscar todos os emblemas (com cache)
    const allBadges = await getAllBadges(forceRefresh);
    
    // Fallback com emblemas básicos se necessário
    if (allBadges.length === 0) {
      const fallbackBadges: Badge[] = [
        { code: 'ADM', name: 'Administrador', image_url: 'https://www.habboassets.com/assets/badges/ADM.gif', category: 'official' },
        { code: 'MOD', name: 'Moderador', image_url: 'https://www.habboassets.com/assets/badges/MOD.gif', category: 'official' },
        { code: 'VIP', name: 'VIP', image_url: 'https://www.habboassets.com/assets/badges/VIP.gif', category: 'official' },
        { code: 'HC1', name: 'Habbo Club', image_url: 'https://www.habboassets.com/assets/badges/HC1.gif', category: 'achievements' },
        { code: 'ACH_BasicClub1', name: 'Habbo Club Member', image_url: 'https://www.habboassets.com/assets/badges/ACH_BasicClub1.gif', category: 'achievements' },
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
            cached: false,
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
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredBadges = filteredBadges.filter(badge => 
        badge.code.toLowerCase().includes(searchLower) ||
        badge.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBadges = filteredBadges.slice(startIndex, endIndex);
    
    // Calcular estatísticas de categorias
    const categories = {
      all: allBadges.length,
      official: allBadges.filter(b => b.category === 'official').length,
      achievements: allBadges.filter(b => b.category === 'achievements').length,
      fansites: allBadges.filter(b => b.category === 'fansites').length,
      others: allBadges.filter(b => b.category === 'others').length,
    };
    
    const response = {
      success: true,
      badges: paginatedBadges,
      metadata: {
        total: filteredBadges.length,
        page,
        limit,
        hasMore: endIndex < filteredBadges.length,
        source: 'HabboAssets-Enhanced',
        cached: badgeCache.has('all_badges'),
        categories
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
