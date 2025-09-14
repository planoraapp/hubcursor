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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🚀 [CREATE-HABBOHUB] Iniciando criação automática da conta habbohub...')

    // Verificar se a conta já existe
    const { data: existingAccount, error: checkError } = await supabaseClient
      .from('habbo_accounts')
      .select('habbo_name, is_admin')
      .eq('habbo_name', 'habbohub')
      .eq('hotel', 'br')
      .single()

    if (existingAccount && !checkError) {
      console.log('✅ [CREATE-HABBOHUB] Conta habbohub já existe!')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Conta habbohub já existe',
          account: existingAccount
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Criar conta habbohub
    const { data: newAccount, error: createError } = await supabaseClient
      .from('habbo_accounts')
      .insert({
        habbo_name: 'habbohub',
        hotel: 'br',
        figure_string: 'hd-180-1.ch-255-66.lg-280-110.sh-290-62.ha-1012-110.hr-100-61',
        motto: 'Sistema HabboHub - Administrador',
        is_admin: true,
        is_online: false
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ [CREATE-HABBOHUB] Erro ao criar conta:', createError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erro ao criar conta habbohub: ' + createError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    console.log('✅ [CREATE-HABBOHUB] Conta habbohub criada com sucesso!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Conta habbohub criada com sucesso',
        account: newAccount,
        credentials: {
          username: 'habbohub',
          password: '151092',
          hotel: 'br',
          is_admin: true
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ [CREATE-HABBOHUB] Erro geral:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro interno: ' + error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
