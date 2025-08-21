
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Cache simples para descoberta de usuários
const discoveryCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      'https://wueccgeizznjmjgmuscy.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { hotel = 'br', method = 'random', limit = 20, query } = await req.json();
    const cacheKey = `${hotel}:${method}:${limit}:${query || ''}`;
    
    // Verificar cache
    const cached = discoveryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`📦 [discover-users] Cache hit for ${cacheKey}`);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔍 [discover-users] Discovering users via ${method} for hotel ${hotel}`);
    
    let users = [];
    const hotelFilter = hotel === 'com.br' ? 'br' : hotel;
    
    switch (method) {
      case 'search':
        users = await searchUsers(supabase, hotelFilter, query, limit);
        break;
      case 'random':
        users = await discoverRandomUsers(supabase, hotelFilter, limit);
        break;
      case 'recent':
        users = await discoverRecentUsers(supabase, hotelFilter, limit);
        break;
      case 'active':
        users = await discoverActiveUsers(supabase, hotelFilter, limit);
        break;
      default:
        users = await discoverRandomUsers(supabase, hotelFilter, limit);
    }

    // Se não encontrou resultados suficientes, tentar buscar na API do Habbo
    if (users.length < Math.min(limit, 5) && query) {
      console.log(`🌐 [discover-users] Fallback to Habbo API for "${query}"`);
      const apiUsers = await searchHabboAPI(query, hotelFilter);
      
      // Mergear resultados, removendo duplicatas
      const existingIds = new Set(users.map(u => u.habbo_id));
      const newUsers = apiUsers.filter(u => !existingIds.has(u.habbo_id));
      users = [...users, ...newUsers].slice(0, limit);

      // Cachear novos usuários na base local
      for (const user of newUsers) {
        await cacheUserInDatabase(supabase, user, hotelFilter);
      }
    }

    const result = {
      users,
      meta: {
        source: 'database_with_api_fallback',
        method,
        timestamp: new Date().toISOString(),
        count: users.length,
        hotel: hotelFilter
      }
    };

    // Salvar no cache
    discoveryCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`❌ [discover-users] Error:`, error);
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

async function discoverRandomUsers(supabase: any, hotel: string, limit: number) {
  // Limit to 5-8 users as requested, prefer online users
  const actualLimit = Math.min(Math.max(limit, 5), 8);
  
  try {
    // First try to get diverse users from both habbo_accounts and discovered_users
    const { data: accountUsers, error: accountError } = await supabase
      .from('habbo_accounts')
      .select('habbo_name, habbo_id, hotel, motto, figure_string, is_online, created_at')
      .eq('hotel', hotel)
      .order('created_at', { ascending: false })
      .limit(actualLimit * 2);

    if (accountError) {
      console.error('❌ [discoverRandomUsers] habbo_accounts error:', accountError);
    }

    const { data: discoveredUsers, error: discoveredError } = await supabase
      .from('discovered_users')
      .select('habbo_name, habbo_id, hotel, motto, figure_string, is_online, last_seen_at')
      .eq('hotel', hotel)
      .order('last_seen_at', { ascending: false })
      .limit(actualLimit * 2);

    if (discoveredError) {
      console.error('❌ [discoverRandomUsers] discovered_users error:', discoveredError);
    }

    // Combine users from both sources
    const allUsers = [
      ...(accountUsers || []).map(user => ({
        ...user,
        source: 'accounts',
        last_activity: user.created_at
      })),
      ...(discoveredUsers || []).map(user => ({
        ...user,
        source: 'discovered',
        last_activity: user.last_seen_at
      }))
    ];

    // Remove duplicates based on habbo_id
    const uniqueUsers = allUsers.filter((user, index, self) => 
      index === self.findIndex(u => u.habbo_id === user.habbo_id)
    );

    // Truly randomize with Fisher-Yates shuffle
    const shuffled = [...uniqueUsers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Prefer online users but keep variety
    const selected = shuffled
      .sort((a, b) => {
        if (a.is_online && !b.is_online) return -1;
        if (!a.is_online && b.is_online) return 1;
        return 0;
      })
      .slice(0, actualLimit);

    return selected.map(user => ({
      id: user.habbo_id,
      habbo_name: user.habbo_name,
      habbo_id: user.habbo_id,
      hotel: user.hotel,
      motto: user.motto || '',
      figure_string: user.figure_string || '',
      online: user.is_online || false,
      last_seen: user.last_activity || user.created_at
    }));

  } catch (error) {
    console.error('❌ [discoverRandomUsers] Error:', error);
    
    // Fallback: try to get just from discovered_users if habbo_accounts fails
    const { data: fallbackUsers } = await supabase
      .from('discovered_users')
      .select('habbo_name, habbo_id, hotel, motto, figure_string, is_online, last_seen_at')
      .eq('hotel', hotel)
      .limit(actualLimit);

    return (fallbackUsers || []).map(user => ({
      id: user.habbo_id,
      habbo_name: user.habbo_name,
      habbo_id: user.habbo_id,
      hotel: user.hotel,
      motto: user.motto || '',
      figure_string: user.figure_string || '',
      online: user.is_online || false,
      last_seen: user.last_seen_at
    }));
  }
}

async function discoverRecentUsers(supabase: any, hotel: string, limit: number) {
  const { data, error } = await supabase
    .from('habbo_accounts')
    .select('habbo_name, habbo_id, hotel, motto, figure_string, is_online, created_at')
    .eq('hotel', hotel)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(user => ({
    id: user.habbo_id,
    habbo_name: user.habbo_name,
    habbo_id: user.habbo_id,
    hotel: user.hotel,
    motto: user.motto || '',
    figure_string: user.figure_string || '',
    online: user.is_online || false,
    last_seen: user.created_at
  }));
}

async function discoverActiveUsers(supabase: any, hotel: string, limit: number) {
  const { data, error } = await supabase
    .from('habbo_accounts')
    .select('habbo_name, habbo_id, hotel, motto, figure_string, is_online, created_at')
    .eq('hotel', hotel)
    .eq('is_online', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(user => ({
    id: user.habbo_id,
    habbo_name: user.habbo_name,
    habbo_id: user.habbo_id,
    hotel: user.hotel,
    motto: user.motto || '',
    figure_string: user.figure_string || '',
    online: user.is_online || false,
    last_seen: user.created_at
  }));
}

async function searchUsers(supabase: any, hotel: string, query: string, limit: number) {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const searchTerm = query.trim().toLowerCase();
  console.log(`🔍 [searchUsers] Searching for "${searchTerm}" in hotel ${hotel}`);

    // Busca flexível: exato, começando com, contendo
    const searches = [
      // Busca exata (prioridade máxima)
      supabase
        .from('habbo_accounts')
        .select('habbo_name, habbo_id, hotel, motto, figure_string, is_online, created_at')
        .eq('hotel', hotel)
        .ilike('habbo_name', searchTerm)
        .limit(5),
      
      // Busca começando com
      supabase
        .from('habbo_accounts')
        .select('habbo_name, habbo_id, hotel, motto, figure_string, is_online, created_at')
        .eq('hotel', hotel)
        .ilike('habbo_name', `${searchTerm}%`)
        .limit(10),
      
      // Busca contendo
      supabase
        .from('habbo_accounts')
        .select('habbo_name, habbo_id, hotel, motto, figure_string, is_online, created_at')
        .eq('hotel', hotel)
        .ilike('habbo_name', `%${searchTerm}%`)
        .limit(15)
    ];

  const results = await Promise.allSettled(searches);
  const allUsers: any[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.data) {
      allUsers.push(...result.value.data);
    }
  });

  // Remover duplicatas e limitar
  const uniqueUsers = Array.from(
    new Map(allUsers.map(user => [user.habbo_id, user])).values()
  ).slice(0, limit);

  console.log(`✅ [searchUsers] Found ${uniqueUsers.length} users for "${searchTerm}"`);

    return uniqueUsers.map(user => ({
      id: user.habbo_id,
      habbo_name: user.habbo_name,
      habbo_id: user.habbo_id,
      hotel: user.hotel,
      motto: user.motto || '',
      figure_string: user.figure_string || '',
      online: user.is_online || false,
      last_seen: user.created_at
    }));
}

async function searchHabboAPI(query: string, hotel: string): Promise<any[]> {
  try {
    const hotelDomain = hotel === 'br' ? 'com.br' : hotel;
    const apiUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(query)}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const userData = await response.json();
    
    return [{
      id: userData.uniqueId,
      habbo_name: userData.name,
      habbo_id: userData.uniqueId,
      hotel: hotel,
      motto: userData.motto || '',
      figure_string: userData.figureString || '',
      online: userData.online || false,
      last_seen: userData.lastAccessTime || new Date().toISOString()
    }];
  } catch (error) {
    console.error('Error searching Habbo API:', error);
    return [];
  }
}

async function cacheUserInDatabase(supabase: any, user: any, hotel: string) {
  try {
    await supabase
      .from('habbo_accounts')
      .upsert({
        habbo_id: user.habbo_id,
        habbo_name: user.habbo_name,
        hotel: hotel,
        motto: user.motto,
        figure_string: user.figure_string,
        is_online: user.online,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'habbo_id'
      });
  } catch (error) {
    console.error('Error caching user:', error);
  }
}
