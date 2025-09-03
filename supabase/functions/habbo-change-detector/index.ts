import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { habbo_id, habbo_name, hotel = 'com.br' } = await req.json();

    console.log(`[CHANGE DETECTOR] Processing ${habbo_name} (${habbo_id}) on ${hotel}`);

    // Fetch current profile data from Habbo API
    const currentProfileData = await fetchCurrentProfileData(habbo_name, hotel);
    if (!currentProfileData) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch current profile data' 
      }), { headers: corsHeaders });
    }

    // Get latest snapshot from database
    const { data: latestSnapshot } = await supabase
      .from('user_snapshots')
      .select('*')
      .eq('habbo_id', habbo_id)
      .order('snapshot_timestamp', { ascending: false })
      .limit(1)
      .single();

    // Create new snapshot
    const { data: newSnapshot, error: snapshotError } = await supabase
      .from('user_snapshots')
      .insert({
        habbo_id,
        habbo_name,
        hotel,
        figure_string: currentProfileData.figureString,
        motto: currentProfileData.motto,
        online: currentProfileData.online,
        badges: currentProfileData.badges || [],
        friends: currentProfileData.friends || [],
        groups: currentProfileData.groups || [],
        rooms: currentProfileData.rooms || [],
        raw_profile_data: currentProfileData
      })
      .select()
      .single();

    if (snapshotError) {
      console.error('[CHANGE DETECTOR] Error creating snapshot:', snapshotError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to create snapshot' 
      }), { headers: corsHeaders });
    }

    const detectedChanges = [];

    // Compare with previous snapshot if exists
    if (latestSnapshot) {
      const changes = await detectChanges(latestSnapshot, currentProfileData, supabase);
      detectedChanges.push(...changes);

      // Insert detected changes
      if (changes.length > 0) {
        const changeInserts = changes.map(change => ({
          habbo_id,
          habbo_name,
          hotel,
          change_type: change.type,
          change_description: change.description,
          old_snapshot_id: latestSnapshot.id,
          new_snapshot_id: newSnapshot.id,
          change_details: change.details
        }));

        await supabase
          .from('detected_changes')
          .insert(changeInserts);

        console.log(`[CHANGE DETECTOR] Detected ${changes.length} changes for ${habbo_name}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      changes_detected: detectedChanges.length,
      changes: detectedChanges,
      snapshot_id: newSnapshot.id
    }), { headers: corsHeaders });

  } catch (error) {
    console.error('[CHANGE DETECTOR] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});

async function fetchCurrentProfileData(habbo_name: string, hotel: string) {
  try {
    const hotelApiDomain = hotel === 'com.br' ? 'com.br' : hotel;
    
    // Fetch basic profile
    const profileResponse = await fetch(`https://www.habbo.${hotelApiDomain}/api/public/users?name=${encodeURIComponent(habbo_name)}`);
    if (!profileResponse.ok) return null;
    
    const profileData = await profileResponse.json();
    const uniqueId = profileData.uniqueId;
    
    if (!uniqueId) return null;

    // Fetch additional data in parallel
    const [badgesResponse, friendsResponse, groupsResponse, roomsResponse] = await Promise.allSettled([
      fetch(`https://www.habbo.${hotelApiDomain}/api/public/users/${uniqueId}/badges`),
      fetch(`https://www.habbo.${hotelApiDomain}/api/public/users/${uniqueId}/friends`),
      fetch(`https://www.habbo.${hotelApiDomain}/api/public/users/${uniqueId}/groups`),
      fetch(`https://www.habbo.${hotelApiDomain}/api/public/users/${uniqueId}/rooms`)
    ]);

    const badges = badgesResponse.status === 'fulfilled' && badgesResponse.value.ok 
      ? await badgesResponse.value.json() : [];
    const friends = friendsResponse.status === 'fulfilled' && friendsResponse.value.ok 
      ? await friendsResponse.value.json() : [];
    const groups = groupsResponse.status === 'fulfilled' && groupsResponse.value.ok 
      ? await groupsResponse.value.json() : [];
    const rooms = roomsResponse.status === 'fulfilled' && roomsResponse.value.ok 
      ? await roomsResponse.value.json() : [];

    return {
      ...profileData,
      badges,
      friends,
      groups,
      rooms
    };
  } catch (error) {
    console.error('[CHANGE DETECTOR] Error fetching profile data:', error);
    return null;
  }
}

async function detectChanges(oldSnapshot: any, currentData: any, supabase: any) {
  const changes = [];

  // Detect outfit changes
  if (oldSnapshot.figure_string !== currentData.figureString) {
    changes.push({
      type: 'outfit',
      description: 'mudou seu visual',
      details: {
        old_figure: oldSnapshot.figure_string,
        new_figure: currentData.figureString
      }
    });
  }

  // Detect motto changes
  if (oldSnapshot.motto !== currentData.motto) {
    changes.push({
      type: 'motto',
      description: `mudou seu lema para "${currentData.motto}"`,
      details: {
        old_motto: oldSnapshot.motto,
        new_motto: currentData.motto
      }
    });
  }

  // Detect new badges (filter out old badges from 2017 and earlier)
  const oldBadges = new Set((oldSnapshot.badges || []).map((b: any) => b.code || b));
  const newBadges = (currentData.badges || []).filter((badge: any) => {
    const badgeCode = badge.code || badge;
    
    // Skip if badge already exists
    if (oldBadges.has(badgeCode)) return false;
    
    // Check if badge is recent (not from old years)
    const oldBadgePatterns = [
      /^ACH_/, /^NFT/, /^HC/, /^VIP/, /^ADM/, /^MOD/,
      /2009|2010|2011|2012|2013|2014|2015|2016|2017/
    ];
    
    return !oldBadgePatterns.some(pattern => badgeCode.match(pattern));
  });

  if (newBadges.length > 0) {
    const description = newBadges.length === 1 
      ? `conquistou 1 novo emblema`
      : `conquistou ${newBadges.length} novos emblemas`;
    
    changes.push({
      type: 'badge',
      description,
      details: {
        new_badges: newBadges,
        count: newBadges.length
      }
    });
  }

  // Detect new friends
  const oldFriends = new Set((oldSnapshot.friends || []).map((f: any) => f.name || f));
  const newFriends = (currentData.friends || []).filter((friend: any) => {
    const friendName = friend.name || friend;
    return !oldFriends.has(friendName);
  });

  if (newFriends.length > 0) {
    const description = newFriends.length === 1 
      ? `adicionou 1 novo amigo`
      : `adicionou ${newFriends.length} novos amigos`;
    
    changes.push({
      type: 'friend',
      description,
      details: {
        new_friends: newFriends,
        count: newFriends.length
      }
    });
  }

  // Detect new groups
  const oldGroups = new Set((oldSnapshot.groups || []).map((g: any) => g.id || g));
  const newGroups = (currentData.groups || []).filter((group: any) => {
    const groupId = group.id || group;
    return !oldGroups.has(groupId);
  });

  if (newGroups.length > 0) {
    const description = newGroups.length === 1 
      ? `entrou em 1 novo grupo`
      : `entrou em ${newGroups.length} novos grupos`;
    
    changes.push({
      type: 'group',
      description,
      details: {
        new_groups: newGroups,
        count: newGroups.length
      }
    });
  }

  // Detect new rooms
  const oldRooms = new Set((oldSnapshot.rooms || []).map((r: any) => r.id || r));
  const newRooms = (currentData.rooms || []).filter((room: any) => {
    const roomId = room.id || room;
    return !oldRooms.has(roomId);
  });

  if (newRooms.length > 0) {
    const description = newRooms.length === 1 
      ? `criou 1 novo quarto`
      : `criou ${newRooms.length} novos quartos`;
    
    changes.push({
      type: 'room',
      description,
      details: {
        new_rooms: newRooms,
        count: newRooms.length
      }
    });
  }

  return changes;
}