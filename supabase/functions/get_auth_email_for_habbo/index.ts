// ========================================
// EDGE FUNCTION: GET AUTH EMAIL FOR HABBO
// Substitui a função RPC que está faltando
// ========================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('🔍 [GET-AUTH-EMAIL] Getting auth email for Habbo...');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { habbo_name_param, hotel_param = 'br' } = await req.json();

    if (!habbo_name_param) {
      return new Response(JSON.stringify({ 
        error: 'habbo_name_param is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Buscar o email do usuário baseado no nome Habbo e hotel
    const { data, error } = await supabase
      .from('habbo_accounts')
      .select(`
        supabase_user_id,
        auth_users:supabase_user_id(email)
      `)
      .eq('habbo_name', habbo_name_param)
      .eq('hotel', hotel_param)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ 
        error: 'Conta não encontrada' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data.auth_users?.email || null), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ [GET-AUTH-EMAIL] Error:', error);
    
    return new Response(JSON.stringify({ 
      error: `Erro: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});