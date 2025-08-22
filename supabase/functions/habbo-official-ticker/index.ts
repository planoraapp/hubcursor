import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface EnrichedTickerActivity {
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

async function fetchHabboAPI(url: string, retries = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`🌐 [API] Request attempt ${i + 1}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      if (response.status === 404 || response.status === 403) {
        return null;
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries) {
        console.error(`❌ [API] All attempts failed for: ${url}`);
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}

function createSyntheticResponse(hotel: string, limit: number) {
  // Fallback to synthetic activities when no real changes are available
  const activities: EnrichedTickerActivity[] = [];
  
  const activityTypes = [
    'conquistou um novo emblema',
    'subiu para o nível',
    'mudou o visual',
    'entrou em um novo grupo',
    'fez novos amigos',
    'criou um quarto público'
  ];
  
  for (let i = 0; i < limit; i++) {
    const username = `Usuario${i + 1}`;
    const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const isOnline = Math.random() < 0.3;
    
    const activity: EnrichedTickerActivity = {
      username,
      lastUpdate: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
      counts: {
        groups: Math.floor(Math.random() * 5),
        friends: Math.floor(Math.random() * 20),
        badges: Math.floor(Math.random() * 10),
        avatarChanged: randomActivity.includes('visual'),
        mottoChanged: Math.random() < 0.2
      },
      groups: [],
      friends: [],
      badges: [],
      photos: [],
      description: randomActivity,
      profile: {
        figureString: `hd-180-${Math.floor(Math.random() * 10) + 1}.ch-255-${Math.floor(Math.random() * 100)}`,
        motto: 'Explorando o Habbo!',
        isOnline,
        memberSince: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastWebVisit: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        groupsCount: Math.floor(Math.random() * 5),
        friendsCount: Math.floor(Math.random() * 20),
        badgesCount: Math.floor(Math.random() * 10),
        photosCount: 0
      }
    };
    
    activities.push(activity);
  }

  console.log(`🔄 [SYNTHETIC DATA] Generated ${activities.length} synthetic activities`);
  
  return new Response(JSON.stringify({
    success: true,
    hotel,
    activities,
    meta: {
      source: 'synthetic',
      timestamp: new Date().toISOString(),
      count: activities.length,
      onlineCount: activities.filter(a => a.profile.isOnline).length,
      message: 'Synthetic activity data (fallback)'
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  });
}

async function discoverActiveUsers(hotel: string, limit: number, supabase: any) {
  try {
    // Get some known active users from discovered_users table
    const { data: activeUsers } = await supabase
      .from('discovered_users')
      .select('habbo_name, habbo_id, figure_string')
      .eq('hotel', hotel.replace('com.br', 'br'))
      .eq('is_online', true)
      .order('last_seen_at', { ascending: false })
      .limit(limit * 2); // Get more to filter

    if (!activeUsers || activeUsers.length === 0) {
      return createSyntheticResponse(hotel, limit);
    }

    // Process a subset of active users to detect changes
    const usersToProcess = activeUsers.slice(0, Math.min(5, activeUsers.length));
    const changeDetectionPromises = usersToProcess.map(async user => {
      try {
        const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-change-detector', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            habbo_id: user.habbo_id,
            habbo_name: user.habbo_name,
            hotel: hotel
          })
        });

        if (response.ok) {
          const result = await response.json();
          return result.changes || [];
        }
      } catch (error) {
        console.error(`[ACTIVE USER DISCOVERY] Error processing ${user.habbo_name}:`, error);
      }
      return [];
    });

    const allChanges = (await Promise.all(changeDetectionPromises)).flat();

    if (allChanges.length > 0) {
      console.log(`🔍 [ACTIVE USER DISCOVERY] Found ${allChanges.length} real changes from active users`);
      
      return new Response(JSON.stringify({
        success: true,
        activities: allChanges.slice(0, limit),
        metadata: {
          source: 'active_user_discovery',
          timestamp: new Date().toISOString(),
          count: allChanges.length,
          onlineCount: 0,
          hotel
        }
      }), { headers: corsHeaders });
    }

    return createSyntheticResponse(hotel, limit);
  } catch (error) {
    console.error(`[ACTIVE USER DISCOVERY] Error:`, error);
    return createSyntheticResponse(hotel, limit);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hotel = 'com.br', limit = 15 } = await req.json();
    
    console.log(`🎯 [COMMUNITY TICKER] Request for hotel: ${hotel}, limit: ${limit}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get recent detected changes from the database
    const { data: recentChanges, error } = await supabase
      .from('detected_changes')
      .select('*')
      .eq('hotel', hotel)
      .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(`❌ [COMMUNITY TICKER] Error fetching changes:`, error);
      return createSyntheticResponse(hotel, limit);
    }

    if (!recentChanges || recentChanges.length === 0) {
      console.log(`⚠️ [COMMUNITY TICKER] No recent changes found, using active user discovery`);
      return await discoverActiveUsers(hotel, limit, supabase);
    }

    // Transform detected changes to ticker format
    const activities = recentChanges.map(change => ({
      id: change.id,
      username: change.habbo_name,
      activity_type: change.change_type,
      activity_description: change.change_description,
      timestamp: change.detected_at,
      hotel: change.hotel,
      figure_string: '',
      online: false,
      details: change.change_details
    }));

    const onlineCount = 0; // Will be updated when we have real online status

    console.log(`✅ [COMMUNITY TICKER] Returning ${activities.length} real changes`);

    return new Response(JSON.stringify({
      success: true,
      activities,
      metadata: {
        source: 'real_changes',
        timestamp: new Date().toISOString(),
        count: activities.length,
        onlineCount,
        hotel
      }
    }), { headers: corsHeaders });

  } catch (error) {
    console.error(`❌ [COMMUNITY TICKER] Error:`, error);
    return createSyntheticResponse('com.br', 15);
  }
});