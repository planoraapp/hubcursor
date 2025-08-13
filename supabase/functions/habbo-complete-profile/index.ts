
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Get photos with enhanced error handling and logging
    const photosUrl = `https://www.habbo.${hotel}/api/public/users/${uniqueId}/photos`;
    let photos = [];
    
    console.log(`[Complete Profile] Fetching photos from: ${photosUrl}`);
    
    try {
      const photosResponse = await fetch(photosUrl, {
        headers: {
          'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
          'Accept': 'application/json',
        },
      });
      
      console.log(`[Complete Profile] Photos response status: ${photosResponse.status}`);
      
      if (photosResponse.ok) {
        const rawPhotos = await photosResponse.json();
        console.log(`[Complete Profile] Raw photos data:`, JSON.stringify(rawPhotos, null, 2));
        
        // Handle both array and object responses
        if (Array.isArray(rawPhotos)) {
          photos = rawPhotos;
        } else if (rawPhotos && rawPhotos.photos) {
          photos = rawPhotos.photos;
        } else if (rawPhotos) {
          photos = [rawPhotos];
        }
        
        // Enhanced photo mapping with more fields
        photos = photos.map((photo, index) => ({
          id: photo.id || photo.photoId || `photo-${uniqueId}-${index}`,
          url: photo.url || photo.imageUrl || photo.src,
          previewUrl: photo.previewUrl || photo.thumbnailUrl || photo.url || photo.imageUrl,
          caption: photo.caption || photo.description || '',
          timestamp: photo.timestamp || photo.takenOn || photo.createdAt || new Date().toISOString(),
          roomId: photo.roomId || null,
          roomName: photo.roomName || 'Quarto desconhecido',
          likesCount: photo.likesCount || photo.likes || 0,
          type: photo.type || 'PHOTO'
        }));
        
        console.log(`[Complete Profile] Processed ${photos.length} photos for ${username}`);
      } else {
        console.log(`[Complete Profile] Photos API returned ${photosResponse.status}, continuing without photos`);
      }
    } catch (error) {
      console.log(`[Complete Profile] Photos fetch failed: ${error.message}, continuing without photos`);
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
