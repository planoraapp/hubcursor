
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Photo {
  id: string;
  photo_id: string;
  imageUrl: string;
  date: string;
  likes: number;
  timestamp?: number;
  roomName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let username: string | null = null;
    let hotel: string = 'br';
    let forceRefresh: boolean = false;

    // Try to get parameters from query string first
    const url = new URL(req.url)
    username = url.searchParams.get('username')
    const queryHotel = url.searchParams.get('hotel')
    forceRefresh = url.searchParams.get('forceRefresh') === 'true'

    // If not in query string, try to get from body
    if (!username) {
      try {
        const body = await req.json()
        username = body.username
        hotel = body.hotel || 'br'
        forceRefresh = body.forceRefresh || false
      } catch (error) {
        console.log('[habbo-photos-scraper] No JSON body found, continuing with query params')
      }
    } else {
      hotel = queryHotel || 'br'
    }

    if (!username) {
      console.error('[habbo-photos-scraper] No username provided in query or body')
      return new Response(
        JSON.stringify({ error: 'Username parameter is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Normalize hotel format - convert 'br' to 'com.br' for profile URL
    const profileHotel = hotel === 'br' ? 'com.br' : hotel
    const dbHotel = hotel === 'com.br' ? 'br' : hotel // Database uses 'br' format

    console.log(`[habbo-photos-scraper] ====== STARTING SCRAPE ======`)
    console.log(`[habbo-photos-scraper] Username: ${username}`)
    console.log(`[habbo-photos-scraper] Hotel: ${hotel} (profile: ${profileHotel}, db: ${dbHotel})`)
    console.log(`[habbo-photos-scraper] Force refresh: ${forceRefresh}`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check cached photos (5 minutes cache instead of 1 hour, unless force refresh)
    const cacheMinutes = forceRefresh ? 0 : 5;
    const cacheTime = new Date(Date.now() - cacheMinutes * 60 * 1000).toISOString();
    
    const { data: cachedPhotos } = await supabase
      .from('habbo_photos')
      .select('*')
      .eq('habbo_name', username)
      .eq('hotel', dbHotel)
      .gte('updated_at', cacheTime)
      .order('taken_date', { ascending: false })

    console.log(`[habbo-photos-scraper] Cache check: found ${cachedPhotos?.length || 0} cached photos (cache since: ${cacheTime})`)

    if (cachedPhotos && cachedPhotos.length > 0 && !forceRefresh) {
      console.log(`[habbo-photos-scraper] Returning ${cachedPhotos.length} cached photos`)
      const formattedPhotos = cachedPhotos.map(photo => ({
        id: photo.photo_id,
        photo_id: photo.photo_id,
        imageUrl: photo.s3_url,
        date: new Date(photo.taken_date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }),
        likes: photo.likes_count,
        timestamp: photo.timestamp_taken,
        roomName: photo.room_name || 'Quarto do jogo'
      }))

      return new Response(
        JSON.stringify(formattedPhotos),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If no cache or force refresh, scrape from Habbo profile
    console.log(`[habbo-photos-scraper] No valid cache found, attempting to scrape profile`)
    
    const profileUrl = `https://www.habbo.${profileHotel}/profile/${username}`
    console.log(`[habbo-photos-scraper] Profile URL: ${profileUrl}`)
    
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8,es;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      console.error(`[habbo-photos-scraper] HTTP error: ${response.status} - ${response.statusText}`)
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch profile: ${response.statusText}`,
          debug: { status: response.status, url: profileUrl }
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const html = await response.text()
    console.log(`[habbo-photos-scraper] Retrieved HTML, length: ${html.length}`)
    console.log(`[habbo-photos-scraper] HTML preview (first 500 chars): ${html.substring(0, 500)}`)

    // Extract photos using multiple patterns
    const photos: Photo[] = []
    const uniqueUrls = new Set<string>()
    
    // Pattern 1: Main S3 URLs
    const s3UrlPattern = /https:\/\/habbo-stories-content\.s3\.amazonaws\.com\/servercamera\/purchased\/[^\/]+\/p-(\d+)-(\d+)\.png/g
    const s3Matches = [...html.matchAll(s3UrlPattern)]
    console.log(`[habbo-photos-scraper] Pattern 1 (S3 URLs): Found ${s3Matches.length} matches`)

    // Pattern 2: Any S3 content URLs
    const generalS3Pattern = /https:\/\/habbo-stories-content\.s3\.amazonaws\.com\/[^"'\s]+\.png/g
    const generalMatches = [...html.matchAll(generalS3Pattern)]
    console.log(`[habbo-photos-scraper] Pattern 2 (General S3): Found ${generalMatches.length} matches`)

    // Pattern 3: ng-src attributes
    const ngSrcPattern = /ng-src="(https:\/\/habbo-stories-content\.s3\.amazonaws\.com\/[^"]+)"/g
    const ngSrcMatches = [...html.matchAll(ngSrcPattern)]
    console.log(`[habbo-photos-scraper] Pattern 3 (ng-src): Found ${ngSrcMatches.length} matches`)

    // Pattern 4: src attributes
    const srcPattern = /src="(https:\/\/habbo-stories-content\.s3\.amazonaws\.com\/[^"]+)"/g
    const srcMatches = [...html.matchAll(srcPattern)]
    console.log(`[habbo-photos-scraper] Pattern 4 (src): Found ${srcMatches.length} matches`)

    // Combine all patterns
    const allMatches = [
      ...s3Matches.map(match => ({ url: match[0], userId: match[1], timestamp: parseInt(match[2]) })),
      ...generalMatches.map(match => ({ url: match[0], userId: 'unknown', timestamp: Date.now() })),
      ...ngSrcMatches.map(match => ({ url: match[1], userId: 'unknown', timestamp: Date.now() })),
      ...srcMatches.map(match => ({ url: match[1], userId: 'unknown', timestamp: Date.now() }))
    ]

    console.log(`[habbo-photos-scraper] Total URL matches found: ${allMatches.length}`)

    // Process matches
    for (const match of allMatches) {
      const fullUrl = match.url
      
      // Skip duplicates
      if (uniqueUrls.has(fullUrl)) {
        console.log(`[habbo-photos-scraper] Skipping duplicate: ${fullUrl}`)
        continue
      }
      uniqueUrls.add(fullUrl)

      // Extract timestamp from URL if possible
      const timestampMatch = fullUrl.match(/p-\d+-(\d+)\.png/)
      const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : match.timestamp

      // Try to extract more metadata from surrounding HTML
      const urlIndex = html.indexOf(fullUrl)
      let likes = 0
      let roomName = 'Quarto do jogo'
      
      if (urlIndex > -1) {
        // Look for likes in surrounding context (500 chars before and after)
        const context = html.substring(Math.max(0, urlIndex - 500), urlIndex + 500)
        const likesMatch = context.match(/(\d+)\s*like[s]?/i) || context.match(/curtida[s]?\s*(\d+)/i)
        if (likesMatch) {
          likes = parseInt(likesMatch[1]) || 0
        }

        // Look for room name
        const roomMatch = context.match(/room[:\s]+([^<"']+)/i) || context.match(/quarto[:\s]+([^<"']+)/i)
        if (roomMatch) {
          roomName = roomMatch[1].trim()
        }
      }

      const photo: Photo = {
        id: `${username}-${timestamp}`,
        photo_id: `${username}-${timestamp}`,
        imageUrl: fullUrl,
        date: new Date(timestamp).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }),
        likes: likes,
        timestamp: timestamp,
        roomName: roomName
      }
      
      photos.push(photo)
      console.log(`[habbo-photos-scraper] Added photo: ${fullUrl} (likes: ${likes}, room: ${roomName})`)
    }

    console.log(`[habbo-photos-scraper] Final photo count: ${photos.length} unique photos`)

    // Store in database for caching
    if (photos.length > 0) {
      console.log(`[habbo-photos-scraper] Storing ${photos.length} photos in database`)
      
      // Clear existing photos for this user to avoid duplicates
      await supabase
        .from('habbo_photos')
        .delete()
        .eq('habbo_name', username)
        .eq('hotel', dbHotel)
      
      for (const photo of photos) {
        // Fixed bug: get userId from URL extraction or use fallback
        let userId = 'unknown'
        const userIdMatch = photo.imageUrl.match(/p-(\d+)-\d+\.png/)
        if (userIdMatch) {
          userId = userIdMatch[1]
        }

        const { error: insertError } = await supabase
          .from('habbo_photos')
          .insert({
            photo_id: photo.photo_id,
            habbo_name: username,
            habbo_id: `${dbHotel}-${userId}`,
            hotel: dbHotel,
            s3_url: photo.imageUrl,
            preview_url: photo.imageUrl,
            timestamp_taken: photo.timestamp,
            taken_date: new Date(photo.timestamp || Date.now()).toISOString(),
            likes_count: photo.likes,
            photo_type: 'PHOTO',
            source: 'profile_scraping',
            caption: `Foto de ${username}`,
            room_name: photo.roomName
          })
        
        if (insertError) {
          console.error(`[habbo-photos-scraper] Error inserting photo ${photo.photo_id}:`, insertError)
        }
      }
      
      console.log(`[habbo-photos-scraper] Successfully stored ${photos.length} photos`)
    } else {
      console.log(`[habbo-photos-scraper] No photos found for ${username}`)
      console.log(`[habbo-photos-scraper] HTML sample for debugging:`)
      
      // Log specific sections of HTML that might contain photos
      const photoSections = [
        html.match(/<div[^>]*photo[^>]*>.*?<\/div>/gi),
        html.match(/<img[^>]*habbo-stories[^>]*>/gi),
        html.match(/habbo-stories-content\.s3\.amazonaws\.com[^"'\s]*/gi)
      ].filter(Boolean)
      
      photoSections.forEach((section, index) => {
        console.log(`[habbo-photos-scraper] Photo section ${index + 1}:`, section)
      })
    }

    console.log(`[habbo-photos-scraper] ====== SCRAPE COMPLETE ======`)
    console.log(`[habbo-photos-scraper] Returning ${photos.length} photos for ${username}`)
    
    return new Response(
      JSON.stringify(photos),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[habbo-photos-scraper] Error:', error)
    console.error('[habbo-photos-scraper] Error stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        debug: {
          name: error.name,
          stack: error.stack?.split('\n').slice(0, 5)
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
