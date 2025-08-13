
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

// Cache em memória com TTL
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCacheKey(hotel: string, type: string, params?: any): string {
  return `${hotel}:${type}:${JSON.stringify(params || {})}`;
}

function getFromCache(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCache(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_TTL
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      'https://wueccgeizznjmjgmuscy.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { hotel = 'br', type = 'activities', limit = 50 } = await req.json();
    const cacheKey = getCacheKey(hotel, type, { limit });
    
    // Tentar cache primeiro
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log(`📦 [feed-optimized] Cache hit for ${cacheKey}`);
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔍 [feed-optimized] Processing ${type} for hotel ${hotel}`);
    
    let result;
    
    switch (type) {
      case 'activities':
        result = await getActivities(supabase, hotel, limit);
        break;
      case 'online-users':
        result = await getOnlineUsers(supabase, hotel, limit);
        break;
      case 'recent-changes':
        result = await getRecentChanges(supabase, hotel, limit);
        break;
      default:
        throw new Error(`Tipo não suportado: ${type}`);
    }

    // Salvar no cache
    setCache(cacheKey, result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`❌ [feed-optimized] Error:`, error);
    return new Response(JSON.stringify({ 
      error: error.message,
      activities: [],
      meta: { source: 'error', count: 0, timestamp: new Date().toISOString() }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function getActivities(supabase: any, hotel: string, limit: number) {
  const hotelFilter = hotel === 'com.br' ? 'br' : hotel;
  const cutoffTime = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString();

  // Buscar snapshots recentes com mudanças significativas
  const { data: snapshots, error } = await supabase
    .from('habbo_user_snapshots')
    .select('*')
    .eq('hotel', hotelFilter)
    .gte('created_at', cutoffTime)
    .order('created_at', { ascending: false })
    .limit(limit * 2); // Buscar mais para filtrar depois

  if (error) throw error;

  const activities = [];
  const seenUsers = new Set();

  for (const snapshot of snapshots || []) {
    if (seenUsers.has(snapshot.habbo_id)) continue;
    seenUsers.add(snapshot.habbo_id);

    const activity = {
      id: snapshot.id,
      username: snapshot.habbo_name,
      description: generateActivityDescription(snapshot),
      timestamp: snapshot.created_at,
      profile: {
        figureString: snapshot.figure_string,
        motto: snapshot.motto,
        online: snapshot.is_online
      },
      changes: snapshot.profile_changes || {}
    };

    activities.push(activity);
    
    if (activities.length >= limit) break;
  }

  return {
    activities,
    meta: {
      source: 'database',
      type: 'activities',
      timestamp: new Date().toISOString(),
      count: activities.length,
      hotel: hotelFilter
    }
  };
}

async function getOnlineUsers(supabase: any, hotel: string, limit: number) {
  const hotelFilter = hotel === 'com.br' ? 'br' : hotel;
  const cutoffTime = new Date(Date.now() - (30 * 60 * 1000)).toISOString();

  const { data: onlineUsers, error } = await supabase
    .from('habbo_user_snapshots')
    .select('*')
    .eq('hotel', hotelFilter)
    .eq('is_online', true)
    .gte('created_at', cutoffTime)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const users = (onlineUsers || []).map(user => ({
    id: user.habbo_id,
    username: user.habbo_name,
    motto: user.motto,
    figureString: user.figure_string,
    lastSeen: user.created_at,
    profile: {
      figureString: user.figure_string,
      motto: user.motto,
      online: true
    }
  }));

  return {
    users,
    meta: {
      source: 'database',
      type: 'online-users',
      timestamp: new Date().toISOString(),
      count: users.length,
      hotel: hotelFilter
    }
  };
}

async function getRecentChanges(supabase: any, hotel: string, limit: number) {
  const hotelFilter = hotel === 'com.br' ? 'br' : hotel;
  const cutoffTime = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString();

  const { data: changes, error } = await supabase
    .from('user_profile_changes')
    .select('*')
    .eq('hotel', hotelFilter)
    .gte('detected_at', cutoffTime)
    .order('detected_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const profileChanges = (changes || []).map(change => ({
    id: change.id,
    username: change.habbo_name,
    changeType: change.change_type,
    description: change.change_description,
    timestamp: change.detected_at,
    oldValue: change.old_value,
    newValue: change.new_value
  }));

  return {
    changes: profileChanges,
    meta: {
      source: 'database',
      type: 'recent-changes',
      timestamp: new Date().toISOString(),
      count: profileChanges.length,
      hotel: hotelFilter
    }
  };
}

function generateActivityDescription(snapshot: any): string {
  const changes = snapshot.profile_changes || {};
  const descriptions = [];

  if (changes.motto_changed) {
    descriptions.push('atualizou a missão');
  }
  if (changes.avatar_changed) {
    descriptions.push('mudou o visual');
  }
  if (changes.badges_changed) {
    descriptions.push('conquistou novos emblemas');
  }
  if (snapshot.is_online) {
    descriptions.push('está online');
  }

  return descriptions.length > 0 ? descriptions.join(', ') : 'esteve ativo no hotel';
}
