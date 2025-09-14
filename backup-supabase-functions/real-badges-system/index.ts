
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache global para badges verificados
const verifiedBadgesCache = new Map<string, {
  badges: any[];
  timestamp: number;
  source: string;
}>()

// Lista de badges conhecidos e verificados como existentes
const VERIFIED_BADGES = [
  // Staff e Oficiais
  'ADM', 'MOD', 'ADM001', 'ADM002', 'ADM003', 'MOD001', 'MOD002', 'MOD003',
  'STAFF', 'GUIDE', 'HELPER', 'SUP001', 'SUP002', 'AMBASSADOR',
  
  // HC e VIP
  'HC1', 'HC2', 'HC3', 'HC4', 'HC5', 'VIP1', 'VIP2', 'VIP3',
  'CLUB1', 'CLUB2', 'CLUB3', 'GOLD1', 'GOLD2', 'SILVER1', 'SILVER2',
  
  // Achievements reais
  'ACH_Login1', 'ACH_Login2', 'ACH_Login3', 'ACH_Login4', 'ACH_Login5',
  'ACH_RoomEntry1', 'ACH_RoomEntry2', 'ACH_RoomEntry3', 'ACH_RoomEntry4',
  'ACH_BasicClub1', 'ACH_BasicClub2', 'ACH_BasicClub3',
  'ACH_Motto1', 'ACH_Motto2', 'ACH_Avatar1', 'ACH_Avatar2',
  'ACH_Trading1', 'ACH_Trading2', 'ACH_Trading3',
  
  // Eventos e competições reais
  'COMP2019', 'COMP2020', 'COMP2021', 'COMP2022', 'COMP2023', 'COMP2024',
  'EVENT001', 'EVENT002', 'EVENT003', 'PARTY001', 'PARTY002',
  'WINNER1', 'WINNER2', 'WINNER3', 'CHAMPION1', 'CHAMPION2',
  
  // Badges de países/hotéis
  'BR001', 'BR002', 'BR003', 'US001', 'US002', 'US003', 'US004', 'US005',
  'DE001', 'DE002', 'ES001', 'ES002', 'FR001', 'FR002', 'IT001', 'IT002',
  
  // Fã-sites conhecidos
  'FANSITE001', 'FANSITE002', 'HABBOX1', 'HABBOX2', 'SULAKE1', 'SULAKE2',
  'PARTNER1', 'PARTNER2', 'EXCLUSIVE1', 'EXCLUSIVE2',
  
  // Badges sazonais/especiais
  'XMAS2019', 'XMAS2020', 'XMAS2021', 'XMAS2022', 'XMAS2023',
  'EASTER2020', 'EASTER2021', 'EASTER2022', 'EASTER2023',
  'SUMMER2020', 'SUMMER2021', 'SUMMER2022', 'SUMMER2023',
  'HALLOWEEN2020', 'HALLOWEEN2021', 'HALLOWEEN2022', 'HALLOWEEN2023',
  
  // Badges de jogos reais
  'GAME_POOL1', 'GAME_POOL2', 'GAME_SNOW1', 'GAME_SNOW2',
  'GAME_BATTLE1', 'GAME_BATTLE2', 'PUZZLE1', 'PUZZLE2',
  
  // Badges de construção/criatividade
  'BUILDER1', 'BUILDER2', 'BUILDER3', 'ARTIST1', 'ARTIST2',
  'ARCHITECT1', 'ARCHITECT2', 'CREATIVE1', 'CREATIVE2',
  
  // Badges de comunidade
  'FRIEND1', 'FRIEND2', 'FRIEND3', 'SOCIAL1', 'SOCIAL2',
  'COMMUNITY1', 'COMMUNITY2', 'RESPECT1', 'RESPECT2',
  
  // Badges especiais numerados
  'RARE001', 'RARE002', 'RARE003', 'RARE004', 'RARE005',
  'SPECIAL001', 'SPECIAL002', 'SPECIAL003', 'LIMITED001', 'LIMITED002'
];

// Função para validar se um badge realmente existe
async function validateBadgeExists(code: string): Promise<boolean> {
  console.log(`🔍 [Validation] Verificando existência do badge: ${code}`);
  
  // URLs prioritárias para verificação (mais confiáveis primeiro)
  const validationUrls = [
    `https://habboassets.com/c_images/album1584/${code}.gif`,
    `https://images.habbo.com/c_images/album1584/${code}.gif`,
    `https://www.habbowidgets.com/images/badges/${code}.gif`,
    `https://www.habbo.com/habbo-imaging/badge/${code}.gif`
  ];
  
  for (const url of validationUrls) {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'HabboHub-BadgeValidator/1.0'
        }
      });
      
      if (response.ok && response.status === 200) {
        console.log(`✅ [Validation] Badge ${code} confirmado em: ${url}`);
        return true;
      }
    } catch (error) {
      // Continuar para próxima URL
      continue;
    }
  }
  
  console.log(`❌ [Validation] Badge ${code} NÃO EXISTE em nenhuma fonte`);
  return false;
}

// Função para buscar badges reais com validação
async function fetchRealBadges(): Promise<any[]> {
  console.log('🚀 [RealBadges] Iniciando busca de badges REAIS...');
  
  const realBadges: any[] = [];
  let validatedCount = 0;
  let invalidCount = 0;
  
  // Processar badges em lotes para evitar sobrecarga
  const batchSize = 10;
  for (let i = 0; i < VERIFIED_BADGES.length; i += batchSize) {
    const batch = VERIFIED_BADGES.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (code) => {
      const isValid = await validateBadgeExists(code);
      
      if (isValid) {
        validatedCount++;
        return {
          id: `real_${code}`,
          code: code,
          name: getBadgeName(code),
          description: getBadgeDescription(code),
          imageUrl: `https://habboassets.com/c_images/album1584/${code}.gif`,
          category: categorizeBadge(code),
          rarity: getBadgeRarity(code),
          source: 'real-validated',
          scrapedAt: new Date().toISOString(),
          verified: true
        };
      } else {
        invalidCount++;
        return null;
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        realBadges.push(result.value);
      }
    });
    
    // Pequeno delay entre lotes para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`📊 [RealBadges] Resultado final:`);
  console.log(`  ✅ Badges válidos: ${validatedCount}`);
  console.log(`  ❌ Badges inválidos: ${invalidCount}`);
  console.log(`  📦 Total processado: ${VERIFIED_BADGES.length}`);
  console.log(`  🎯 Taxa de sucesso: ${Math.round((validatedCount / VERIFIED_BADGES.length) * 100)}%`);
  
  return realBadges;
}

function getBadgeName(code: string): string {
  const nameMap: Record<string, string> = {
    'ADM': 'Administrador',
    'MOD': 'Moderador',
    'STAFF': 'Staff Member',
    'GUIDE': 'Guia Oficial',
    'HELPER': 'Helper',
    'HC1': 'Habbo Club',
    'VIP1': 'VIP Member',
    'ACH_Login1': 'First Login',
    'ACH_RoomEntry1': 'Room Explorer',
    'BR001': 'Brasil Badge',
    'COMP2024': 'Competição 2024',
    'XMAS2023': 'Natal 2023'
  };
  
  return nameMap[code] || `Badge ${code}`;
}

function getBadgeDescription(code: string): string {
  if (code.startsWith('ADM') || code.startsWith('MOD')) return 'Badge oficial da equipe Habbo';
  if (code.startsWith('HC') || code.startsWith('VIP')) return 'Badge exclusivo para membros premium';
  if (code.startsWith('ACH_')) return 'Badge de conquista do jogo';
  if (code.includes('COMP')) return 'Badge de competição oficial';
  if (code.includes('XMAS') || code.includes('EASTER')) return 'Badge sazonal especial';
  
  return `Emblema especial ${code}`;
}

function categorizeBadge(code: string): string {
  if (code.match(/^(ADM|MOD|STAFF|GUIDE|HELPER|SUP)/)) return 'official';
  if (code.match(/^(ACH_|GAME_|PUZZLE|WINNER|CHAMPION)/)) return 'achievements';
  if (code.match(/(FANSITE|PARTNER|EXCLUSIVE|HABBOX|SULAKE)/)) return 'fansites';
  return 'others';
}

function getBadgeRarity(code: string): string {
  if (code.match(/^(ADM|MOD)/)) return 'legendary';
  if (code.match(/(RARE|LIMITED|EXCLUSIVE|SPECIAL)/)) return 'rare';
  if (code.match(/^(HC|VIP|STAFF)/)) return 'uncommon';
  return 'common';
}

serve(async (req) => {
  console.log(`🎯 [RealBadges] ${req.method} request recebida`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { limit = 1000, search = '', category = 'all' } = await req.json();
    
    console.log(`📋 [RealBadges] Parâmetros: limit=${limit}, search="${search}", category=${category}`);
    
    // Verificar cache (TTL: 1 hora para badges reais)
    const cacheKey = `real_badges_${category}_${search}`;
    const cached = verifiedBadgesCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < (60 * 60 * 1000)) {
      console.log(`💾 [RealBadges] Dados do cache (${cached.badges.length} badges)`);
      
      return new Response(JSON.stringify({
        badges: cached.badges.slice(0, limit),
        metadata: {
          total: cached.badges.length,
          source: 'cache-validated',
          cached: true,
          timestamp: new Date().toISOString()
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Buscar badges reais
    console.log(`🔄 [RealBadges] Buscando badges reais...`);
    const realBadges = await fetchRealBadges();
    
    // Filtrar por categoria
    let filteredBadges = category === 'all' 
      ? realBadges 
      : realBadges.filter(badge => badge.category === category);
    
    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBadges = filteredBadges.filter(badge => 
        badge.code.toLowerCase().includes(searchLower) ||
        badge.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Cache dos resultados
    verifiedBadgesCache.set(cacheKey, {
      badges: filteredBadges,
      timestamp: now,
      source: 'real-validated'
    });
    
    const response = {
      badges: filteredBadges.slice(0, limit),
      metadata: {
        total: filteredBadges.length,
        totalVerified: realBadges.length,
        source: 'real-validated',
        cached: false,
        validationRate: Math.round((realBadges.length / VERIFIED_BADGES.length) * 100),
        timestamp: new Date().toISOString(),
        categories: {
          official: realBadges.filter(b => b.category === 'official').length,
          achievements: realBadges.filter(b => b.category === 'achievements').length,
          fansites: realBadges.filter(b => b.category === 'fansites').length,
          others: realBadges.filter(b => b.category === 'others').length
        }
      }
    };
    
    console.log(`✅ [RealBadges] Retornando ${response.badges.length} badges REAIS`);
    console.log(`📊 [RealBadges] Estatísticas: ${JSON.stringify(response.metadata.categories)}`);
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ [RealBadges] Erro crítico:', error);
    
    return new Response(JSON.stringify({
      error: 'Erro no sistema de badges reais',
      message: error.message,
      badges: [],
      metadata: {
        total: 0,
        source: 'error',
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
