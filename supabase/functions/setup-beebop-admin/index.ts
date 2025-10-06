import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { action } = await req.json()

    if (action === 'create_beebop_account') {
      // 1. Limpar conta existente se houver
      console.log('🧹 [EDGE-FUNCTION] Limpando conta Beebop existente...');
      const { error: deleteError } = await supabase
        .from('habbo_accounts')
        .delete()
        .eq('habbo_name', 'Beebop')
        .eq('hotel', 'br');

      if (deleteError) {
        console.log('⚠️ [EDGE-FUNCTION] Erro ao limpar conta (pode não existir):', deleteError.message);
      } else {
        console.log('✅ [EDGE-FUNCTION] Conta Beebop limpa com sucesso!');
      }

      // 2. Inserir nova conta
      const accountData = {
        habbo_name: 'Beebop',
        hotel: 'br',
        habbo_id: 'hhbr-00e6988dddeb5a1838658c854d62fe49',
        figure_string: 'hr-155-45.hd-208-10.ch-4165-91-1408.lg-4167-91.sh-3068-1408-90.ea-3169-92.fa-1206-90.ca-1804-1326',
        motto: 'HUB-ACTI1',
        is_admin: false,
        is_online: false,
        supabase_user_id: '00000000-0000-0000-0000-000000000002'
      };

      const { data: newAccount, error: createError } = await supabase
        .from('habbo_accounts')
        .insert(accountData)
        .select()
        .single();

      if (createError) {
        return new Response(
          JSON.stringify({ error: `Erro ao criar conta Beebop: ${createError.message}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('✅ [EDGE-FUNCTION] Conta Beebop criada com sucesso!');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Conta Beebop criada com sucesso!',
          account: newAccount
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action === 'create_beebop_background') {
      // 1. Limpar background existente se houver
      console.log('🧹 [EDGE-FUNCTION] Limpando background Beebop existente...');
      const { error: deleteError } = await supabase
        .from('user_home_backgrounds')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000002');

      if (deleteError) {
        console.log('⚠️ [EDGE-FUNCTION] Erro ao limpar background (pode não existir):', deleteError.message);
      } else {
        console.log('✅ [EDGE-FUNCTION] Background Beebop limpo com sucesso!');
      }

      // 2. Inserir o novo background
      const backgroundData = {
        user_id: '00000000-0000-0000-0000-000000000002',
        background_type: 'image',
        background_value: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/backgroundshome/bg_bathroom_tile.gif',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newBackground, error: createError } = await supabase
        .from('user_home_backgrounds')
        .insert(backgroundData)
        .select()
        .single();

      if (createError) {
        return new Response(
          JSON.stringify({ error: `Erro ao criar background Beebop: ${createError.message}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('✅ [EDGE-FUNCTION] Background Beebop criado com sucesso!');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Background Beebop criado com sucesso!',
          background: newBackground
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Ação inválida' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
