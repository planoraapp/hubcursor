import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HabboProfile {
  habbo_id: string;
  habbo_name: string;
  hotel: string;
  motto?: string;
  figure_string?: string;
  badges: any[];
  friends: any[];
  groups: any[];
  rooms: any[];
  photos: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[DAILY TRACKER] Starting daily activities tracking');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_habbo_name, user_habbo_id, hotel = 'br' } = await req.json();

    if (!user_habbo_name || !user_habbo_id) {
      throw new Error('Missing required parameters: user_habbo_name, user_habbo_id');
    }

    console.log(`[DAILY TRACKER] Processing ${user_habbo_name} (${user_habbo_id})`);

    // Get user's friends to track their activities
    const friendsResponse = await fetch(`https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/api/public/users/${user_habbo_id}/friends`);
    
    if (!friendsResponse.ok) {
      console.log(`[DAILY TRACKER] Could not fetch friends for ${user_habbo_name}`);
      return new Response(JSON.stringify({ success: false, error: 'Could not fetch friends' }), { headers: corsHeaders });
    }

    const friends = await friendsResponse.json();
    console.log(`[DAILY TRACKER] Found ${friends.length} friends to track`);

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    let processedCount = 0;
    let activitiesDetected = 0;

    // Process friends in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < friends.length; i += batchSize) {
      const batch = friends.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (friend: any) => {
        try {
          const friendId = friend.habbo_id || friend.id;
          const friendName = friend.habbo_name || friend.name;
          
          console.log(`[DAILY TRACKER] Processing friend: ${friendName}`);
          
          // Get current profile snapshot
          const profileResponse = await fetch(`https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/api/public/users/${friendId}`);
          if (!profileResponse.ok) return 0;
          
          const profile = await profileResponse.json();
          
          // Get additional data in parallel
          const [badgesRes, groupsRes, roomsRes, photosRes] = await Promise.allSettled([
            fetch(`https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/api/public/users/${friendId}/badges`),
            fetch(`https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/api/public/users/${friendId}/groups`),
            fetch(`https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/api/public/users/${friendId}/rooms`),
            fetch(`https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/api/public/users/${friendId}/photos`)
          ]);

          const currentData: HabboProfile = {
            habbo_id: friendId,
            habbo_name: friendName,
            hotel: hotel,
            motto: profile.motto,
            figure_string: profile.figureString,
            badges: badgesRes.status === 'fulfilled' && badgesRes.value.ok ? await badgesRes.value.json() : [],
            friends: [], // We don't track friends of friends for performance
            groups: groupsRes.status === 'fulfilled' && groupsRes.value.ok ? await groupsRes.value.json() : [],
            rooms: roomsRes.status === 'fulfilled' && roomsRes.value.ok ? await roomsRes.value.json() : [],
            photos: photosRes.status === 'fulfilled' && photosRes.value.ok ? await photosRes.value.json() : []
          };

          // Get previous day's data to compare
          const { data: previousActivity } = await supabase
            .from('daily_friend_activities')
            .select('*')
            .eq('user_habbo_id', friendId)
            .eq('activity_date', today)
            .single();

          let changesDetected = 0;
          const newBadges: string[] = [];
          const newGroups: any[] = [];
          const newRooms: any[] = [];
          const newPhotos: any[] = [];
          let mottoChanged: string | null = null;
          let figureChanged: any = null;

          // Compare with previous data if exists
          if (previousActivity) {
            const prevData = previousActivity.activities_summary as any;
            
            // Compare badges
            const prevBadges = prevData.badges || [];
            const currentBadges = currentData.badges.map((b: any) => b.code);
            newBadges.push(...currentBadges.filter((badge: string) => !prevBadges.includes(badge)));
            
            // Compare groups
            const prevGroups = prevData.groups || [];
            const prevGroupIds = prevGroups.map((g: any) => g.id);
            newGroups.push(...currentData.groups.filter((g: any) => !prevGroupIds.includes(g.id)));
            
            // Compare rooms
            const prevRooms = prevData.rooms || [];
            const prevRoomIds = prevRooms.map((r: any) => r.id);
            newRooms.push(...currentData.rooms.filter((r: any) => !prevRoomIds.includes(r.id)));
            
            // Compare photos (last 24 hours only)
            const yesterday = Date.now() - 24 * 60 * 60 * 1000;
            const recentPhotos = currentData.photos.filter((p: any) => {
              const photoTime = p.takenOn ? new Date(p.takenOn).getTime() : 0;
              return photoTime > yesterday;
            });
            newPhotos.push(...recentPhotos);
            
            // Check motto change
            if (prevData.motto !== currentData.motto) {
              mottoChanged = currentData.motto || '';
            }
            
            // Check figure change
            if (prevData.figure_string !== currentData.figure_string) {
              figureChanged = { 
                old: prevData.figure_string, 
                new: currentData.figure_string 
              };
            }
            
            changesDetected = newBadges.length + newGroups.length + newRooms.length + 
                            newPhotos.length + (mottoChanged ? 1 : 0) + (figureChanged ? 1 : 0);
            
            // Update existing record
            if (changesDetected > 0) {
              const { error } = await supabase
                .from('daily_friend_activities')
                .update({
                  activities_summary: currentData,
                  badges_gained: [...(previousActivity.badges_gained || []), ...newBadges],
                  groups_joined: [...(previousActivity.groups_joined || []), ...newGroups],
                  rooms_created: [...(previousActivity.rooms_created || []), ...newRooms],
                  photos_posted: [...(previousActivity.photos_posted || []), ...newPhotos],
                  motto_changed: mottoChanged || previousActivity.motto_changed,
                  figure_changes: figureChanged || previousActivity.figure_changes,
                  last_updated: new Date().toISOString(),
                  total_changes: (previousActivity.total_changes || 0) + changesDetected
                })
                .eq('user_habbo_id', friendId)
                .eq('activity_date', today);
                
              if (error) {
                console.error(`[DAILY TRACKER] Update error for ${friendName}:`, error);
              }
            }
          } else {
            // Create new record for today
            const { error } = await supabase
              .from('daily_friend_activities')
              .insert({
                user_habbo_id: friendId,
                user_habbo_name: friendName,
                hotel: hotel,
                activity_date: today,
                activities_summary: currentData,
                badges_gained: currentData.badges.map((b: any) => b.code),
                groups_joined: currentData.groups,
                rooms_created: currentData.rooms,
                photos_posted: currentData.photos.filter((p: any) => {
                  const photoTime = p.takenOn ? new Date(p.takenOn).getTime() : 0;
                  const yesterday = Date.now() - 24 * 60 * 60 * 1000;
                  return photoTime > yesterday;
                }),
                motto_changed: currentData.motto,
                figure_changes: currentData.figure_string ? { new: currentData.figure_string } : null,
                total_changes: 1,
                session_start: new Date().toISOString(),
                last_updated: new Date().toISOString()
              });
              
            if (error) {
              console.error(`[DAILY TRACKER] Insert error for ${friendName}:`, error);
            } else {
              changesDetected = 1; // New profile tracked
            }
          }
          
          return changesDetected;
        } catch (error) {
          console.error(`[DAILY TRACKER] Error processing friend:`, error);
          return 0;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const batchActivities = batchResults.reduce((sum, changes) => sum + changes, 0);
      
      processedCount += batch.length;
      activitiesDetected += batchActivities;
      
      console.log(`[DAILY TRACKER] Batch ${Math.floor(i / batchSize) + 1}: processed ${batch.length}, detected ${batchActivities} activities`);
      
      // Small delay between batches to be respectful to Habbo API
      if (i + batchSize < friends.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Cleanup old activities (older than 7 days)
    await supabase.rpc('cleanup_old_daily_activities');

    console.log(`[DAILY TRACKER] Completed: ${processedCount} friends processed, ${activitiesDetected} activities detected`);

    return new Response(JSON.stringify({
      success: true,
      processed: processedCount,
      activities_detected: activitiesDetected,
      timestamp: new Date().toISOString()
    }), { headers: corsHeaders });

  } catch (error) {
    console.error('[DAILY TRACKER] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});