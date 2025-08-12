
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
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const onlineWithinSecondsParam = url.searchParams.get('onlineWithinSeconds');
    const onlineWithinSeconds = onlineWithinSecondsParam ? parseInt(onlineWithinSecondsParam) : undefined;

    console.log(`🎯 [habbo-feed] Fetching feed for hotel: ${hotel}${username ? `, user: ${username}` : ''}`);

    // Build query
    let query = supabase
      .from('habbo_activities')
      .select(`
        *,
        habbo_user_snapshots!inner(*)
      `)
      .eq('hotel', hotel)
      .order('created_at', { ascending: false });

    if (username) {
      query = query.ilike('habbo_name', username);
    }

    const { data: activities, error } = await query.limit(limit * 3); // Get more to aggregate properly

    if (error) {
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }

    console.log(`📊 [habbo-feed] Found ${activities?.length || 0} raw activities`);

    // Get latest snapshots for all tracked users for richer data
    const cutoffIso = onlineWithinSeconds ? new Date(Date.now() - onlineWithinSeconds * 1000).toISOString() : undefined;
    let snapshotsQuery = supabase
      .from('habbo_user_snapshots')
      .select('*')
      .eq('hotel', hotel)
      .order('created_at', { ascending: false });
    if (cutoffIso) {
      snapshotsQuery = snapshotsQuery.gte('created_at', cutoffIso);
    }
    const { data: latestSnapshots } = await snapshotsQuery;

    // Create user snapshots map
    const userSnapshotMap: { [username: string]: any } = {};
    const cutoffDate = cutoffIso ? new Date(cutoffIso) : undefined;
    latestSnapshots?.forEach(snapshot => {
      // When filtering for onlineWithinSeconds, only include users definitely online or with recent web visit
      const passesOnlineFilter = !cutoffDate || (snapshot.is_online === true || (snapshot.last_web_visit && new Date(snapshot.last_web_visit) >= cutoffDate));
      if (passesOnlineFilter && !userSnapshotMap[snapshot.habbo_name]) {
        userSnapshotMap[snapshot.habbo_name] = snapshot;
      }
    });

    // Aggregate activities by user (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivities = activities?.filter(activity => 
      new Date(activity.created_at) >= twentyFourHoursAgo
    ) || [];

    const userGroups: { [username: string]: any[] } = {};
    recentActivities.forEach(activity => {
      if (!userGroups[activity.habbo_name]) {
        userGroups[activity.habbo_name] = [];
      }
      userGroups[activity.habbo_name].push(activity);
    });

    // Include users from snapshots even if they don't have recent activities
    Object.keys(userSnapshotMap).forEach(username => {
      if (!userGroups[username]) {
        userGroups[username] = [];
      }
    });

    // Format for HabboWidgets-style display
    const feedActivities: FeedActivity[] = Object.entries(userGroups)
      .map(([username, userActivities]) => {
        const sortedActivities = userActivities.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        const latestSnapshot = sortedActivities[0]?.habbo_user_snapshots || userSnapshotMap[username];
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

        // Extract data from latest snapshot's raw_data if available
        const rawData = latestSnapshot?.raw_data;
        if (rawData) {
          // Extract groups from raw data
          if (rawData.groups && Array.isArray(rawData.groups)) {
            const snapshotGroups = rawData.groups.slice(0, 3).map((group: any) => ({
              name: group.name || 'Grupo',
              badgeCode: group.badgeCode || 'GRP001'
            }));
            groups.push(...snapshotGroups);
            counts.groups = rawData.groups.length;
          }

          // Extract friends from raw data
          if (rawData.friends && Array.isArray(rawData.friends)) {
            const snapshotFriends = rawData.friends.slice(0, 5).map((friend: any) => ({
              name: friend.name || friend.habboName || 'Amigo',
              figureString: friend.figureString
            }));
            friends.push(...snapshotFriends);
            counts.friends = rawData.friends.length;
          }

          // Extract badges from raw data
          if (rawData.selectedBadges && Array.isArray(rawData.selectedBadges)) {
            const snapshotBadges = rawData.selectedBadges.slice(0, 5).map((badge: any) => ({
              code: badge.code || badge.badgeCode || 'BAD001',
              name: badge.name || badge.description || badge.code
            }));
            badges.push(...snapshotBadges);
            counts.badges = rawData.selectedBadges.length;
          }
        }

        // Process activities to build counts and details
        sortedActivities.forEach(activity => {
          switch (activity.activity_type) {
            case 'new_group':
              counts.groups += activity.details?.groups_added || 1;
              if (activity.details?.new_groups) {
                groups.push(...activity.details.new_groups.slice(0, 5));
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

        // Build HabboWidgets-style description based on available data
        const activityParts = [];
        const hasRecentActivity = sortedActivities.length > 0;
        
        if (hasRecentActivity) {
          if (counts.groups > 0) {
            activityParts.push(`${counts.groups} novo(s) grupo(s)`);
          }
          if (counts.friends > 0) {
            activityParts.push(`${counts.friends} novo(s) amigo(s)`);
          }
          if (counts.badges > 0) {
            const badgeText = counts.badges > 5 ? 'mais de 5 novo(s) emblema(s)' : `${counts.badges} novo(s) emblema(s)`;
            activityParts.push(badgeText);
          }
          if (counts.avatarChanged) {
            activityParts.push('mudou seu visual');
          }
          if (counts.mottoChanged) {
            activityParts.push('mudou o lema');
          }
        }

        let description = 'atividade recente';
        if (activityParts.length > 0) {
          description = `adicionou ${activityParts.join(', ')}.`;
        } else if (latestSnapshot) {
          // Create description from profile data
          const profileParts = [];
          if (latestSnapshot.groups_count > 0) {
            profileParts.push(`${latestSnapshot.groups_count} grupos`);
          }
          if (latestSnapshot.friends_count > 0) {
            profileParts.push(`${latestSnapshot.friends_count} amigos`);
          }
          if (latestSnapshot.badges_count > 0) {
            profileParts.push(`${latestSnapshot.badges_count} emblemas`);
          }
          
          if (profileParts.length > 0) {
            description = `possui ${profileParts.join(', ')}.`;
          }
          
          if (latestSnapshot.is_online) {
            description = `está online! ${description}`;
          }
        }

        return {
          username,
          lastUpdate: sortedActivities[0]?.created_at || latestSnapshot?.created_at || new Date().toISOString(),
          counts,
          groups: groups.slice(0, 3),
          friends: friends.slice(0, 5),
          badges: badges.slice(0, 5),
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
            photosCount: latestSnapshot?.photos_count || 0
          }
        };
      })
      .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
      .slice(0, limit);

    console.log(`✅ [habbo-feed] Returning ${feedActivities.length} aggregated activities`);

    return new Response(
      JSON.stringify({
        success: true,
        hotel,
        activities: feedActivities,
        meta: {
          source: 'live',
          timestamp: new Date().toISOString(),
          count: feedActivities.length,
          filter: onlineWithinSeconds ? { onlineWithinSeconds } : undefined
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
