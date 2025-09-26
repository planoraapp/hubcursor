import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        db: { schema: 'public' }
      }
    )

    const { habbo_name, verification_code, new_password, hotel = 'br' } = await req.json()
    
    if (!habbo_name || !verification_code || !new_password) {
      return new Response(
        JSON.stringify({ error: 'habbo_name, verification_code e new_password são obrigatórios' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Processing auto-registration for ${habbo_name} from hotel ${hotel}`)

    // 1. Verificar se o usuário existe no Habbo Hotel
    const hotelDomain = hotel === 'br' ? 'com.br' : hotel
    const habboApiUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(habbo_name)}`
    console.log(`Fetching Habbo data from: ${habboApiUrl}`)
    
    const habboResponse = await fetch(habboApiUrl)
    
    if (!habboResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado no Habbo Hotel' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const habboData = await habboResponse.json()
    console.log(`Habbo data retrieved: ${habboData.name} - ${habboData.motto}`)

    // 2. Verificar se o código de verificação está na missão
    if (!habboData.motto || !habboData.motto.includes(verification_code)) {
      return new Response(
        JSON.stringify({ error: `Código ${verification_code} não encontrado na sua missão. Altere sua missão no Habbo para incluir: ${verification_code}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 3. Verificar se usuário já existe
    const { data: existingAccount } = await supabase
      .from('habbo_accounts')
      .select('*')
      .eq('habbo_name', habbo_name)
      .single()

    if (existingAccount) {
      return new Response(
        JSON.stringify({ error: 'Usuário já cadastrado. Use a opção de login.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 4. Criar usuário auth
    const email = `${habboData.uniqueId}@habbohub.com`
    console.log(`Creating auth user with email: ${email}`)
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: new_password,
      email_confirm: true,
      user_metadata: {
        habbo_name: habbo_name,
        hotel: hotel
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar usuário de autenticação' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Auth user created: ${authUser.user.id}`)

    // 5. Criar conta habbo_accounts
    const { data: habboAccount, error: accountError } = await supabase
      .from('habbo_accounts')
      .insert({
        supabase_user_id: authUser.user.id,
        habbo_name: habboData.name,
        habbo_id: habboData.uniqueId,
        hotel: hotel,
        figure_string: habboData.figureString,
        motto: habboData.motto,
        member_since: habboData.memberSince,
        current_level: habboData.currentLevel || 1,
        total_experience: habboData.totalExperience || 0,
        star_gem_count: habboData.starGemCount || 0,
        selected_badges: habboData.selectedBadges || [],
        is_admin: false,
        is_online: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (accountError) {
      console.error('Error creating habbo account:', accountError)
      // Tentar deletar o usuário auth se a conta falhou
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar conta do usuário' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Habbo account created: ${habboAccount.id}`)

    // 6. Criar dados básicos da home
    const { error: layoutError } = await supabase
      .from('user_home_layouts')
      .insert({
        habbo_name: habboData.name,
        layout_data: {
          widgets: [],
          background: {
            type: 'default',
            value: 'bghabbohub'
          }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (layoutError) {
      console.warn('Warning: Could not create home layout:', layoutError.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Conta criada com sucesso! Agora você pode fazer login com o nome "${habbo_name}" e a senha escolhida.`,
        user: {
          habbo_name: habboData.name,
          hotel: hotel,
          figure_string: habboData.figureString,
          motto: habboData.motto
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in auto-register-via-motto:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
