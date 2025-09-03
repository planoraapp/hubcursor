
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CompleteProfile {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  lastAccessTime: string;
  memberSince: string;
  profileVisible: boolean;
  photos: any[];
  badges: any[];
  selectedBadges: any[];
  friends: any[];
  groups: any[];
  rooms: any[];
  stats: {
    level: number;
    levelPercent: number;
    photosCount: number;
    badgesCount: number;
    friendsCount: number;
    groupsCount: number;
    roomsCount: number;
  };
}

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCached(key: string, data: any) {
  cache.set(key, {
    data,
    expires: Date.now() + CACHE_TTL
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, hotel = 'com.br' } = await req.json();
    
    console.log(`[habbo-complete-profile] ====== FETCHING COMPLETE PROFILE ======`);
    console.log(`[habbo-complete-profile] Username: ${username}`);
    console.log(`[habbo-complete-profile] Hotel: ${hotel}`);
    
    if (!username) {
      return new Response(JSON.stringify({ error: 'Username is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check cache first
    const cacheKey = `profile-${username}-${hotel}`;
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`[habbo-complete-profile] Returning cached data for ${username}`);
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const hotelDomain = hotel === 'br' ? 'com.br' : hotel;

    // Step 1: Get basic user info using OFFICIAL API
    const userApiUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(username)}`;
    
    console.log(`[habbo-complete-profile] Fetching user data from official API...`);
    
    const userResponse = await fetch(userApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!userResponse.ok) {
      console.error(`[habbo-complete-profile] User not found: ${userResponse.status}`);
      return new Response(JSON.stringify({ error: `User '${username}' not found` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userData = await userResponse.json();
    const uniqueId = userData.uniqueId;

    console.log(`[habbo-complete-profile] Found uniqueId: ${uniqueId}`);

    // Step 2: Fetch all data in parallel using OFFICIAL API endpoints
    const promises = [
      // Photos - using extradata as it works for photos
      fetch(`https://www.habbo.${hotelDomain}/extradata/public/users/${uniqueId}/photos`, {
        headers: { 'Accept': 'application/json' }
      }).then(res => res.ok ? res.json() : []).catch(() => []),
      
      // Badges - using OFFICIAL API
      fetch(`https://www.habbo.${hotelDomain}/api/public/users/${uniqueId}/badges`, {
        headers: { 'Accept': 'application/json' }
      }).then(res => res.ok ? res.json() : []).catch(() => []),

      // Friends - using OFFICIAL API
      fetch(`https://www.habbo.${hotelDomain}/api/public/users/${uniqueId}/friends`, {
        headers: { 'Accept': 'application/json' }
      }).then(res => res.ok ? res.json() : []).catch(() => []),

      // Groups - using OFFICIAL API
      fetch(`https://www.habbo.${hotelDomain}/api/public/users/${uniqueId}/groups`, {
        headers: { 'Accept': 'application/json' }
      }).then(res => res.ok ? res.json() : []).catch(() => []),

      // Rooms - using OFFICIAL API
      fetch(`https://www.habbo.${hotelDomain}/api/public/users/${uniqueId}/rooms`, {
        headers: { 'Accept': 'application/json' }
      }).then(res => res.ok ? res.json() : []).catch(() => [])
    ];

    const [photosData, badgesData, friendsData, groupsData, roomsData] = await Promise.all(promises);

    console.log(`[habbo-complete-profile] Fetched data using OFFICIAL API: ${photosData.length} photos, ${badgesData.length} badges, ${friendsData.length} friends, ${groupsData.length} groups, ${roomsData.length} rooms`);

    // Step 3: Build complete profile
    const completeProfile: CompleteProfile = {
      uniqueId: userData.uniqueId,
      name: userData.name,
      figureString: userData.figureString,
      motto: userData.motto || '',
      online: userData.online || false,
      lastAccessTime: userData.lastAccessTime || '',
      memberSince: userData.memberSince || '',
      profileVisible: userData.profileVisible !== false,
      photos: photosData.map((photo: any) => ({
        id: photo.id,
        url: photo.url,
        previewUrl: photo.url,
        timestamp: photo.creationTime,
        roomName: photo.roomName || 'Quarto do jogo',
        likesCount: 0 // Start with 0 likes, will reflect console interactions
      })),
      badges: badgesData,
      selectedBadges: userData.selectedBadges || [],
      friends: friendsData,
      groups: groupsData,
      rooms: roomsData,
      stats: {
        level: userData.starGemCount || userData.currentLevel || 0,
        levelPercent: userData.currentLevelCompletePercent || 0,
        photosCount: photosData.length,
        badgesCount: badgesData.length,
        friendsCount: friendsData.length,
        groupsCount: groupsData.length,
        roomsCount: roomsData.length
      }
    };

    // Cache the result
    setCached(cacheKey, completeProfile);

    console.log(`[habbo-complete-profile] ====== SUCCESS WITH OFFICIAL API ======`);
    console.log(`[habbo-complete-profile] Complete profile built for ${username}`);

    return new Response(JSON.stringify(completeProfile), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`[habbo-complete-profile] Fatal error:`, error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
