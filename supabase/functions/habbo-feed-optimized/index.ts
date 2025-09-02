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

// Cache em memória com TTL reduzido
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 2 * 60 * 1000; // Reduzido para 2 minutos

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

    console.log(`🔍 [feed-optimized] Processing ${type} for hotel ${hotel} (fresh data)`);
    
    let result;
    
    switch (type) {
      case 'activities':
        result = await getRecentActivities(supabase, hotel, limit);
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

// Buscar atividades recentes com dados mais frescos
async function getRecentActivities(supabase: any, hotel: string, limit: number) {
  const hotelFilter = hotel === 'com.br' ? 'br' : hotel;
  
  // Buscar dados das últimas 6 horas em vez de 24h
  const cutoffTime = new Date(Date.now() - (6 * 60 * 60 * 1000)).toISOString();

  // Primeiro tentar buscar de habbo_activities (dados recentes)
  const { data: recentActivities, error: activitiesError } = await supabase
    .from('habbo_activities')
    .select('*')
    .eq('hotel', hotelFilter)
    .gte('created_at', cutoffTime)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (activitiesError) {
    console.warn(`⚠️ [feed-optimized] Activities query error:`, activitiesError);
  }

  // Fallback para snapshots se não houver atividades recentes
  const { data: snapshots, error: snapshotsError } = await supabase
    .from('habbo_user_snapshots')
    .select('*')
    .eq('hotel', hotelFilter)
    .gte('created_at', cutoffTime)
    .order('created_at', { ascending: false })
    .limit(limit * 2);

  if (snapshotsError) {
    console.warn(`⚠️ [feed-optimized] Snapshots query error:`, snapshotsError);
  }

  // Processar atividades reais primeiro
  const activities = [];
  
  if (recentActivities && recentActivities.length > 0) {
    console.log(`✅ [feed-optimized] Found ${recentActivities.length} recent activities`);
    
    for (const activity of recentActivities.slice(0, Math.floor(limit * 0.7))) {
      activities.push({
        id: activity.id,
        username: activity.habbo_name,
        description: activity.description || generateActivityDescription(activity),
        timestamp: activity.created_at,
        profile: {
          figureString: activity.figure_string || '',
          motto: activity.motto || '',
          online: true
        },
        activityType: activity.activity_type
      });
    }
  }

  // Completar com dados dos snapshots para diversidade
  if (snapshots && snapshots.length > 0 && activities.length < limit) {
    console.log(`📸 [feed-optimized] Adding ${Math.min(snapshots.length, limit - activities.length)} snapshot activities`);
    
    const seenUsers = new Set(activities.map(a => a.username));
    const remaining = limit - activities.length;
    
    for (const snapshot of snapshots) {
      if (activities.length >= limit) break;
      if (seenUsers.has(snapshot.habbo_name)) continue;
      
      seenUsers.add(snapshot.habbo_name);
      
      activities.push({
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
      });
    }
  }

  // Ordenar por timestamp (mais recente primeiro)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  console.log(`📊 [feed-optimized] Returning ${activities.length} activities for ${hotelFilter}`);

  return {
    activities: activities.slice(0, limit),
    meta: {
      source: 'optimized-database',
      type: 'activities',
      timestamp: new Date().toISOString(),
      count: activities.length,
      hotel: hotelFilter,
      freshness: 'recent-6h'
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
  const cutoffTime = new Date(Date.now() - (12 * 60 * 60 * 1000)).toISOString(); // Últimas 12h

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