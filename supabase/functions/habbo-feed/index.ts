
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { hotel, limit = 50, onlineWithinSeconds = 3600, mode = 'hybrid' } = await req.json()
    console.log(`🎯 [feed] Feed request: ${mode} mode for ${hotel}, limit ${limit}, online within ${onlineWithinSeconds}s`)

    const hotelFilter = hotel === 'com.br' ? 'br' : hotel
    const cutoffTime = new Date(Date.now() - (onlineWithinSeconds * 1000)).toISOString()

    console.log(`📊 [feed] Getting database feed for ${hotel}, online within ${onlineWithinSeconds}s`)

    // Get activities from database
    const { data: activities, error } = await supabase
      .from('habbo_activities')
      .select(`
        *,
        habbo_tracked_users!inner(*)
      `)
      .eq('hotel', hotelFilter)
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    console.log(`📊 [feed] Found ${activities?.length || 0} activities in database`)

    if (!activities || activities.length === 0) {
      console.log(`⚠️ [feed] No activities found in database for ${hotel}`)
      
      if (mode === 'hybrid' || mode === 'database') {
        console.log(`📊 [feed] Database has only 0 activities, trying official ticker`)
        console.log(`🎯 [feed] Trying official ticker for ${hotel}`)
        
        // Try to get from official ticker as fallback
        const tickerResponse = await supabase.functions.invoke('habbo-widgets-proxy', {
          body: { hotel }
        })

        if (tickerResponse.data?.activities?.length > 0) {
          return new Response(
            JSON.stringify({
              activities: tickerResponse.data.activities.slice(0, limit).map((activity: any) => ({
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
                count: tickerResponse.data.activities.length,
                onlineCount: 0
              }
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          )
        }
      }

      console.log(`✅ [feed] Returning 0 activities (database), 0 online`)
      return new Response(
        JSON.stringify({
          activities: [],
          meta: {
            source: 'database',
            timestamp: new Date().toISOString(),
            count: 0,
            onlineCount: 0
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Get online count
    const { count: onlineCount } = await supabase
      .from('habbo_tracked_users')
      .select('*', { count: 'exact', head: true })
      .eq('hotel', hotelFilter)
      .eq('is_online', true)
      .gte('last_seen_at', cutoffTime)

    // Aggregate activities by user
    const userActivities = new Map()

    for (const activity of activities) {
      const username = activity.habbo_name
      
      if (!userActivities.has(username)) {
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
          profile: activity.habbo_tracked_users?.raw_data || null,
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

    // Convert to array and generate descriptions
    const aggregatedActivities = Array.from(userActivities.values()).map(user => {
      const actions = []
      
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
      
      user.description = actions.length > 0 ? actions.join(', ') : 'esteve ativo no hotel'
      
      return user
    })

    // Sort by last update
    aggregatedActivities.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())

    console.log(`✅ [feed] Returning ${aggregatedActivities.length} activities (database), ${onlineCount || 0} online`)

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
