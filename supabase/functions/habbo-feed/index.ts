
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
    figureString: string;
    motto: string;
    isOnline: boolean;
    memberSince?: string;
    lastWebVisit: string;
    groupsCount: number;
    friendsCount: number;
    badgesCount: number;
    photosCount: number;
    uniqueId?: string;
  };
}

async function getDatabaseFeed(
  supabase: any,
  hotel: string,
  limit: number,
  onlineWithinSeconds: number
): Promise<FeedActivity[]> {
  console.log(`📊 [feed] Getting database feed for ${hotel}, online within ${onlineWithinSeconds}s`);
  
  // Get recent activities from the database
  const cutoffTime = new Date(Date.now() - (onlineWithinSeconds * 1000)).toISOString();
  
  const { data: activities, error } = await supabase
    .from('habbo_activities')
    .select(`
      *,
      habbo_user_snapshots!inner(*)
    `)
    .eq('hotel', hotel === 'com.br' ? 'br' : hotel)
    .gte('created_at', cutoffTime)
    .order('created_at', { ascending: false })
    .limit(limit * 2); // Get more to filter duplicates

  if (error) {
    console.error('❌ [feed] Database query error:', error);
    return [];
  }

  if (!activities || activities.length === 0) {
    console.log(`⚠️ [feed] No activities found in database for ${hotel}`);
    return [];
  }

  console.log(`📊 [feed] Found ${activities.length} activities in database`);

  // Group activities by user and aggregate
  const userActivities = new Map<string, any>();

  for (const activity of activities) {
    const snapshot = activity.habbo_user_snapshots;
    const username = activity.habbo_name;
    
    if (!userActivities.has(username)) {
      userActivities.set(username, {
        username,
        lastUpdate: activity.created_at,
        activities: [],
        latestSnapshot: snapshot,
        totalCounts: {
          friends: 0,
          badges: 0,
          photos: 0,
          avatarChanged: false,
          mottoChanged: false
        },
        newItems: {
          friends: [],
          badges: [],
          photos: []
        }
      });
    }

    const userActivity = userActivities.get(username);
    userActivity.activities.push(activity);

    // Update latest snapshot if this activity is more recent
    if (new Date(activity.created_at) > new Date(userActivity.lastUpdate)) {
      userActivity.lastUpdate = activity.created_at;
      userActivity.latestSnapshot = snapshot;
    }

    // Aggregate activity counts and new items
    const details = activity.details || {};
    
    switch (activity.activity_type) {
      case 'new_friend':
        userActivity.totalCounts.friends += details.new_friends?.length || 0;
        userActivity.newItems.friends.push(...(details.new_friends || []));
        break;
      case 'new_badge':
        userActivity.totalCounts.badges += details.new_badges?.length || 0;
        userActivity.newItems.badges.push(...(details.new_badges || []));
        break;
      case 'new_photo':
        userActivity.totalCounts.photos += details.new_photos?.length || 0;
        userActivity.newItems.photos.push(...(details.new_photos || []));
        break;
      case 'avatar_update':
        userActivity.totalCounts.avatarChanged = true;
        break;
      case 'motto_change':
        userActivity.totalCounts.mottoChanged = true;
        break;
      case 'user_tracked':
        // For initial tracking, show some existing data
        if (details.initial_friends) {
          userActivity.newItems.friends.push(...details.initial_friends);
          userActivity.totalCounts.friends = details.initial_friends.length;
        }
        if (details.initial_badges) {
          userActivity.newItems.badges.push(...details.initial_badges);
          userActivity.totalCounts.badges = details.initial_badges.length;
        }
        if (details.initial_photos) {
          userActivity.newItems.photos.push(...details.initial_photos);
          userActivity.totalCounts.photos = details.initial_photos.length;
        }
        break;
    }
  }

  // Convert to feed format
  const feedActivities: FeedActivity[] = [];
  
  for (const [username, userActivity] of userActivities.entries()) {
    const snapshot = userActivity.latestSnapshot;
    const rawData = snapshot.raw_data || {};
    
    // Build description based on what changed
    let description = 'atividade recente';
    const activityParts = [];
    
    if (userActivity.totalCounts.friends > 0) {
      activityParts.push(`${userActivity.totalCounts.friends} novo${userActivity.totalCounts.friends > 1 ? 's' : ''} amigo${userActivity.totalCounts.friends > 1 ? 's' : ''}`);
    }
    if (userActivity.totalCounts.badges > 0) {
      activityParts.push(`${userActivity.totalCounts.badges} novo${userActivity.totalCounts.badges > 1 ? 's' : ''} emblema${userActivity.totalCounts.badges > 1 ? 's' : ''}`);
    }
    if (userActivity.totalCounts.photos > 0) {
      activityParts.push(`${userActivity.totalCounts.photos} nova${userActivity.totalCounts.photos > 1 ? 's' : ''} foto${userActivity.totalCounts.photos > 1 ? 's' : ''}`);
    }
    if (userActivity.totalCounts.avatarChanged) {
      activityParts.push('mudou o visual');
    }
    if (userActivity.totalCounts.mottoChanged) {
      activityParts.push('mudou o lema');
    }
    
    if (activityParts.length > 0) {
      description = `adicionou ${activityParts.join(', ')}.`;
    }

    // Process friends data
    const friendsData = userActivity.newItems.friends.slice(0, 5).map((friend: any) => ({
      name: friend.name,
      figureString: friend.figureString
    }));

    // Process badges data
    const badgesData = userActivity.newItems.badges.slice(0, 8).map((badge: any) => ({
      code: badge.name || badge.badgeIndex || badge.code,
      name: badge.description || badge.name
    }));

    // Process photos data with proper URLs
    const photosData = userActivity.newItems.photos.slice(0, 6).map((photo: any) => ({
      url: photo.url || `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/habbo-imaging/photo/${photo.id}.png`,
      caption: photo.caption || '',
      id: photo.id
    }));

    feedActivities.push({
      username,
      lastUpdate: userActivity.lastUpdate,
      counts: {
        groups: 0,
        friends: userActivity.totalCounts.friends,
        badges: userActivity.totalCounts.badges,
        avatarChanged: userActivity.totalCounts.avatarChanged,
        mottoChanged: userActivity.totalCounts.mottoChanged
      },
      groups: [],
      friends: friendsData,
      badges: badgesData,
      photos: photosData,
      description,
      profile: {
        figureString: snapshot.figure_string || '',
        motto: snapshot.motto || '',
        isOnline: snapshot.is_online || false,
        memberSince: snapshot.member_since,
        lastWebVisit: snapshot.last_web_visit || userActivity.lastUpdate,
        groupsCount: 0,
        friendsCount: snapshot.friends_count || 0,
        badgesCount: snapshot.badges_count || 0,
        photosCount: snapshot.photos_count || 0,
        uniqueId: snapshot.habbo_id
      }
    });
  }

  // Sort by most recent activity
  feedActivities.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
  
  return feedActivities.slice(0, limit);
}

async function getOfficialTicker(hotel: string, limit: number): Promise<FeedActivity[]> {
  console.log(`🎯 [feed] Trying official ticker for ${hotel}`);
  
  try {
    const response = await fetch(`https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-official-ticker?hotel=${hotel}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.activities && data.activities.length > 0) {
        console.log(`✅ [feed] Official ticker returned ${data.activities.length} activities`);
        return data.activities;
      }
    }
  } catch (error) {
    console.warn(`⚠️ [feed] Official ticker failed:`, error);
  }
  
  return [];
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
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const mode = url.searchParams.get('mode') || 'hybrid';
    const onlineWithinSeconds = parseInt(url.searchParams.get('onlineWithinSeconds') || '3600');
    const offsetHours = parseInt(url.searchParams.get('offsetHours') || '0');

    console.log(`🎯 [feed] Feed request: ${mode} mode for ${hotel}, limit ${limit}, online within ${onlineWithinSeconds}s`);

    let activities: FeedActivity[] = [];
    let source = 'database';

    if (mode === 'official') {
      // Try official ticker first
      activities = await getOfficialTicker(hotel, limit);
      source = 'official';
      
      // Fallback to database if official fails
      if (activities.length === 0) {
        console.log(`⚠️ [feed] Official ticker empty, falling back to database`);
        activities = await getDatabaseFeed(supabase, hotel, limit, onlineWithinSeconds);
        source = 'database';
      }
    } else if (mode === 'database') {
      activities = await getDatabaseFeed(supabase, hotel, limit, onlineWithinSeconds);
      source = 'database';
    } else {
      // Hybrid mode: prefer database, fallback to official
      activities = await getDatabaseFeed(supabase, hotel, limit, onlineWithinSeconds);
      source = 'database';
      
      if (activities.length < 5) {
        console.log(`📊 [feed] Database has only ${activities.length} activities, trying official ticker`);
        const officialActivities = await getOfficialTicker(hotel, limit);
        if (officialActivities.length > 0) {
          activities = [...activities, ...officialActivities].slice(0, limit);
          source = 'hybrid';
        }
      }
    }

    const onlineCount = activities.filter(a => a.profile?.isOnline).length;

    console.log(`✅ [feed] Returning ${activities.length} activities (${source}), ${onlineCount} online`);

    return new Response(
      JSON.stringify({
        success: true,
        hotel,
        activities,
        meta: {
          source,
          timestamp: new Date().toISOString(),
          count: activities.length,
          onlineCount,
          filter: {
            mode,
            onlineWithinSeconds,
            offsetHours
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ [feed] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        hotel: new URL(req.url).searchParams.get('hotel') || 'com.br',
        activities: [],
        meta: {
          source: 'error',
          timestamp: new Date().toISOString(),
          count: 0,
          onlineCount: 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
