import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Cache para buscas de usuários
const searchCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      'https://wueccgeizznjmjgmuscy.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { query, hotel = 'br', limit = 20 } = await req.json();
    
    if (!query || query.trim().length < 1) {
      return new Response(JSON.stringify({ 
        users: [],
        meta: { source: 'empty_query', count: 0, timestamp: new Date().toISOString() }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const cacheKey = `search:${query.trim().toLowerCase()}:${hotel}:${limit}`;
    
    // Verificar cache
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`📦 [habbo-user-search] Cache hit for "${query}"`);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔍 [habbo-user-search] Searching for "${query}" in hotel ${hotel}`);
    
    const searchTerm = query.trim().toLowerCase();
    const hotelFilter = hotel === 'com.br' ? 'br' : hotel;
    
    // Busca no banco local (prioridade)
    let localUsers = await searchLocalDatabase(supabase, searchTerm, hotelFilter, limit);
    
    // Se não encontrou resultados suficientes, buscar na API oficial do Habbo
    if (localUsers.length === 0) {
      console.log(`🌐 [habbo-user-search] No local results, trying Habbo API for "${query}"`);
      const apiUser = await searchHabboAPI(query, hotelFilter);
      if (apiUser) {
        // Cachear o usuário encontrado na API
        await cacheUserInDatabase(supabase, apiUser, hotelFilter);
        localUsers = [apiUser];
      }
    }

    const result = {
      users: localUsers,
      meta: {
        source: localUsers.length > 0 ? 'database_with_api_fallback' : 'no_results',
        query: query.trim(),
        timestamp: new Date().toISOString(),
        count: localUsers.length,
        hotel: hotelFilter
      }
    };

    // Salvar no cache
    searchCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    console.log(`✅ [habbo-user-search] Found ${localUsers.length} users for "${query}"`);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`❌ [habbo-user-search] Error:`, error);
    return new Response(JSON.stringify({ 
      error: error.message,
      users: [],
      meta: { source: 'error', count: 0, timestamp: new Date().toISOString() }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function searchLocalDatabase(supabase: any, searchTerm: string, hotel: string, limit: number) {
  console.log(`🔍 [searchLocalDatabase] Searching for "${searchTerm}" in hotel ${hotel}`);

  // Busca múltipla com diferentes prioridades
  const searches = [
    // 1. Busca exata (máxima prioridade)
    supabase
      .from('habbo_accounts')
      .select('*')
      .eq('hotel', hotel)
      .ilike('habbo_name', searchTerm)
      .limit(3),
    
    // 2. Busca começando com
    supabase
      .from('habbo_accounts')
      .select('*')
      .eq('hotel', hotel)
      .ilike('habbo_name', `${searchTerm}%`)
      .limit(8),
    
    // 3. Busca contendo
    supabase
      .from('habbo_accounts')
      .select('*')
      .eq('hotel', hotel)
      .ilike('habbo_name', `%${searchTerm}%`)
      .limit(15),

    // 4. Busca em usuários descobertos (fallback)
    supabase
      .from('discovered_users')
      .select('*')
      .eq('hotel', hotel)
      .ilike('habbo_name', `%${searchTerm}%`)
      .limit(10)
  ];

  const results = await Promise.allSettled(searches);
  const allUsers: any[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.data) {
      allUsers.push(...result.value.data);
    }
  });

  // Remover duplicatas baseado no habbo_id e priorizar resultados mais exatos
  const userMap = new Map();
  
  allUsers.forEach(user => {
    const key = user.habbo_id || user.id;
    if (!userMap.has(key)) {
      userMap.set(key, {
        id: user.habbo_id || user.id,
        habbo_name: user.habbo_name,
        habbo_id: user.habbo_id || user.id,
        hotel: user.hotel,
        motto: user.motto || '',
        figure_string: user.figure_string,
        online: user.is_online || false,
        last_seen: user.updated_at || user.last_seen_at || user.created_at
      });
    }
  });

  // Ordenar por relevância (exato > começa com > contém)
  const uniqueUsers = Array.from(userMap.values())
    .sort((a, b) => {
      const aName = a.habbo_name.toLowerCase();
      const bName = b.habbo_name.toLowerCase();
      
      // Exato tem prioridade máxima
      if (aName === searchTerm && bName !== searchTerm) return -1;
      if (bName === searchTerm && aName !== searchTerm) return 1;
      
      // Começa com tem prioridade sobre contém
      if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
      if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
      
      // Ordem alfabética para o resto
      return aName.localeCompare(bName);
    })
    .slice(0, limit);

  console.log(`✅ [searchLocalDatabase] Found ${uniqueUsers.length} users locally`);
  return uniqueUsers;
}

async function searchHabboAPI(query: string, hotel: string): Promise<any | null> {
  try {
    const hotelDomain = hotel === 'br' ? 'com.br' : hotel;
    const apiUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(query)}`;
    
    console.log(`🌐 [searchHabboAPI] Trying Habbo API: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HabboHub/1.0)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`❌ [searchHabboAPI] API returned ${response.status}`);
      return null;
    }

    const userData = await response.json();
    
    if (!userData || !userData.name) {
      console.log(`❌ [searchHabboAPI] No user data in response`);
      return null;
    }

    console.log(`✅ [searchHabboAPI] Found user via API: ${userData.name}`);
    
    return {
      id: userData.uniqueId,
      habbo_name: userData.name,
      habbo_id: userData.uniqueId,
      hotel: hotel,
      motto: userData.motto || '',
      figure_string: userData.figureString || '',
      online: userData.online || false,
      last_seen: userData.lastAccessTime || new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [searchHabboAPI] Error:', error);
    return null;
  }
}

async function cacheUserInDatabase(supabase: any, user: any, hotel: string) {
  try {
    // Adicionar tanto na tabela principal quanto na de descobertos
    const userData = {
      habbo_id: user.habbo_id,
      habbo_name: user.habbo_name,
      hotel: hotel,
      motto: user.motto,
      figure_string: user.figure_string,
      is_online: user.online,
      updated_at: new Date().toISOString()
    };

    // Tentar inserir na tabela principal (pode falhar se não tiver supabase_user_id)
    await supabase
      .from('discovered_users')
      .upsert({
        ...userData,
        last_seen_at: user.last_seen,
        discovery_source: 'api_search'
      }, {
        onConflict: 'habbo_name,hotel'
      });
      
    console.log(`📥 [cacheUserInDatabase] Cached user ${user.habbo_name} in discovered_users`);
  } catch (error) {
    console.error('❌ [cacheUserInDatabase] Error:', error);
  }
}