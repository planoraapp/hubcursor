
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { page = 1, limit = 100, category = 'all' } = await req.json().catch(() => ({}));
    
    console.log(`🌐 [HabboEmotion Badges] Fetching page ${page}, limit ${limit}, category: ${category}`);

    const endpoints = [
      'https://api.habboemotion.com/public/badges/new/300',
      'https://habboemotion.com/api/badges/new/300'
    ];

    let badgesData: any[] = [];
    let successfulEndpoint = '';

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 [HabboEmotion Badges] Trying: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'HabboHub-Console/1.0',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
          console.log(`❌ Failed ${endpoint}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        
        if (data && data.data && data.data.badges && Array.isArray(data.data.badges)) {
          badgesData = data.data.badges;
          successfulEndpoint = endpoint;
          console.log(`✅ Success with ${badgesData.length} badges from ${endpoint}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Error with ${endpoint}:`, error.message);
        continue;
      }
    }

    // If no data, generate fallback
    if (badgesData.length === 0) {
      console.log('🔄 Generating badges fallback data');
      badgesData = generateBadgesFallbackData();
    }

    // Process badges with Portuguese descriptions
    const processedBadges = badgesData.map((item: any, index: number) => ({
      id: `badge_${item.id || index}`,
      code: item.code || `B${index.toString().padStart(5, '0')}`,
      name: translateBadgeName(item.code || ''),
      description: translateBadgeDescription(item.code || ''),
      category: categorizeBadge(item.code || ''),
      imageUrl: item.image_url || `https://habboemotion.com/images/badges/${item.code}.gif`,
      rarity: determineBadgeRarity(item.code || '')
    }));

    // Filter by category if specified
    const filteredBadges = category === 'all' 
      ? processedBadges 
      : processedBadges.filter((item: BadgeItem) => item.category === category);

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBadges = filteredBadges.slice(startIndex, endIndex);

    console.log(`🎯 Returning ${paginatedBadges.length} badges for page ${page}`);

    return new Response(
      JSON.stringify({
        badges: paginatedBadges,
        metadata: {
          source: successfulEndpoint || 'fallback',
          page,
          limit,
          total: filteredBadges.length,
          hasMore: endIndex < filteredBadges.length,
          categories: [...new Set(processedBadges.map((b: BadgeItem) => b.category))]
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [HabboEmotion Badges] Error:', error);
    
    return new Response(
      JSON.stringify({
        badges: generateBadgesFallbackData().slice(0, 50),
        metadata: {
          source: 'error-fallback',
          error: error.message
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function categorizeBadge(code: string): string {
  if (code.startsWith('ADM') || code.startsWith('MOD') || code.startsWith('STF')) return 'staff';
  if (code.includes('ACH') || code.includes('skill')) return 'conquistas';
  if (code.includes('EVT') || code.includes('event')) return 'eventos';
  if (code.includes('VIP') || code.includes('HC')) return 'especiais';
  if (code.includes('GAME') || code.includes('WIN')) return 'jogos';
  
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
    'GAME': 'Jogo'
  };
  
  for (const [key, value] of Object.entries(translations)) {
    if (code.includes(key)) {
      return `${value} ${code}`;
    }
  }
  
  return code;
}

function translateBadgeDescription(code: string): string {
  if (code.startsWith('ADM')) return 'Emblema exclusivo da equipe de administradores do Habbo.';
  if (code.startsWith('MOD')) return 'Emblema dos moderadores que mantêm a ordem no hotel.';
  if (code.includes('HC')) return 'Emblema especial para membros do Habbo Club.';
  if (code.includes('ACH')) return 'Emblema de conquista por completar desafios no jogo.';
  if (code.includes('EVT')) return 'Emblema comemorativo de evento especial do Habbo.';
  
  return `Emblema exclusivo do Habbo Hotel - ${code}`;
}

function determineBadgeRarity(code: string): string {
  if (code.startsWith('ADM') || code.startsWith('BETA')) return 'legendary';
  if (code.includes('RARE') || code.includes('LTD')) return 'rare';
  if (code.includes('HC') || code.includes('VIP')) return 'uncommon';
  
  return 'common';
}

function generateBadgesFallbackData(): BadgeItem[] {
  const fallbackBadges: BadgeItem[] = [];
  const categories = ['staff', 'conquistas', 'eventos', 'especiais', 'jogos', 'gerais'];
  
  categories.forEach(category => {
    for (let i = 1; i <= 20; i++) {
      const code = `${category.toUpperCase()}${i.toString().padStart(3, '0')}`;
      fallbackBadges.push({
        id: `fallback_${category}_${i}`,
        code,
        name: translateBadgeName(code),
        description: translateBadgeDescription(code),
        category,
        imageUrl: `https://habboemotion.com/images/badges/${code}.gif`,
        rarity: determineBadgeRarity(code)
      });
    }
  });
  
  return fallbackBadges;
}
