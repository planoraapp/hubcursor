import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuração para fontes de badges híbridas com URLs corrigidas
const BADGE_SOURCES = {
  HABBO_WIDGETS: 'https://www.habbowidgets.com/images/badges',
  HABBO_ASSETS: 'https://habboassets.com/c_images/album1584',
  SUPABASE_BUCKET: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-badges`,
  HABBO_OFFICIAL: 'https://images.habbo.com/c_images/album1584'
};

// Cache de validações para evitar requisições desnecessárias
const VALIDATION_CACHE = new Map<string, { valid: boolean, timestamp: number }>();
const CACHE_TTL = 60000 * 10; // 10 minutos

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

    const { action = 'get-badges', limit = 1000, search = '', category = 'all' } = await req.json();
    
    console.log(`🔧 [HybridSystem] Action: ${action}, limit: ${limit}, category: ${category}`);

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

// Função melhorada para buscar badges com fallbacks
async function handleGetBadges(supabase: any, { limit, search, category }: any) {
  console.log(`📊 [HybridGet] Fetching badges: limit=${limit}, search="${search}", category=${category}`);
  
  try {
    // Construir query dinamicamente
    let query = supabase
      .from('habbo_badges')
      .select('*')
      .eq('is_active', true)
      .order('validation_count', { ascending: false });

    // Aplicar filtro de categoria se não for 'all'
    if (category !== 'all') {
      query = query.eq('category', category);
    }

    // Aplicar busca se fornecida
    if (search) {
      query = query.or(`badge_code.ilike.%${search}%,badge_name.ilike.%${search}%`);
    }

    // Aplicar limite
    query = query.limit(limit);

    const { data: validatedBadges, error } = await query;
    
    if (error) {
      console.error('❌ [HybridGet] Database error:', error);
      throw error;
    }

    console.log(`✅ [HybridGet] Found ${validatedBadges?.length || 0} validated badges`);

    // Se poucos badges, ativar população automática
    const needsPopulation = (validatedBadges?.length || 0) < 20;
    let discoveredBadges: any[] = [];
    
    if (needsPopulation) {
      console.log(`🔍 [HybridGet] Auto-population triggered - discovering badges`);
      discoveredBadges = await discoverAndSaveBadges(supabase, 50);
    }

    // Combinar badges validados e descobertos
    const allBadges = [...(validatedBadges || []), ...discoveredBadges];
    
    // Categorizar badges
    const categorizedBadges = categorizeBadgesIntelligently(allBadges);

    // Filtrar por categoria final
    const finalBadges = category === 'all' 
      ? allBadges 
      : allBadges.filter(badge => badge.category === category);

    return new Response(JSON.stringify({
      success: true,
      badges: finalBadges.map(badge => ({
        id: badge.id,
        badge_code: badge.badge_code,
        badge_name: badge.badge_name || generateBadgeName(badge.badge_code),
        source: badge.source,
        image_url: badge.image_url,
        created_at: badge.created_at,
        last_validated_at: badge.last_validated_at,
        validation_count: badge.validation_count || 1,
        is_active: badge.is_active !== false,
        category: badge.category || determineBadgeCategory(badge.badge_code, badge.badge_name || '')
      })),
      metadata: {
        total: finalBadges.length,
        categories: {
          official: categorizedBadges.official.length,
          achievements: categorizedBadges.achievements.length,
          fansites: categorizedBadges.fansites.length,
          others: categorizedBadges.others.length,
          all: allBadges.length
        },
        discoveryMode: needsPopulation,
        source: 'hybrid-unified-system',
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    console.error('❌ [HybridGet] Error:', error);
    return await generateHybridFallback(category);
  }
}

// Sistema melhorado de descoberta e salvamento
async function discoverAndSaveBadges(supabase: any, maxBadges: number) {
  console.log(`🔍 [Discovery] Starting enhanced discovery for up to ${maxBadges} badges`);
  
  const commonBadges = getKnownWorkingBadgesList();
  const discoveredBadges: any[] = [];
  const batchSize = 10;
  
  // Processar em lotes menores para melhor performance
  for (let i = 0; i < Math.min(commonBadges.length, maxBadges); i += batchSize) {
    const batch = commonBadges.slice(i, i + batchSize);
    
    console.log(`📦 [Discovery] Processing batch ${Math.floor(i/batchSize) + 1} with ${batch.length} badges`);
    
    const batchPromises = batch.map(async (badgeCode) => {
      try {
        const validationResult = await validateBadgeFromSources(badgeCode);
        
        if (validationResult) {
          // Salvar badge na base de dados
          const { data: savedBadge, error } = await supabase
            .from('habbo_badges')
            .upsert({
              badge_code: badgeCode,
              badge_name: generateBadgeName(badgeCode),
              source: validationResult.source,
              image_url: validationResult.imageUrl,
              category: determineBadgeCategory(badgeCode, ''),
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
            console.log(`✅ [Discovery] Discovered and saved: ${badgeCode} from ${validationResult.source}`);
            return savedBadge;
          }
        }
      } catch (error) {
        console.log(`⚠️ [Discovery] Failed ${badgeCode}:`, error.message);
      }
      return null;
    });

    const batchResults = await Promise.allSettled(batchPromises);
    const successfulBadges = batchResults
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => (result as any).value);
    
    discoveredBadges.push(...successfulBadges);
    
    // Pausa entre lotes para evitar rate limiting
    if (i + batchSize < Math.min(commonBadges.length, maxBadges)) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`🎯 [Discovery] Enhanced discovery completed: ${discoveredBadges.length} badges found`);
  return discoveredBadges;
}

// População inicial melhorada com retry logic
async function handleInitialPopulation(supabase: any) {
  console.log(`🚀 [Population] Starting enhanced initial population`);
  
  try {
    const knownBadges = getKnownWorkingBadgesList();
    const populatedBadges: any[] = [];
    const batchSize = 15;
    const maxRetries = 2;
    
    console.log(`📝 [Population] Processing ${knownBadges.length} known working badges`);
    
    for (let i = 0; i < knownBadges.length; i += batchSize) {
      const batch = knownBadges.slice(i, i + batchSize);
      console.log(`🔄 [Population] Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(knownBadges.length/batchSize)}`);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (badgeCode) => {
          let attempts = 0;
          while (attempts < maxRetries) {
            try {
              const validationResult = await validateBadgeFromSources(badgeCode);
              
              if (validationResult) {
                const { data: savedBadge, error } = await supabase
                  .from('habbo_badges')
                  .upsert({
                    badge_code: badgeCode,
                    badge_name: generateBadgeName(badgeCode),
                    source: validationResult.source,
                    image_url: validationResult.imageUrl,
                    category: determineBadgeCategory(badgeCode, ''),
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
              break;
            } catch (error) {
              attempts++;
              if (attempts >= maxRetries) {
                console.log(`❌ [Population] Failed ${badgeCode} after ${maxRetries} attempts`);
              } else {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
              }
            }
          }
          return null;
        })
      );
      
      const successfulBadges = batchResults
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => (result as any).value);
        
      populatedBadges.push(...successfulBadges);
      
      // Pausa entre lotes
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`✅ [Population] Enhanced population completed: ${populatedBadges.length} badges`);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Base de dados populada com sistema melhorado',
      populated: populatedBadges.length,
      total_processed: knownBadges.length,
      categories: categorizeBadgesIntelligently(populatedBadges),
      badges: populatedBadges.slice(0, 10) // Amostra dos primeiros 10
    }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ [Population] Enhanced population failed:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Erro na população melhorada', 
      details: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Validação melhorada com cache e timeout otimizado
async function validateBadgeFromSources(badgeCode: string) {
  const cacheKey = badgeCode;
  const cached = VALIDATION_CACHE.get(cacheKey);
  
  // Verificar cache primeiro
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.valid ? { source: 'Cache', imageUrl: `${BADGE_SOURCES.HABBO_WIDGETS}/${badgeCode}.gif`, badgeCode } : null;
  }

  const sources = [
    { name: 'HabboWidgets', url: `${BADGE_SOURCES.HABBO_WIDGETS}/${badgeCode}.gif` },
    { name: 'HabboAssets', url: `${BADGE_SOURCES.HABBO_ASSETS}/${badgeCode}.gif` },
    { name: 'HabboOfficial', url: `${BADGE_SOURCES.HABBO_OFFICIAL}/${badgeCode}.gif` },
    { name: 'SupabaseBucket', url: `${BADGE_SOURCES.SUPABASE_BUCKET}/${badgeCode}.gif` }
  ];

  for (const source of sources) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
      
      const response = await fetch(source.url, { 
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HabboHubBot/1.0)'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const result = { 
          source: source.name, 
          imageUrl: source.url,
          badgeCode
        };
        
        // Cachear resultado positivo
        VALIDATION_CACHE.set(cacheKey, { valid: true, timestamp: Date.now() });
        return result;
      }
    } catch (error) {
      // Continuar para próxima fonte
      continue;
    }
  }

  // Cachear resultado negativo
  VALIDATION_CACHE.set(cacheKey, { valid: false, timestamp: Date.now() });
  return null;
}

// Lista otimizada de badges conhecidos e funcionais
function getKnownWorkingBadgesList(): string[] {
  return [
    // Staff e Oficiais
    'ADM', 'MOD', 'VIP', 'STAFF', 'GUIDE', 'HELPER',
    
    // Achievements básicos
    'ACH_BasicClub1', 'ACH_RoomEntry1', 'ACH_Login1', 'ACH_Motto1',
    'ACH_AvatarLooks1', 'ACH_FriendListSize1', 'ACH_GiftGiver1',
    
    // Jogos
    'GAM_MAHJONG1', 'GAM_POOL1', 'GAM_CHESS1', 'GAM_POKER1',
    
    // Habbo Club
    'HC1', 'HC2', 'HC3', 'CLUB1', 'CLUB2',
    
    // Nacionais
    'BR001', 'BR002', 'US001', 'ES001', 'DE001',
    
    // Eventos
    'XMAS2023', 'SUMMER2023', 'HALLOWEEN2023',
    
    // Conquistas comuns
    'WIN001', 'VICTORY1', 'CHAMPION1', 'SUCCESS1'
  ];
}

function categorizeBadgesIntelligently(badges: any[]) {
  const categorized = {
    official: [] as any[],
    achievements: [] as any[],
    fansites: [] as any[],
    others: [] as any[]
  };
  
  badges.forEach(badge => {
    const category = badge.category || determineBadgeCategory(badge.badge_code, badge.badge_name || '');
    if (categorized[category as keyof typeof categorized]) {
      categorized[category as keyof typeof categorized].push(badge);
    } else {
      categorized.others.push(badge);
    }
  });
  
  return categorized;
}

function determineBadgeCategory(code: string, name: string): string {
  const upperCode = code.toUpperCase();
  const upperName = name.toUpperCase();
  
  // Oficiais
  const officialPatterns = ['ADM', 'MOD', 'STAFF', 'VIP', 'GUIDE', 'HELPER'];
  if (officialPatterns.some(pattern => upperCode.includes(pattern) || upperName.includes(pattern))) {
    return 'official';
  }
  
  // Achievements
  const achievementPatterns = ['ACH', 'GAM', 'WIN', 'VICTORY', 'CHAMPION', 'SUCCESS'];
  if (achievementPatterns.some(pattern => upperCode.includes(pattern) || upperName.includes(pattern))) {
    return 'achievements';
  }
  
  // Fansites
  const fansitePatterns = ['FANSITE', 'PARTNER', 'EVENT', 'SPECIAL', 'EXCLUSIVE', 'XMAS', 'SUMMER', 'HALLOWEEN'];
  if (fansitePatterns.some(pattern => upperCode.includes(pattern) || upperName.includes(pattern))) {
    return 'fansites';
  }
  
  return 'others';
}

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
      if (code.includes('XMAS')) return `Natal ${code}`;
      if (code.includes('SUMMER')) return `Verão ${code}`;
      if (code.includes('EVENT')) return `Evento ${code}`;
      break;
  }
  
  return `Emblema ${code}`;
}

async function generateHybridFallback(category: string = 'all') {
  const fallbackBadges = getKnownWorkingBadgesList().slice(0, 30).map(code => ({
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

  const filteredBadges = category === 'all' 
    ? fallbackBadges 
    : fallbackBadges.filter(badge => badge.category === category);
  
  return new Response(JSON.stringify({
    success: true,
    badges: filteredBadges,
    metadata: {
      total: filteredBadges.length,
      source: 'hybrid-fallback-system',
      fallbackMode: true,
      category: category
    }
  }), {
    headers: { 
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
