import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EnsureTrackedRequest {
  habbo_name: string;
  habbo_id: string;
  hotel: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      'https://wueccgeizznjmjgmuscy.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        db: { schema: 'public' }
      }
    );

    const { habbo_name, habbo_id, hotel }: EnsureTrackedRequest = await req.json();

    if (!habbo_name || !habbo_id || !hotel) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: habbo_name, habbo_id, hotel'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log(`🔄 [ensure-tracked] Ensuring ${habbo_name} (${habbo_id}) is tracked for hotel ${hotel}`);

    // First check if user is already tracked
    const { data: existingUser, error: checkError } = await supabase
      .from('tracked_habbo_users')
      .select('id, is_active')
      .eq('habbo_id', habbo_id)
      .eq('hotel', hotel)
      .maybeSingle();

    if (checkError) {
      console.error('❌ [ensure-tracked] Error checking existing user:', checkError);
      throw new Error(`Database check failed: ${checkError.message}`);
    }

    let result;

    if (existingUser) {
      // Update existing user if inactive
      if (!existingUser.is_active) {
        const { data: updateData, error: updateError } = await supabase
          .from('tracked_habbo_users')
          .update({
            habbo_name,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ [ensure-tracked] Error updating user:', updateError);
          throw new Error(`Update failed: ${updateError.message}`);
        }

        result = { action: 'reactivated', user: updateData };
        console.log(`✅ [ensure-tracked] Reactivated user ${habbo_name}`);
      } else {
        result = { action: 'already_tracked', user: existingUser };
        console.log(`ℹ️ [ensure-tracked] User ${habbo_name} already tracked and active`);
      }
    } else {
      // Insert new user
      const { data: insertData, error: insertError } = await supabase
        .from('tracked_habbo_users')
        .insert({
          habbo_name,
          habbo_id,
          hotel,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ [ensure-tracked] Error inserting user:', insertError);
        throw new Error(`Insert failed: ${insertError.message}`);
      }

      result = { action: 'added', user: insertData };
      console.log(`✅ [ensure-tracked] Added new tracked user ${habbo_name}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ [ensure-tracked] Error:', error);
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