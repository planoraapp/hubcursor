
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface FeedActivity {
  username: string;
  lastUpdate: string;
  counts: {
    groups: number;
    friends: number;
    badges: number;
    avatarChanged: boolean;
    mottoChanged: boolean;
  };
  groups: Array<{ name: string; badgeCode: string }>;
  friends: Array<{ name: string; figureString?: string }>;
  badges: Array<{ code: string; name?: string }>;
  photos: Array<{ url: string; caption?: string; id?: string }>;
  description: string;
  profile: {
    figureString?: string;
    motto?: string;
    isOnline?: boolean;
    memberSince?: string;
    lastWebVisit?: string;
    groupsCount?: number;
    friendsCount?: number;
    badgesCount?: number;
    photosCount?: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      'https://wueccgeizznjmjgmuscy.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const url = new URL(req.url);
    const hotel = url.searchParams.get('hotel') || 'com.br';
    const username = url.searchParams.get('username');
    const limit = parseInt(url.searchParams.get('limit') || '100'); // Increased default limit
    const onlineWithinSecondsParam = url.searchParams.get('onlineWithinSeconds');
    const onlineWithinSeconds = onlineWithinSecondsParam ? parseInt(onlineWithinSecondsParam) : 1800; // Default 30 minutes

    console.log(`🎯 [habbo-feed] Fetching feed for hotel: ${hotel}${username ? `, user: ${username}` : ''}, window: ${Math.floor(onlineWithinSeconds / 60)}min, limit: ${limit}`);

    // Get snapshots from the last window (default 30 minutes, expandable)
    const cutoffTime = new Date(Date.now() - onlineWithinSeconds * 1000).toISOString();
    
    let snapshotsQuery = supabase
      .from('habbo_user_snapshots')
      .select('*')
      .eq('hotel', hotel)
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false });

    if (username) {
      snapshotsQuery = snapshotsQuery.ilike('habbo_name', username);
    }

    const { data: snapshots, error: snapshotsError } = await snapshotsQuery.limit(limit * 5); // Increased snapshot limit

    if (snapshotsError) {
      throw new Error(`Failed to fetch snapshots: ${snapshotsError.message}`);
    }

    console.log(`📊 [habbo-feed] Found ${snapshots?.length || 0} snapshots in ${Math.floor(onlineWithinSeconds / 60)}min window`);

    // Get recent activities for context (increased limit)
    const { data: activities } = await supabase
      .from('habbo_activities')
      .select('*')
      .eq('hotel', hotel)
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false })
      .limit(500); // Increased activity limit

    // Create user snapshots map with latest data per user
    const userSnapshotMap: { [username: string]: any } = {};
    snapshots?.forEach(snapshot => {
      if (!userSnapshotMap[snapshot.habbo_name] || 
          new Date(snapshot.created_at) > new Date(userSnapshotMap[snapshot.habbo_name].created_at)) {
        userSnapshotMap[snapshot.habbo_name] = snapshot;
      }
    });

    // Group activities by user
    const userActivitiesMap: { [username: string]: any[] } = {};
    activities?.forEach(activity => {
      if (!userActivitiesMap[activity.habbo_name]) {
        userActivitiesMap[activity.habbo_name] = [];
      }
      userActivitiesMap[activity.habbo_name].push(activity);
    });

    // Format for display - show all users with any data, not just online ones
    const feedActivities: FeedActivity[] = Object.entries(userSnapshotMap)
      .map(([username, latestSnapshot]) => {
        const userActivities = userActivitiesMap[username] || [];
        const counts = {
          groups: 0,
          friends: 0,
          badges: 0,
          avatarChanged: false,
          mottoChanged: false
        };

        const groups: Array<{ name: string; badgeCode: string }> = [];
        const friends: Array<{ name: string; figureString?: string }> = [];
        const badges: Array<{ code: string; name?: string }> = [];
        const photos: Array<{ url: string; caption?: string; id?: string }> = [];

        // Extract data from latest snapshot's raw_data
        const rawData = latestSnapshot?.raw_data;
        if (rawData) {
          // Extract groups
          if (rawData.groups && Array.isArray(rawData.groups)) {
            const snapshotGroups = rawData.groups.slice(0, 3).map((group: any) => ({
              name: group.name || 'Grupo',
              badgeCode: group.badgeCode || 'GRP001'
            }));
            groups.push(...snapshotGroups);
            counts.groups = rawData.groups.length;
          }

          // Extract friends
          if (rawData.friends && Array.isArray(rawData.friends)) {
            const snapshotFriends = rawData.friends.slice(0, 5).map((friend: any) => ({
              name: friend.name || friend.habboName || 'Amigo',
              figureString: friend.figureString
            }));
            friends.push(...snapshotFriends);
            counts.friends = rawData.friends.length;
          }

          // Extract badges
          if (rawData.selectedBadges && Array.isArray(rawData.selectedBadges)) {
            const snapshotBadges = rawData.selectedBadges.slice(0, 5).map((badge: any) => ({
              code: badge.code || badge.badgeCode || 'BAD001',
              name: badge.name || badge.description || badge.code
            }));
            badges.push(...snapshotBadges);
            counts.badges = rawData.selectedBadges.length;
          }

          // Extract photos
          if (rawData.photos && Array.isArray(rawData.photos)) {
            const snapshotPhotos = rawData.photos.slice(0, 6).map((photo: any) => ({
              url: photo.url || `https://www.habbo.com.br/habbo-imaging/badge/${photo.id}.gif`,
              caption: photo.caption || '',
              id: photo.id
            }));
            photos.push(...snapshotPhotos);
          }
        }

        // Process recent activities for additional counts
        userActivities.forEach(activity => {
          switch (activity.activity_type) {
            case 'new_group':
              counts.groups += activity.details?.groups_added || 1;
              if (activity.details?.new_groups) {
                groups.push(...activity.details.new_groups.slice(0, 3));
              }
              break;
            case 'new_friend':
              counts.friends += activity.details?.friends_added || 1;
              if (activity.details?.new_friends) {
                friends.push(...activity.details.new_friends.slice(0, 5));
              }
              break;
            case 'new_badge':
              counts.badges += activity.details?.badges_added || 1;
              if (activity.details?.new_badges) {
                badges.push(...activity.details.new_badges.slice(0, 5));
              }
              break;
            case 'avatar_update':
              counts.avatarChanged = true;
              break;
            case 'motto_change':
              counts.mottoChanged = true;
              break;
          }
        });

        // Build description
        const activityParts = [];
        const hasRecentActivity = userActivities.length > 0;
        
        if (hasRecentActivity) {
          if (counts.groups > 0) activityParts.push(`${counts.groups} novo(s) grupo(s)`);
          if (counts.friends > 0) activityParts.push(`${counts.friends} novo(s) amigo(s)`);
          if (counts.badges > 0) {
            const badgeText = counts.badges > 5 ? 'mais de 5 novo(s) emblema(s)' : `${counts.badges} novo(s) emblema(s)`;
            activityParts.push(badgeText);
          }
          if (counts.avatarChanged) activityParts.push('mudou seu visual');
          if (counts.mottoChanged) activityParts.push('mudou o lema');
        }

        let description = 'atividade recente';
        if (activityParts.length > 0) {
          description = `adicionou ${activityParts.join(', ')}.`;
        } else if (latestSnapshot) {
          const profileParts = [];
          if (latestSnapshot.groups_count > 0) profileParts.push(`${latestSnapshot.groups_count} grupos`);
          if (latestSnapshot.friends_count > 0) profileParts.push(`${latestSnapshot.friends_count} amigos`);
          if (latestSnapshot.badges_count > 0) profileParts.push(`${latestSnapshot.badges_count} emblemas`);
          
          if (profileParts.length > 0) {
            description = `possui ${profileParts.join(', ')}.`;
          }
          
          if (latestSnapshot.is_online) {
            description = `está online! ${description}`;
          }
        }

        return {
          username,
          lastUpdate: userActivities[0]?.created_at || latestSnapshot?.created_at || new Date().toISOString(),
          counts,
          groups: groups.slice(0, 3),
          friends: friends.slice(0, 5),
          badges: badges.slice(0, 5),
          photos: photos.slice(0, 6),
          description,
          profile: {
            figureString: latestSnapshot?.figure_string,
            motto: latestSnapshot?.motto,
            isOnline: latestSnapshot?.is_online || false,
            memberSince: latestSnapshot?.member_since,
            lastWebVisit: latestSnapshot?.last_web_visit,
            groupsCount: latestSnapshot?.groups_count || groups.length,
            friendsCount: latestSnapshot?.friends_count || friends.length,
            badgesCount: latestSnapshot?.badges_count || badges.length,
            photosCount: latestSnapshot?.photos_count || photos.length
          }
        };
      })
      // More relaxed filtering - show users with recent snapshots or activities
      .filter(activity => {
        const hasRecentSnapshot = new Date(activity.lastUpdate) > new Date(Date.now() - onlineWithinSeconds * 1000);
        const hasProfileData = activity.profile.figureString || activity.counts.groups > 0 || activity.counts.friends > 0 || activity.counts.badges > 0;
        
        return hasRecentSnapshot || hasProfileData;
      })
      .sort((a, b) => {
        // Sort by online status first, then by last update
        if (a.profile.isOnline && !b.profile.isOnline) return -1;
        if (!a.profile.isOnline && b.profile.isOnline) return 1;
        return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
      })
      .slice(0, limit);

    console.log(`✅ [habbo-feed] Returning ${feedActivities.length} activities (${feedActivities.filter(a => a.profile.isOnline).length} online users)`);

    return new Response(
      JSON.stringify({
        success: true,
        hotel,
        activities: feedActivities,
        meta: {
          source: 'live',
          timestamp: new Date().toISOString(),
          count: feedActivities.length,
          onlineCount: feedActivities.filter(a => a.profile.isOnline).length,
          filter: { onlineWithinSeconds }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ [habbo-feed] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
