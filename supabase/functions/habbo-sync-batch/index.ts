
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    console.log('🔄 [habbo-sync-batch] Starting batch sync...');

    // Get all active tracked users
    const { data: trackedUsers, error } = await supabase
      .from('tracked_habbo_users')
      .select('habbo_name, hotel')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch tracked users: ${error.message}`);
    }

    console.log(`📋 [habbo-sync-batch] Found ${trackedUsers.length} users to sync`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process users in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < trackedUsers.length; i += batchSize) {
      const batch = trackedUsers.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (user) => {
        try {
          console.log(`🔄 [habbo-sync-batch] Syncing ${user.habbo_name} (${user.hotel})`);
          
          const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              habbo_name: user.habbo_name,
              hotel: user.hotel
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
          }

          const result = await response.json();
          successCount++;
          
          return {
            user: user.habbo_name,
            hotel: user.hotel,
            success: true,
            activities_created: result.activities_created || 0,
            changes: result.changes_detected || []
          };
        } catch (error) {
          errorCount++;
          console.error(`❌ [habbo-sync-batch] Failed to sync ${user.habbo_name}:`, error.message);
          
          return {
            user: user.habbo_name,
            hotel: user.hotel,
            success: false,
            error: error.message
          };
        }
      });

      // Wait for current batch to complete before starting next
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to be respectful to the API
      if (i + batchSize < trackedUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const totalActivities = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.activities_created || 0), 0);

    console.log(`✅ [habbo-sync-batch] Batch sync completed: ${successCount} success, ${errorCount} errors, ${totalActivities} activities created`);

    return new Response(
      JSON.stringify({
        success: true,
        total_users: trackedUsers.length,
        successful_syncs: successCount,
        failed_syncs: errorCount,
        total_activities_created: totalActivities,
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ [habbo-sync-batch] Error:', error);
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
