
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface BadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  rarity: string;
  source: 'habbo-api';
  scrapedAt: string;
}

// Cache global para badges da HabboAPI
const badgeCache = new Map();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 5000, search = '', category = 'all', forceRefresh = false } = await req.json().catch(() => ({}));
    
    console.log(`🔥 [HabboAPI] Buscando badges via HabboAPI - limit: ${limit}, search: "${search}", category: ${category}`);
    
    // Verificar cache se não forçar refresh
    const cacheKey = 'habbo_api_badges';
    if (!forceRefresh && badgeCache.has(cacheKey)) {
      const cached = badgeCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('💾 [HabboAPICache] Dados do cache válidos');
        const filteredBadges = applyFilters(cached.badges, search, category, limit);
        return createResponse(filteredBadges, { source: 'cache', totalAvailable: cached.badges.length });
      }
    }

    console.log('🚀 [HabboAPI] Fazendo fetch da API...');
    const badges = await fetchFromHabboAPI();
    
    console.log(`✅ [HabboAPI] Recebidos ${badges.length} badges da API`);
    
    // Salvar no cache
    badgeCache.set(cacheKey, {
      badges,
      timestamp: Date.now()
    });

    // Aplicar filtros
    const filteredBadges = applyFilters(badges, search, category, limit);
    
    console.log(`🎯 [HabboAPI] Retornando ${filteredBadges.length} badges filtrados`);
    
    return createResponse(filteredBadges, {
      source: 'habbo-api',
      totalAvailable: badges.length,
      scrapedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [HabboAPI] Erro:', error);
    
    // Fallback para badges locais
    const fallbackBadges = generateFallbackBadges();
    return createResponse(fallbackBadges, {
      source: 'fallback',
      error: error.message,
      totalAvailable: fallbackBadges.length
    });
  }
});

async function fetchFromHabboAPI(): Promise<BadgeItem[]> {
  const badges: BadgeItem[] = [];
  
  try {
    // Buscar badges de diferentes endpoints da HabboAPI
    const endpoints = [
      'https://habbo-api.github.io/api/badges/official.json',
      'https://habbo-api.github.io/api/badges/achievements.json',
      'https://habbo-api.github.io/api/badges/events.json',
      'https://habbo-api.github.io/api/badges/fansites.json'
    ];

    console.log(`📡 [HabboAPI] Fazendo fetch de ${endpoints.length} endpoints`);

    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      const category = endpoint.includes('official') ? 'official' :
                      endpoint.includes('achievements') ? 'achievements' :
                      endpoint.includes('events') ? 'others' : 'fansites';

      try {
        console.log(`🔗 [HabboAPI] Fetching ${endpoint}`);
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'HabboHub-Badge-System/1.0'
          }
        });

        if (!response.ok) {
          console.warn(`⚠️ [HabboAPI] Endpoint ${endpoint} retornou ${response.status}`);
          continue;
        }

        const data = await response.json();
        console.log(`✅ [HabboAPI] Endpoint ${endpoint} retornou ${Array.isArray(data) ? data.length : Object.keys(data).length} items`);

        // Processar dados conforme formato da API
        const badgeItems = processBadgeData(data, category);
        badges.push(...badgeItems);

      } catch (endpointError) {
        console.error(`❌ [HabboAPI] Erro no endpoint ${endpoint}:`, endpointError);
      }
    }

    // Se não conseguiu dados da API, gerar badges conhecidos
    if (badges.length === 0) {
      console.warn('⚠️ [HabboAPI] Nenhum badge da API, usando dados conhecidos');
      return generateKnownBadges();
    }

    return badges;

  } catch (error) {
    console.error('❌ [HabboAPI] Erro geral:', error);
    return generateKnownBadges();
  }
}

function processBadgeData(data: any, category: string): BadgeItem[] {
  const badges: BadgeItem[] = [];
  
  try {
    // Se data é array direto de badges
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item.code || item.id || item.name) {
          badges.push(createBadgeFromAPI(item, category));
        }
      });
    }
    // Se data é objeto com badges aninhados
    else if (typeof data === 'object' && data !== null) {
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (value && typeof value === 'object') {
          badges.push(createBadgeFromAPI({ code: key, ...value }, category));
        } else {
          badges.push(createBadgeFromAPI({ code: key, name: String(value) }, category));
        }
      });
    }
  } catch (error) {
    console.error('❌ [HabboAPI] Erro processando dados:', error);
  }

  return badges;
}

function createBadgeFromAPI(item: any, category: string): BadgeItem {
  const code = item.code || item.id || item.name || 'UNKNOWN';
  
  return {
    id: `habbo_api_${code}`,
    code: code,
    name: item.name || item.title || item.description || `Badge ${code}`,
    description: item.description || item.info || `Badge ${code} from Habbo API`,
    imageUrl: `https://habboassets.com/c_images/album1584/${code}.gif`,
    category: category,
    rarity: determineRarity(code, item.rarity),
    source: 'habbo-api' as const,
    scrapedAt: new Date().toISOString()
  };
}

function generateKnownBadges(): BadgeItem[] {
  // Lista expandida de badges conhecidos organizados por categoria
  const knownBadges = {
    official: [
      'ADM', 'MOD', 'STAFF', 'SUP', 'GUIDE', 'HELPER', 'VIP', 'ADMIN', 'MODERATOR',
      'HC1', 'HC2', 'HC3', 'HC4', 'HC5', 'HC6', 'HC7', 'HC8', 'HC9', 'HC10'
    ],
    achievements: [
      'ACH_BasicClub1', 'ACH_BasicClub2', 'ACH_BasicClub3', 'ACH_BasicClub4', 'ACH_BasicClub5',
      'ACH_RoomEntry1', 'ACH_RoomEntry2', 'ACH_RoomEntry3', 'ACH_RoomEntry4', 'ACH_RoomEntry5',
      'ACH_Login1', 'ACH_Login2', 'ACH_Login3', 'ACH_Login4', 'ACH_Login5',
      'ACH_Motto1', 'ACH_Avatar1', 'ACH_Guide1', 'ACH_AllTimeHotelPresence1',
      'ACH_HappyHour1', 'ACH_HappyHour2', 'ACH_HappyHour3'
    ],
    fansites: [
      'US001', 'US002', 'US003', 'US004', 'US005', 'US006', 'US007', 'US008', 'US009', 'US010',
      'BR001', 'BR002', 'BR003', 'BR004', 'BR005', 'BR006', 'BR007', 'BR008', 'BR009', 'BR010',
      'ES001', 'ES002', 'ES003', 'ES004', 'ES005',
      'DE001', 'DE002', 'DE003', 'FI001', 'FI002', 'FR001', 'FR002', 'IT001', 'NL001',
      'FANSITE001', 'FANSITE002', 'FANSITE003', 'PARTNER001', 'PARTNER002', 'SPECIAL001'
    ],
    others: [
      'XMAS07', 'XMAS08', 'XMAS09', 'XMAS10', 'XMAS11', 'XMAS12', 'XMAS13', 'XMAS14', 'XMAS15',
      'EASTER07', 'EASTER08', 'EASTER09', 'EASTER10', 'EASTER11', 'EASTER12',
      'SUMMER07', 'SUMMER08', 'SUMMER09', 'SUMMER10', 'SUMMER11', 'SUMMER12',
      'Y2005', 'Y2006', 'Y2007', 'Y2008', 'Y2009', 'Y2010', 'Y2011', 'Y2012', 'Y2013', 'Y2014', 'Y2015',
      'EVENT001', 'EVENT002', 'EVENT003', 'LIMITED001', 'LIMITED002', 'EXCLUSIVE001'
    ]
  };

  const badges: BadgeItem[] = [];

  Object.entries(knownBadges).forEach(([category, codes]) => {
    codes.forEach(code => {
      badges.push({
        id: `known_${code}`,
        code: code,
        name: generateBadgeName(code),
        description: `Badge ${code} - ${category}`,
        imageUrl: `https://habboassets.com/c_images/album1584/${code}.gif`,
        category: category,
        rarity: determineRarity(code, null),
        source: 'habbo-api' as const,
        scrapedAt: new Date().toISOString()
      });
    });
  });

  console.log(`🎯 [HabboAPI] Gerados ${badges.length} badges conhecidos`);
  return badges;
}

function generateBadgeName(code: string): string {
  const specialNames: Record<string, string> = {
    'ADM': 'Administrador',
    'MOD': 'Moderador',
    'STAFF': 'Equipe Habbo',
    'SUP': 'Supervisor',
    'GUIDE': 'Guia do Hotel',
    'HELPER': 'Ajudante',
    'VIP': 'VIP Badge'
  };

  for (const [key, name] of Object.entries(specialNames)) {
    if (code.includes(key)) return `${name} - ${code}`;
  }

  if (code.startsWith('ACH_')) return `Conquista: ${code.replace('ACH_', '')}`;
  if (code.startsWith('US')) return `Badge USA ${code}`;
  if (code.startsWith('BR')) return `Badge Brasil ${code}`;
  if (code.startsWith('ES')) return `Badge España ${code}`;
  if (code.startsWith('DE')) return `Badge Deutschland ${code}`;
  if (/^(HC\d+)/.test(code)) return `Habbo Club ${code}`;
  if (/^(XMAS|EASTER|SUMMER)/.test(code)) return `Badge Sazonal: ${code}`;
  if (code.startsWith('Y20')) return `Badge Anual ${code}`;
  
  return `Emblema ${code}`;
}

function generateFallbackBadges(): BadgeItem[] {
  const essentialCodes = [
    'ADM', 'MOD', 'STAFF', 'GUIDE', 'HELPER', 'VIP',
    'HC1', 'HC2', 'HC3', 'US001', 'US002', 'BR001', 'BR002',
    'ACH_BasicClub1', 'ACH_RoomEntry1', 'ACH_Login1'
  ];
  
  return essentialCodes.map(code => ({
    id: `fallback_${code}`,
    code: code,
    name: generateBadgeName(code),
    description: `Badge essencial ${code}`,
    imageUrl: `https://habboassets.com/c_images/album1584/${code}.gif`,
    category: categorizeBadge(code),
    rarity: determineRarity(code, null),
    source: 'habbo-api' as const,
    scrapedAt: new Date().toISOString()
  }));
}

function determineRarity(code: string, apiRarity: string | null): string {
  if (apiRarity) return apiRarity.toLowerCase();
  
  const upperCode = code.toUpperCase();
  
  if (/^(ADM|MOD|STAFF|SUP)/i.test(upperCode)) return 'legendary';
  if (/(LIMITED|EXCLUSIVE|SPECIAL|Y20)/i.test(upperCode)) return 'rare';
  if (/(EVENT|FANSITE|PARTNER|ACH|VIP|HC)/i.test(upperCode)) return 'uncommon';
  
  return 'common';
}

function categorizeBadge(code: string): string {
  const upperCode = code.toUpperCase();
  
  if (/^(ADM|MOD|STAFF|SUP|GUIDE|HELPER|ADMIN)/i.test(upperCode)) return 'official';
  if (/(ACH|GAME|WIN|VICTORY|CHAMPION|QUEST|MISSION|COMPLETE|FINISH)/i.test(upperCode)) return 'achievements';
  if (/(FANSITE|PARTNER|EVENT|SPECIAL|EXCLUSIVE|LIMITED|PROMO|COLLAB|US\d+|BR\d+|ES\d+|DE\d+)/i.test(upperCode)) return 'fansites';
  
  return 'others';
}

function applyFilters(badges: BadgeItem[], search: string, category: string, limit: number): BadgeItem[] {
  let filtered = badges;
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(badge => 
      badge.name.toLowerCase().includes(searchLower) ||
      badge.code.toLowerCase().includes(searchLower) ||
      badge.description.toLowerCase().includes(searchLower)
    );
  }

  if (category !== 'all') {
    filtered = filtered.filter(badge => badge.category === category);
  }
  
  return filtered.slice(0, limit);
}

function createResponse(badges: BadgeItem[], metadata: any) {
  const categories = [...new Set(badges.map(b => b.category))];
  
  return new Response(
    JSON.stringify({
      badges,
      metadata: {
        ...metadata,
        totalReturned: badges.length,
        categories: categories,
        fetchedAt: new Date().toISOString(),
        cacheInfo: {
          ttl: CACHE_TTL,
          source: metadata.source
        }
      }
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
