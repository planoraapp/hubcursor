
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { hotel, limit = 50, onlineWithinSeconds = 3600, mode = 'hybrid', onlyOnline = false } = await req.json()
    console.log(`🎯 [feed] Feed request: ${mode} mode for ${hotel}, limit ${limit}, online within ${onlineWithinSeconds}s`)

    const hotelFilter = hotel === 'com.br' ? 'br' : hotel
    const cutoffTime = new Date(Date.now() - (onlineWithinSeconds * 1000)).toISOString()

    console.log(`📊 [feed] Getting activities from database for ${hotel}`)

    // Get activities from database - remove the problematic join
    const { data: activities, error } = await supabase
      .from('habbo_activities')
      .select('*')
      .eq('hotel', hotelFilter)
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error(`❌ [feed] Database error: ${error.message}`)
      throw error
    }

    console.log(`📊 [feed] Found ${activities?.length || 0} activities in database`)

    // Get user profiles separately for enrichment
    const uniqueUserIds = [...new Set(activities?.map(a => a.habbo_id) || [])]
    let userProfiles = new Map()

    if (uniqueUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('habbo_user_snapshots')
        .select('*')
        .in('habbo_id', uniqueUserIds)
        .eq('hotel', hotelFilter)
        .order('created_at', { ascending: false })

      if (profiles) {
        profiles.forEach(profile => {
          if (!userProfiles.has(profile.habbo_id)) {
            userProfiles.set(profile.habbo_id, profile)
          }
        })
      }
    }

    // Get online count from snapshots
    const { count: onlineCount } = await supabase
      .from('habbo_user_snapshots')
      .select('*', { count: 'exact', head: true })
      .eq('hotel', hotelFilter)
      .eq('is_online', true)
      .gte('created_at', cutoffTime)

    if (!activities || activities.length === 0) {
      console.log(`⚠️ [feed] No activities found in database for ${hotel}`)
      
      if (mode === 'hybrid' || mode === 'database') {
        console.log(`📊 [feed] Trying fallback to widgets proxy`)
        
        // Try to get from official ticker as fallback
        const { data: tickerResponse, error: tickerError } = await supabase.functions.invoke('habbo-widgets-proxy', {
          body: { endpoint: 'community/ticker', hotel }
        })

        if (!tickerError && tickerResponse?.activities?.length > 0) {
          console.log(`✅ [feed] Using ${tickerResponse.activities.length} activities from ticker fallback`)
          return new Response(
            JSON.stringify({
              activities: tickerResponse.activities.slice(0, limit).map((activity: any) => ({
                username: activity.username || 'Unknown',
                description: activity.activity || activity.description || 'fez uma atividade',
                lastUpdate: activity.timestamp || activity.time || new Date().toISOString(),
                counts: {},
                profile: null,
                friends: [],
                badges: [],
                photos: []
              })),
              meta: {
                source: 'official-fallback',
                timestamp: new Date().toISOString(),
                count: tickerResponse.activities.length,
                onlineCount: onlineCount || 0
              }
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          )
        }
      }

      console.log(`✅ [feed] Returning 0 activities (database), ${onlineCount || 0} online`)
      return new Response(
        JSON.stringify({
          activities: [],
          meta: {
            source: 'database',
            timestamp: new Date().toISOString(),
            count: 0,
            onlineCount: onlineCount || 0
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Aggregate activities by user
    const userActivities = new Map()

    for (const activity of activities) {
      const username = activity.habbo_name
      
      if (!userActivities.has(username)) {
        const userProfile = userProfiles.get(activity.habbo_id)
        userActivities.set(username, {
          username,
          description: '',
          lastUpdate: activity.created_at,
          counts: {
            friendsAdded: 0,
            badgesEarned: 0,
            photosPosted: 0,
            avatarChanged: 0,
            mottoChanged: 0
          },
          profile: userProfile?.raw_data || null,
          friends: [],
          badges: [],
          photos: [],
          activities: []
        })
      }

      const userActivity = userActivities.get(username)
      userActivity.activities.push(activity)
      
      // Update lastUpdate to the most recent
      if (activity.created_at > userActivity.lastUpdate) {
        userActivity.lastUpdate = activity.created_at
      }

      // Process activity details
      if (activity.details) {
        if (activity.details.new_friends?.length > 0) {
          userActivity.counts.friendsAdded += activity.details.new_friends.length
          userActivity.friends.push(...activity.details.new_friends)
        }
        
        if (activity.details.new_badges?.length > 0) {
          userActivity.counts.badgesEarned += activity.details.new_badges.length
          userActivity.badges.push(...activity.details.new_badges)
        }
        
        if (activity.details.new_photos?.length > 0) {
          userActivity.counts.photosPosted += activity.details.new_photos.length
          userActivity.photos.push(...activity.details.new_photos)
        }
        
        if (activity.details.avatar_changed) {
          userActivity.counts.avatarChanged += 1
        }
        
        if (activity.details.motto_changed) {
          userActivity.counts.mottoChanged += 1
        }
      }
    }

    // Convert to array, generate descriptions and normalize counts
    let aggregatedActivities = Array.from(userActivities.values()).map((user: any) => {
      const actions: string[] = []

      if (user.counts.friendsAdded > 0) {
        actions.push(`adicionou ${user.counts.friendsAdded} novo(s) amigo(s)`)
      }
      if (user.counts.badgesEarned > 0) {
        actions.push(`conquistou ${user.counts.badgesEarned} novo(s) emblema(s)`)
      }
      if (user.counts.photosPosted > 0) {
        actions.push(`postou ${user.counts.photosPosted} nova(s) foto(s)`)
      }
      if (user.counts.avatarChanged > 0) {
        actions.push('mudou o visual')
      }
      if (user.counts.mottoChanged > 0) {
        actions.push('atualizou a missão')
      }

      const description = actions.length > 0 ? actions.join(', ') : 'esteve ativo no hotel'

      const profileRaw = user.profile || null
      const profile = profileRaw ? {
        figureString: profileRaw.figureString,
        motto: profileRaw.motto,
        online: !!profileRaw.online
      } : null

      return {
        username: user.username,
        description,
        lastUpdate: user.lastUpdate,
        counts: {
          friends: user.counts.friendsAdded || 0,
          badges: user.counts.badgesEarned || 0,
          photos: user.counts.photosPosted || 0,
          avatarChanged: (user.counts.avatarChanged || 0) > 0,
        },
        profile,
        friends: user.friends || [],
        badges: user.badges || [],
        photos: user.photos || [],
        activities: user.activities || [],
      }
    })

    // Optional: filter to only online users
    if (onlyOnline) {
      aggregatedActivities = aggregatedActivities.filter((u: any) => u?.profile?.online)
    }

    // Sort by last update
    aggregatedActivities.sort((a: any, b: any) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())

    console.log(`✅ [feed] Returning ${aggregatedActivities.length} activities (database), ${onlineCount || 0} online (onlyOnline=${onlyOnline})`)

    return new Response(
      JSON.stringify({
        activities: aggregatedActivities,
        meta: {
          source: 'database',
          timestamp: new Date().toISOString(),
          count: aggregatedActivities.length,
          onlineCount: onlineCount || 0
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error(`❌ [feed] Error: ${error.message}`)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
