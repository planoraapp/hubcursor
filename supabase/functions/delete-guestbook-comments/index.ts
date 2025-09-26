import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    // Create a Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { home_owner_user_id, entry_id } = await req.json()

    if (!home_owner_user_id) {
      return new Response(
        JSON.stringify({ error: 'home_owner_user_id é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let query = supabase
      .from('guestbook_entries')
      .delete()

    // Se entry_id foi fornecido, deletar apenas essa entrada
    if (entry_id) {
      query = query.eq('id', entry_id)
    } else {
      // Caso contrário, deletar todas as entradas do home owner
      query = query.eq('home_owner_user_id', home_owner_user_id)
    }

    const { error } = await query

    if (error) {
      console.error('Erro ao deletar comentários:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao deletar comentários' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Comentários deletados com sucesso' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
