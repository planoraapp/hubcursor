
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Aggregate activities by user (last 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const recentActivities = activities?.filter(activity => 
      new Date(activity.created_at) >= twoHoursAgo
    ) || [];

    const userGroups: { [username: string]: any[] } = {};
    recentActivities.forEach(activity => {
      if (!userGroups[activity.habbo_name]) {
        userGroups[activity.habbo_name] = [];
      }
      userGroups[activity.habbo_name].push(activity);
    });

    // Format for HabboWidgets-style display
    const feedActivities: FeedActivity[] = Object.entries(userGroups)
      .map(([username, userActivities]) => {
        const sortedActivities = userActivities.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        const latestSnapshot = sortedActivities[0]?.habbo_user_snapshots;
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

        // Build HabboWidgets-style description
        const parts = [];
        if (counts.groups > 0) {
          parts.push(`${counts.groups} novo(s) grupo(s)`);
        }
        if (counts.friends > 0) {
          parts.push(`${counts.friends} novo(s) amigo(s)`);
        }
        if (counts.badges > 0) {
          const badgeText = counts.badges > 5 ? 'mais de 5 novo(s) emblema(s)' : `${counts.badges} novo(s) emblema(s)`;
          parts.push(badgeText);
        }
        if (counts.avatarChanged) {
          parts.push('mudou seu visual');
        }
        if (counts.mottoChanged) {
          parts.push('mudou o lema');
        }

        const description = parts.length > 0 
          ? `adicionou ${parts.join(', ')}.`
          : 'atividade recente';

        return {
          username,
          lastUpdate: sortedActivities[0]?.created_at || new Date().toISOString(),
          counts,
          groups: groups.slice(0, 3),
          friends: friends.slice(0, 5),
          badges: badges.slice(0, 5),
          description
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
          count: feedActivities.length
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
