import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface UnifiedRequest {
  endpoint: 'badges' | 'clothing' | 'users' | 'photos' | 'furni' | 'feed';
  action: string;
  params: Record<string, any>;
}

interface CacheConfig {
  ttl: number; // seconds
  priority: 'high' | 'medium' | 'low';
}

const CACHE_STRATEGIES: Record<string, CacheConfig> = {
  badges: { ttl: 24 * 60 * 60, priority: 'high' }, // 24 hours
  clothing: { ttl: 60 * 60, priority: 'medium' }, // 1 hour
  photos: { ttl: 5 * 60, priority: 'low' }, // 5 minutes
  users: { ttl: 30 * 60, priority: 'medium' }, // 30 minutes
  furni: { ttl: 60 * 60, priority: 'medium' }, // 1 hour
  feed: { ttl: 2 * 60, priority: 'low' }, // 2 minutes
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { endpoint, action, params = {} }: UnifiedRequest = await req.json();

    console.log(`🔄 [UnifiedAPI] ${endpoint}.${action}`, params);

    // Check cache first
    const cacheKey = `unified_${endpoint}_${action}_${JSON.stringify(params)}`;
    const cached = await getCachedData(supabase, cacheKey);
    
    if (cached && !params.forceRefresh) {
      console.log(`✅ [UnifiedAPI] Cache hit for ${cacheKey}`);
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let result;
    switch (endpoint) {
      case 'badges':
        result = await handleBadges(action, params, supabase);
        break;
      case 'clothing':
        result = await handleClothing(action, params, supabase);
        break;
      case 'users':
        result = await handleUsers(action, params, supabase);
        break;
      case 'photos':
        result = await handlePhotos(action, params, supabase);
        break;
      case 'furni':
        result = await handleFurni(action, params, supabase);
        break;
      case 'feed':
        result = await handleFeed(action, params, supabase);
        break;
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    // Cache the result
    await setCachedData(supabase, cacheKey, result, CACHE_STRATEGIES[endpoint]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [UnifiedAPI] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Badge handlers
async function handleBadges(action: string, params: any, supabase: any) {
  switch (action) {
    case 'search':
      return await searchBadges(params, supabase);
    case 'get':
      return await getBadge(params, supabase);
    case 'discover':
      return await discoverBadges(params, supabase);
    default:
      throw new Error(`Unknown badges action: ${action}`);
  }
}

async function searchBadges(params: any, supabase: any) {
  const { limit = 1000, search = '', category = 'all' } = params;
  
  // Try real-badges-system first
  try {
    const { data, error } = await supabase.functions.invoke('real-badges-system', {
      body: { limit, search, category }
    });
    
    if (!error && data?.badges) {
      return { success: true, badges: data.badges, source: 'real-badges-system' };
    }
  } catch (error) {
    console.warn('Real badges system failed, trying fallback');
  }

  // Fallback to habbo-assets-badges
  try {
    const { data, error } = await supabase.functions.invoke('habbo-assets-badges', {
      body: { limit, search, category }
    });
    
    if (!error && data?.badges) {
      return { success: true, badges: data.badges, source: 'habbo-assets-badges' };
    }
  } catch (error) {
    console.warn('Habbo assets badges failed, trying API fallback');
  }

  // Final fallback to habbo-api-badges
  const { data, error } = await supabase.functions.invoke('habbo-api-badges', {
    body: { limit, search, category }
  });

  return { 
    success: !error, 
    badges: data?.badges || [], 
    source: 'habbo-api-badges',
    error: error?.message 
  };
}

async function getBadge(params: any, supabase: any) {
  const { badgeCode } = params;
  
  // Try to get badge from real-badges-system
  const { data, error } = await supabase.functions.invoke('real-badges-system', {
    body: { limit: 1, search: badgeCode, category: 'all' }
  });

  if (!error && data?.badges?.length > 0) {
    return { success: true, badge: data.badges[0], source: 'real-badges-system' };
  }

  return { success: false, error: 'Badge not found' };
}

async function discoverBadges(params: any, supabase: any) {
  const { hotel = 'br', badge = 'ACH_Tutorial1', limit = 100 } = params;
  
  const { data, error } = await supabase.functions.invoke('habbo-discover-by-badges', {
    body: { hotel, badge, limit }
  });

  return { 
    success: !error, 
    result: data || {}, 
    source: 'habbo-discover-by-badges',
    error: error?.message 
  };
}

// Clothing handlers
async function handleClothing(action: string, params: any, supabase: any) {
  switch (action) {
    case 'search':
      return await searchClothing(params, supabase);
    case 'get':
      return await getClothing(params, supabase);
    case 'categories':
      return await getClothingCategories(params, supabase);
    default:
      throw new Error(`Unknown clothing action: ${action}`);
  }
}

async function searchClothing(params: any, supabase: any) {
  const { limit = 500, category = 'all', search = '', gender = 'U' } = params;
  
  // Try unified-clothing-api first
  try {
    const { data, error } = await supabase.functions.invoke('unified-clothing-api', {
      body: { limit, category, gender, search }
    });
    
    if (!error && data?.data) {
      return { success: true, clothing: data.data, source: 'unified-clothing-api' };
    }
  } catch (error) {
    console.warn('Unified clothing API failed, trying real data');
  }

  // Fallback to get-real-habbo-data
  const { data, error } = await supabase.functions.invoke('get-real-habbo-data');
  
  if (!error && data?.data) {
    let clothing = data.data;
    
    // Filter by category if specified
    if (category !== 'all') {
      clothing = { [category]: clothing[category] || [] };
    }
    
    // Filter by gender if specified
    if (gender !== 'U') {
      Object.keys(clothing).forEach(cat => {
        clothing[cat] = clothing[cat].filter((item: any) => 
          item.gender === gender || item.gender === 'U'
        );
      });
    }
    
    return { success: true, clothing, source: 'get-real-habbo-data' };
  }

  return { success: false, clothing: {}, error: error?.message };
}

async function getClothing(params: any, supabase: any) {
  const { itemId, category } = params;
  
  const { data, error } = await supabase.functions.invoke('get-real-habbo-data');
  
  if (!error && data?.data && category) {
    const categoryData = data.data[category] || [];
    const item = categoryData.find((item: any) => item.id === itemId);
    
    if (item) {
      return { success: true, item, source: 'get-real-habbo-data' };
    }
  }

  return { success: false, error: 'Item not found' };
}

async function getClothingCategories(params: any, supabase: any) {
  const { data, error } = await supabase.functions.invoke('get-real-habbo-data');
  
  if (!error && data?.data) {
    const categories = Object.keys(data.data).map(cat => ({
      id: cat,
      name: getCategoryName(cat),
      count: data.data[cat].length
    }));
    
    return { success: true, categories, source: 'get-real-habbo-data' };
  }

  return { success: false, categories: [], error: error?.message };
}

// User handlers
async function handleUsers(action: string, params: any, supabase: any) {
  switch (action) {
    case 'search':
      return await searchUsers(params, supabase);
    case 'profile':
      return await getUserProfile(params, supabase);
    case 'activities':
      return await getUserActivities(params, supabase);
    default:
      throw new Error(`Unknown users action: ${action}`);
  }
}

async function searchUsers(params: any, supabase: any) {
  const { query, hotel = 'br', limit = 20 } = params;
  
  const { data, error } = await supabase.functions.invoke('habbo-user-search', {
    body: { query, hotel, limit }
  });

  return { 
    success: !error, 
    users: data?.users || [], 
    source: 'habbo-user-search',
    error: error?.message 
  };
}

async function getUserProfile(params: any, supabase: any) {
  const { username, hotel = 'br' } = params;
  
  const { data, error } = await supabase.functions.invoke('habbo-complete-profile', {
    body: { username, hotel }
  });

  return { 
    success: !error, 
    profile: data || {}, 
    source: 'habbo-complete-profile',
    error: error?.message 
  };
}

async function getUserActivities(params: any, supabase: any) {
  const { username, hotel = 'br' } = params;
  
  const { data, error } = await supabase.functions.invoke('habbo-friends-activities-direct', {
    body: { username, hotel }
  });

  return { 
    success: !error, 
    activities: data || [], 
    source: 'habbo-friends-activities-direct',
    error: error?.message 
  };
}

// Photo handlers
async function handlePhotos(action: string, params: any, supabase: any) {
  switch (action) {
    case 'discover':
      return await discoverPhotos(params, supabase);
    case 'scrape':
      return await scrapePhotos(params, supabase);
    default:
      throw new Error(`Unknown photos action: ${action}`);
  }
}

async function discoverPhotos(params: any, supabase: any) {
  const { username, hotel = 'br' } = params;
  
  const { data, error } = await supabase.functions.invoke('habbo-photo-discovery', {
    body: { username, hotel }
  });

  return { 
    success: !error, 
    photos: data || {}, 
    source: 'habbo-photo-discovery',
    error: error?.message 
  };
}

async function scrapePhotos(params: any, supabase: any) {
  const { username, hotel = 'br' } = params;
  
  const { data, error } = await supabase.functions.invoke('habbo-photos-scraper', {
    body: { username, hotel }
  });

  return { 
    success: !error, 
    photos: data || {}, 
    source: 'habbo-photos-scraper',
    error: error?.message 
  };
}

// Furni handlers
async function handleFurni(action: string, params: any, supabase: any) {
  switch (action) {
    case 'search':
      return await searchFurni(params, supabase);
    case 'get':
      return await getFurni(params, supabase);
    default:
      throw new Error(`Unknown furni action: ${action}`);
  }
}

async function searchFurni(params: any, supabase: any) {
  const { searchTerm = '', className = '', limit = 500 } = params;
  
  const { data, error } = await supabase.functions.invoke('habbo-furni-api', {
    body: { searchTerm, className, limit, category: 'all' }
  });

  return { 
    success: !error, 
    furni: data?.furni || [], 
    source: 'habbo-furni-api',
    error: error?.message 
  };
}

async function getFurni(params: any, supabase: any) {
  const { itemId } = params;
  
  const { data, error } = await supabase.functions.invoke('habbo-furni-api', {
    body: { searchTerm: itemId, limit: 1 }
  });

  if (!error && data?.furni?.length > 0) {
    return { success: true, item: data.furni[0], source: 'habbo-furni-api' };
  }

  return { success: false, error: 'Item not found' };
}

// Feed handlers
async function handleFeed(action: string, params: any, supabase: any) {
  switch (action) {
    case 'general':
      return await getGeneralFeed(params, supabase);
    case 'friends':
      return await getFriendsFeed(params, supabase);
    case 'activities':
      return await getActivitiesFeed(params, supabase);
    default:
      throw new Error(`Unknown feed action: ${action}`);
  }
}

async function getGeneralFeed(params: any, supabase: any) {
  const { limit = 20 } = params;
  
  const { data, error } = await supabase.functions.invoke('habbo-feed-optimized', {
    body: { limit }
  });

  return { 
    success: !error, 
    feed: data || [], 
    source: 'habbo-feed-optimized',
    error: error?.message 
  };
}

async function getFriendsFeed(params: any, supabase: any) {
  const { usernames = [], limit = 15 } = params;
  
  const { data, error } = await supabase.functions.invoke('habbo-friends-activities-direct', {
    body: { usernames, limit }
  });

  return { 
    success: !error, 
    feed: data || [], 
    source: 'habbo-friends-activities-direct',
    error: error?.message 
  };
}

async function getActivitiesFeed(params: any, supabase: any) {
  const { username, hotel = 'br' } = params;
  
  const { data, error } = await supabase.functions.invoke('habbo-daily-activities-tracker', {
    body: { username, hotel }
  });

  return { 
    success: !error, 
    activities: data || [], 
    source: 'habbo-daily-activities-tracker',
    error: error?.message 
  };
}

// Cache functions
async function getCachedData(supabase: any, key: string) {
  try {
    const { data } = await supabase
      .from('api_cache')
      .select('data, expires_at')
      .eq('key', key)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    return data?.data;
  } catch {
    return null;
  }
}

async function setCachedData(supabase: any, key: string, data: any, config: CacheConfig) {
  try {
    const expiresAt = new Date(Date.now() + config.ttl * 1000).toISOString();
    
    await supabase
      .from('api_cache')
      .upsert({
        key,
        data,
        expires_at: expiresAt,
        priority: config.priority,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.warn('Failed to cache data:', error);
  }
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    'hd': 'Rosto',
    'hr': 'Cabelo',
    'ch': 'Camiseta',
    'cc': 'Casaco',
    'lg': 'Calça',
    'sh': 'Sapato',
    'ha': 'Chapéu',
    'ea': 'Óculos',
    'fa': 'Acessório Facial',
    'ca': 'Acessório Peito',
    'wa': 'Cintura',
    'cp': 'Estampa'
  };
  
  return names[category] || category.toUpperCase();
}
