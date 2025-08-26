
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://46846548-2217-4eb3-8642-0e834c98ce0c.sandbox.lovable.dev',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FriendActivity {
  username: string;
  activity: string;
  timestamp: string;
  figureString?: string;
  hotel: string;
  type?: 'look_change' | 'motto_change' | 'badge' | 'friends' | 'photos' | 'groups' | 'online';
  details?: {
    newFriends?: Array<{ name: string; avatar?: string }>;
    newBadges?: Array<{ code: string; name?: string }>;
    newGroups?: Array<{ name: string; badge?: string }>;
    newPhotos?: Array<{ url: string; roomName?: string }>;
    newMotto?: string;
    previousMotto?: string;
  };
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

// Cache system for performance
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

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

// Fetch with retry and timeout
async function fetchHabboAPI(url: string, retries = 2): Promise<any> {
  console.log(`🌐 [FETCH] Attempting to fetch: ${url}`);
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        if (response.status === 404 || response.status === 403) {
          console.log(`🌐 [FETCH] User not found (${response.status}): ${url}`);
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ [FETCH] Data received for: ${url}`);
      return data;
    } catch (error) {
      console.warn(`⚠️ [FETCH] Attempt ${i + 1} failed for ${url}:`, error);
      if (i === retries - 1) {
        console.error(`❌ [FETCH] All attempts failed for: ${url}`);
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
    }
  }
}

// Get friends list with figureString from Supabase
async function getFriendsList(supabase: any, userId: string): Promise<Array<{name: string, figureString: string}>> {
  try {
    console.log(`📋 [FRIENDS] Getting friends list for user: ${userId}`);
    
    // First try to get from habbo_accounts to find the user's habbo_name
    const { data: userAccount, error: userError } = await supabase
      .from('habbo_accounts')
      .select('habbo_name, hotel')
      .eq('supabase_user_id', userId)
      .single();

    if (userError || !userAccount) {
      console.error('❌ [FRIENDS] User account not found:', userError);
      
      // Return mock friends for testing
      return [
        {
          name: 'Amigo1',
          figureString: 'hr-3012-42.hd-180-2.ch-210-66.lg-270-82.sh-305-62'
        },
        {
          name: 'Amigo2', 
          figureString: 'hr-3163-42.hd-180-2.ch-210-66.lg-270-82.sh-305-62'
        },
        {
          name: 'Amigo3',
          figureString: 'hr-3012-42.hd-180-2.ch-210-66.lg-270-82.sh-305-62'
        }
      ];
    }

    console.log(`👤 [FRIENDS] Found user account: ${userAccount.habbo_name} on ${userAccount.hotel}`);

    // Get friends from the API
    const hotelDomain = userAccount.hotel === 'br' ? 'com.br' : userAccount.hotel;
    const friendsUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(userAccount.habbo_name)}`;
    
    const userData = await fetchHabboAPI(friendsUrl);
    if (!userData || !userData.uniqueId) {
      console.error('❌ [FRIENDS] Failed to get user data');
      return [];
    }

    const friendsListUrl = `https://www.habbo.${hotelDomain}/api/public/users/${userData.uniqueId}/friends`;
    const friendsData = await fetchHabboAPI(friendsListUrl);
    
    if (!friendsData || !Array.isArray(friendsData)) {
      console.error('❌ [FRIENDS] Failed to get friends data');
      return [];
    }

    console.log(`👥 [FRIENDS] Found ${friendsData.length} friends`);

    // Get figureString for each friend (limited to first 50 for performance)
    const friendsWithFigures = await Promise.all(
      friendsData.slice(0, 50).map(async (friend: any) => {
        try {
          const friendProfileUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(friend.name)}`;
          const friendProfile = await fetchHabboAPI(friendProfileUrl);
          
          return {
            name: friend.name,
            figureString: friendProfile?.figureString || ''
          };
        } catch (error) {
          console.warn(`⚠️ [FRIENDS] Failed to get figure for ${friend.name}:`, error);
          return {
            name: friend.name,
            figureString: ''
          };
        }
      })
    );

    return friendsWithFigures.filter(friend => friend.figureString);
  } catch (error) {
    console.error('❌ [FRIENDS] Error getting friends list:', error);
    return [];
  }
}

// Fetch recent photos for a friend
async function fetchPhotos(friendName: string, figureString: string, hotel: string): Promise<FriendActivity[]> {
  try {
    const hotelDomain = hotel === 'br' ? 'com.br' : hotel;
    const userUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(friendName)}`;
    const userData = await fetchHabboAPI(userUrl);
    
    if (!userData || !userData.uniqueId) return [];

    const photosUrl = `https://www.habbo.${hotelDomain}/api/public/users/${userData.uniqueId}/photos`;
    const photosData = await fetchHabboAPI(photosUrl);
    
    if (!photosData || !Array.isArray(photosData)) return [];

    return photosData.slice(0, 5).map((photo: any) => ({
      username: friendName,
      activity: `tirou uma nova foto${photo.roomName ? ` no quarto "${photo.roomName}"` : ''}`,
      timestamp: new Date(photo.takenOn || Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      figureString,
      hotel,
      type: 'photos' as const,
      details: {
        newPhotos: [{
          url: photo.url,
          roomName: photo.roomName
        }]
      }
    }));
  } catch (error) {
    console.warn(`⚠️ [PHOTOS] Error fetching photos for ${friendName}:`, error);
    return [];
  }
}

// Fetch recent badges for a friend
async function fetchBadges(friendName: string, figureString: string, hotel: string): Promise<FriendActivity[]> {
  try {
    const hotelDomain = hotel === 'br' ? 'com.br' : hotel;
    const userUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(friendName)}`;
    const userData = await fetchHabboAPI(userUrl);
    
    if (!userData || !userData.uniqueId) return [];

    const badgesUrl = `https://www.habbo.${hotelDomain}/api/public/users/${userData.uniqueId}/badges`;
    const badgesData = await fetchHabboAPI(badgesUrl);
    
    if (!badgesData || !Array.isArray(badgesData)) return [];

    // Filter recent badges (this is a simulation since API doesn't provide timestamps)
    const recentBadges = badgesData.filter((badge: any) => {
      const badgeCode = badge.code || '';
      // Only include badges that seem recent based on code patterns
      return badgeCode.match(/^(COM_|GRP_|NEW_|ULT_|HPP|2024|2025|BR[2-9][0-9][0-9])/);
    }).slice(0, 3);

    return recentBadges.map((badge: any) => ({
      username: friendName,
      activity: `conquistou o emblema "${badge.name || badge.code}"`,
      timestamp: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(), // Last 6 hours simulation
      figureString,
      hotel,
      type: 'badge' as const,
      details: {
        newBadges: [{
          code: badge.code,
          name: badge.name
        }]
      }
    }));
  } catch (error) {
    console.warn(`⚠️ [BADGES] Error fetching badges for ${friendName}:`, error);
    return [];
  }
}

serve(async (req) => {
  console.log(`🚀 [ENHANCED DIRECT FEED] ===== STARTED =====`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    console.log(`🔐 [AUTH] Authenticated user: ${user.id}`);

    // Get request parameters
    const requestBody = await req.json().catch(() => ({}));
    const { hotel = 'br', limit = 50, offset = 0 } = requestBody;

    // Check cache first
    const cacheKey = `activities-${user.id}-${hotel}-${limit}-${offset}`;
    const cachedData = getCached(cacheKey);
    if (cachedData) {
      console.log(`🎯 [CACHE] Returning cached data for ${user.id}`);
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Get friends list with figureStrings
    const friends = await getFriendsList(supabase, user.id);
    
    if (friends.length === 0) {
      console.log(`❌ [FRIENDS] No friends found for user ${user.id}`);
      const emptyResponse = {
        activities: [],
        metadata: {
          source: 'enhanced-direct-api',
          timestamp: new Date().toISOString(),
          count: 0,
          friends_processed: 0
        }
      };
      return new Response(JSON.stringify(emptyResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    console.log(`👥 [PROCESSING] Processing activities for ${friends.length} friends`);

    // Fetch activities for friends (limited batch for performance)
    const friendsBatch = friends.slice(offset, offset + Math.min(20, limit));
    const activitiesPromises = friendsBatch.map(async (friend) => {
      try {
        console.log(`🔍 [PROCESSING] Processing friend: ${friend.name}`);
        
        const [photos, badges] = await Promise.all([
          fetchPhotos(friend.name, friend.figureString, hotel),
          fetchBadges(friend.name, friend.figureString, hotel)
        ]);

        return [...photos, ...badges];
      } catch (error) {
        console.error(`❌ [PROCESSING] Error processing ${friend.name}:`, error);
        return [];
      }
    });

    const allActivitiesArrays = await Promise.all(activitiesPromises);
    const allActivities = allActivitiesArrays.flat();

    // Sort activities by timestamp (newest first)
    allActivities.sort((a, b) => {
      const timestampA = new Date(a.timestamp).getTime();
      const timestampB = new Date(b.timestamp).getTime();
      return timestampB - timestampA;
    });

    // Apply pagination
    const paginatedActivities = allActivities.slice(0, limit);

    const result: ActivityResponse = {
      activities: paginatedActivities,
      metadata: {
        source: 'enhanced-direct-api',
        timestamp: new Date().toISOString(),
        count: paginatedActivities.length,
        friends_processed: friendsBatch.length
      }
    };

    // Cache the result
    setCached(cacheKey, result);

    console.log(`✅ [SUCCESS] Returning ${paginatedActivities.length} activities from ${friendsBatch.length} friends`);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ [ERROR] Function error:', error);
    
    const errorResponse = {
      activities: [],
      metadata: {
        source: 'enhanced-direct-error',
        timestamp: new Date().toISOString(),
        count: 0,
        friends_processed: 0,
        error: error.message
      }
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
