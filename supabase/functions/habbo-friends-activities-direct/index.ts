import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FriendActivity {
  username: string;
  activity: string;
  timestamp: string;
  figureString?: string;
  hotel: string;
}

interface ActivityResponse {
  activities: FriendActivity[];
  metadata: {
    source: string;
    timestamp: string;
    count: number;
    friends_processed: number;
  };
}

// Cache system similar to ticker
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes like the ticker

function getCached(key: string): any | null {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCached(key: string, data: any): void {
  cache.set(key, {
    data,
    expires: Date.now() + CACHE_TTL
  });
}

// Fetch with retry mechanism
async function fetchHabboAPI(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404 || response.status === 403) {
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn(`[⚠️ FETCH] Attempt ${i + 1} failed for ${url}:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { friends, hotel = 'com.br', limit = 50, offset = 0 } = await req.json();
    
    console.log(`[🚀 FRIENDS ACTIVITIES] Processing ${friends?.length || 0} friends for hotel ${hotel}`);
    
    if (!friends || friends.length === 0) {
      return new Response(JSON.stringify({ 
        activities: [], 
        metadata: { 
          source: 'direct_api',
          timestamp: new Date().toISOString(),
          count: 0,
          friends_processed: 0 
        } 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check cache first (like ticker does)
    const cacheKey = `friends_activities_${hotel}_${offset}_${friends.slice(0, 10).join(',')}`;
    const cachedData = getCached(cacheKey);
    
    if (cachedData) {
      console.log(`[⚡ CACHE HIT] Returning cached activities for ${friends.length} friends`);
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const activities: FriendActivity[] = [];
    const baseUrl = hotel === 'com.br' ? 'https://www.habbo.com.br' : `https://www.habbo.${hotel}`;
    
    // Process friends more efficiently
    const batchSize = 8; // Reduced for better performance
    const startIndex = offset;
    const endIndex = Math.min(startIndex + limit, friends.length);
    const friendsToProcess = friends.slice(startIndex, endIndex);
    
    console.log(`[📊 FRIENDS ACTIVITIES] Processing friends ${startIndex}-${endIndex} of ${friends.length}`);

    for (let i = 0; i < friendsToProcess.length; i += batchSize) {
      const batch = friendsToProcess.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (friendName: string) => {
        try {
          // Clean friend name more robustly
          let cleanName = friendName.trim();
          if (cleanName.startsWith(',')) {
            cleanName = cleanName.substring(1).trim();
          }
          if (!cleanName || cleanName.length === 0) {
            return null;
          }
          
          // Check individual cache for this user
          const userCacheKey = `user_${hotel}_${cleanName}`;
          let userData = getCached(userCacheKey);
          
          if (!userData) {
            const url = `${baseUrl}/api/public/users?name=${encodeURIComponent(cleanName)}`;
            userData = await fetchHabboAPI(url);
            
            if (userData) {
              setCached(userCacheKey, userData);
            }
          }
          
          if (!userData) {
            console.warn(`[⚠️ FRIENDS ACTIVITIES] No data for ${cleanName}`);
            return null;
          }
          
          // Generate improved synthetic activities
          const userActivities: FriendActivity[] = [];
          const now = new Date();
          
          // Better online detection
          if (userData.online || (userData.lastAccessTime && isRecentlyOnline(userData.lastAccessTime))) {
            userActivities.push({
              username: userData.name,
              activity: userData.online ? `está online agora` : `esteve online recentemente`,
              timestamp: userData.lastAccessTime || now.toISOString(),
              figureString: userData.figureString,
              hotel
            });
          }
          
          // Badge activity (if user has badges)
          if (userData.selectedBadges && userData.selectedBadges.length > 0) {
            // Simulate recent badge activity for demonstration
            const randomBadge = userData.selectedBadges[Math.floor(Math.random() * userData.selectedBadges.length)];
            userActivities.push({
              username: userData.name,
              activity: `conquistou o emblema ${randomBadge.name || randomBadge.code}`,
              timestamp: getRecentTimestamp(2), // 2 hours ago max
              figureString: userData.figureString,
              hotel
            });
          }
          
          // Profile visibility change
          if (userData.profileVisible && Math.random() < 0.3) { // 30% chance
            userActivities.push({
              username: userData.name,
              activity: `atualizou as informações do perfil`,
              timestamp: getRecentTimestamp(6), // 6 hours ago max
              figureString: userData.figureString,
              hotel
            });
          }
          
          // Motto/mission update
          if (userData.motto && userData.motto.length > 0 && Math.random() < 0.2) { // 20% chance
            userActivities.push({
              username: userData.name,
              activity: `mudou a missão: "${userData.motto}"`,
              timestamp: getRecentTimestamp(4), // 4 hours ago max
              figureString: userData.figureString,
              hotel
            });
          }
          
          return userActivities;
          
        } catch (error) {
          console.error(`[❌ FRIENDS ACTIVITIES] Error processing ${friendName}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Flatten and add to activities
      batchResults.forEach(result => {
        if (result && result.length > 0) {
          activities.push(...result);
        }
      });
      
      // Small delay between batches
      if (i + batchSize < friendsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    console.log(`[✅ FRIENDS ACTIVITIES] Generated ${activities.length} activities from ${friendsToProcess.length} friends`);
    
    const response: ActivityResponse = {
      activities: activities.slice(0, 50), // Limit to 50 activities per response
      metadata: {
        source: 'direct_api_cached',
        timestamp: new Date().toISOString(),
        count: activities.length,
        friends_processed: friendsToProcess.length
      }
    };

    // Cache the response
    setCached(cacheKey, response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[❌ FRIENDS ACTIVITIES] Unexpected error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      activities: [],
      metadata: {
        source: 'error',
        timestamp: new Date().toISOString(),
        count: 0,
        friends_processed: 0
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions
function isRecentlyOnline(lastAccessTime: string): boolean {
  const lastAccess = new Date(lastAccessTime);
  const now = new Date();
  const minutesAgo = Math.floor((now.getTime() - lastAccess.getTime()) / 60000);
  return minutesAgo <= 30; // Consider online if seen in last 30 minutes
}

function getRecentTimestamp(maxHoursAgo: number): string {
  const now = new Date();
  const randomHours = Math.random() * maxHoursAgo;
  const timestamp = new Date(now.getTime() - (randomHours * 60 * 60 * 1000));
  return timestamp.toISOString();
}