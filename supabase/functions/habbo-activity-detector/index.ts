
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface ActivityDetectionResult {
  userId: string;
  userName: string;
  hotel: string;
  activities: Array<{
    type: string;
    description: string;
    details: any;
    timestamp: string;
  }>;
}

async function fetchHabboAPI(url: string, retries = 3): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`🌐 [activity-detector] API Request attempt ${i + 1}: ${url}`);
      
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
      console.warn(`⚠️ [activity-detector] API attempt ${i + 1} failed for ${url}:`, error);
      
      if (i === retries) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}

async function detectUserActivities(
  supabase: any,
  habboName: string, 
  hotel: string
): Promise<ActivityDetectionResult | null> {
  try {
    console.log(`🔍 [activity-detector] Analyzing ${habboName} (${hotel})`);
    
    const baseUrl = hotel === 'com.br' ? 'https://www.habbo.com.br' : `https://www.habbo.${hotel}`;
    
    // Fetch current user data
    const currentProfile = await fetchHabboAPI(`${baseUrl}/api/public/users?name=${encodeURIComponent(habboName)}`);
    if (!currentProfile) {
      console.log(`❌ [activity-detector] User ${habboName} not found`);
      return null;
    }
    
    // Get last snapshot from database
    const { data: lastSnapshot } = await supabase
      .from('habbo_user_snapshots')
      .select('*')
      .eq('habbo_name', habboName)
      .eq('hotel', hotel === 'com.br' ? 'br' : hotel)
      .order('created_at', { ascending: false })
      .limit(1);
    
    const activities: Array<{
      type: string;
      description: string;
      details: any;
      timestamp: string;
    }> = [];
    
    const now = new Date().toISOString();
    
    if (lastSnapshot && lastSnapshot.length > 0) {
      const previous = lastSnapshot[0];
      
      // Check for motto changes
      if (previous.motto !== currentProfile.motto) {
        activities.push({
          type: 'motto_change',
          description: `mudou o lema para "${currentProfile.motto}"`,
          details: {
            oldMotto: previous.motto,
            newMotto: currentProfile.motto
          },
          timestamp: now
        });
      }
      
      // Check for figure changes (avatar)
      if (previous.figure_string !== currentProfile.figureString) {
        activities.push({
          type: 'avatar_change',
          description: 'mudou o visual',
          details: {
            oldFigure: previous.figure_string,
            newFigure: currentProfile.figureString
          },
          timestamp: now
        });
      }
      
      // Check for badge changes
      try {
        const currentBadges = currentProfile.selectedBadges || [];
        const previousBadges = JSON.parse(previous.raw_data || '{}').selectedBadges || [];
        
        const newBadges = currentBadges.filter((badge: any) => 
          !previousBadges.some((prev: any) => prev.code === badge.code)
        );
        
        if (newBadges.length > 0) {
          activities.push({
            type: 'new_badges',
            description: `ganhou ${newBadges.length} novo(s) emblema(s)`,
            details: {
              newBadges: newBadges.map((b: any) => ({ code: b.code, name: b.name })),
              count: newBadges.length
            },
            timestamp: now
          });
        }
      } catch (error) {
        console.warn(`⚠️ [activity-detector] Error comparing badges for ${habboName}:`, error);
      }
    }
    
    // Save new snapshot
    const snapshotData = {
      habbo_name: habboName,
      habbo_id: currentProfile.uniqueId,
      hotel: hotel === 'com.br' ? 'br' : hotel,
      figure_string: currentProfile.figureString,
      motto: currentProfile.motto,
      is_online: currentProfile.online,
      member_since: currentProfile.memberSince,
      last_web_visit: currentProfile.lastWebVisit,
      badges_count: currentProfile.selectedBadges?.length || 0,
      raw_data: currentProfile
    };
    
    const { error: snapshotError } = await supabase
      .from('habbo_user_snapshots')
      .insert(snapshotData);
    
    if (snapshotError) {
      console.error(`❌ [activity-detector] Error saving snapshot for ${habboName}:`, snapshotError);
    }
    
    // Save detected activities
    if (activities.length > 0) {
      const activityRecords = activities.map(activity => ({
        habbo_name: habboName,
        habbo_id: currentProfile.uniqueId,
        hotel: hotel === 'com.br' ? 'br' : hotel,
        activity_type: activity.type,
        description: activity.description,
        details: activity.details
      }));
      
      const { error: activityError } = await supabase
        .from('habbo_activities')
        .insert(activityRecords);
      
      if (activityError) {
        console.error(`❌ [activity-detector] Error saving activities for ${habboName}:`, activityError);
      } else {
        console.log(`✅ [activity-detector] Saved ${activities.length} activities for ${habboName}`);
      }
    }
    
    return {
      userId: currentProfile.uniqueId,
      userName: habboName,
      hotel: hotel,
      activities
    };
    
  } catch (error) {
    console.error(`❌ [activity-detector] Error analyzing ${habboName}:`, error);
    return null;
  }
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
    const targetUser = url.searchParams.get('user');

    console.log(`🎯 [activity-detector] Starting activity detection for hotel: ${hotel}`);

    if (targetUser) {
      // Analyze specific user
      const result = await detectUserActivities(supabase, targetUser, hotel);
      
      return new Response(
        JSON.stringify({
          success: true,
          hotel,
          user: targetUser,
          result,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      // Analyze tracked users
      const { data: trackedUsers, error } = await supabase
        .from('tracked_habbo_users')
        .select('habbo_name, hotel')
        .eq('is_active', true)
        .eq('hotel', hotel === 'com.br' ? 'br' : hotel)
        .limit(limit);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const results: ActivityDetectionResult[] = [];
      const batchSize = 5;

      for (let i = 0; i < trackedUsers.length; i += batchSize) {
        const batch = trackedUsers.slice(i, i + batchSize);
        const batchPromises = batch.map(user => 
          detectUserActivities(supabase, user.habbo_name, hotel)
        );

        const batchResults = await Promise.allSettled(batchPromises);
        batchResults.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value) {
            results.push(result.value);
          } else if (result.status === 'rejected') {
            console.warn(`⚠️ [activity-detector] Failed to analyze ${batch[idx].habbo_name}:`, result.reason);
          }
        });

        // Small delay between batches
        if (i + batchSize < trackedUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      console.log(`✅ [activity-detector] Completed analysis of ${results.length}/${trackedUsers.length} users`);

      return new Response(
        JSON.stringify({
          success: true,
          hotel,
          analyzed: results.length,
          total: trackedUsers.length,
          results,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

  } catch (error) {
    console.error('❌ [activity-detector] Error:', error);
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
