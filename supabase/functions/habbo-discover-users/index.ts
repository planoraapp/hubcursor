
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

    const { hotel = 'br', method = 'random', limit = 20 } = await req.json();
    const cacheKey = `${hotel}:${method}:${limit}`;
    
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

    const result = {
      users,
      meta: {
        source: 'database',
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
  // Buscar usuários aleatórios da tabela habbo_users
  const { data, error } = await supabase
    .from('habbo_users')
    .select('*')
    .eq('hotel', hotel)
    .gte('updated_at', new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString())
    .order('updated_at', { ascending: false })
    .limit(limit * 3);

  if (error) throw error;

  // Randomizar e remover duplicatas
  const uniqueUsers = new Map();
  const shuffled = (data || []).sort(() => Math.random() - 0.5);
  
  for (const user of shuffled) {
    if (!uniqueUsers.has(user.habbo_id)) {
      uniqueUsers.set(user.habbo_id, {
        id: user.habbo_id,
        username: user.habbo_name,
        habbo_id: user.habbo_id,
        motto: user.motto,
        figureString: user.figure_string,
        online: true,
        lastSeen: user.updated_at
      });
      
      if (uniqueUsers.size >= limit) break;
    }
  }

  return Array.from(uniqueUsers.values());
}

async function discoverRecentUsers(supabase: any, hotel: string, limit: number) {
  const { data, error } = await supabase
    .from('habbo_users')
    .select('*')
    .eq('hotel', hotel)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(user => ({
    id: user.habbo_id,
    username: user.habbo_name,
    habbo_id: user.habbo_id,
    motto: user.motto,
    figureString: user.figure_string,
    online: true,
    lastSeen: user.updated_at
  }));
}

async function discoverActiveUsers(supabase: any, hotel: string, limit: number) {
  const { data, error } = await supabase
    .from('habbo_users')
    .select('*')
    .eq('hotel', hotel)
    .gte('updated_at', new Date(Date.now() - (60 * 60 * 1000)).toISOString()) // Last hour
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(user => ({
    id: user.habbo_id,
    username: user.habbo_name,
    habbo_id: user.habbo_id,
    motto: user.motto,
    figureString: user.figure_string,
    online: true,
    lastSeen: user.updated_at
  }));
}
