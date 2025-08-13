
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache para armazenar IDs internos descobertos
const internalIdCache = new Map<string, string>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, hotel = 'com.br' } = await req.json();
    
    if (!username) {
      throw new Error('Username is required');
    }

    console.log(`[Complete Profile] Fetching complete profile for ${username} on ${hotel}`);

    // First get user basic info to get uniqueId
    const userUrl = `https://www.habbo.${hotel}/api/public/users?name=${encodeURIComponent(username)}`;
    const userResponse = await fetch(userUrl, {
      headers: {
        'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
        'Accept': 'application/json',
      },
    });

    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`HTTP error! status: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    const uniqueId = userData.uniqueId;

    if (!uniqueId) {
      throw new Error('User uniqueId not found');
    }

    // Get complete profile with all data in one call
    const profileUrl = `https://www.habbo.${hotel}/api/public/users/${uniqueId}/profile`;
    const profileResponse = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
        'Accept': 'application/json',
      },
    });

    if (!profileResponse.ok) {
      throw new Error(`Profile API error! status: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();

    // Extract internal user ID and discover photos via S3
    let photos = [];
    let internalUserId = internalIdCache.get(uniqueId);

    // If we don't have the internal ID cached, try to extract it
    if (!internalUserId) {
      console.log(`[Complete Profile] Extracting internal user ID for ${username}`);
      internalUserId = await extractInternalUserId(username, hotel);
      if (internalUserId) {
        internalIdCache.set(uniqueId, internalUserId);
        console.log(`[Complete Profile] Found internal user ID: ${internalUserId} for ${username}`);
      }
    }

    // If we have internal user ID, discover photos from S3
    if (internalUserId) {
      console.log(`[Complete Profile] Discovering S3 photos for internal ID: ${internalUserId}`);
      photos = await discoverS3Photos(internalUserId, hotel, username);
      console.log(`[Complete Profile] Found ${photos.length} photos via S3 discovery`);
    } else {
      console.log(`[Complete Profile] Could not extract internal user ID for ${username}`);
    }

    // Calculate Habbo Ticker activities (mock for now, could be enhanced with real activity data)
    const habboTickerCount = Math.floor(Math.random() * 20) + 10; // Mock data

    // Structure the complete profile data
    const completeProfile = {
      // Basic user info
      uniqueId: profileData.uniqueId,
      name: profileData.name,
      figureString: profileData.figureString,
      motto: profileData.motto,
      online: profileData.online,
      lastAccessTime: profileData.lastAccessTime,
      memberSince: profileData.memberSince,
      profileVisible: profileData.profileVisible,
      
      // Stats for the buttons
      stats: {
        level: profileData.currentLevel || 0,
        levelPercent: profileData.currentLevelCompletePercent || 0,
        experience: profileData.totalExperience || 0,
        starGems: profileData.starGemCount || 0,
        badgesCount: profileData.badges ? profileData.badges.length : 0,
        friendsCount: profileData.friends ? profileData.friends.length : 0,
        groupsCount: profileData.groups ? profileData.groups.length : 0,
        roomsCount: profileData.rooms ? profileData.rooms.length : 0,
        photosCount: photos.length,
        habboTickerCount: habboTickerCount
      },

      // Complete data for modals
      data: {
        badges: profileData.badges || [],
        friends: profileData.friends || [],
        groups: profileData.groups || [],
        rooms: profileData.rooms || [],
        photos: photos,
        selectedBadges: profileData.selectedBadges || []
      }
    };

    console.log(`[Complete Profile] Successfully fetched profile for ${username}`);
    console.log(`[Complete Profile] Stats: Level ${completeProfile.stats.level}, ${completeProfile.stats.badgesCount} badges, ${completeProfile.stats.friendsCount} friends, ${completeProfile.stats.photosCount} photos`);

    return new Response(JSON.stringify(completeProfile), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`[Complete Profile] Error:`, error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Function to extract internal user ID from profile page
async function extractInternalUserId(username: string, hotel: string): Promise<string | null> {
  try {
    const profilePageUrl = `https://www.habbo.${hotel}/profile/${encodeURIComponent(username)}`;
    console.log(`[Internal ID] Fetching profile page: ${profilePageUrl}`);

    const response = await fetch(profilePageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      console.log(`[Internal ID] Profile page request failed: ${response.status}`);
      return null;
    }

    const html = await response.text();
    
    // Try multiple patterns to extract internal user ID
    const patterns = [
      /userId['":\s]*(\d+)/i,
      /user_id['":\s]*(\d+)/i,
      /"id"[:\s]*(\d+)/i,
      /data-user-id[='"]*(\d+)/i,
      /servercamera\/purchased\/\w+\/p-(\d+)-/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const id = match[1];
        console.log(`[Internal ID] Found internal user ID: ${id} using pattern: ${pattern}`);
        return id;
      }
    }

    // Also try to find it in any script tags or JSON data
    const scriptMatches = html.match(/<script[^>]*>(.*?)<\/script>/gis);
    if (scriptMatches) {
      for (const script of scriptMatches) {
        for (const pattern of patterns) {
          const match = script.match(pattern);
          if (match && match[1]) {
            const id = match[1];
            console.log(`[Internal ID] Found internal user ID in script: ${id}`);
            return id;
          }
        }
      }
    }

    console.log(`[Internal ID] Could not extract internal user ID from profile page`);
    return null;

  } catch (error) {
    console.error(`[Internal ID] Error extracting internal user ID:`, error);
    return null;
  }
}

// Function to discover photos from S3 bucket
async function discoverS3Photos(internalUserId: string, hotel: string, username: string): Promise<any[]> {
  const photos: any[] = [];
  const hotelCode = hotel === 'com.br' ? 'hhbr' : 'hhus'; // Adjust for different hotels
  
  // Generate timestamps for the last 6 months (sample strategy)
  const now = Date.now();
  const sixMonthsAgo = now - (6 * 30 * 24 * 60 * 60 * 1000);
  
  // Create a sampling of potential timestamps (weekly intervals)
  const timestamps = [];
  for (let time = now; time >= sixMonthsAgo; time -= (7 * 24 * 60 * 60 * 1000)) {
    timestamps.push(time);
  }

  console.log(`[S3 Discovery] Testing ${timestamps.length} potential photo timestamps for user ${internalUserId}`);

  // Test each timestamp (with rate limiting)
  for (let i = 0; i < timestamps.length && photos.length < 50; i++) {
    const timestamp = timestamps[i];
    const photoUrl = `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/${hotelCode}/p-${internalUserId}-${timestamp}.png`;
    
    try {
      // Use HEAD request to check if photo exists
      const headResponse = await fetch(photoUrl, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
        },
      });

      if (headResponse.ok) {
        console.log(`[S3 Discovery] Found photo: ${photoUrl}`);
        
        photos.push({
          id: `s3-${internalUserId}-${timestamp}`,
          url: photoUrl,
          previewUrl: photoUrl,
          caption: `Foto de ${username}`,
          timestamp: new Date(timestamp).toISOString(),
          roomName: 'Quarto do jogo',
          likesCount: 0,
          type: 'PHOTO',
          source: 's3_discovery'
        });
      }

      // Rate limiting - small delay between requests
      if (i % 10 === 0 && i > 0) {
        console.log(`[S3 Discovery] Processed ${i + 1}/${timestamps.length} timestamps, found ${photos.length} photos so far`);
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay every 10 requests
      }

    } catch (error) {
      console.log(`[S3 Discovery] Error checking photo ${photoUrl}:`, error.message);
      // Continue with next timestamp
    }
  }

  console.log(`[S3 Discovery] Discovery complete. Found ${photos.length} photos for user ${internalUserId}`);
  return photos;
}
