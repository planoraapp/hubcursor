import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
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

    const { action, user_id, habbo_name, hotel, photo_id, is_hidden } = await req.json();

    // Validação básica
    if (!user_id || !habbo_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, habbo_name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // photo_id é obrigatório apenas para upsert e delete
    if ((action === 'upsert' || action === 'delete') && !photo_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: photo_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'upsert') {
      // Inserir ou atualizar preferência
      const { data, error } = await supabaseAdmin
        .from('user_photo_preferences')
        .upsert({
          user_id,
          habbo_name,
          hotel: hotel || 'br',
          photo_id,
          is_hidden: is_hidden !== undefined ? is_hidden : true
        }, {
          onConflict: 'user_id,photo_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar preferência:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'delete') {
      // Remover preferência
      const { error } = await supabaseAdmin
        .from('user_photo_preferences')
        .delete()
        .eq('user_id', user_id)
        .eq('photo_id', photo_id);

      if (error) {
        console.error('Erro ao remover preferência:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'get') {
      // Buscar preferências do usuário
      const { data, error } = await supabaseAdmin
        .from('user_photo_preferences')
        .select('photo_id')
        .eq('user_id', user_id)
        .eq('habbo_name', habbo_name)
        .eq('hotel', hotel || 'br')
        .eq('is_hidden', true);

      if (error) {
        console.error('Erro ao buscar preferências:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: data || [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use: upsert, delete, or get' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Erro na Edge Function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
