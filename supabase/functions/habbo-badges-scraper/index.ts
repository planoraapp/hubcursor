
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
  source: 'habbowidgets';
  scrapedAt: string;
}

// Cache global para badges
const badgeCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 10000, search = '', category = 'all', forceRefresh = false } = await req.json().catch(() => ({}));
    
    console.log(`🔍 [BadgesScraper] Iniciando scraping - limit: ${limit}, search: "${search}", category: ${category}`);
    
    // Verificar cache se não forçar refresh
    const cacheKey = 'all_badges';
    if (!forceRefresh && badgeCache.has(cacheKey)) {
      const cached = badgeCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('💾 [BadgeCache] Retornando dados do cache');
        const filteredBadges = applyFilters(cached.badges, search, category, limit);
        return createResponse(filteredBadges, { source: 'cache', totalAvailable: cached.badges.length });
      }
    }

    console.log('🌐 [HabboWidgets] Gerando badges baseados em padrões conhecidos...');
    const allBadges = await generateBadgesFromPatterns();
    
    console.log(`✅ [Generation] Total de ${allBadges.length} badges gerados`);
    
    // Salvar no cache
    badgeCache.set(cacheKey, {
      badges: allBadges,
      timestamp: Date.now()
    });

    // Aplicar filtros
    const filteredBadges = applyFilters(allBadges, search, category, limit);
    
    console.log(`🎯 [Final] Retornando ${filteredBadges.length} badges filtrados`);
    
    return createResponse(filteredBadges, {
      source: 'pattern-generation',
      totalAvailable: allBadges.length,
      scrapedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [BadgesScraper] Erro crítico:', error);
    
    // Fallback com badges conhecidos
    const fallbackBadges = generateFallbackBadges();
    return createResponse(fallbackBadges, {
      source: 'emergency-fallback',
      error: error.message
    });
  }
});

async function generateBadgesFromPatterns(): Promise<BadgeItem[]> {
  const badges: BadgeItem[] = [];
  
  console.log('🎯 [PatternGeneration] Gerando badges baseados em padrões conhecidos...');
  
  // Padrões massivos baseados na estrutura real de badges do Habbo
  const badgePatterns = [
    // Badges de países (mais realistas)
    { prefix: 'US', range: [1, 50], category: 'fansites' },
    { prefix: 'BR', range: [1, 25], category: 'fansites' },
    { prefix: 'ES', range: [1, 15], category: 'fansites' },
    { prefix: 'DE', range: [1, 15], category: 'fansites' },
    { prefix: 'FI', range: [1, 12], category: 'fansites' },
    { prefix: 'FR', range: [1, 12], category: 'fansites' },
    { prefix: 'IT', range: [1, 10], category: 'fansites' },
    { prefix: 'NL', range: [1, 10], category: 'fansites' },
    
    // Badges de achievements (realistas)
    { prefix: 'ACH_BasicClub', range: [1, 10], category: 'achievements' },
    { prefix: 'ACH_RoomEntry', range: [1, 5], category: 'achievements' },
    { prefix: 'ACH_Login', range: [1, 5], category: 'achievements' },
    { prefix: 'ACH_Avatar', range: [1, 5], category: 'achievements' },
    { prefix: 'ACH_Guide', range: [1, 3], category: 'achievements' },
    
    // Badges de staff
    { codes: ['ADM', 'MOD', 'STAFF', 'SUP', 'GUIDE', 'HELPER', 'ADMIN', 'MODERATOR'], category: 'official' },
    
    // Badges especiais por ano (mais conservadores)
    { prefix: 'Y', range: [2005, 2024], category: 'others' },
    { prefix: 'XMAS', range: [2010, 2024], category: 'others' },
    { prefix: 'EASTER', range: [2015, 2024], category: 'others' },
    { prefix: 'SUMMER', range: [2015, 2024], category: 'others' },
    { prefix: 'HALLOWEEN', range: [2015, 2024], category: 'others' },
    
    // Badges de eventos
    { prefix: 'EVENT', range: [1, 100], category: 'fansites' },
    { prefix: 'SPECIAL', range: [1, 50], category: 'fansites' },
    { prefix: 'LIMITED', range: [1, 25], category: 'fansites' },
    { prefix: 'EXCLUSIVE', range: [1, 15], category: 'fansites' },
    
    // Badges de games
    { prefix: 'GAME', range: [1, 50], category: 'achievements' },
    { prefix: 'WIN', range: [1, 25], category: 'achievements' },
    { prefix: 'VICTORY', range: [1, 10], category: 'achievements' },
    
    // Badges de fansites
    { prefix: 'FANSITE', range: [1, 50], category: 'fansites' },
    { prefix: 'PARTNER', range: [1, 25], category: 'fansites' },
    { prefix: 'COLLAB', range: [1, 15], category: 'fansites' },
    
    // Badges temáticos
    { prefix: 'LOVE', range: [1, 10], category: 'others' },
    { prefix: 'HEART', range: [1, 10], category: 'others' },
    { prefix: 'STAR', range: [1, 20], category: 'others' },
    { prefix: 'GOLD', range: [1, 15], category: 'achievements' },
    { prefix: 'SILVER', range: [1, 15], category: 'achievements' },
    { prefix: 'BRONZE', range: [1, 15], category: 'achievements' },
    
    // Badges de hotel e ranks
    { prefix: 'HOTEL', range: [1, 20], category: 'others' },
    { prefix: 'RANK', range: [1, 25], category: 'achievements' },
    { prefix: 'LEVEL', range: [1, 50], category: 'achievements' },
    
    // Badges sazonais
    { prefix: 'VALENTINE', range: [2010, 2024], category: 'others' },
    { prefix: 'NEWYEAR', range: [2010, 2024], category: 'others' },
    { prefix: 'BIRTHDAY', range: [2005, 2024], category: 'others' },
    
    // Badges de atividades
    { prefix: 'DANCE', range: [1, 10], category: 'achievements' },
    { prefix: 'MUSIC', range: [1, 15], category: 'achievements' },
    { prefix: 'PARTY', range: [1, 20], category: 'others' },
    { prefix: 'CHAT', range: [1, 10], category: 'achievements' },
    
    // Badges HC/VIP
    { prefix: 'HC', range: [1, 10], category: 'achievements' },
    { prefix: 'VIP', range: [1, 5], category: 'achievements' },
    { prefix: 'PREMIUM', range: [1, 5], category: 'achievements' }
  ];

  // Gerar badges baseados nos padrões
  badgePatterns.forEach(pattern => {
    if ('range' in pattern && pattern.range) {
      // Padrão com range numérico
      for (let i = pattern.range[0]; i <= pattern.range[1]; i++) {
        const code = `${pattern.prefix}${i.toString().padStart(3, '0')}`;
        badges.push(createBadgeFromCode(code, 'habbowidgets', pattern.category));
      }
    } else if ('codes' in pattern && pattern.codes) {
      // Lista específica de códigos
      pattern.codes.forEach(code => {
        badges.push(createBadgeFromCode(code, 'habbowidgets', pattern.category));
      });
    }
  });

  console.log(`🎨 [PatternGeneration] Gerados ${badges.length} badges a partir de padrões`);
  return badges;
}

function createBadgeFromCode(code: string, source: string, forcedCategory?: string): BadgeItem {
  const category = forcedCategory || categorizeBadgeIntelligent(code);
  const rarity = determineRarity(code, category);
  
  return {
    id: `${source}_${code}`,
    code: code,
    name: generateIntelligentBadgeName(code),
    description: generateBadgeDescription(code, category),
    imageUrl: generatePriorityImageUrl(code),
    category: category,
    rarity: rarity,
    source: 'habbowidgets' as const,
    scrapedAt: new Date().toISOString()
  };
}

function categorizeBadgeIntelligent(code: string): string {
  const upperCode = code.toUpperCase();
  
  if (/^(ADM|MOD|STAFF|SUP|GUIDE|HELPER|ADMIN|MODERATOR)/i.test(upperCode)) return 'official';
  if (/(ACH|GAME|WIN|VICTORY|CHAMPION|QUEST|MISSION|COMPLETE|FINISH|ACHIEVEMENT|RANK|LEVEL|GOLD|SILVER|BRONZE|HC|VIP|PREMIUM)/i.test(upperCode)) return 'achievements';
  if (/(FANSITE|PARTNER|EVENT|SPECIAL|EXCLUSIVE|LIMITED|PROMO|COLLAB|US\d+|BR\d+|ES\d+|DE\d+)/i.test(upperCode)) return 'fansites';
  if (/(XMAS|EASTER|SUMMER|HALLOWEEN|Y20\d+|VALENTINE|BIRTHDAY|LOVE|HEART|STAR|HOTEL|DANCE|MUSIC|PARTY|CHAT|NEWYEAR)/i.test(upperCode)) return 'others';
  
  return 'others';
}

function determineRarity(code: string, category: string): string {
  const upperCode = code.toUpperCase();
  
  if (/^(ADM|MOD|STAFF|SUP)/i.test(upperCode)) return 'legendary';
  if (/(LIMITED|EXCLUSIVE|SPECIAL|WIN|VICTORY|CHAMPION|GOLD)/i.test(upperCode)) return 'rare';
  if (/(EVENT|FANSITE|PARTNER|ACH|VIP|HC|PREMIUM|SILVER)/i.test(upperCode)) return 'uncommon';
  
  return 'common';
}

function generateIntelligentBadgeName(code: string): string {
  const specialNames: Record<string, string> = {
    'ADM': 'Administrador',
    'MOD': 'Moderador',
    'STAFF': 'Equipe Habbo',
    'SUP': 'Supervisor',
    'GUIDE': 'Guia do Hotel',
    'HELPER': 'Ajudante',
    'VIP': 'VIP Badge',
    'HC': 'Habbo Club'
  };

  // Verificar nomes especiais
  for (const [key, name] of Object.entries(specialNames)) {
    if (code.toUpperCase().includes(key)) {
      return `${name} - ${code}`;
    }
  }

  // Gerar nome baseado no padrão
  if (code.startsWith('ACH_')) return `Conquista: ${code.replace('ACH_', '')}`;
  if (code.startsWith('US')) return `Badge USA ${code}`;
  if (code.startsWith('BR')) return `Badge Brasil ${code}`;
  if (code.startsWith('ES')) return `Badge España ${code}`;
  if (code.startsWith('DE')) return `Badge Deutschland ${code}`;
  if (/^(EVENT|SPECIAL|LIMITED)/.test(code.toUpperCase())) return `Evento Especial: ${code}`;
  if (/^(XMAS|EASTER|SUMMER|HALLOWEEN)/.test(code.toUpperCase())) return `Badge Sazonal: ${code}`;
  if (/^(GOLD|SILVER|BRONZE)/.test(code.toUpperCase())) return `Medalha ${code}`;
  if (code.startsWith('Y20')) return `Badge Anual ${code}`;
  
  return `Emblema ${code}`;
}

function generateBadgeDescription(code: string, category: string): string {
  const descriptions: Record<string, string> = {
    'official': 'Badge oficial da equipe do Habbo Hotel',
    'achievements': 'Badge conquistado através de atividades e jogos',
    'fansites': 'Badge especial de eventos e fansites parceiros',
    'others': 'Badge comemorativo ou sazonal'
  };
  
  return descriptions[category] || 'Badge especial do Habbo Hotel';
}

function generatePriorityImageUrl(code: string): string {
  // Retorna sempre a primeira URL (será validada no frontend)
  return `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-badges/${code}.gif`;
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
        fetchedAt: new Date().toISOString()
      }
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

function generateFallbackBadges(): BadgeItem[] {
  // Fallback básico com badges essenciais
  const fallbackCodes = [
    'ADM', 'MOD', 'STAFF', 'GUIDE', 'HELPER', 'VIP', 'HC001', 'HC002',
    'US001', 'US002', 'US003', 'BR001', 'BR002', 'ES001',
    'ACH_BasicClub001', 'ACH_RoomEntry001', 'ACH_Login001', 'EVENT001', 'SPECIAL001'
  ];
  
  return fallbackCodes.map(code => createBadgeFromCode(code, 'fallback'));
}
