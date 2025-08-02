import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface BadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  rarity: string;
}

serve(async (req) => {
  // Enhanced CORS handling
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { 
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      } 
    });
  }

  try {
    const { page = 1, limit = 120, category = 'all' } = await req.json().catch(() => ({}));
    
    console.log(`🌐 [Enhanced Badges] Fetching page ${page}, limit ${limit}, category: ${category}`);

    // Try HabboWidgets first (more reliable for badges)
    const endpoints = [
      'https://www.habbowidgets.com/api/badges',
      'https://habbowidgets.com/api/badges', 
      'https://api.habboemotion.com/public/badges/new/500',
      'https://habboemotion.com/api/badges/new/500'
    ];

    let badgesData: any[] = [];
    let successfulEndpoint = '';

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 [Enhanced Badges] Trying: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'HabboHub-Enhanced/2.0 (Compatible Bot)',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
          },
          signal: AbortSignal.timeout(12000)
        });

        if (!response.ok) {
          console.log(`❌ Failed ${endpoint}: ${response.status} - ${response.statusText}`);
          continue;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.log(`❌ Invalid content-type from ${endpoint}: ${contentType}`);
          continue;
        }

        const data = await response.json();
        
        // Handle multiple response formats with enhanced detection
        if (data && Array.isArray(data)) {
          badgesData = data.slice(0, 1000); // Limit for performance
          successfulEndpoint = endpoint;
          console.log(`✅ Success with ${badgesData.length} badges from ${endpoint}`);
          break;
        } else if (data && data.data && Array.isArray(data.data.badges)) {
          badgesData = data.data.badges.slice(0, 1000);
          successfulEndpoint = endpoint;
          console.log(`✅ Success with ${badgesData.length} badges from ${endpoint}`);
          break;
        } else if (data && data.badges && Array.isArray(data.badges)) {
          badgesData = data.badges.slice(0, 1000);
          successfulEndpoint = endpoint;
          console.log(`✅ Success with ${badgesData.length} badges from ${endpoint}`);
          break;
        } else if (data && data.result && Array.isArray(data.result)) {
          badgesData = data.result.slice(0, 1000);
          successfulEndpoint = endpoint;
          console.log(`✅ Success with ${badgesData.length} badges from ${endpoint}`);
          break;
        }
        
        console.log(`⚠️ Unexpected data structure from ${endpoint}:`, Object.keys(data));
      } catch (error) {
        console.log(`❌ Error with ${endpoint}:`, error.message);
        continue;
      }
    }

    // Enhanced fallback with comprehensive badge collection
    if (badgesData.length === 0) {
      console.log('🔄 Generating comprehensive badges fallback data');
      badgesData = generateComprehensiveBadgesFallback();
    }

    // Process badges with optimized image URLs and Portuguese descriptions
    const processedBadges = badgesData.map((item: any, index: number) => {
      const badgeCode = item.code || item.badge_code || item.name || `BADGE${index.toString().padStart(3, '0')}`;
      
      return {
        id: `badge_${item.id || index}`,
        code: badgeCode,
        name: translateBadgeName(badgeCode),
        description: translateBadgeDescription(badgeCode),
        category: categorizeBadge(badgeCode),
        imageUrl: generateOptimizedBadgeUrl(badgeCode),
        rarity: determineBadgeRarity(badgeCode)
      };
    });

    // Filter by category if specified
    const filteredBadges = category === 'all' 
      ? processedBadges 
      : processedBadges.filter((item: BadgeItem) => item.category === category);

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBadges = filteredBadges.slice(startIndex, endIndex);

    console.log(`🎯 Returning ${paginatedBadges.length} enhanced badges for page ${page}`);

    return new Response(
      JSON.stringify({
        badges: paginatedBadges,
        metadata: {
          source: successfulEndpoint || 'comprehensive-fallback',
          page,
          limit,
          total: filteredBadges.length,
          hasMore: endIndex < filteredBadges.length,
          categories: [...new Set(processedBadges.map((b: BadgeItem) => b.category))],
          fetchedAt: new Date().toISOString(),
          dataQuality: successfulEndpoint ? 'live' : 'fallback'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [Enhanced Badges] Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        badges: generateComprehensiveBadgesFallback().slice(0, 50),
        metadata: {
          source: 'error-fallback',
          error: error.message,
          hasMore: false
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateOptimizedBadgeUrl(code: string): string {
  // Multiple URL patterns for maximum success rate
  const patterns = [
    `https://www.habbowidgets.com/images/badges/${code}.gif`,
    `https://habbowidgets.com/images/badges/${code}.gif`,
    `https://images.habbo.com/c_images/album1584/${code}.gif`,
    `https://www.habbo.com.br/habbo-imaging/badge/${code}.gif`,
    `https://habboemotion.com/images/badges/${code}.gif`,
    `https://cdn.habboemotion.com/badges/${code}.gif`
  ];
  
  return patterns[0]; // Primary URL - others will be fallbacks in the frontend
}

function categorizeBadge(code: string): string {
  const upperCode = code.toUpperCase();
  
  if (upperCode.includes('ADM') || upperCode.includes('MOD') || upperCode.includes('STF')) return 'staff';
  if (upperCode.includes('ACH') || upperCode.includes('SKILL') || upperCode.includes('WIN')) return 'conquistas';
  if (upperCode.includes('EVT') || upperCode.includes('EVENT') || upperCode.includes('SPECIAL')) return 'eventos';
  if (upperCode.includes('VIP') || upperCode.includes('HC') || upperCode.includes('CLUB')) return 'especiais';
  if (upperCode.includes('GAME') || upperCode.includes('SPORT') || upperCode.includes('COMP')) return 'jogos';
  
  return 'gerais';
}

function translateBadgeName(code: string): string {
  const translations: Record<string, string> = {
    'ADM': 'Administrador',
    'MOD': 'Moderador',
    'STF': 'Staff',
    'VIP': 'VIP',
    'HC': 'Habbo Club',
    'ACH': 'Conquista',
    'EVT': 'Evento',
    'GAME': 'Jogo',
    'WIN': 'Vencedor',
    'COMP': 'Competição',
    'SKILL': 'Habilidade'
  };
  
  for (const [key, value] of Object.entries(translations)) {
    if (code.toUpperCase().includes(key)) {
      return `${value} - ${code}`;
    }
  }
  
  return code;
}

function translateBadgeDescription(code: string): string {
  const upperCode = code.toUpperCase();
  
  if (upperCode.includes('ADM')) return 'Emblema exclusivo da equipe de administradores do Habbo Hotel.';
  if (upperCode.includes('MOD')) return 'Emblema dos moderadores que mantêm a ordem e segurança no hotel.';
  if (upperCode.includes('HC') || upperCode.includes('CLUB')) return 'Emblema especial para membros do Habbo Club Premium.';
  if (upperCode.includes('ACH') || upperCode.includes('SKILL')) return 'Emblema de conquista obtido por completar desafios especiais.';
  if (upperCode.includes('EVT') || upperCode.includes('EVENT')) return 'Emblema comemorativo de evento especial do Habbo Hotel.';
  if (upperCode.includes('GAME') || upperCode.includes('COMP')) return 'Emblema conquistado em competições e jogos do Habbo.';
  if (upperCode.includes('WIN')) return 'Emblema de vencedor em torneios e competições oficiais.';
  
  return `Emblema oficial do Habbo Hotel - ${code}. Este emblema representa uma conquista especial dentro do jogo.`;
}

function determineBadgeRarity(code: string): string {
  const upperCode = code.toUpperCase();
  
  if (upperCode.includes('ADM') || upperCode.includes('BETA') || upperCode.includes('FOUNDER')) return 'legendary';
  if (upperCode.includes('RARE') || upperCode.includes('LTD') || upperCode.includes('SPECIAL')) return 'rare';
  if (upperCode.includes('HC') || upperCode.includes('VIP') || upperCode.includes('EVENT')) return 'uncommon';
  
  return 'common';
}

function generateComprehensiveBadgesFallback(): BadgeItem[] {
  // Expanded collection with real Habbo badge codes
  const comprehensiveBadges = [
    // Staff badges
    { code: 'ADM', category: 'staff', rarity: 'legendary' },
    { code: 'MOD', category: 'staff', rarity: 'legendary' },
    { code: 'STF001', category: 'staff', rarity: 'rare' },
    { code: 'SUP001', category: 'staff', rarity: 'rare' },
    
    // HC/VIP badges  
    { code: 'HC1', category: 'especiais', rarity: 'uncommon' },
    { code: 'HC2', category: 'especiais', rarity: 'uncommon' },
    { code: 'HC3', category: 'especiais', rarity: 'uncommon' },
    { code: 'VIP001', category: 'especiais', rarity: 'rare' },
    
    // Achievement badges
    { code: 'ACH_BasicClub1', category: 'conquistas', rarity: 'common' },
    { code: 'ACH_RoomEntry1', category: 'conquistas', rarity: 'common' },
    { code: 'ACH_Login1', category: 'conquistas', rarity: 'common' },
    { code: 'ACH_Guide1', category: 'conquistas', rarity: 'uncommon' },
    { code: 'ACH_Trade1', category: 'conquistas', rarity: 'uncommon' },
    { code: 'ACH_SocialChat1', category: 'conquistas', rarity: 'common' },
    
    // Event badges
    { code: 'EVT_XMAS2024', category: 'eventos', rarity: 'rare' },
    { code: 'EVT_SUMMER2024', category: 'eventos', rarity: 'rare' },
    { code: 'EVT_HALLOWEEN2024', category: 'eventos', rarity: 'rare' },
    { code: 'EVT_EASTER2024', category: 'eventos', rarity: 'rare' },
    { code: 'EVT_CARNIVAL2024', category: 'eventos', rarity: 'uncommon' },
    
    // Game badges
    { code: 'GAME_SNOWWAR_WINNER', category: 'jogos', rarity: 'rare' },
    { code: 'GAME_FREEZE_CHAMPION', category: 'jogos', rarity: 'rare' },
    { code: 'GAME_BATTLEBALL_PRO', category: 'jogos', rarity: 'uncommon' },
    { code: 'COMP_BUILDER_2024', category: 'jogos', rarity: 'rare' },
    { code: 'COMP_FASHION_2024', category: 'jogos', rarity: 'uncommon' },
    
    // Special/Rare badges
    { code: 'BETA_TESTER', category: 'especiais', rarity: 'legendary' },
    { code: 'FOUNDER', category: 'especiais', rarity: 'legendary' },
    { code: 'RARE001', category: 'especiais', rarity: 'rare' },
    { code: 'LTD_SPECIAL', category: 'especiais', rarity: 'rare' },
    
    // General community badges
    { code: 'FRIEND_MAKER', category: 'gerais', rarity: 'common' },
    { code: 'ROOM_OWNER', category: 'gerais', rarity: 'common' },
    { code: 'COLLECTOR', category: 'gerais', rarity: 'uncommon' },
    { code: 'TRADER_PRO', category: 'gerais', rarity: 'uncommon' }
  ];

  return comprehensiveBadges.map((badge, index) => ({
    id: `enhanced_${index}`,
    code: badge.code,
    name: translateBadgeName(badge.code),
    description: translateBadgeDescription(badge.code),
    category: badge.category,
    imageUrl: generateOptimizedBadgeUrl(badge.code),
    rarity: badge.rarity
  }));
}
