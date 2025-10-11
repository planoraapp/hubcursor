import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, habbo_name, background } = await req.json();

    // Create Supabase admin client with service_role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    if (action === 'update_background') {
      // Validate input
      if (!habbo_name || !background?.type || !background?.value) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required fields: habbo_name, background.type, background.value' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // 1. Get user's supabase_user_id from habbo_name (CASE-SENSITIVE!)
      const hotel = background?.hotel || 'com.br'; // Default para BR
      
      console.log('🔍 [Edge Function] Buscando:', { habbo_name, hotel });
      
      const { data: accountData, error: accountError } = await supabaseAdmin
        .from('habbo_accounts')
        .select('supabase_user_id, habbo_name, hotel')
        .eq('habbo_name', habbo_name)  // CASE-SENSITIVE (nomes Habbo são case-sensitive!)
        .eq('hotel', hotel)
        .maybeSingle();

      if (accountError || !accountData) {
        console.error('Error fetching account:', accountError);
        return new Response(
          JSON.stringify({ 
            error: 'User not found',
            details: accountError?.message 
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // 2. Upsert background (bypass RLS with service_role)
      const { data: backgroundData, error: backgroundError } = await supabaseAdmin
        .from('user_home_backgrounds')
        .upsert({
          user_id: accountData.supabase_user_id,
          background_type: background.type,
          background_value: background.value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (backgroundError) {
        console.error('Error saving background:', backgroundError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to save background',
            details: backgroundError.message 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`✅ Background saved for ${habbo_name}:`, background);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Background saved successfully',
          data: backgroundData 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Unknown action
    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in sync-home-assets:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

