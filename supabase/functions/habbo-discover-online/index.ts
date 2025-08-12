
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface HabboUser {
  name: string;
  figureString: string;
  motto?: string;
  memberSince?: string;
  profileVisible: boolean;
  lastWebVisit?: string;
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

    console.log(`🔍 [habbo-discover-online] Discovering online users for hotel: ${hotel}`);

    // Map hotel codes to proper domains
    const hotelDomains: { [key: string]: string } = {
      'com.br': 'habbo.com.br',
      'br': 'habbo.com.br',
      'com': 'habbo.com',
      'es': 'habbo.es',
      'fr': 'habbo.fr',
      'de': 'habbo.de',
      'it': 'habbo.it',
      'nl': 'habbo.nl',
      'fi': 'habbo.fi',
      'tr': 'habbo.com.tr'
    };

    const domain = hotelDomains[hotel] || 'habbo.com.br';
    
    // Try multiple strategies to discover online users
    const discoveredUsers: Set<string> = new Set();
    
    // Strategy 1: Get users from hotel ticker/news feed
    try {
      console.log(`📰 [habbo-discover-online] Fetching hotel ticker from ${domain}`);
      const tickerResponse = await fetch(`https://www.${domain}/api/public/community/ticker`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });

      if (tickerResponse.ok) {
        const tickerData = await tickerResponse.json();
        if (tickerData && Array.isArray(tickerData)) {
          tickerData.forEach((item: any) => {
            if (item.habboName) {
              discoveredUsers.add(item.habboName);
            }
          });
        }
      }
    } catch (error) {
      console.warn(`⚠️ [habbo-discover-online] Failed to fetch ticker: ${error}`);
    }

    // Strategy 2: Get users from groups with recent activity
    try {
      console.log(`👥 [habbo-discover-online] Fetching active groups from ${domain}`);
      const groupsResponse = await fetch(`https://www.${domain}/api/public/groups?limit=20`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });

      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        if (groupsData && Array.isArray(groupsData)) {
          // Get members from active groups
          for (const group of groupsData.slice(0, 5)) {
            try {
              const membersResponse = await fetch(`https://www.${domain}/api/public/groups/${group.id}/members?limit=10`, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                  'Accept': 'application/json',
                },
              });
              
              if (membersResponse.ok) {
                const membersData = await membersResponse.json();
                if (membersData && Array.isArray(membersData)) {
                  membersData.forEach((member: any) => {
                    if (member.name) {
                      discoveredUsers.add(member.name);
                    }
                  });
                }
              }
            } catch (error) {
              console.warn(`⚠️ [habbo-discover-online] Failed to fetch group members: ${error}`);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ [habbo-discover-online] Failed to fetch groups: ${error}`);
    }

    // Strategy 3: Get existing tracked users and find their friends
    try {
      const { data: trackedUsers } = await supabase
        .from('tracked_habbo_users')
        .select('habbo_name')
        .eq('hotel', hotel)
        .eq('is_active', true)
        .limit(10);

      if (trackedUsers && trackedUsers.length > 0) {
        console.log(`🤝 [habbo-discover-online] Checking friends of ${trackedUsers.length} tracked users`);
        
        for (const user of trackedUsers) {
          try {
            const friendsResponse = await fetch(`https://www.${domain}/api/public/users?name=${encodeURIComponent(user.habbo_name)}`, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
              },
            });

            if (friendsResponse.ok) {
              const userData = await friendsResponse.json();
              if (userData && userData.name) {
                discoveredUsers.add(userData.name);
                
                // Get user's friends
                try {
                  const userFriendsResponse = await fetch(`https://www.${domain}/api/public/users/${userData.uniqueId}/friends?limit=20`, {
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                      'Accept': 'application/json',
                    },
                  });
                  
                  if (userFriendsResponse.ok) {
                    const friendsData = await userFriendsResponse.json();
                    if (friendsData && Array.isArray(friendsData)) {
                      friendsData.forEach((friend: any) => {
                        if (friend.name) {
                          discoveredUsers.add(friend.name);
                        }
                      });
                    }
                  }
                } catch (error) {
                  console.warn(`⚠️ [habbo-discover-online] Failed to fetch user friends: ${error}`);
                }
              }
            }
          } catch (error) {
            console.warn(`⚠️ [habbo-discover-online] Failed to fetch user data: ${error}`);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ [habbo-discover-online] Failed to get tracked users: ${error}`);
    }

    const userList = Array.from(discoveredUsers).slice(0, limit);
    console.log(`✅ [habbo-discover-online] Discovered ${userList.length} unique users`);

    // Now ensure all discovered users are tracked and synced
    const syncPromises = userList.map(async (username) => {
      try {
        // First try to get user data to get their ID
        const userResponse = await fetch(`https://www.${domain}/api/public/users?name=${encodeURIComponent(username)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData && userData.uniqueId && userData.name) {
            // Call ensure-tracked function
            const { error: ensureError } = await supabase.functions.invoke('habbo-ensure-tracked', {
              body: {
                habbo_name: userData.name,
                habbo_id: userData.uniqueId,
                hotel: hotel === 'com.br' ? 'br' : hotel
              },
            });

            if (ensureError) {
              console.warn(`⚠️ [habbo-discover-online] Failed to ensure tracking for ${username}: ${ensureError.message}`);
            } else {
              console.log(`✅ [habbo-discover-online] Ensured tracking for ${username}`);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ [habbo-discover-online] Failed to sync ${username}: ${error}`);
      }
    });

    // Wait for all sync operations to complete (with timeout)
    await Promise.allSettled(syncPromises);

    return new Response(
      JSON.stringify({
        success: true,
        hotel,
        discovered: userList.length,
        users: userList,
        message: `Discovered and synced ${userList.length} users for ${hotel}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ [habbo-discover-online] Error:', error);
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
