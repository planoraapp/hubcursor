
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache global para badges
const badgeCache = new Map<string, {
  badges: any[];
  timestamp: number;
}>()

// Lista de badges essenciais que SABEMOS que existem
const ESSENTIAL_BADGES = [
  // Staff e Oficiais
  { code: 'ADM', name: 'Administrador', category: 'official' },
  { code: 'MOD', name: 'Moderador', category: 'official' },
  { code: 'STAFF', name: 'Equipe Habbo', category: 'official' },
  { code: 'GUIDE', name: 'Guia do Hotel', category: 'official' },
  { code: 'HELPER', name: 'Ajudante', category: 'official' },
  { code: 'VIP', name: 'VIP Member', category: 'official' },
  
  // Habbo Club
  { code: 'HC1', name: 'Habbo Club 1', category: 'achievements' },
  { code: 'HC2', name: 'Habbo Club 2', category: 'achievements' },
  { code: 'HC3', name: 'Habbo Club 3', category: 'achievements' },
  { code: 'CLUB1', name: 'Club Badge 1', category: 'achievements' },
  { code: 'CLUB2', name: 'Club Badge 2', category: 'achievements' },
  
  // Achievements
  { code: 'ACH_BasicClub1', name: 'Conquista: Basic Club 1', category: 'achievements' },
  { code: 'ACH_RoomEntry1', name: 'Conquista: Room Entry 1', category: 'achievements' },
  { code: 'ACH_Login1', name: 'Conquista: First Login', category: 'achievements' },
  { code: 'ACH_Motto1', name: 'Conquista: First Motto', category: 'achievements' },
  { code: 'ACH_Avatar1', name: 'Conquista: Avatar Change', category: 'achievements' },
  
  // Fansites e Países
  { code: 'US001', name: 'USA Badge 001', category: 'fansites' },
  { code: 'US002', name: 'USA Badge 002', category: 'fansites' },
  { code: 'US003', name: 'USA Badge 003', category: 'fansites' },
  { code: 'BR001', name: 'Brasil Badge 001', category: 'fansites' },
  { code: 'BR002', name: 'Brasil Badge 002', category: 'fansites' },
  { code: 'DE001', name: 'Deutschland Badge 001', category: 'fansites' },
  { code: 'DE002', name: 'Deutschland Badge 002', category: 'fansites' },
  
  // Sazonais e Especiais
  { code: 'XMAS07', name: 'Natal 2007', category: 'others' },
  { code: 'XMAS08', name: 'Natal 2008', category: 'others' },
  { code: 'EASTER08', name: 'Páscoa 2008', category: 'others' },
  { code: 'SUMMER09', name: 'Verão 2009', category: 'others' },
  { code: 'Y2005', name: 'Badge Anual 2005', category: 'others' },
  { code: 'Y2006', name: 'Badge Anual 2006', category: 'others' },
];

// Função para validar se um badge realmente existe
async function validateBadgeExists(code: string): Promise<string | null> {
  const urls = [
    `https://www.habbowidgets.com/images/badges/${code}.gif`,
    `https://habbowidgets.com/images/badges/${code}.gif`,
    `https://habboassets.com/c_images/album1584/${code}.gif`,
    `https://images.habbo.com/c_images/album1584/${code}.gif`,
  ];
  
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ Badge ${code} validado: ${url}`);
        return url;
      }
    } catch (error) {
      continue;
    }
  }
  
  console.log(`❌ Badge ${code} não validado`);
  return null;
}

// Função para buscar badges do storage do Supabase
async function getBadgesFromStorage() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Credenciais do Supabase não encontradas');
    return [];
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data, error } = await supabase
      .from('habbo_badges')
      .select('*')
      .eq('is_active', true)
      .limit(100);
    
    if (error) {
      console.log('❌ Erro ao buscar badges do storage:', error.message);
      return [];
    }
    
    console.log(`📦 Encontrados ${data?.length || 0} badges no storage`);
    return data || [];
  } catch (error) {
    console.log('❌ Erro na conexão com storage:', error.message);
    return [];
  }
}

// Função para popular badges iniciais
async function populateInitialBadges() {
  console.log('🚀 Populando badges iniciais...');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Credenciais do Supabase não configuradas');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  let populated = 0;
  
  for (const badgeInfo of ESSENTIAL_BADGES) {
    const imageUrl = await validateBadgeExists(badgeInfo.code);
    
    if (imageUrl) {
      try {
        const { error } = await supabase
          .from('habbo_badges')
          .upsert({
            badge_code: badgeInfo.code,
            badge_name: badgeInfo.name,
            source: 'HabboWidgets',
            image_url: imageUrl,
            is_active: true,
            last_validated_at: new Date().toISOString(),
            validation_count: 1
          }, {
            onConflict: 'badge_code',
            ignoreDuplicates: false
          });
        
        if (!error) {
          populated++;
          console.log(`✅ Badge ${badgeInfo.code} populado`);
        } else {
          console.log(`❌ Erro ao popular ${badgeInfo.code}:`, error.message);
        }
      } catch (error) {
        console.log(`❌ Erro ao inserir ${badgeInfo.code}:`, error.message);
      }
    }
    
    // Delay para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`🎯 População concluída: ${populated} badges inseridos`);
  return { populated, total: ESSENTIAL_BADGES.length };
}

// Função principal para buscar badges
async function getBadges({ limit = 1000, search = '', category = 'all' }) {
  console.log(`🎯 Buscando badges: limit=${limit}, search="${search}", category=${category}`);
  
  // Verificar cache
  const cacheKey = `badges_${category}_${search}_${limit}`;
  const cached = badgeCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < 300000) { // 5 minutos
    console.log('💾 Usando cache de badges');
    return {
      badges: cached.badges,
      metadata: { source: 'cache', cached: true }
    };
  }
  
  // Buscar do storage primeiro
  let badges = await getBadgesFromStorage();
  
  // Se não tem badges no storage, usar dados essenciais
  if (badges.length === 0) {
    console.log('🔄 Usando badges essenciais como fallback');
    badges = [];
    
    for (const badgeInfo of ESSENTIAL_BADGES.slice(0, 50)) { // Limitar para performance
      const imageUrl = await validateBadgeExists(badgeInfo.code);
      
      if (imageUrl) {
        badges.push({
          id: `essential_${badgeInfo.code}`,
          badge_code: badgeInfo.code,
          badge_name: badgeInfo.name,
          source: 'HabboWidgets',
          image_url: imageUrl,
          created_at: new Date().toISOString(),
          last_validated_at: new Date().toISOString(),
          validation_count: 1,
          is_active: true,
          category: badgeInfo.category
        });
      }
    }
  }
  
  // Filtrar por categoria
  if (category !== 'all') {
    badges = badges.filter(badge => badge.category === category);
  }
  
  // Filtrar por busca
  if (search) {
    const searchLower = search.toLowerCase();
    badges = badges.filter(badge => 
      badge.badge_code.toLowerCase().includes(searchLower) ||
      badge.badge_name.toLowerCase().includes(searchLower)
    );
  }
  
  // Limitar resultados
  badges = badges.slice(0, limit);
  
  // Cache dos resultados
  badgeCache.set(cacheKey, {
    badges,
    timestamp: Date.now()
  });
  
  console.log(`✅ Retornando ${badges.length} badges`);
  return {
    badges,
    metadata: {
      total: badges.length,
      source: 'hybrid-system',
      cached: false,
      timestamp: new Date().toISOString()
    }
  };
}

serve(async (req) => {
  console.log(`🎯 [BadgesValidator] ${req.method} request recebida`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const body = await req.json();
    const { action = 'get-badges', ...params } = body;
    
    console.log(`📋 Action: ${action}, Params:`, params);
    
    if (action === 'populate-initial') {
      const result = await populateInitialBadges();
      return new Response(JSON.stringify({
        success: true,
        ...result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (action === 'get-badges') {
      const result = await getBadges(params);
      return new Response(JSON.stringify({
        success: true,
        ...result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    throw new Error(`Ação não reconhecida: ${action}`);
    
  } catch (error) {
    console.error('❌ Erro crítico:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      badges: [],
      metadata: {
        error: true,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
