// ========================================
// EDGE FUNCTION: HABBO HUB LOGIN SYSTEM
// Sistema de login por código HUB-XXXXX
// ========================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Configuração dos hotéis suportados
const HOTELS_CONFIG = {
  'br': { domain: 'com.br', name: 'Brasil', apiUrl: 'https://www.habbo.com.br/api/public/users' },
  'us': { domain: 'com', name: 'Estados Unidos', apiUrl: 'https://www.habbo.com/api/public/users' },
  'es': { domain: 'es', name: 'Espanha', apiUrl: 'https://www.habbo.es/api/public/users' },
  'fr': { domain: 'fr', name: 'França', apiUrl: 'https://www.habbo.fr/api/public/users' },
  'de': { domain: 'de', name: 'Alemanha', apiUrl: 'https://www.habbo.de/api/public/users' },
  'it': { domain: 'it', name: 'Itália', apiUrl: 'https://www.habbo.it/api/public/users' },
  'nl': { domain: 'nl', name: 'Holanda', apiUrl: 'https://www.habbo.nl/api/public/users' },
  'tr': { domain: 'com.tr', name: 'Turquia', apiUrl: 'https://www.habbo.com.tr/api/public/users' },
  'fi': { domain: 'fi', name: 'Finlândia', apiUrl: 'https://www.habbo.fi/api/public/users' }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, username, hotel, verificationCode, password } = await req.json()

    if (!action || !username) {
      return new Response(
        JSON.stringify({ error: 'Ação e nome de usuário são obrigatórios' }),
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

    if (action === 'generate_code') {
      // Gerar código de verificação HUB-XXXXX
      const code = generateVerificationCode()
      
      // Limpar códigos expirados primeiro
      await supabase.rpc('cleanup_expired_codes')
      
      // Salvar código temporário no banco (expira em 10 minutos)
      const { error } = await supabase
        .from('verification_codes')
        .insert({
          username: username.toLowerCase(),
          hotel: hotel || 'br',
          code: code,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
        })

      if (error) {
        console.error('Error saving verification code:', error)
        return new Response(
          JSON.stringify({ error: 'Erro ao gerar código' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          code: code,
          message: 'Código gerado com sucesso. Coloque-o em sua motto no Habbo.'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } else if (action === 'verify_code') {
      // Verificar código na motto do usuário
      if (!verificationCode || !hotel) {
        return new Response(
          JSON.stringify({ error: 'Código de verificação e hotel são obrigatórios' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Verificar se código existe e não expirou
      const { data: codeData, error: codeError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('username', username.toLowerCase())
        .eq('hotel', hotel)
        .eq('code', verificationCode)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (codeError || !codeData) {
        return new Response(
          JSON.stringify({ error: 'Código inválido ou expirado' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Verificar se usuário existe no Habbo e se a motto contém o código
      const habboUser = await verifyHabboUserWithMotto(username, verificationCode, hotel)
      
      if (!habboUser.success) {
        return new Response(
          JSON.stringify({ error: 'Usuário não encontrado ou código não encontrado na motto' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Remover código usado
      await supabase
        .from('verification_codes')
        .delete()
        .eq('id', codeData.id)

      // Verificar se usuário já tem conta
      const { data: existingUser } = await supabase
        .from('hub_users')
        .select('*')
        .eq('habbo_username', username.toLowerCase())
        .eq('hotel', hotel)
        .single()

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            habbo_username: habboUser.data.name,
            habbo_avatar: habboUser.data.figureString,
            hotel: hotel,
            member_since: habboUser.data.memberSince
          },
          hasAccount: !!existingUser,
          message: existingUser ? 'Usuário verificado. Faça login com sua senha.' : 'Usuário verificado. Crie uma senha para sua conta.'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } else if (action === 'register') {
      // Registrar usuário com senha
      if (!password || !hotel) {
        return new Response(
          JSON.stringify({ error: 'Senha e hotel são obrigatórios' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (password.length < 6) {
        return new Response(
          JSON.stringify({ error: 'Senha deve ter pelo menos 6 caracteres' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Verificar se usuário já existe
      const { data: existingUser } = await supabase
        .from('hub_users')
        .select('*')
        .eq('habbo_username', username.toLowerCase())
        .eq('hotel', hotel)
        .single()

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'Usuário já possui conta. Use a opção de login.' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Hash da senha
      const passwordHash = await hashPassword(password)

      // Obter dados do usuário do Habbo
      const habboUser = await getHabboUserData(username, hotel)
      
      // Criar usuário
      const { data: newUser, error: insertError } = await supabase
        .from('hub_users')
        .insert({
          habbo_username: username.toLowerCase(),
          hotel: hotel,
          habbo_avatar: habboUser?.figureString || null,
          password_hash: passwordHash,
          member_since: habboUser?.memberSince || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating user:', insertError)
        return new Response(
          JSON.stringify({ error: 'Erro ao criar conta' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: newUser.id,
            habbo_username: newUser.habbo_username,
            hotel: newUser.hotel,
            habbo_avatar: newUser.habbo_avatar,
            created_at: newUser.created_at
          },
          message: 'Conta criada com sucesso!'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } else if (action === 'login') {
      // Login com senha
      if (!password || !hotel) {
        return new Response(
          JSON.stringify({ error: 'Senha e hotel são obrigatórios' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Buscar usuário
      const { data: user, error: userError } = await supabase
        .from('hub_users')
        .select('*')
        .eq('habbo_username', username.toLowerCase())
        .eq('hotel', hotel)
        .eq('is_active', true)
        .single()

      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Usuário não encontrado' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Verificar senha
      const isValidPassword = await verifyPassword(password, user.password_hash)
      if (!isValidPassword) {
        return new Response(
          JSON.stringify({ error: 'Senha incorreta' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Criar sessão
      const sessionToken = generateSessionToken()
      const { error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
        })

      if (sessionError) {
        console.error('Error creating session:', sessionError)
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: user.id,
            habbo_username: user.habbo_username,
            hotel: user.hotel,
            habbo_avatar: user.habbo_avatar,
            created_at: user.created_at
          },
          sessionToken: sessionToken,
          message: 'Login realizado com sucesso!'
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

// Gerar código de verificação HUB-XXXXX
function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'HUB-'
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Gerar token de sessão
function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Verificar usuário do Habbo e se a motto contém o código
async function verifyHabboUserWithMotto(username: string, code: string, hotel: string) {
  try {
    const hotelConfig = HOTELS_CONFIG[hotel as keyof typeof HOTELS_CONFIG]
    if (!hotelConfig) {
      return { success: false, error: 'Hotel não suportado' }
    }

    const apiUrl = `${hotelConfig.apiUrl}?name=${encodeURIComponent(username)}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'HabboHub/1.0',
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data && data.name && data.motto && data.motto.includes(code)) {
        return {
          success: true,
          data: {
            name: data.name,
            motto: data.motto,
            figureString: data.figureString || null,
            memberSince: data.memberSince || null
          }
        }
      }
    }
  } catch (error) {
    console.log('Erro ao verificar usuário via API oficial:', error)
  }

  return { success: false, error: 'Usuário não encontrado ou código não encontrado na motto' }
}

// Obter dados do usuário do Habbo
async function getHabboUserData(username: string, hotel: string) {
  try {
    const hotelConfig = HOTELS_CONFIG[hotel as keyof typeof HOTELS_CONFIG]
    if (!hotelConfig) return null

    const apiUrl = `${hotelConfig.apiUrl}?name=${encodeURIComponent(username)}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'HabboHub/1.0',
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        figureString: data.figureString || null,
        memberSince: data.memberSince || null
      }
    }
  } catch (error) {
    console.log('Erro ao obter dados do usuário:', error)
  }

  return null
}

// Hash da senha
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'habbohub_salt_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Verificar senha
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password)
  return hashedPassword === hash
}