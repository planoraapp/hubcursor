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

    // Discover photos using new enhanced scraping system
    console.log(`[Complete Profile] Starting enhanced photo discovery for ${username}`);
    const photos = await discoverPhotosEnhanced(uniqueId, hotel, username);
    console.log(`[Complete Profile] Enhanced discovery complete. Found ${photos.length} photos total`);
    
    // Store photos in database
    if (photos.length > 0) {
      await storePhotosInDatabase(photos, username, uniqueId, hotel);
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

// Enhanced photo discovery function with proper scraping
async function discoverPhotosEnhanced(uniqueId: string, hotel: string, username: string): Promise<any[]> {
  console.log(`[Photo Discovery] Starting enhanced discovery for ${username} on ${hotel}`);
  
  const allPhotos: any[] = [];
  const discoveredUrls = new Set<string>();
  
  // Strategy 1: Enhanced Profile Page Scraping (Primary method)
  console.log('[Photo Discovery] Strategy 1: Enhanced Profile Page Scraping');
  try {
    const scrapedPhotos = await scrapeProfilePhotosEnhanced(username, hotel);
    for (const photo of scrapedPhotos) {
      if (!discoveredUrls.has(photo.url)) {
        discoveredUrls.add(photo.url);
        allPhotos.push(photo);
      }
    }
  } catch (error) {
    console.error('[Photo Discovery] Strategy 1 failed:', error);
  }
  
  // Strategy 2: HabboWidgets scraping (secondary)
  console.log('[Photo Discovery] Strategy 2: HabboWidgets Scraping');
  try {
    const habboWidgetsPhotos = await scrapeHabboWidgets(username, hotel);
    for (const photo of habboWidgetsPhotos) {
      if (!discoveredUrls.has(photo.url)) {
        discoveredUrls.add(photo.url);
        allPhotos.push(photo);
      }
    }
  } catch (error) {
    console.error('[Photo Discovery] Strategy 2 failed:', error);
  }
  
  // Strategy 3: Official Habbo API (if available)
  console.log('[Photo Discovery] Strategy 3: Official Habbo API');
  try {
    const apiPhotos = await getPhotosFromHabboAPI(uniqueId, hotel, username);
    for (const photo of apiPhotos) {
      if (!discoveredUrls.has(photo.url)) {
        discoveredUrls.add(photo.url);
        allPhotos.push(photo);
      }
    }
  } catch (error) {
    console.error('[Photo Discovery] Strategy 3 failed:', error);
  }

  // NO MORE FIXED FALLBACK - Return empty array if no photos found
  console.log(`[Photo Discovery] Total photos found: ${allPhotos.length}`);
  
  return allPhotos;
}

// Enhanced profile scraping function
async function scrapeProfilePhotosEnhanced(username: string, hotel: string): Promise<any[]> {
  const photos: any[] = [];
  const profileUrl = `https://www.habbo.${hotel}/profile/${encodeURIComponent(username)}`;
  
  console.log(`[Profile Scraping Enhanced] Fetching photos from: ${profileUrl}`);
  
  try {
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      console.log(`[Profile Scraping Enhanced] Failed to fetch profile page: ${response.status}`);
      return photos;
    }

    const html = await response.text();
    console.log(`[Profile Scraping Enhanced] Profile page HTML length: ${html.length} characters`);

    // Enhanced regex patterns to extract photo data
    const photoCardPattern = /<habbo-card[^>]*item="[^"]*"[^>]*>(.*?)<\/habbo-card>/gs;
    const photoLinkPattern = /href="\/profile\/[^\/]+\/photo\/([^"]+)"/g;
    const photoImagePattern = /ng-src="([^"]*habbo-stories-content\.s3\.amazonaws\.com[^"]*p-(\d+)-(\d+)\.png[^"]*)"/g;
    const likesPattern = /<span class="like__count">(\d+)<\/span>/g;
    const datePattern = /<time class="card__date">([^<]+)<\/time>/g;

    let photoCards = [];
    let match;
    
    // Extract all photo cards
    while ((match = photoCardPattern.exec(html)) !== null) {
      photoCards.push(match[1]);
    }
    
    console.log(`[Profile Scraping Enhanced] Found ${photoCards.length} photo cards`);

    for (let i = 0; i < photoCards.length; i++) {
      const cardHtml = photoCards[i];
      
      // Extract photo ID
      const photoIdMatch = cardHtml.match(/href="\/profile\/[^\/]+\/photo\/([^"]+)"/);
      const photoId = photoIdMatch ? photoIdMatch[1] : `scraped-${username}-${i}`;
      
      // Extract S3 URL and metadata
      const imageMatch = cardHtml.match(/ng-src="([^"]*habbo-stories-content\.s3\.amazonaws\.com[^"]*p-(\d+)-(\d+)\.png[^"]*)"/);
      if (!imageMatch) continue;
      
      const [, fullUrl, internalId, timestamp] = imageMatch;
      const cleanUrl = fullUrl.replace(/&amp;/g, '&');
      
      // Extract likes count
      const likesMatch = cardHtml.match(/<span class="like__count">(\d+)<\/span>/);
      const likesCount = likesMatch ? parseInt(likesMatch[1]) : 0;
      
      // Extract date
      const dateMatch = cardHtml.match(/<time class="card__date">([^<]+)<\/time>/);
      let takenDate = null;
      if (dateMatch) {
        try {
          // Parse date like "01/08/25" to proper date
          const dateParts = dateMatch[1].split('/');
          if (dateParts.length === 3) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
            const year = 2000 + parseInt(dateParts[2]); // Assuming 20XX
            takenDate = new Date(year, month, day).toISOString();
          }
        } catch (e) {
          console.log(`[Profile Scraping Enhanced] Error parsing date: ${dateMatch[1]}`);
        }
      }

      photos.push({
        id: photoId,
        url: cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`,
        previewUrl: cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`,
        caption: `Foto de ${username}`,
        timestamp: takenDate || new Date(parseInt(timestamp)).toISOString(),
        roomName: 'Quarto do jogo',
        likesCount: likesCount,
        type: 'PHOTO',
        source: 'profile_scraping_enhanced',
        internalUserId: internalId,
        timestampTaken: parseInt(timestamp)
      });
      
      console.log(`[Profile Scraping Enhanced] Extracted photo: ${cleanUrl}, likes: ${likesCount}, date: ${takenDate}`);
    }

    console.log(`[Profile Scraping Enhanced] Successfully extracted ${photos.length} photos from profile page`);

  } catch (error) {
    console.error(`[Profile Scraping Enhanced] Error scraping profile page:`, error);
  }

  return photos;
}

// Function to scrape photos from HabboWidgets (primary method)
async function scrapeHabboWidgets(username: string, hotel: string): Promise<any[]> {
  console.log(`[HabboWidgets] Fetching photos from HabboWidgets for ${username}`);
  
  const photos: any[] = [];
  const habboWidgetsUrl = `https://www.habbowidgets.com/habinfo/${hotel}/${username}`;
  
  try {
    const response = await fetch(habboWidgetsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Referer': 'https://www.habbowidgets.com/',
      }
    });

    if (!response.ok) {
      console.log(`[HabboWidgets] HTTP ${response.status} for HabboWidgets page`);
      return photos;
    }

    const html = await response.text();
    console.log(`[HabboWidgets] HabboWidgets HTML length: ${html.length} characters`);
    
    // Enhanced patterns to extract photo URLs from HabboWidgets
    const patterns = [
      // Direct S3 URLs
      /habbo-stories-content\.s3\.amazonaws\.com\/servercamera\/purchased\/[\w\.]+\/p-(\d+)-(\d+)\.png/g,
      // URLs with protocol
      /https?:\/\/habbo-stories-content\.s3\.amazonaws\.com\/servercamera\/purchased\/[\w\.]+\/p-(\d+)-(\d+)\.png/g,
      // URLs in src attributes
      /src=["']([^"']*habbo-stories-content\.s3\.amazonaws\.com[^"']*p-(\d+)-(\d+)\.png[^"']*)["']/g,
      // URLs in href attributes
      /href=["']([^"']*habbo-stories-content\.s3\.amazonaws\.com[^"']*p-(\d+)-(\d+)\.png[^"']*)["']/g
    ];
    
    const foundUrls = new Set<string>();
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let fullUrl, internalId, timestamp;
        
        if (match.length === 3) {
          // Direct URL patterns
          [fullUrl, internalId, timestamp] = match;
          if (!fullUrl.startsWith('http')) {
            fullUrl = fullUrl.startsWith('//') ? `https:${fullUrl}` : `https://${fullUrl}`;
          }
        } else if (match.length === 4) {
          // Attribute patterns
          [, fullUrl, internalId, timestamp] = match;
        }
        
        if (fullUrl && internalId && timestamp) {
          foundUrls.add(fullUrl);
          console.log(`[HabboWidgets] Found photo URL: ${fullUrl}`);
        }
      }
    }
    
    // Convert found URLs to photo objects
    Array.from(foundUrls).forEach((photoUrl, index) => {
      const urlMatch = photoUrl.match(/p-(\d+)-(\d+)\.png/);
      if (urlMatch) {
        const internalId = urlMatch[1];
        const timestamp = parseInt(urlMatch[2]);
        
        photos.push({
          id: `habbowidgets-${internalId}-${timestamp}`,
          url: photoUrl,
          previewUrl: photoUrl,
          caption: `Foto de ${username}`,
          timestamp: new Date(timestamp).toISOString(),
          roomName: 'Quarto do jogo',
          likesCount: 0,
          type: 'PHOTO',
          source: 'habbowidgets_scraping',
          internalUserId: internalId,
          timestampTaken: timestamp
        });
      }
    });

    console.log(`[HabboWidgets] Found ${photos.length} photos from HabboWidgets`);
    
  } catch (error) {
    console.error('[HabboWidgets] Error:', error);
  }
  
  return photos;
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

// Function to store photos in Supabase database
async function storePhotosInDatabase(photos: any[], username: string, habbo_id: string, hotel: string): Promise<void> {
  console.log(`[Store Photos] Storing ${photos.length} photos for ${username}`);
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare photo data for insertion
    const photoData = photos.map(photo => ({
      photo_id: photo.id,
      habbo_name: username,
      habbo_id: habbo_id,
      hotel: hotel === 'com.br' ? 'br' : hotel,
      s3_url: photo.url,
      preview_url: photo.previewUrl || photo.url,
      internal_user_id: photo.internalUserId,
      timestamp_taken: photo.timestampTaken,
      caption: photo.caption,
      room_name: photo.roomName,
      taken_date: photo.timestamp ? new Date(photo.timestamp) : null,
      likes_count: photo.likesCount || 0,
      photo_type: photo.type || 'PHOTO',
      source: photo.source
    }));

    // Insert photos using upsert to avoid duplicates
    const { data, error } = await supabase
      .from('habbo_photos')
      .upsert(photoData, { 
        onConflict: 'photo_id,habbo_name',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error(`[Store Photos] Error storing photos:`, error);
      return;
    }

    console.log(`[Store Photos] Successfully stored ${photos.length} photos for ${username}`);

    // Create activity records for new photos
    const activityData = photos.map(photo => ({
      habbo_name: username,
      habbo_id: habbo_id,
      hotel: hotel === 'com.br' ? 'br' : hotel,
      activity_type: 'new_photo',
      description: `Nova foto: ${photo.caption}`,
      photo_id: photo.id,
      photo_url: photo.url,
      details: {
        room_name: photo.roomName,
        likes_count: photo.likesCount,
        source: photo.source
      }
    }));

    await supabase
      .from('habbo_activities')
      .insert(activityData);

    console.log(`[Store Photos] Created activity records for ${photos.length} photos`);

  } catch (error) {
    console.error(`[Store Photos] Error storing photos in database:`, error);
  }
}
