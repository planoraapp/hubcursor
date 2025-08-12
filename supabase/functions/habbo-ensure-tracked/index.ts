import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface EnsureTrackedPayload {
  habbo_name: string;
  habbo_id: string;
  hotel: string; // e.g., 'com.br'
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

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    const body: EnsureTrackedPayload = await req.json();
    const { habbo_name, habbo_id, hotel } = body || {} as any;

    if (!habbo_name || !habbo_id || !hotel) {
      return new Response(JSON.stringify({ error: 'Missing habbo_name, habbo_id or hotel' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`🧭 [habbo-ensure-tracked] Ensuring tracking for ${habbo_name} (${hotel})`);

    // Check if already tracked
    const { data: existing, error: selError } = await supabase
      .from('tracked_habbo_users')
      .select('*')
      .eq('hotel', hotel)
      .eq('habbo_id', habbo_id)
      .limit(1);

    if (selError) {
      throw new Error(`Select error: ${selError.message}`);
    }

    let action: 'insert' | 'update' = 'insert';

    if (!existing || existing.length === 0) {
      const { error: insError } = await supabase.from('tracked_habbo_users').insert({
        habbo_name,
        habbo_id,
        hotel,
        is_active: true,
      });
      if (insError) throw new Error(`Insert error: ${insError.message}`);
      console.log('✅ [habbo-ensure-tracked] Inserted into tracked_habbo_users');
      action = 'insert';
    } else {
      const { error: updError } = await supabase
        .from('tracked_habbo_users')
        .update({ habbo_name, is_active: true, updated_at: new Date().toISOString() })
        .eq('id', existing[0].id);
      if (updError) throw new Error(`Update error: ${updError.message}`);
      console.log('✅ [habbo-ensure-tracked] Updated tracked_habbo_users');
      action = 'update';
    }

    // Trigger a user sync immediately
    console.log('🔄 [habbo-ensure-tracked] Invoking habbo-sync-user...');
    const { data: invokeData, error: invokeError } = await supabase.functions.invoke('habbo-sync-user', {
      body: { habbo_name, hotel },
    });

    if (invokeError) {
      console.error('❌ [habbo-ensure-tracked] Sync invoke error:', invokeError);
    } else {
      console.log('✅ [habbo-ensure-tracked] Sync invoked successfully');
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        sync: invokeError ? 'failed' : 'ok',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    console.error('❌ [habbo-ensure-tracked] Error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
