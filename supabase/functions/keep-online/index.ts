// ========================================
// EDGE FUNCTION: Keep Online
// ========================================
// Atualiza o estado online do usuário enquanto ele está usando o site
// Usa service_role para bypass de RLS

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      console.error('[KEEP ONLINE] Error parsing JSON:', jsonError);
      return jsonResponse({ error: 'Erro ao processar requisição JSON' }, 400);
    }

    const { userId, user_id, isOnline } = body;

    // Suportar tanto userId quanto user_id para compatibilidade
    const actualUserId = userId || user_id;

    if (!actualUserId) {
      return jsonResponse({ error: 'userId é obrigatório' }, 400);
    }

    // Se isOnline não for fornecido, assumir true (comportamento padrão)
    const shouldBeOnline = isOnline !== undefined ? isOnline : true;

    console.log('[KEEP ONLINE] Updating online status for user:', actualUserId.substring(0, 8), 'isOnline:', shouldBeOnline);

    // Atualizar estado online
    const { error } = await supabaseAdmin
      .from('habbo_accounts')
      .update({ 
        is_online: shouldBeOnline, 
        updated_at: new Date().toISOString() 
      })
      .eq('supabase_user_id', actualUserId);

    if (error) {
      console.error('[KEEP ONLINE] Error updating online status:', error);
      return jsonResponse({ error: 'Erro ao atualizar estado online' }, 500);
    }

    return jsonResponse({ success: true }, 200);

  } catch (error: any) {
    console.error('[KEEP ONLINE] Unexpected error:', error);
    return jsonResponse({ 
      error: error?.message || 'Erro interno do servidor'
    }, 500);
  }
});

