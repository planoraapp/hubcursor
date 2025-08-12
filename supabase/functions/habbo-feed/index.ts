
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

interface TickerEntry {
  habboName: string;
  figureString: string;
  motto: string;
  buildersClubMember: boolean;
  habboClubMember: boolean;
  lastWebAccess: string;
  habbosMissionChanged: boolean;
  newFriends: Array<{
    habboName: string;
    figureString: string;
  }>;
  totalFriends: number;
  newGroups: Array<{
    groupName: string;
    badgeCode: string;
  }>;
  totalGroups: number;
  newBadges: Array<{
    badgeCode: string;
    badgeName: string;
  }>;
  totalBadges: number;
  newRooms: Array<{
    roomName: string;
    roomId: string;
  }>;
  totalRooms: number;
  profileVisible: boolean;
}

// Helper function to fetch from Habbo API with retry logic
async function fetchHabboAPI(url: string, retries = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'HabboHub/1.0',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      if (response.status === 404 || response.status === 403) {
        return null;
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Function to get official ticker data
async function getOfficialTicker(hotel: string, limit: number): Promise<TickerEntry[]> {
  console.log(`🎯 [habbo-feed] Fetching official ticker for ${hotel}, limit: ${limit}`);
  
  const baseUrl = hotel === 'com.br' ? 'https://www.habbo.com.br' : `https://www.habbo.${hotel}`;
  const tickerUrl = `${baseUrl}/api/public/users/habbo/ticker?limit=${limit}`;
  
  try {
    const tickerData = await fetchHabboAPI(tickerUrl);
    console.log(`✅ [habbo-feed] Retrieved ${tickerData?.length || 0} ticker entries`);
    return tickerData || [];
  } catch (error) {
    console.error(`❌ [habbo-feed] Failed to fetch ticker:`, error);
    return [];
  }
}

// Function to enrich ticker data with additional profile info
async function enrichTickerEntry(entry: TickerEntry, hotel: string): Promise<FeedActivity> {
  const baseUrl = hotel === 'com.br' ? 'https://www.habbo.com.br' : `https://www.habbo.${hotel}`;
  
  // Count actual changes
  const counts = {
    groups: entry.newGroups?.length || 0,
    friends: entry.newFriends?.length || 0,
    badges: entry.newBadges?.length || 0,
    avatarChanged: false, // Ticker doesn't provide this directly
    mottoChanged: entry.habbosMissionChanged || false
  };
  
  // Get additional profile data if needed
  let profileData = null;
  try {
    if (entry.profileVisible) {
      profileData = await fetchHabboAPI(`${baseUrl}/api/public/users?name=${encodeURIComponent(entry.habboName)}`);
    }
  } catch (error) {
    console.warn(`⚠️ [habbo-feed] Failed to fetch profile for ${entry.habboName}:`, error);
  }
  
  // Build description based on activities
  const activityParts = [];
  if (counts.groups > 0) activityParts.push(`${counts.groups} novo(s) grupo(s)`);
  if (counts.friends > 0) activityParts.push(`${counts.friends} novo(s) amigo(s)`);
  if (counts.badges > 0) activityParts.push(`${counts.badges} novo(s) emblema(s)`);
  if (counts.mottoChanged) activityParts.push('mudou sua missão');
  if (entry.newRooms?.length > 0) activityParts.push(`${entry.newRooms.length} novo(s) quarto(s)`);
  
  let description = 'atividade recente';
  if (activityParts.length > 0) {
    description = `adicionou ${activityParts.join(', ')}.`;
  }
  
  return {
    username: entry.habboName,
    lastUpdate: entry.lastWebAccess,
    counts,
    groups: (entry.newGroups || []).map(g => ({
      name: g.groupName,
      badgeCode: g.badgeCode
    })),
    friends: (entry.newFriends || []).map(f => ({
      name: f.habboName,
      figureString: f.figureString
    })),
    badges: (entry.newBadges || []).map(b => ({
      code: b.badgeCode,
      name: b.badgeName
    })),
    photos: [], // Ticker doesn't provide photos directly
    description,
    profile: {
      figureString: entry.figureString,
      motto: entry.motto || '',
      isOnline: profileData?.online || false,
      memberSince: profileData?.memberSince || null,
      lastWebVisit: entry.lastWebAccess,
      groupsCount: entry.totalGroups || 0,
      friendsCount: entry.totalFriends || 0,
      badgesCount: entry.totalBadges || 0,
      photosCount: 0
    }
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
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const onlineWithinSecondsParam = url.searchParams.get('onlineWithinSeconds');
    const onlineWithinSeconds = onlineWithinSecondsParam ? parseInt(onlineWithinSecondsParam) : 1800;
    const mode = url.searchParams.get('mode') || 'hybrid'; // 'official', 'database', or 'hybrid'
    const offsetHours = parseInt(url.searchParams.get('offsetHours') || '0');

    console.log(`🎯 [habbo-feed] Mode: ${mode}, Hotel: ${hotel}${username ? `, user: ${username}` : ''}, limit: ${limit}`);

    // If mode is 'official' or 'hybrid', try to get live ticker data
    if ((mode === 'official' || mode === 'hybrid') && !username) {
      try {
        console.log(`📡 [habbo-feed] Fetching official ticker data...`);
        const tickerEntries = await getOfficialTicker(hotel, limit);
        
        if (tickerEntries.length > 0) {
          // Apply time filtering if offsetHours is specified
          let filteredEntries = tickerEntries;
          if (offsetHours > 0) {
            const cutoffTime = new Date(Date.now() - offsetHours * 60 * 60 * 1000);
            filteredEntries = tickerEntries.filter(entry => {
              const entryTime = new Date(entry.lastWebAccess);
              return entryTime >= cutoffTime;
            });
            console.log(`⏰ [habbo-feed] Filtered to ${filteredEntries.length} entries within ${offsetHours}h`);
          }
          
          // Enrich ticker data with additional details
          const enrichedActivities: FeedActivity[] = [];
          const batchSize = 5; // Process in batches to avoid overwhelming the API
          
          for (let i = 0; i < Math.min(filteredEntries.length, limit); i += batchSize) {
            const batch = filteredEntries.slice(i, i + batchSize);
            const batchPromises = batch.map(entry => enrichTickerEntry(entry, hotel));
            
            try {
              const batchResults = await Promise.allSettled(batchPromises);
              batchResults.forEach((result, idx) => {
                if (result.status === 'fulfilled') {
                  enrichedActivities.push(result.value);
                } else {
                  console.warn(`⚠️ [habbo-feed] Failed to enrich ${batch[idx].habboName}:`, result.reason);
                }
              });
            } catch (error) {
              console.warn(`⚠️ [habbo-feed] Batch processing error:`, error);
            }
            
            // Small delay between batches
            if (i + batchSize < Math.min(filteredEntries.length, limit)) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
          
          console.log(`✅ [habbo-feed] Returning ${enrichedActivities.length} official activities`);
          
          return new Response(
            JSON.stringify({
              success: true,
              hotel,
              activities: enrichedActivities,
              meta: {
                source: 'official',
                timestamp: new Date().toISOString(),
                count: enrichedActivities.length,
                onlineCount: enrichedActivities.filter(a => a.profile.isOnline).length,
                filter: { mode, offsetHours }
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
      } catch (error) {
        console.error(`❌ [habbo-feed] Official ticker failed:`, error);
        if (mode === 'official') {
          return new Response(
            JSON.stringify({
              success: false,
              error: `Failed to fetch official ticker: ${error.message}`
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }
        // Fall back to database mode if hybrid
      }
    }

    // Fallback to database mode (existing logic)
    console.log(`📊 [habbo-feed] Using database mode as fallback/primary`);
    
    // Get snapshots from the database
    const cutoffTime = new Date(Date.now() - (onlineWithinSeconds + offsetHours * 3600) * 1000).toISOString();
    
    let snapshotsQuery = supabase
      .from('habbo_user_snapshots')
      .select('*')
      .eq('hotel', hotel)
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false });

    if (username) {
      snapshotsQuery = snapshotsQuery.ilike('habbo_name', username);
    }

    const { data: snapshots, error: snapshotsError } = await snapshotsQuery.limit(limit * 5);

    if (snapshotsError) {
      throw new Error(`Failed to fetch snapshots: ${snapshotsError.message}`);
    }

    console.log(`📊 [habbo-feed] Found ${snapshots?.length || 0} snapshots in database`);

    // Get recent activities for context
    const { data: activities } = await supabase
      .from('habbo_activities')
      .select('*')
      .eq('hotel', hotel)
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false })
      .limit(500);

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

    // Format for display - show all users with any data
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
      .filter(activity => {
        const hasRecentSnapshot = new Date(activity.lastUpdate) > new Date(Date.now() - (onlineWithinSeconds + offsetHours * 3600) * 1000);
        const hasProfileData = activity.profile.figureString || activity.counts.groups > 0 || activity.counts.friends > 0 || activity.counts.badges > 0;
        
        return hasRecentSnapshot || hasProfileData;
      })
      .sort((a, b) => {
        if (a.profile.isOnline && !b.profile.isOnline) return -1;
        if (!a.profile.isOnline && b.profile.isOnline) return 1;
        return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
      })
      .slice(0, limit);

    console.log(`✅ [habbo-feed] Returning ${feedActivities.length} database activities`);

    return new Response(
      JSON.stringify({
        success: true,
        hotel,
        activities: feedActivities,
        meta: {
          source: 'database',
          timestamp: new Date().toISOString(),
          count: feedActivities.length,
          onlineCount: feedActivities.filter(a => a.profile.isOnline).length,
          filter: { mode, onlineWithinSeconds, offsetHours }
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
