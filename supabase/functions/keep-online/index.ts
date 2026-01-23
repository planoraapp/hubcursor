// ========================================
// EDGE FUNCTION: Keep Online (Keep-Alive)
// ========================================
// Mantém o backend Supabase ativo com requisições periódicas
// Não atualiza status de usuários - apenas faz ping no sistema
// Útil para evitar que projetos gratuitos sejam pausados por inatividade

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Validar variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[KEEP ONLINE] Missing environment variables');
      return jsonResponse({ error: 'Configuração do servidor inválida' }, 500);
    }

    // Criar cliente com service_role para bypass de RLS
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fazer uma query simples no banco para manter o sistema ativo
    // Não precisa de parâmetros - apenas ping no sistema
    const { error } = await supabaseAdmin
      .from('habbo_accounts')
      .select('id')
      .limit(1);

    // Qualquer resposta (incluindo erro de tabela vazia) significa que o sistema está ativo
    // O importante é que a requisição foi processada pelo Supabase
    if (error && error.code !== 'PGRST116') { // PGRST116 = nenhuma linha retornada (OK para keep-alive)
      console.error('[KEEP ONLINE] Error pinging database:', error);
      // Mesmo com erro, retornamos sucesso se foi um erro de query (sistema está ativo)
      if (error.code && error.code.startsWith('PGRST')) {
        return jsonResponse({ 
          success: true, 
          message: 'Backend está ativo',
          note: 'Query executada com sucesso (erro esperado de tabela vazia)'
        }, 200);
      }
      return jsonResponse({ 
        error: 'Erro ao verificar sistema',
        details: error.message 
      }, 500);
    }

    return jsonResponse({ 
      success: true, 
      message: 'Backend está ativo',
      timestamp: new Date().toISOString()
    }, 200);

  } catch (error: any) {
    console.error('[KEEP ONLINE] Unexpected error:', error);
    return jsonResponse({ 
      error: error?.message || 'Erro interno do servidor'
    }, 500);
  }
});

