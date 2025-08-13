
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

    // Discover photos using multiple strategies
    console.log(`[Complete Profile] Starting enhanced photo discovery for ${username}`);
    photos = await discoverPhotosEnhanced(uniqueId, hotel, username);
    console.log(`[Complete Profile] Enhanced discovery complete. Found ${photos.length} photos total`);
    
    // Log photo sources
    const sourceBreakdown = photos.reduce((acc, photo) => {
      acc[photo.source] = (acc[photo.source] || 0) + 1;
      return acc;
    }, {});
    console.log(`[Complete Profile] Photo sources:`, sourceBreakdown);

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
    console.log(`[Internal ID] HTML page length: ${html.length} characters`);
    
    // Enhanced patterns to extract internal user ID with more logging
    const patterns = [
      // Specific patterns for Habbo profile pages
      /user['":\s]*['":]?(\d+)/gi,
      /userId['":\s]*['":]?(\d+)/gi,
      /user_id['":\s]*['":]?(\d+)/gi,
      /id['":\s]*['":]?(\d+)/gi,
      /data-user-id[='"]*(\d+)/gi,
      // S3 URL patterns we know work
      /servercamera\/purchased\/\w+\/p-(\d+)-/gi,
      // JavaScript variable patterns
      /var\s+user\s*=\s*['"]*(\d+)/gi,
      /window\.user\s*=\s*['"]*(\d+)/gi,
      // JSON data patterns
      /"user"\s*:\s*['"]*(\d+)/gi,
      /"userId"\s*:\s*['"]*(\d+)/gi,
    ];

    for (const pattern of patterns) {
      console.log(`[Internal ID] Testing pattern: ${pattern}`);
      const matches = Array.from(html.matchAll(pattern));
      
      if (matches && matches.length > 0) {
        for (const match of matches) {
          if (match && match[1]) {
            const id = match[1];
            // Filter out common false positives
            if (id.length >= 5 && id.length <= 10 && parseInt(id) > 10000) {
              console.log(`[Internal ID] Found potential internal user ID: ${id} using pattern: ${pattern}`);
              return id;
            }
          }
        }
      }
    }

    // Also search in script tags specifically
    const scriptRegex = /<script[^>]*>(.*?)<\/script>/gis;
    const scriptMatches = html.match(scriptRegex);
    if (scriptMatches) {
      console.log(`[Internal ID] Found ${scriptMatches.length} script tags to analyze`);
      for (let i = 0; i < scriptMatches.length; i++) {
        const script = scriptMatches[i];
        for (const pattern of patterns) {
          const matches = Array.from(script.matchAll(pattern));
          if (matches && matches.length > 0) {
            for (const match of matches) {
              if (match && match[1]) {
                const id = match[1];
                if (id.length >= 5 && id.length <= 10 && parseInt(id) > 10000) {
                  console.log(`[Internal ID] Found internal user ID in script ${i}: ${id}`);
                  return id;
                }
              }
            }
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

// First try to get photos via the official Habbo API
async function getPhotosFromHabboAPI(uniqueId: string, hotel: string, username: string): Promise<any[]> {
  console.log(`[Habbo API] Attempting to get photos from official API for ${username}`);
  
  try {
    // Try profile endpoint first - sometimes contains photo data
    const profileUrl = `https://www.habbo.${hotel}/api/public/users/${uniqueId}/profile`;
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[Habbo API] Profile data keys:`, Object.keys(data));
      
      // Check if there's a photos array or similar
      if (data.photos && Array.isArray(data.photos)) {
        console.log(`[Habbo API] Found ${data.photos.length} photos in profile API`);
        return data.photos.map((photo: any, index: number) => ({
          id: photo.id || `api-${uniqueId}-${index}`,
          url: photo.url || photo.imageUrl,
          previewUrl: photo.thumbnailUrl || photo.previewUrl || photo.url || photo.imageUrl,
          caption: photo.caption || `Foto de ${username}`,
          timestamp: photo.timestamp || photo.createdAt || new Date().toISOString(),
          roomName: photo.roomName || 'Quarto do jogo',
          likesCount: photo.likes || photo.likesCount || 0,
          type: 'PHOTO',
          source: 'api'
        }));
      }
    }
  } catch (error) {
    console.log(`[Habbo API] Error fetching from official API:`, error.message);
  }
  
  return [];
}

// Enhanced function to discover photos using multiple strategies
async function discoverPhotosEnhanced(uniqueId: string, hotel: string, username: string): Promise<any[]> {
  let allPhotos: any[] = [];
  
  // Strategy 1: Try official Habbo API first
  console.log(`[Photo Discovery] Strategy 1: Official Habbo API`);
  const apiPhotos = await getPhotosFromHabboAPI(uniqueId, hotel, username);
  allPhotos = [...allPhotos, ...apiPhotos];
  
  // Strategy 2: Extract internal ID and use S3 discovery
  console.log(`[Photo Discovery] Strategy 2: S3 Discovery`);
  let internalUserId = internalIdCache.get(uniqueId);
  
  if (!internalUserId) {
    console.log(`[Photo Discovery] Extracting internal user ID for ${username}`);
    internalUserId = await extractInternalUserId(username, hotel);
    if (internalUserId) {
      internalIdCache.set(uniqueId, internalUserId);
      console.log(`[Photo Discovery] Found internal user ID: ${internalUserId}`);
    }
  }
  
  if (internalUserId) {
    const s3Photos = await discoverS3Photos(internalUserId, hotel, username);
    allPhotos = [...allPhotos, ...s3Photos];
  }
  
  // Strategy 3: Try known working examples for testing
  console.log(`[Photo Discovery] Strategy 3: Testing known examples`);
  const knownTestPhotos = await testKnownExamples(hotel, username);
  allPhotos = [...allPhotos, ...knownTestPhotos];
  
  // Remove duplicates and return
  const uniquePhotos = allPhotos.filter((photo, index, self) => 
    index === self.findIndex((p) => p.url === photo.url)
  );
  
  console.log(`[Photo Discovery] Total photos found: ${uniquePhotos.length} (${apiPhotos.length} API + ${allPhotos.length - apiPhotos.length - knownTestPhotos.length} S3 + ${knownTestPhotos.length} test)`);
  return uniquePhotos;
}

// Test with known working photo examples
async function testKnownExamples(hotel: string, username: string): Promise<any[]> {
  const photos: any[] = [];
  const hotelCode = hotel === 'com.br' ? 'hhbr' : 'hhus';
  
  // Known working examples from your research
  const knownIds = ['464837', '91557551'];
  const testTimestamps = [
    Date.now() - (7 * 24 * 60 * 60 * 1000), // 1 week ago
    Date.now() - (30 * 24 * 60 * 60 * 1000), // 1 month ago
    Date.now() - (90 * 24 * 60 * 60 * 1000), // 3 months ago
  ];
  
  for (const testId of knownIds) {
    for (const timestamp of testTimestamps) {
      const photoUrl = `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/${hotelCode}/p-${testId}-${timestamp}.png`;
      
      try {
        const headResponse = await fetch(photoUrl, { 
          method: 'HEAD',
          headers: {
            'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
          },
        });

        if (headResponse.ok) {
          console.log(`[Test Photos] ✅ Found test photo: ${photoUrl}`);
          photos.push({
            id: `test-${testId}-${timestamp}`,
            url: photoUrl,
            previewUrl: photoUrl,
            caption: `Foto de exemplo (ID ${testId})`,
            timestamp: new Date(timestamp).toISOString(),
            roomName: 'Quarto de exemplo',
            likesCount: 0,
            type: 'PHOTO',
            source: 'test_example'
          });
          
          if (photos.length >= 5) break; // Limit test photos
        }
      } catch (error) {
        console.log(`[Test Photos] Error testing ${photoUrl}:`, error.message);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (photos.length >= 5) break;
  }
  
  return photos;
}

// Function to discover photos from S3 bucket with enhanced strategy
async function discoverS3Photos(internalUserId: string, hotel: string, username: string): Promise<any[]> {
  const photos: any[] = [];
  const hotelCode = hotel === 'com.br' ? 'hhbr' : 'hhus';
  
  console.log(`[S3 Discovery] Starting photo discovery for user ${internalUserId} on hotel ${hotelCode}`);
  
  // Generate smarter timestamp sampling
  const now = Date.now();
  const timestamps = [];
  
  // Recent photos - higher probability (daily for last 2 weeks)
  for (let days = 0; days < 14; days++) {
    timestamps.push(now - (days * 24 * 60 * 60 * 1000));
  }
  
  // Older photos - weekly sampling for last 6 months
  for (let weeks = 2; weeks < 26; weeks++) {
    timestamps.push(now - (weeks * 7 * 24 * 60 * 60 * 1000));
  }

  console.log(`[S3 Discovery] Testing ${timestamps.length} timestamps for user ${internalUserId}`);

  // Test each timestamp with rate limiting
  for (let i = 0; i < timestamps.length && photos.length < 20; i++) {
    const timestamp = timestamps[i];
    const photoUrl = `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/${hotelCode}/p-${internalUserId}-${timestamp}.png`;
    
    try {
      const headResponse = await fetch(photoUrl, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
        },
      });

      if (headResponse.ok) {
        console.log(`[S3 Discovery] ✅ Found photo: ${photoUrl}`);
        
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

      // Rate limiting
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 150));
      } else {
        await new Promise(resolve => setTimeout(resolve, 75));
      }

    } catch (error) {
      console.log(`[S3 Discovery] Error checking ${photoUrl}:`, error.message);
    }
  }

  console.log(`[S3 Discovery] Found ${photos.length} photos for user ${internalUserId}`);
  return photos;
}
