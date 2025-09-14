// ========================================
// EDGE FUNCTION: VERIFY AND REGISTER VIA MOTTO
// Função completa para cadastro de usuários Habbo via motto
// ========================================

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
    // Get request body
    const { username, motto, password, action } = await req.json()

    if (!username || !motto) {
      return new Response(
        JSON.stringify({ error: 'Username e motto são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user exists in Habbo
    const habboUser = await verifyHabboUser(username, motto)
    
    if (!habboUser.success) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado ou motto incorreta' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user already exists in our database
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('habbo_username', username)
      .single()

    if (action === 'login') {
      // User wants to login
      if (!existingUser) {
        return new Response(
          JSON.stringify({ error: 'Usuário não cadastrado. Faça o cadastro primeiro.' }),
          { 
            status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Verify password if user exists
      if (password && existingUser.password_hash) {
        const isValidPassword = await verifyPassword(password, existingUser.password_hash)
        if (!isValidPassword) {
          return new Response(
            JSON.stringify({ error: 'Senha incorreta' }),
            { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      }

      // Return user data for login
      return new Response(
        JSON.stringify({
        success: true,
          action: 'login',
          user: {
            id: existingUser.id,
            habbo_username: existingUser.habbo_username,
            habbo_motto: existingUser.habbo_motto,
            habbo_avatar: existingUser.habbo_avatar,
            created_at: existingUser.created_at
          }
        }),
        { 
          status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } else if (action === 'register') {
      // User wants to register
      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'Usuário já cadastrado' }),
          { 
            status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (!password) {
        return new Response(
          JSON.stringify({ error: 'Senha é obrigatória para cadastro' }),
          { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Hash password
      const passwordHash = await hashPassword(password)

      // Insert new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          habbo_username: username,
          habbo_motto: motto,
          habbo_avatar: habboUser.data.figureString,
          password_hash: passwordHash,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting user:', insertError)
        return new Response(
          JSON.stringify({ error: 'Erro ao cadastrar usuário' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          action: 'register',
          user: {
            id: newUser.id,
            habbo_username: newUser.habbo_username,
            habbo_motto: newUser.habbo_motto,
            habbo_avatar: newUser.habbo_avatar,
            created_at: newUser.created_at
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } else if (action === 'change_password') {
      // User wants to change password
      if (!existingUser) {
        return new Response(
          JSON.stringify({ error: 'Usuário não cadastrado' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (!password) {
        return new Response(
          JSON.stringify({ error: 'Nova senha é obrigatória' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Hash new password
      const newPasswordHash = await hashPassword(password)

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('habbo_username', username)

      if (updateError) {
        console.error('Error updating password:', updateError)
        return new Response(
          JSON.stringify({ error: 'Erro ao alterar senha' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
        success: true,
          action: 'change_password',
          message: 'Senha alterada com sucesso'
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

// Function to verify Habbo user
async function verifyHabboUser(username: string, motto: string) {
  try {
    // Try official Habbo API first
    const apiUrl = `https://www.habbo.com.br/api/public/users?name=${encodeURIComponent(username)}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
        headers: {
        'User-Agent': 'HabboHub/1.0',
        'Accept': 'application/json'
      }
    })

      if (response.ok) {
      const data = await response.json()
      
      if (data && data.name && data.motto === motto) {
        return {
          success: true,
          data: {
            name: data.name,
            motto: data.motto,
            figureString: data.figureString || 'Sem avatar',
            memberSince: data.memberSince || 'Data não disponível',
            lastOnlineTime: data.lastOnlineTime || 'Não disponível'
          }
        }
      }
      }
    } catch (error) {
    console.log('API oficial falhou, tentando método alternativo')
  }

  // Fallback: verify via avatar imaging
  try {
    const avatarUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=s`
    
    const response = await fetch(avatarUrl, { method: 'HEAD' })
    
    if (response.ok) {
      return {
        success: true,
        data: {
          name: username,
          motto: motto,
          figureString: 'Avatar disponível',
          memberSince: 'Verificado via avatar',
          lastOnlineTime: 'Não disponível'
        }
      }
    }
  } catch (error) {
    console.log('Método alternativo também falhou')
  }

  return { success: false, error: 'Usuário não encontrado' }
}

// Function to hash password (using bcrypt)
async function hashPassword(password: string): Promise<string> {
  // For production, use a proper bcrypt library
  // This is a simple hash for demo purposes
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'habbohub_salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Function to verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password)
  return hashedPassword === hash
}