import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { habboUsername, password } = await req.json()

    if (!habboUsername || !password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nome de usuário e senha são obrigatórios' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar usuário na tabela habbo_auth
    const { data: user, error: userError } = await supabase
      .from('habbo_auth')
      .select('*')
      .eq('habbo_username', habboUsername)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não encontrado' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar senha (em produção, usar bcrypt)
    if (user.password_hash !== password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Senha incorreta' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Atualizar último login
    await supabase
      .from('habbo_auth')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Retornar dados do usuário (sem senha)
    const { password_hash, ...userWithoutPassword } = user

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Login realizado com sucesso!',
        user: userWithoutPassword
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na função de login:', error)
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
