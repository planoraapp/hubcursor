
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
  stats: {
    level: number;
    levelPercent: number;
    photosCount: number;
    badgesCount: number;
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

    // Step 1: Get basic user info
    const userApiUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(username)}`;
    
    console.log(`[habbo-complete-profile] Fetching user data...`);
    
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

    // Step 2: Fetch photos, badges, and other data in parallel
    const promises = [
      // Photos
      fetch(`https://www.habbo.${hotelDomain}/extradata/public/users/${uniqueId}/photos`, {
        headers: { 'Accept': 'application/json' }
      }).then(res => res.ok ? res.json() : []).catch(() => []),
      
      // Badges
      fetch(`https://www.habbo.${hotelDomain}/extradata/public/users/${uniqueId}/badges`, {
        headers: { 'Accept': 'application/json' }
      }).then(res => res.ok ? res.json() : []).catch(() => [])
    ];

    const [photosData, badgesData] = await Promise.all(promises);

    console.log(`[habbo-complete-profile] Fetched ${photosData.length} photos and ${badgesData.length} badges`);

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
        likesCount: photo.likesCount || 0
      })),
      badges: badgesData,
      selectedBadges: userData.selectedBadges || [],
      stats: {
        level: userData.starGems || 0,
        levelPercent: 0,
        photosCount: photosData.length,
        badgesCount: badgesData.length
      }
    };

    // Cache the result
    setCached(cacheKey, completeProfile);

    console.log(`[habbo-complete-profile] ====== SUCCESS ======`);
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
