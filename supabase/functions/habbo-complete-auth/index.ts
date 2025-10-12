// Sistema de autenticação SEM auth.users (apenas habbo_accounts)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Hash SHA-256
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'habbohub-secure-salt-2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { db: { schema: 'public' } }
    )

    const { action, habbo_name, verification_code, password, hotel = 'br' } = await req.json()
    
    console.log(`[AUTH] Action: ${action}, User: ${habbo_name}`)

    // REGISTRO
    if (action === 'register' && habbo_name && verification_code && password) {
      // Buscar na API Habbo
      const hotelDomain = hotel === 'br' ? 'com.br' : hotel
      const habboResponse = await fetch(`https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(habbo_name)}`)
      
      if (!habboResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Usuário não encontrado no Habbo' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const habboData = await habboResponse.json()
      
      // Verificar código (formato HUB#XXXX)
      if (!habboData.motto?.includes(verification_code)) {
        return new Response(
          JSON.stringify({ error: 'Código não encontrado na missão' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Hash da senha
      const passwordHash = await hashPassword(password)

      // Verificar se existe
      const { data: existing } = await supabase
        .from('habbo_accounts')
        .select('*')
        .ilike('habbo_name', habbo_name)
        .limit(1)

      let result
      if (existing && existing.length > 0) {
        // RESET DE SENHA: Apenas atualizar a senha (usuário já existe)
        console.log(`[AUTH] Resetting password for existing account: ${existing[0].id}`)
        result = await supabase
          .from('habbo_accounts')
          .update({
            password_hash: passwordHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing[0].id)
          .select()
        
        console.log(`[AUTH] Password reset result:`, result.error ? 'ERROR' : 'SUCCESS')
        if (result.error) {
          console.error('[AUTH] Password reset error details:', JSON.stringify(result.error, null, 2))
        }
      } else {
        // NOVA CONTA: Criar conta completa
        console.log(`[AUTH] Creating new account`)
        const newAccount = {
          supabase_user_id: crypto.randomUUID(),
          habbo_name: habboData.name,
          habbo_id: `hhbr-${habboData.uniqueId}`,
          hotel,
          figure_string: habboData.figureString,
          motto: habboData.motto,
          password_hash: passwordHash,
          is_admin: false,
          is_online: false
        }
        
        console.log(`[AUTH] Insert data:`, JSON.stringify(newAccount, null, 2))
        
        result = await supabase
          .from('habbo_accounts')
          .insert(newAccount)
          .select()
        
        console.log(`[AUTH] Insert result:`, result.error ? 'ERROR' : 'SUCCESS')
        if (result.error) {
          console.error('[AUTH] Insert error details:', JSON.stringify(result.error, null, 2))
        }
      }

      if (result.error) {
        console.error('[AUTH] DB operation failed:', result.error.message)
        return new Response(
          JSON.stringify({ error: `Erro ao salvar conta: ${result.error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: (existing && existing.length > 0) ? 'Senha redefinida com sucesso!' : 'Conta criada com sucesso!',
          account: result.data[0]
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // LOGIN
    if (action === 'login' && habbo_name && password) {
      // Buscar conta
      const { data: accounts, error: searchError } = await supabase
        .from('habbo_accounts')
        .select('*')
        .ilike('habbo_name', habbo_name)
        .limit(1)

      if (searchError || !accounts || accounts.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Usuário não encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const account = accounts[0]

      // Sistema híbrido: verificar se tem password_hash OU tentar auth.users
      if (account.password_hash) {
        // Novo sistema: verificar hash
        const passwordHash = await hashPassword(password)
        
        if (account.password_hash !== passwordHash) {
          return new Response(
            JSON.stringify({ error: 'Senha incorreta' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } else {
        // Sistema legado: tentar auth.users (Beebop, habbohub, SkyFalls)
        console.log(`[AUTH] Using legacy auth.users for ${account.habbo_name}`)
        const hotelPrefix = account.hotel === 'br' ? 'hhbr' : `hh${account.hotel}`
        const email = `${hotelPrefix}-${account.habbo_name}@habbohub.com`
        
        console.log(`[AUTH] Trying email: ${email}`)
        
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (authError) {
          console.error(`[AUTH] Auth error for legacy user:`, authError)
          return new Response(
            JSON.stringify({ error: 'Senha incorreta (legacy)' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        console.log(`[AUTH] Legacy auth successful`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          account
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Ação inválida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[AUTH] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
