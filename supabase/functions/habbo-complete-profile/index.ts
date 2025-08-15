
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Discover photos using unified scraping system
    console.log(`[Complete Profile] Starting photo discovery for ${username}`);
    const photos = await discoverPhotosFromScraper(username, hotel);
    console.log(`[Complete Profile] Photo discovery complete. Found ${photos.length} photos total`);
    
    // Store photos in database
    if (photos.length > 0) {
      await storePhotosInDatabase(photos, username, uniqueId, hotel);
    }

    // Calculate comprehensive stats
    const habboTickerCount = Math.floor(Math.random() * 20) + 10; // Mock data for now

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
        level: profileData.currentLevel || 1,
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

// Use unified photo scraper system
async function discoverPhotosFromScraper(username: string, hotel: string): Promise<any[]> {
  console.log(`[Photo Discovery] Using unified scraper for ${username} on ${hotel}`);
  
  try {
    // Initialize Supabase client to call the scraper function
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call the habbo-photos-scraper function
    const { data, error } = await supabase.functions.invoke('habbo-photos-scraper', {
      body: { 
        username: username.trim(), 
        hotel: hotel === 'com.br' ? 'br' : hotel,
        forceRefresh: false 
      }
    });

    if (error) {
      console.error('[Photo Discovery] Scraper error:', error);
      return [];
    }

    if (data && Array.isArray(data)) {
      // Convert scraper format to complete profile format
      return data.map(photo => ({
        id: photo.id || photo.photo_id,
        url: photo.imageUrl,
        previewUrl: photo.imageUrl,
        caption: `Foto de ${username}`,
        timestamp: photo.timestamp ? new Date(photo.timestamp).toISOString() : new Date().toISOString(),
        roomName: photo.roomName || 'Quarto do jogo',
        likesCount: photo.likes || 0,
        type: 'PHOTO',
        source: 'unified_scraper'
      }));
    }

    return [];

  } catch (error) {
    console.error('[Photo Discovery] Error calling scraper:', error);
    return [];
  }
}

// Function to store photos in Supabase database
async function storePhotosInDatabase(photos: any[], username: string, habbo_id: string, hotel: string): Promise<void> {
  console.log(`[Store Photos] Storing ${photos.length} photos for ${username}`);
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // The photos are already stored by the scraper function
    // This is just for activity tracking
    const activityData = photos.slice(0, 3).map(photo => ({
      habbo_name: username,
      habbo_id: habbo_id,
      hotel: hotel === 'com.br' ? 'br' : hotel,
      activity_type: 'profile_viewed',
      description: `Perfil visualizado: ${photos.length} fotos encontradas`,
      photo_id: photo.id,
      photo_url: photo.url,
      details: {
        total_photos: photos.length,
        source: 'complete_profile'
      }
    }));

    await supabase
      .from('habbo_activities')
      .insert(activityData);

    console.log(`[Store Photos] Created activity records for profile view`);

  } catch (error) {
    console.error(`[Store Photos] Error storing activity:`, error);
  }
}
