import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BatchProcessorRequest {
  mode?: 'process_queue' | 'populate_queue' | 'stats';
  user_habbo_name?: string;
  user_habbo_id?: string;
  hotel?: string;
  batch_size?: number;
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

    const { 
      mode = 'process_queue', 
      user_habbo_name, 
      user_habbo_id, 
      hotel = 'br',
      batch_size = 50 
    }: BatchProcessorRequest = await req.json().catch(() => ({}));

    console.log(`🚀 [BatchFriendsProcessor] Starting with mode: ${mode}`);

    if (mode === 'stats') {
      // Return queue statistics
      const { data: queueStats } = await supabase
        .from('friends_processing_queue')
        .select('status, count(*)')
        .groupBy('status');

      const { data: recentActivities } = await supabase
        .from('friends_activities')
        .select('count(*)')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      return new Response(
        JSON.stringify({
          success: true,
          queue_stats: queueStats,
          recent_activities_count: recentActivities?.[0]?.count || 0,
          timestamp: new Date().toISOString()
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (mode === 'populate_queue' && user_habbo_name && user_habbo_id) {
      console.log(`📥 [BatchProcessor] Populating queue for user ${user_habbo_name}`);

      // Get user's friends from Habbo API
      const friendsResponse = await fetch(`https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/api/public/users/${user_habbo_id}/friends`);
      if (!friendsResponse.ok) {
        throw new Error(`Failed to get friends for ${user_habbo_name}`);
      }

      const friends = await friendsResponse.json();
      console.log(`📊 [BatchProcessor] Found ${friends.length} friends for ${user_habbo_name}`);

      // Insert friends into processing queue
      const queueItems = friends.map((friend: any) => ({
        user_habbo_name,
        user_habbo_id,
        hotel,
        friend_habbo_name: friend.name,
        friend_habbo_id: friend.uniqueId,
        priority: Math.floor(Math.random() * 100), // Random priority for load distribution
      }));

      // Insert in batches to avoid overwhelming the database
      const BATCH_INSERT_SIZE = 100;
      let insertedCount = 0;

      for (let i = 0; i < queueItems.length; i += BATCH_INSERT_SIZE) {
        const batch = queueItems.slice(i, i + BATCH_INSERT_SIZE);
        const { error } = await supabase
          .from('friends_processing_queue')
          .upsert(batch, {
            onConflict: 'user_habbo_name,friend_habbo_name',
            ignoreDuplicates: true
          });

        if (!error) {
          insertedCount += batch.length;
        } else {
          console.warn(`⚠️ [BatchProcessor] Error inserting batch:`, error);
        }
      }

      console.log(`✅ [BatchProcessor] Added ${insertedCount} friends to processing queue`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Added ${insertedCount} friends to processing queue`,
          user: user_habbo_name,
          total_friends: friends.length
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (mode === 'process_queue') {
      console.log(`⚙️ [BatchProcessor] Processing queue with batch size: ${batch_size}`);

      // Get next batch from queue
      const { data: queueBatch, error: queueError } = await supabase.rpc(
        'get_next_queue_batch',
        { p_batch_size: batch_size }
      );

      if (queueError || !queueBatch || queueBatch.length === 0) {
        console.log(`ℹ️ [BatchProcessor] No items in queue to process`);
        return new Response(
          JSON.stringify({
            success: true,
            message: 'No items in queue to process',
            processed: 0
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`🔄 [BatchProcessor] Processing ${queueBatch.length} queue items`);

      const detectedActivities = [];
      const PROCESSING_DELAY = 150; // ms between API calls

      for (const item of queueBatch) {
        try {
          console.log(`🔍 [BatchProcessor] Processing friend: ${item.friend_habbo_name}`);

          // Get current profile
          const currentProfileResponse = await fetch(
            `https://www.habbo.${item.hotel === 'br' ? 'com.br' : item.hotel}/api/public/users?name=${item.friend_habbo_name}`
          );

          if (!currentProfileResponse.ok) {
            console.warn(`⚠️ [BatchProcessor] Failed to get profile for ${item.friend_habbo_name}`);
            await supabase.rpc('mark_queue_item_failed', {
              p_id: item.id,
              p_error_message: `Failed to fetch profile: ${currentProfileResponse.status}`
            });
            continue;
          }

          const currentProfile = await currentProfileResponse.json();
          if (!currentProfile) {
            console.warn(`⚠️ [BatchProcessor] Empty profile for ${item.friend_habbo_name}`);
            await supabase.rpc('mark_queue_item_failed', {
              p_id: item.id,
              p_error_message: 'Empty profile response'
            });
            continue;
          }

          // Get last known snapshot
          const { data: lastSnapshot } = await supabase
            .from('profile_snapshots')
            .select('*')
            .eq('habbo_name', item.friend_habbo_name)
            .eq('hotel', item.hotel)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // If no previous snapshot, create one and continue
          if (!lastSnapshot) {
            const { error: snapshotError } = await supabase
              .from('profile_snapshots')
              .insert({
                habbo_name: item.friend_habbo_name,
                habbo_id: item.friend_habbo_id,
                hotel: item.hotel,
                figure_string: currentProfile.figureString,
                motto: currentProfile.motto,
                friends_count: 0,
                groups_count: 0,
                badges: currentProfile.selectedBadges || [],
                raw_profile_data: currentProfile
              });

            if (!snapshotError) {
              console.log(`📷 [BatchProcessor] Created snapshot for ${item.friend_habbo_name}`);
            }

            // Mark as completed
            await supabase.rpc('mark_queue_item_completed', { p_id: item.id });
            continue;
          }

          const lastProfile = lastSnapshot.raw_profile_data;
          const friendActivities = [];

          // Detect changes
          if (lastProfile.motto !== currentProfile.motto) {
            friendActivities.push({
              habbo_name: item.friend_habbo_name,
              habbo_id: item.friend_habbo_id,
              hotel: item.hotel,
              activity_type: 'motto_change',
              activity_description: `mudou seu motto para "${currentProfile.motto}"`,
              old_data: { motto: lastProfile.motto },
              new_data: { motto: currentProfile.motto }
            });
          }

          if (lastProfile.figureString !== currentProfile.figureString) {
            friendActivities.push({
              habbo_name: item.friend_habbo_name,
              habbo_id: item.friend_habbo_id,
              hotel: item.hotel,
              activity_type: 'look_change',
              activity_description: `mudou seu visual`,
              old_data: { figureString: lastProfile.figureString },
              new_data: { figureString: currentProfile.figureString, new_figure: currentProfile.figureString }
            });
          }

          // Check for new badges
          const oldBadges = lastProfile.selectedBadges || [];
          const newBadges = currentProfile.selectedBadges || [];
          
          const addedBadges = newBadges.filter((badge: any) => 
            !oldBadges.some((oldBadge: any) => oldBadge.code === badge.code)
          );

          for (const badge of addedBadges) {
            friendActivities.push({
              habbo_name: item.friend_habbo_name,
              habbo_id: item.friend_habbo_id,
              hotel: item.hotel,
              activity_type: 'badge',
              activity_description: `conquistou o emblema "${badge.name || badge.code}"`,
              old_data: null,
              new_data: { 
                badge, 
                badge_code: badge.code, 
                badge_name: badge.name 
              }
            });
          }

          // Check online status change
          if (lastProfile.online !== currentProfile.online && currentProfile.online) {
            friendActivities.push({
              habbo_name: item.friend_habbo_name,
              habbo_id: item.friend_habbo_id,
              hotel: item.hotel,
              activity_type: 'status_change',
              activity_description: `está online agora`,
              old_data: { online: lastProfile.online },
              new_data: { online: currentProfile.online }
            });
          }

          // Save detected activities
          if (friendActivities.length > 0) {
            const { error: insertError } = await supabase
              .from('friends_activities')
              .insert(friendActivities);

            if (!insertError) {
              detectedActivities.push(...friendActivities);
              console.log(`✅ [BatchProcessor] Detected ${friendActivities.length} activities for ${item.friend_habbo_name}`);
            }
          }

          // Update snapshot
          await supabase
            .from('profile_snapshots')
            .update({
              figure_string: currentProfile.figureString,
              motto: currentProfile.motto,
              badges: currentProfile.selectedBadges || [],
              raw_profile_data: currentProfile,
              snapshot_date: new Date().toISOString()
            })
            .eq('id', lastSnapshot.id);

          // Mark as completed
          await supabase.rpc('mark_queue_item_completed', { p_id: item.id });

        } catch (error) {
          console.error(`❌ [BatchProcessor] Error processing ${item.friend_habbo_name}:`, error);
          await supabase.rpc('mark_queue_item_failed', {
            p_id: item.id,
            p_error_message: error.message
          });
        }

        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, PROCESSING_DELAY));
      }

      console.log(`🎯 [BatchProcessor] Completed batch processing. Detected ${detectedActivities.length} total activities`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Processed ${queueBatch.length} friends`,
          processed: queueBatch.length,
          activities_detected: detectedActivities.length,
          activities: detectedActivities.slice(0, 5) // Return first 5 as sample
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid mode' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[BatchFriendsProcessor] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});