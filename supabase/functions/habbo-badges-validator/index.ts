
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuração para fontes de badges híbridas
const BADGE_SOURCES = {
  HABBO_WIDGETS: 'https://www.habbowidgets.com/images/badges',
  HABBO_ASSETS: 'https://habboassets.com/c_images/album1584',
  SUPABASE_BUCKET: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-badges`,
  HABBO_OFFICIAL: 'https://images.habbo.com/c_images/album1584'
};

// Sistema híbrido unificado
serve(async (req) => {
  console.log(`🎯 [HybridSystem] ${req.method} request received`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action = 'get-badges', limit = 1000, search = '', category = 'all', populateMode = false } = await req.json();
    
    console.log(`🔧 [HybridSystem] Action: ${action}, limit: ${limit}, category: ${category}, populateMode: ${populateMode}`);

    if (action === 'populate-initial') {
      return await handleInitialPopulation(supabase);
    }

    if (action === 'get-badges') {
      return await handleGetBadges(supabase, { limit, search, category });
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid action',
      availableActions: ['get-badges', 'populate-initial']
    }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [HybridSystem] Critical error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Sistema híbrido error', 
      details: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Função para buscar badges com fallbacks híbridos
async function handleGetBadges(supabase: any, { limit, search, category }: any) {
  console.log(`📊 [HybridGet] Fetching badges with hybrid fallbacks`);
  
  try {
    // 1. Buscar badges validados da tabela principal
    let query = supabase
      .from('habbo_badges')
      .select('*')
      .eq('is_active', true)
      .order('validation_count', { ascending: false })
      .limit(limit);

    if (search) {
      query = query.or(`badge_code.ilike.%${search}%,badge_name.ilike.%${search}%`);
    }

    const { data: validatedBadges, error } = await query;
    
    if (error) {
      console.error('❌ [HybridGet] Database error:', error);
      throw error;
    }

    console.log(`✅ [HybridGet] Found ${validatedBadges?.length || 0} validated badges`);

    // 2. Se poucos badges na tabela, ativar descoberta automática
    const needsDiscovery = (validatedBadges?.length || 0) < 50;
    let discoveredBadges: any[] = [];
    
    if (needsDiscovery) {
      console.log(`🔍 [HybridGet] Activating auto-discovery mode`);
      discoveredBadges = await discoverAndValidateBadges(supabase, 100);
    }

    // 3. Categorizar badges usando sistema inteligente
    const allBadges = [...(validatedBadges || []), ...discoveredBadges];
    const categorizedBadges = categorizeBadgesIntelligently(allBadges);

    // 4. Filtrar por categoria se especificado
    const filteredBadges = category === 'all' 
      ? categorizedBadges.all 
      : categorizedBadges[category] || [];

    return new Response(JSON.stringify({
      success: true,
      badges: filteredBadges.map(badge => ({
        id: badge.id,
        badge_code: badge.badge_code,
        badge_name: badge.badge_name || `Badge ${badge.badge_code}`,
        source: badge.source,
        image_url: badge.image_url,
        created_at: badge.created_at,
        last_validated_at: badge.last_validated_at,
        validation_count: badge.validation_count || 1,
        is_active: badge.is_active !== false,
        category: determineBadgeCategory(badge.badge_code, badge.badge_name)
      })),
      metadata: {
        total: filteredBadges.length,
        categories: {
          official: categorizedBadges.official.length,
          achievements: categorizedBadges.achievements.length,
          fansites: categorizedBadges.fansites.length,
          others: categorizedBadges.others.length,
          all: categorizedBadges.all.length
        },
        discoveryMode: needsDiscovery,
        source: 'hybrid-unified-system',
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('❌ [HybridGet] Error:', error);
    return await generateHybridFallback();
  }
}

// Descoberta automática de badges
async function discoverAndValidateBadges(supabase: any, limit: number) {
  console.log(`🔍 [Discovery] Starting auto-discovery for ${limit} badges`);
  
  const commonBadges = getCommonBadgesList();
  const discoveredBadges: any[] = [];
  
  for (const badgeCode of commonBadges.slice(0, limit)) {
    try {
      const validationResult = await validateBadgeFromSources(badgeCode);
      
      if (validationResult) {
        // Salvar badge descoberto na tabela
        const { data: savedBadge, error } = await supabase
          .from('habbo_badges')
          .upsert({
            badge_code: badgeCode,
            badge_name: `Badge ${badgeCode}`,
            source: validationResult.source,
            image_url: validationResult.imageUrl,
            last_validated_at: new Date().toISOString(),
            validation_count: 1,
            is_active: true
          }, { 
            onConflict: 'badge_code',
            ignoreDuplicates: false 
          })
          .select()
          .single();

        if (!error && savedBadge) {
          discoveredBadges.push(savedBadge);
          console.log(`✅ [Discovery] Discovered and saved: ${badgeCode}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ [Discovery] Failed to discover ${badgeCode}:`, error.message);
    }
  }
  
  console.log(`🎯 [Discovery] Discovered ${discoveredBadges.length} new badges`);
  return discoveredBadges;
}

// População inicial da base de dados
async function handleInitialPopulation(supabase: any) {
  console.log(`🚀 [Population] Starting initial population`);
  
  try {
    const commonBadges = getCommonBadgesList();
    const populatedBadges: any[] = [];
    
    console.log(`📝 [Population] Processing ${commonBadges.length} known badges`);
    
    // Processar em lotes para evitar timeout
    const batchSize = 20;
    for (let i = 0; i < commonBadges.length; i += batchSize) {
      const batch = commonBadges.slice(i, i + batchSize);
      console.log(`🔄 [Population] Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(commonBadges.length/batchSize)}`);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (badgeCode) => {
          const validationResult = await validateBadgeFromSources(badgeCode);
          
          if (validationResult) {
            const { data: savedBadge, error } = await supabase
              .from('habbo_badges')
              .upsert({
                badge_code: badgeCode,
                badge_name: generateBadgeName(badgeCode),
                source: validationResult.source,
                image_url: validationResult.imageUrl,
                last_validated_at: new Date().toISOString(),
                validation_count: 1,
                is_active: true
              }, { onConflict: 'badge_code' })
              .select()
              .single();

            if (!error && savedBadge) {
              return savedBadge;
            }
          }
          return null;
        })
      );
      
      const successfulBadges = batchResults
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => (result as any).value);
        
      populatedBadges.push(...successfulBadges);
      
      // Pequena pausa entre lotes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`✅ [Population] Successfully populated ${populatedBadges.length} badges`);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Base de dados populada com sucesso',
      populated: populatedBadges.length,
      badges: populatedBadges.slice(0, 20) // Retornar apenas os primeiros 20 como amostra
    }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ [Population] Error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Erro na população inicial', 
      details: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Validar badge em todas as fontes (hierárquica)
async function validateBadgeFromSources(badgeCode: string) {
  const sources = [
    { name: 'HabboWidgets', url: `${BADGE_SOURCES.HABBO_WIDGETS}/${badgeCode}.gif` },
    { name: 'HabboAssets', url: `${BADGE_SOURCES.HABBO_ASSETS}/${badgeCode}.gif` },
    { name: 'SupabaseBucket', url: `${BADGE_SOURCES.SUPABASE_BUCKET}/${badgeCode}.gif` },
    { name: 'HabboOfficial', url: `${BADGE_SOURCES.HABBO_OFFICIAL}/${badgeCode}.gif` }
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source.url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        return { 
          source: source.name, 
          imageUrl: source.url,
          badgeCode
        };
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

// Lista de badges conhecidos/comuns para descoberta
function getCommonBadgesList(): string[] {
  return [
    // Badges oficiais
    'ADM', 'MOD', 'STAFF', 'VIP', 'SUP', 'GUIDE', 'HELPER', 'AMBASSADOR',
    'HC1', 'HC2', 'HC3', 'HC4', 'HC5', 'CLUB1', 'CLUB2', 'CLUB3',
    
    // Achievements comuns
    'ACH_BasicClub1', 'ACH_RoomEntry1', 'ACH_Login1', 'ACH_Motto1',
    'ACH_AvatarLooks1', 'ACH_FriendListSize1', 'ACH_GiftGiver1',
    'ACH_RespectGiven1', 'ACH_RespectEarned1', 'ACH_HappyHour1',
    
    // Conquistas de jogos
    'GAM_MAHJONG1', 'GAM_POOLL1', 'GAM_CHESS1', 'GAM_CHECKERS1',
    'GAM_POKER1', 'GAM_REVERSI1', 'GAM_TICTAC1', 'GAM_WOBBLE1',
    
    // Badges nacionais
    'BR001', 'BR002', 'BR003', 'US001', 'US002', 'US003',
    'ES001', 'ES002', 'DE001', 'FR001', 'IT001', 'NL001',
    
    // Eventos especiais
    'XMAS2023', 'SUMMER2023', 'HALLOWEEN2023', 'EASTER2023',
    'VALENTINE2023', 'NEWYEAR2023', 'PARTY2023', 'CARNIVAL2023',
    
    // Fansites conhecidos
    'FANSITE_HABBO', 'FANSITE_HABBOCITY', 'FANSITE_HABBOON',
    'PARTNER1', 'PARTNER2', 'EXCLUSIVE1', 'LIMITED1', 'PROMO1',
    
    // Conquistas extras
    'WIN001', 'WIN002', 'WIN003', 'VICTORY1', 'CHAMPION1',
    'QUEST001', 'MISSION001', 'COMPLETE1', 'SUCCESS1', 'FINISH1'
  ];
}

// Categorização inteligente de badges
function categorizeBadgesIntelligently(badges: any[]) {
  const categorized = {
    official: [] as any[],
    achievements: [] as any[],
    fansites: [] as any[],
    others: [] as any[],
    all: badges
  };
  
  badges.forEach(badge => {
    const category = determineBadgeCategory(badge.badge_code, badge.badge_name || '');
    categorized[category as keyof typeof categorized].push(badge);
  });
  
  return categorized;
}

// Determinar categoria do badge baseado em padrões
function determineBadgeCategory(code: string, name: string): string {
  const upperCode = code.toUpperCase();
  const upperName = name.toUpperCase();
  
  // Badges oficiais
  const officialPatterns = ['ADM', 'MOD', 'STAFF', 'VIP', 'SUP', 'GUIDE', 'HELPER', 'AMBASSADOR'];
  if (officialPatterns.some(pattern => upperCode.includes(pattern) || upperName.includes(pattern))) {
    return 'official';
  }
  
  // Achievements
  const achievementPatterns = ['ACH', 'GAM', 'WIN', 'VICTORY', 'CHAMPION', 'QUEST', 'MISSION', 'COMPLETE', 'SUCCESS'];
  if (achievementPatterns.some(pattern => upperCode.includes(pattern) || upperName.includes(pattern))) {
    return 'achievements';
  }
  
  // Fansites
  const fansitePatterns = ['FANSITE', 'PARTNER', 'EXCLUSIVE', 'LIMITED', 'PROMO', 'EVENT', 'SPECIAL'];
  if (fansitePatterns.some(pattern => upperCode.includes(pattern) || upperName.includes(pattern))) {
    return 'fansites';
  }
  
  return 'others';
}

// Gerar nome inteligente para badge
function generateBadgeName(code: string): string {
  const category = determineBadgeCategory(code, '');
  
  switch (category) {
    case 'official':
      if (code.includes('ADM')) return `Administrador ${code}`;
      if (code.includes('MOD')) return `Moderador ${code}`;
      if (code.includes('STAFF')) return `Staff ${code}`;
      if (code.includes('VIP')) return `VIP ${code}`;
      break;
    case 'achievements':
      if (code.includes('ACH')) return `Conquista ${code.replace('ACH_', '')}`;
      if (code.includes('GAM')) return `Jogo ${code.replace('GAM_', '')}`;
      if (code.includes('WIN')) return `Vitória ${code}`;
      break;
    case 'fansites':
      if (code.includes('FANSITE')) return `Fã-site ${code.replace('FANSITE_', '')}`;
      if (code.includes('PARTNER')) return `Parceiro ${code}`;
      if (code.includes('EVENT')) return `Evento ${code}`;
      break;
  }
  
  return `Badge ${code}`;
}

// Fallback híbrido em caso de erro total
async function generateHybridFallback() {
  const fallbackBadges = getCommonBadgesList().slice(0, 50).map(code => ({
    id: `fallback_${code}`,
    badge_code: code,
    badge_name: generateBadgeName(code),
    source: 'HybridFallback',
    image_url: `${BADGE_SOURCES.HABBO_WIDGETS}/${code}.gif`,
    created_at: new Date().toISOString(),
    last_validated_at: new Date().toISOString(),
    validation_count: 1,
    is_active: true,
    category: determineBadgeCategory(code, '')
  }));
  
  return new Response(JSON.stringify({
    success: true,
    badges: fallbackBadges,
    metadata: {
      total: fallbackBadges.length,
      source: 'hybrid-fallback-system',
      fallbackMode: true
    }
  }), {
    headers: { 
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
