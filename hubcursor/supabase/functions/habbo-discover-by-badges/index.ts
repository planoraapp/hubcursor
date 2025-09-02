
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface BadgeDiscoveryResult {
  usersFound: number;
  badgesFound: number;
  errors: string[];
  processingTime: number;
}

async function fetchHabboAPI(url: string, retries = 3): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`🌐 [badge-discovery] API Request attempt ${i + 1}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
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
      console.warn(`⚠️ [badge-discovery] API attempt ${i + 1} failed for ${url}:`, error);
      
      if (i === retries) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}

async function discoverUsersByBadge(
  supabase: any,
  hotel: string,
  badgeCode: string,
  limit: number = 100
): Promise<BadgeDiscoveryResult> {
  const startTime = Date.now();
  const result: BadgeDiscoveryResult = {
    usersFound: 0,
    badgesFound: 0,
    errors: [],
    processingTime: 0
  };

  try {
    console.log(`🎯 [badge-discovery] Starting discovery for badge ${badgeCode} on ${hotel}`);
    
    const baseUrl = hotel === 'com.br' ? 'https://www.habbo.com.br' : `https://www.habbo.${hotel}`;
    const discoveredUsers = new Set<string>();
    const discoveredBadges = new Map<string, any>();

    // Strategy 1: Get users from hotel ticker (most active users)
    try {
      console.log(`📰 [badge-discovery] Fetching hotel ticker from ${baseUrl}`);
      const tickerData = await fetchHabboAPI(`${baseUrl}/api/public/community/ticker`);
      
      if (tickerData && Array.isArray(tickerData)) {
        for (const activity of tickerData.slice(0, 50)) {
          const username = activity.user?.username || activity.username;
          if (username && !discoveredUsers.has(username)) {
            await processUser(supabase, username, hotel, discoveredUsers, discoveredBadges, badgeCode);
            
            if (discoveredUsers.size >= limit) break;
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ [badge-discovery] Ticker fetch failed:`, error);
      result.errors.push(`Ticker fetch failed: ${error.message}`);
    }

    // Strategy 2: Get users from popular groups
    if (discoveredUsers.size < limit) {
      try {
        console.log(`👥 [badge-discovery] Fetching active groups from ${baseUrl}`);
        const groupsData = await fetchHabboAPI(`${baseUrl}/api/public/groups`);
        
        if (groupsData && Array.isArray(groupsData)) {
          for (const group of groupsData.slice(0, 10)) {
            try {
              const groupMembers = await fetchHabboAPI(`${baseUrl}/api/public/groups/${group.id}/members`);
              
              if (groupMembers && Array.isArray(groupMembers)) {
                for (const member of groupMembers.slice(0, 20)) {
                  const username = member.user?.username || member.username;
                  if (username && !discoveredUsers.has(username)) {
                    await processUser(supabase, username, hotel, discoveredUsers, discoveredBadges, badgeCode);
                    
                    if (discoveredUsers.size >= limit) break;
                  }
                }
              }
            } catch (memberError) {
              console.warn(`⚠️ [badge-discovery] Group ${group.id} members fetch failed:`, memberError);
            }
            
            if (discoveredUsers.size >= limit) break;
          }
        }
      } catch (error) {
        console.warn(`⚠️ [badge-discovery] Groups fetch failed:`, error);
        result.errors.push(`Groups fetch failed: ${error.message}`);
      }
    }

    // Strategy 3: Get friends of existing tracked users
    if (discoveredUsers.size < limit) {
      try {
        console.log(`🤝 [badge-discovery] Checking friends of tracked users`);
        const { data: trackedUsers } = await supabase
          .from('tracked_habbo_users')
          .select('habbo_name')
          .eq('hotel', hotel === 'com.br' ? 'br' : hotel)
          .eq('is_active', true)
          .limit(10);

        if (trackedUsers) {
          for (const user of trackedUsers) {
            try {
              const friendsData = await fetchHabboAPI(`${baseUrl}/api/public/users/${user.habbo_name}/friends`);
              
              if (friendsData && Array.isArray(friendsData)) {
                for (const friend of friendsData.slice(0, 10)) {
                  const username = friend.user?.username || friend.username;
                  if (username && !discoveredUsers.has(username)) {
                    await processUser(supabase, username, hotel, discoveredUsers, discoveredBadges, badgeCode);
                    
                    if (discoveredUsers.size >= limit) break;
                  }
                }
              }
            } catch (friendError) {
              console.warn(`⚠️ [badge-discovery] Friends fetch failed for ${user.habbo_name}:`, friendError);
            }
            
            if (discoveredUsers.size >= limit) break;
          }
        }
      } catch (error) {
        console.warn(`⚠️ [badge-discovery] Friends strategy failed:`, error);
        result.errors.push(`Friends strategy failed: ${error.message}`);
      }
    }

    // Process discovered badges in batch
    if (discoveredBadges.size > 0) {
      const badgeRecords = Array.from(discoveredBadges.values());
      
      try {
        const { error: badgeError } = await supabase
          .from('habbo_badges')
          .upsert(badgeRecords, { 
            onConflict: 'badge_code',
            ignoreDuplicates: false 
          });

        if (badgeError) {
          console.error(`❌ [badge-discovery] Error saving badges:`, badgeError);
          result.errors.push(`Badge save error: ${badgeError.message}`);
        } else {
          result.badgesFound = badgeRecords.length;
          console.log(`✅ [badge-discovery] Saved ${badgeRecords.length} badges`);
        }
      } catch (error) {
        console.error(`❌ [badge-discovery] Badge batch insert failed:`, error);
        result.errors.push(`Badge batch insert failed: ${error.message}`);
      }
    }

    result.usersFound = discoveredUsers.size;
    result.processingTime = Date.now() - startTime;

    console.log(`✅ [badge-discovery] Discovery completed:`, {
      usersFound: result.usersFound,
      badgesFound: result.badgesFound,
      processingTime: `${result.processingTime}ms`,
      errors: result.errors.length
    });

    return result;

  } catch (error) {
    console.error(`❌ [badge-discovery] Critical error:`, error);
    result.errors.push(`Critical error: ${error.message}`);
    result.processingTime = Date.now() - startTime;
    return result;
  }
}

async function processUser(
  supabase: any,
  username: string,
  hotel: string,
  discoveredUsers: Set<string>,
  discoveredBadges: Map<string, any>,
  targetBadge: string
): Promise<void> {
  try {
    console.log(`👤 [badge-discovery] Processing user: ${username}`);
    
    const baseUrl = hotel === 'com.br' ? 'https://www.habbo.com.br' : `https://www.habbo.${hotel}`;
    const userProfile = await fetchHabboAPI(`${baseUrl}/api/public/users?name=${encodeURIComponent(username)}`);
    
    if (!userProfile || !userProfile.uniqueId) {
      console.log(`❌ [badge-discovery] User ${username} not found or invalid`);
      return;
    }

    const hasTargetBadge = userProfile.selectedBadges?.some((badge: any) => badge.code === targetBadge) || false;
    
    if (hasTargetBadge) {
      console.log(`🎯 [badge-discovery] User ${username} has target badge ${targetBadge}!`);
      
      // Ensure user is tracked
      await ensureUserTracked(supabase, username, userProfile.uniqueId, hotel);
      discoveredUsers.add(username);

      // Process all user badges
      if (userProfile.selectedBadges) {
        for (const badge of userProfile.selectedBadges) {
          if (!discoveredBadges.has(badge.code)) {
            discoveredBadges.set(badge.code, {
              badge_code: badge.code,
              badge_name: badge.name || badge.code,
              image_url: `https://images.habbo.com/c_images/album1584/${badge.code}.gif`,
              category: categorizeBadge(badge.code),
              source: 'mass-discovery',
              is_active: true,
              validation_count: 1,
              last_validated_at: new Date().toISOString()
            });
          }
        }
      }
    } else {
      console.log(`❌ [badge-discovery] User ${username} does not have target badge ${targetBadge}`);
    }

    // Small delay to prevent API overload
    await new Promise(resolve => setTimeout(resolve, 100));

  } catch (error) {
    console.warn(`⚠️ [badge-discovery] Error processing user ${username}:`, error);
  }
}

async function ensureUserTracked(supabase: any, habboName: string, habboId: string, hotel: string): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('habbo-ensure-tracked', {
      body: {
        habbo_name: habboName,
        habbo_id: habboId,
        hotel: hotel
      }
    });

    if (error) {
      console.warn(`⚠️ [badge-discovery] Failed to ensure tracking for ${habboName}:`, error);
    } else {
      console.log(`✅ [badge-discovery] Ensured tracking for ${habboName}`);
    }
  } catch (error) {
    console.warn(`⚠️ [badge-discovery] Error ensuring tracking for ${habboName}:`, error);
  }
}

function categorizeBadge(code: string): string {
  if (code.match(/^(ADM|MOD|STAFF|GUIDE|HELPER)/)) return 'official';
  if (code.match(/^(ACH_|GAME_|WIN|VICTORY)/)) return 'achievements';
  if (code.match(/(FANSITE|PARTNER|EVENT|SPECIAL)/)) return 'fansites';
  return 'others';
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
    const badgeCode = url.searchParams.get('badge') || 'ACH_Tutorial1';
    const limit = parseInt(url.searchParams.get('limit') || '100');

    console.log(`🎯 [badge-discovery] Starting badge discovery for ${badgeCode} on ${hotel}`);

    const result = await discoverUsersByBadge(supabase, hotel, badgeCode, limit);

    return new Response(
      JSON.stringify({
        success: true,
        hotel,
        badgeCode,
        result,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ [badge-discovery] Critical error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
