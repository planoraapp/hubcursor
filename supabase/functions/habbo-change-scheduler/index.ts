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
    console.log('[CHANGE SCHEDULER] Starting automated change detection');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get active users from different sources
    const activeUsers = await getActiveUsers(supabase);
    
    if (activeUsers.length === 0) {
      console.log('[CHANGE SCHEDULER] No active users found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No active users to process',
        processed: 0 
      }), { headers: corsHeaders });
    }

    console.log(`[CHANGE SCHEDULER] Processing ${activeUsers.length} active users`);

    // Process users in batches to avoid overwhelming the APIs
    const batchSize = 5;
    let totalProcessed = 0;
    let totalChangesDetected = 0;

    for (let i = 0; i < activeUsers.length; i += batchSize) {
      const batch = activeUsers.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (user) => {
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
              hotel: user.hotel
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              console.log(`[CHANGE SCHEDULER] Processed ${user.habbo_name}: ${result.changes_detected} changes`);
              return result.changes_detected || 0;
            }
          }
          return 0;
        } catch (error) {
          console.error(`[CHANGE SCHEDULER] Error processing ${user.habbo_name}:`, error);
          return 0;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const batchChanges = batchResults.reduce((sum, changes) => sum + changes, 0);
      
      totalProcessed += batch.length;
      totalChangesDetected += batchChanges;

      console.log(`[CHANGE SCHEDULER] Batch ${Math.floor(i / batchSize) + 1}: processed ${batch.length}, detected ${batchChanges} changes`);

      // Small delay between batches
      if (i + batchSize < activeUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Cleanup old snapshots
    await supabase.rpc('cleanup_old_snapshots');

    console.log(`[CHANGE SCHEDULER] Completed: ${totalProcessed} users processed, ${totalChangesDetected} changes detected`);

    return new Response(JSON.stringify({
      success: true,
      processed: totalProcessed,
      changes_detected: totalChangesDetected,
      timestamp: new Date().toISOString()
    }), { headers: corsHeaders });

  } catch (error) {
    console.error('[CHANGE SCHEDULER] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});

async function getActiveUsers(supabase: any) {
  const users = [];
  
  // 1. Get recently discovered online users
  const { data: discoveredUsers } = await supabase
    .from('discovered_users')
    .select('habbo_name, habbo_id, hotel')
    .eq('is_online', true)
    .gte('last_seen_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // Last 2 hours
    .limit(20);

  if (discoveredUsers) {
    users.push(...discoveredUsers.map((user: any) => ({
      habbo_name: user.habbo_name,
      habbo_id: user.habbo_id,
      hotel: user.hotel === 'br' ? 'com.br' : user.hotel
    })));
  }

  // 2. Get users from habbo_accounts (registered users)
  const { data: registeredUsers } = await supabase
    .from('habbo_accounts')
    .select('habbo_name, habbo_id, hotel')
    .limit(10);

  if (registeredUsers) {
    users.push(...registeredUsers.map((user: any) => ({
      habbo_name: user.habbo_name,
      habbo_id: user.habbo_id,
      hotel: user.hotel === 'br' ? 'com.br' : user.hotel
    })));
  }

  // 3. Get users who had recent activities
  const { data: recentActivityUsers } = await supabase
    .from('detected_changes')
    .select('habbo_name, habbo_id, hotel')
    .gte('detected_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()) // Last 6 hours
    .limit(15);

  if (recentActivityUsers) {
    users.push(...recentActivityUsers);
  }

  // Remove duplicates based on habbo_id
  const uniqueUsers = users.filter((user, index, self) => 
    index === self.findIndex(u => u.habbo_id === user.habbo_id)
  );

  console.log(`[CHANGE SCHEDULER] Found ${uniqueUsers.length} unique active users`);
  
  return uniqueUsers.slice(0, 25); // Limit to 25 users per run to avoid timeout
}