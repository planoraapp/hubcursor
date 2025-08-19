import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FriendActivity {
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  activity_type: string;
  activity_description: string;
  old_data?: any;
  new_data: any;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { username, hotel = 'br' } = await req.json();
    
    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 [FriendsActivityTracker] Tracking activities for ${username} on ${hotel}`);

    // Get user's friends
    const friendsResponse = await fetch(`https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/api/public/users?name=${username}`);
    if (!friendsResponse.ok) {
      throw new Error(`Failed to get user profile: ${friendsResponse.status}`);
    }

    const userProfile = await friendsResponse.json();
    if (!userProfile) {
      throw new Error('User not found');
    }

    // Get friends list
    const friendsListResponse = await fetch(`https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/api/public/users/${userProfile.uniqueId}/friends`);
    if (!friendsListResponse.ok) {
      console.warn(`Could not get friends for ${username}`);
      return new Response(
        JSON.stringify([]),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const friends = await friendsListResponse.json();
    console.log(`📊 [FriendsActivityTracker] Found ${friends.length} friends for ${username}`);

    const detectedActivities: FriendActivity[] = [];

    // Process each friend to detect activity changes
    for (const friend of friends.slice(0, 20)) { // Limit to avoid rate limits
      try {
        // Get current profile
        const currentProfileResponse = await fetch(`https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/api/public/users?name=${friend.name}`);
        if (!currentProfileResponse.ok) continue;

        const currentProfile = await currentProfileResponse.json();
        if (!currentProfile) continue;

        // Get last known snapshot from profile_snapshots
        const { data: lastSnapshot } = await supabase
          .from('profile_snapshots')
          .select('*')
          .eq('habbo_name', friend.name)
          .eq('hotel', hotel)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // If no previous snapshot, create one and continue
        if (!lastSnapshot) {
          // Create snapshot
          const { error: snapshotError } = await supabase
            .from('profile_snapshots')
            .insert({
              habbo_name: friend.name,
              habbo_id: friend.uniqueId,
              hotel,
              figure_string: currentProfile.figureString,
              motto: currentProfile.motto,
              friends_count: 0, // We don't track this in real-time
              groups_count: 0,
              badges: currentProfile.selectedBadges || [],
              raw_profile_data: currentProfile
            });
          
          if (snapshotError) {
            console.warn(`Error creating snapshot for ${friend.name}:`, snapshotError.message);
          } else {
            console.log(`📷 [FriendsActivityTracker] Created snapshot for ${friend.name}`);
          }
          
          continue;
        }

        const lastProfile = lastSnapshot.raw_profile_data;

        // Check for motto changes
        if (lastProfile.motto !== currentProfile.motto) {
          detectedActivities.push({
            habbo_name: friend.name,
            habbo_id: friend.uniqueId,
            hotel,
            activity_type: 'motto_change',
            activity_description: `mudou seu motto para "${currentProfile.motto}"`,
            old_data: { motto: lastProfile.motto },
            new_data: { motto: currentProfile.motto }
          });
        }

        // Check for figure/look changes
        if (lastProfile.figureString !== currentProfile.figureString) {
          detectedActivities.push({
            habbo_name: friend.name,
            habbo_id: friend.uniqueId,
            hotel,
            activity_type: 'look_change',
            activity_description: `mudou seu visual`,
            old_data: { figureString: lastProfile.figureString },
            new_data: { figureString: currentProfile.figureString }
          });
        }

        // Check for new badges
        const oldBadges = lastProfile.selectedBadges || [];
        const newBadges = currentProfile.selectedBadges || [];
        
        const addedBadges = newBadges.filter((badge: any) => 
          !oldBadges.some((oldBadge: any) => oldBadge.code === badge.code)
        );

        for (const badge of addedBadges) {
          detectedActivities.push({
            habbo_name: friend.name,
            habbo_id: friend.uniqueId,
            hotel,
            activity_type: 'badge',
            activity_description: `conquistou o emblema "${badge.name || badge.code}"`,
            old_data: null,
            new_data: { badge }
          });
        }

        // Check online status change
        if (lastProfile.online !== currentProfile.online && currentProfile.online) {
          detectedActivities.push({
            habbo_name: friend.name,
            habbo_id: friend.uniqueId,
            hotel,
            activity_type: 'status_change',
            activity_description: `está online agora`,
            old_data: { online: lastProfile.online },
            new_data: { online: currentProfile.online }
          });
        }

        // Update snapshot
        const { error: updateError } = await supabase
          .from('profile_snapshots')
          .update({
            figure_string: currentProfile.figureString,
            motto: currentProfile.motto,
            badges: currentProfile.selectedBadges || [],
            raw_profile_data: currentProfile,
            snapshot_date: new Date().toISOString()
          })
          .eq('id', lastSnapshot.id);

        if (updateError) {
          console.warn(`Error updating snapshot for ${friend.name}:`, updateError.message);
        }

      } catch (error) {
        console.warn(`Error processing friend ${friend.name}:`, error.message);
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Save detected activities
    if (detectedActivities.length > 0) {
      const { error: insertError } = await supabase
        .from('friends_activities')
        .insert(detectedActivities);

      if (insertError) {
        console.error('Error saving activities:', insertError);
      } else {
        console.log(`✅ [FriendsActivityTracker] Saved ${detectedActivities.length} new activities`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        activitiesDetected: detectedActivities.length,
        message: `Processed ${friends.length} friends, found ${detectedActivities.length} new activities`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[FriendsActivityTracker] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});