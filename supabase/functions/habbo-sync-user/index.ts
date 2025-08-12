
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HabboUser {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  memberSince: string;
  lastWebOnline?: string;
  online?: boolean;
}

interface HabboBadge {
  name: string;
  description: string;
  badgeIndex: number;
}

interface HabboPhoto {
  id: string;
  caption: string;
  timestamp: string;
}

interface HabboFriend {
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
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

    const { habbo_name, hotel = 'com.br' } = await req.json();

    if (!habbo_name) {
      throw new Error('habbo_name is required');
    }

    console.log(`🔄 [habbo-sync-user] Syncing user: ${habbo_name} (${hotel})`);

    // Fetch user data from official Habbo API
    const baseUrl = hotel === 'com.br' ? 'https://www.habbo.com.br' : `https://www.habbo.${hotel}`;
    
    // Get user profile
    const profileResponse = await fetch(`${baseUrl}/api/public/users?name=${encodeURIComponent(habbo_name)}`);
    if (!profileResponse.ok) {
      throw new Error(`Failed to fetch user profile: ${profileResponse.status}`);
    }
    
    const userData: HabboUser = await profileResponse.json();
    console.log(`✅ [habbo-sync-user] User profile fetched for ${userData.name}`);

    // Get user badges
    let badges: HabboBadge[] = [];
    try {
      const badgesResponse = await fetch(`${baseUrl}/api/public/users/${userData.uniqueId}/badges`);
      if (badgesResponse.ok) {
        badges = await badgesResponse.json();
      }
    } catch (error) {
      console.warn(`⚠️ [habbo-sync-user] Failed to fetch badges for ${habbo_name}:`, error);
    }

    // Get user photos
    let photos: HabboPhoto[] = [];
    try {
      const photosResponse = await fetch(`${baseUrl}/api/public/users/${userData.uniqueId}/photos`);
      if (photosResponse.ok) {
        photos = await photosResponse.json();
      }
    } catch (error) {
      console.warn(`⚠️ [habbo-sync-user] Failed to fetch photos for ${habbo_name}:`, error);
    }

    // Get user friends
    let friends: HabboFriend[] = [];
    try {
      const friendsResponse = await fetch(`${baseUrl}/api/public/users/${userData.uniqueId}/friends`);
      if (friendsResponse.ok) {
        friends = await friendsResponse.json();
      }
    } catch (error) {
      console.warn(`⚠️ [habbo-sync-user] Failed to fetch friends for ${habbo_name}:`, error);
    }

    // Get previous snapshot for comparison
    const { data: previousSnapshot } = await supabase
      .from('habbo_user_snapshots')
      .select('*')
      .eq('habbo_name', userData.name)
      .eq('hotel', hotel)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Create new snapshot
    const newSnapshot = {
      habbo_name: userData.name,
      habbo_id: userData.uniqueId,
      hotel,
      motto: userData.motto,
      figure_string: userData.figureString,
      is_online: userData.online || false,
      last_web_visit: userData.lastWebOnline ? new Date(userData.lastWebOnline).toISOString() : null,
      member_since: new Date(userData.memberSince).toISOString(),
      badges_count: badges.length,
      photos_count: photos.length,
      friends_count: friends.length,
      raw_data: {
        user: userData,
        badges,
        photos,
        friends
      }
    };

    const { data: insertedSnapshot, error: snapshotError } = await supabase
      .from('habbo_user_snapshots')
      .insert(newSnapshot)
      .select()
      .single();

    if (snapshotError) {
      throw new Error(`Failed to insert snapshot: ${snapshotError.message}`);
    }

    console.log(`📸 [habbo-sync-user] Snapshot created for ${userData.name}`);

    // Detect changes and create activities
    const activities = [];

    if (previousSnapshot) {
      // Check for motto change
      if (previousSnapshot.motto !== userData.motto) {
        activities.push({
          habbo_name: userData.name,
          habbo_id: userData.uniqueId,
          hotel,
          activity_type: 'motto_change',
          description: `${userData.name} mudou o lema para "${userData.motto}"`,
          details: {
            old_motto: previousSnapshot.motto,
            new_motto: userData.motto
          },
          snapshot_id: insertedSnapshot.id
        });
      }

      // Check for avatar update
      if (previousSnapshot.figure_string !== userData.figureString) {
        activities.push({
          habbo_name: userData.name,
          habbo_id: userData.uniqueId,
          hotel,
          activity_type: 'avatar_update',
          description: `${userData.name} atualizou o visual do avatar`,
          details: {
            old_figure: previousSnapshot.figure_string,
            new_figure: userData.figureString
          },
          snapshot_id: insertedSnapshot.id
        });
      }

      // Check for new badges
      if (badges.length > previousSnapshot.badges_count) {
        const badgeDiff = badges.length - previousSnapshot.badges_count;
        activities.push({
          habbo_name: userData.name,
          habbo_id: userData.uniqueId,
          hotel,
          activity_type: 'new_badge',
          description: `${userData.name} conquistou ${badgeDiff} novo${badgeDiff > 1 ? 's' : ''} emblema${badgeDiff > 1 ? 's' : ''}`,
          details: {
            badges_count: badges.length,
            previous_badges_count: previousSnapshot.badges_count
          },
          snapshot_id: insertedSnapshot.id
        });
      }

      // Check for new photos
      if (photos.length > previousSnapshot.photos_count) {
        const photoDiff = photos.length - previousSnapshot.photos_count;
        activities.push({
          habbo_name: userData.name,
          habbo_id: userData.uniqueId,
          hotel,
          activity_type: 'new_photo',
          description: `${userData.name} postou ${photoDiff} nova${photoDiff > 1 ? 's' : ''} foto${photoDiff > 1 ? 's' : ''}`,
          details: {
            photos_count: photos.length,
            previous_photos_count: previousSnapshot.photos_count
          },
          snapshot_id: insertedSnapshot.id
        });
      }

      // Check for new friends
      if (friends.length > previousSnapshot.friends_count) {
        const friendDiff = friends.length - previousSnapshot.friends_count;
        activities.push({
          habbo_name: userData.name,
          habbo_id: userData.uniqueId,
          hotel,
          activity_type: 'new_friend',
          description: `${userData.name} fez ${friendDiff} novo${friendDiff > 1 ? 's' : ''} amigo${friendDiff > 1 ? 's' : ''}`,
          details: {
            friends_count: friends.length,
            previous_friends_count: previousSnapshot.friends_count
          },
          snapshot_id: insertedSnapshot.id
        });
      }

      // Check for online status change
      if (previousSnapshot.is_online !== userData.online) {
        activities.push({
          habbo_name: userData.name,
          habbo_id: userData.uniqueId,
          hotel,
          activity_type: 'status_change',
          description: `${userData.name} ${userData.online ? 'entrou online' : 'saiu offline'}`,
          details: {
            is_online: userData.online,
            previous_status: previousSnapshot.is_online
          },
          snapshot_id: insertedSnapshot.id
        });
      }
    } else {
      // First snapshot, create initial activity
      activities.push({
        habbo_name: userData.name,
        habbo_id: userData.uniqueId,
        hotel,
        activity_type: 'user_tracked',
        description: `${userData.name} agora está sendo monitorado no feed`,
        details: {
          badges_count: badges.length,
          photos_count: photos.length,
          friends_count: friends.length
        },
        snapshot_id: insertedSnapshot.id
      });
    }

    // Insert activities if any
    if (activities.length > 0) {
      const { error: activitiesError } = await supabase
        .from('habbo_activities')
        .insert(activities);

      if (activitiesError) {
        console.error(`❌ [habbo-sync-user] Failed to insert activities:`, activitiesError);
      } else {
        console.log(`🎯 [habbo-sync-user] Created ${activities.length} activities for ${userData.name}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: userData.name,
        hotel,
        snapshot_id: insertedSnapshot.id,
        activities_created: activities.length,
        changes_detected: activities.map(a => a.activity_type)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ [habbo-sync-user] Error:', error);
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
