
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

    const { habbo_name, hotel } = await req.json()
    console.log(`🔄 [habbo-sync-user] Syncing user: ${habbo_name} (${hotel})`)

    // Use the correct domain format
    const domain = hotel === 'br' ? 'www.habbo.com.br' : `www.habbo.${hotel}`
    const apiUrl = `https://${domain}/api/public/users?name=${encodeURIComponent(habbo_name)}`
    
    console.log(`🌐 [habbo-sync-user] Fetching from: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HabboHub/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const userData = await response.json()
    
    if (!userData || !userData.uniqueId) {
      throw new Error(`User not found: ${habbo_name}`)
    }

    // Get existing user data from snapshots to detect changes
    const { data: existingSnapshot } = await supabase
      .from('habbo_user_snapshots')
      .select('*')
      .eq('habbo_name', habbo_name)
      .eq('hotel', hotel)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Calculate what's new/changed
    const details: any = {}
    let hasChanges = false

    if (existingSnapshot?.raw_data) {
      const oldData = existingSnapshot.raw_data
      
      // Detect new friends
      const oldFriends = oldData.friends || []
      const newFriends = userData.friends || []
      const addedFriends = newFriends.filter((friend: any) => 
        !oldFriends.some((old: any) => old.uniqueId === friend.uniqueId)
      )
      if (addedFriends.length > 0) {
        details.new_friends = addedFriends
        hasChanges = true
      }

      // Detect new badges
      const oldBadges = oldData.selectedBadges || []
      const newBadges = userData.selectedBadges || []
      const addedBadges = newBadges.filter((badge: any) => 
        !oldBadges.some((old: any) => old.code === badge.code)
      )
      if (addedBadges.length > 0) {
        details.new_badges = addedBadges
        hasChanges = true
      }

      // Detect avatar change
      if (oldData.figureString !== userData.figureString) {
        details.avatar_changed = true
        details.old_figure = oldData.figureString
        details.new_figure = userData.figureString
        hasChanges = true
      }

      // Detect motto change
      if (oldData.motto !== userData.motto) {
        details.motto_changed = true
        details.old_motto = oldData.motto
        details.new_motto = userData.motto
        hasChanges = true
      }
    } else {
      // First time tracking this user
      hasChanges = true
      details.first_time_tracking = true
    }

    // Create new snapshot
    const { error: snapshotError } = await supabase
      .from('habbo_user_snapshots')
      .insert({
        habbo_name,
        habbo_id: userData.uniqueId,
        hotel,
        figure_string: userData.figureString,
        motto: userData.motto,
        is_online: userData.online || false,
        member_since: userData.memberSince ? new Date(userData.memberSince).toISOString() : null,
        last_web_visit: userData.lastWebVisit ? new Date(userData.lastWebVisit).toISOString() : null,
        friends_count: userData.friends?.length || 0,
        badges_count: userData.selectedBadges?.length || 0,
        photos_count: 0, // Will be updated by photo sync
        groups_count: userData.groups?.length || 0,
        raw_data: userData
      })

    if (snapshotError) {
      console.warn(`⚠️ [habbo-sync-user] Failed to create snapshot: ${snapshotError.message}`)
    }

    // Create activity record if there are meaningful changes
    if (hasChanges && !details.first_time_tracking) {
      const { error: activityError } = await supabase
        .from('habbo_activities')
        .insert({
          habbo_name,
          habbo_id: userData.uniqueId,
          hotel,
          activity_type: 'profile_update',
          description: generateActivityDescription(details),
          details,
          created_at: new Date().toISOString()
        })

      if (activityError) {
        console.warn(`⚠️ [habbo-sync-user] Failed to create activity: ${activityError.message}`)
      }
    }

    console.log(`✅ [habbo-sync-user] Successfully synced ${habbo_name} (changes: ${hasChanges})`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        hasChanges,
        details: hasChanges ? details : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error(`❌ [habbo-sync-user] Error: ${error.message}`)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

function generateActivityDescription(details: any): string {
  const actions = []
  
  if (details.new_friends?.length > 0) {
    actions.push(`adicionou ${details.new_friends.length} novo(s) amigo(s)`)
  }
  
  if (details.new_badges?.length > 0) {
    actions.push(`conquistou ${details.new_badges.length} novo(s) emblema(s)`)
  }
  
  if (details.avatar_changed) {
    actions.push('mudou o visual')
  }
  
  if (details.motto_changed) {
    actions.push('atualizou a missão')
  }
  
  return actions.length > 0 ? actions.join(', ') : 'atualizou o perfil'
}
