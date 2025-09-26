import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HabboUserData {
  name: string
  uniqueId: string
  motto: string
  figureString: string
  hotel: string
}

// Função para buscar dados do Habbo na API oficial
async function getHabboData(username: string): Promise<HabboUserData | null> {
  const hotels = ['com.br', 'com', 'es', 'fr', 'de', 'it', 'nl', 'fi', 'tr']
  
  for (const hotel of hotels) {
    try {
      const response = await fetch(`https://www.habbo.${hotel}/api/public/users?name=${username}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data && data.name && data.uniqueId) {
          return {
            name: data.name,
            uniqueId: data.uniqueId,
            motto: data.motto || '',
            figureString: data.figureString || '',
            hotel: hotel === 'com.br' ? 'br' : hotel.replace('com', 'us')
          }
        }
      }
    } catch (error) {
      console.log(`Erro ao buscar ${username} no hotel ${hotel}:`, error)
      continue
    }
  }
  
  return null
}

// Função para gerar motto aleatória
function generateRandomMotto(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'HUB-'
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { habboName, motto, password } = await req.json()

    if (!habboName || !motto || !password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nome do Habbo, motto e senha são obrigatórios' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 1. Buscar dados reais do Habbo
    const habboData = await getHabboData(habboName)
    
    if (!habboData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não encontrado na API do Habbo' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 2. Verificar se a motto está correta
    if (habboData.motto !== motto) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Motto incorreta. Verifique se digitou corretamente.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 3. Verificar se conta já existe
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: existingUser } = await supabase
      .from('habbo_auth')
      .select('*')
      .eq('habbo_username', habboName)
      .single()

    if (existingUser) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Conta já existe. Use o login por senha.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 4. Criar conta na tabela habbo_auth
    const { data: newUser, error: insertError } = await supabase
      .from('habbo_auth')
      .insert({
        habbo_username: habboName,
        habbo_motto: habboData.motto,
        habbo_avatar: habboData.figureString,
        password_hash: password, // Em produção, usar hash
        is_admin: false,
        is_verified: true,
        last_login: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao criar usuário:', insertError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro interno ao criar conta' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 5. Retornar sucesso
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Conta criada com sucesso!',
        user: {
          id: newUser.id,
          habbo_username: newUser.habbo_username,
          habbo_motto: newUser.habbo_motto,
          is_admin: newUser.is_admin
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
