// ========================================
// EDGE FUNCTION: Chat Messages
// ========================================
// Centraliza operações de envio de mensagens com validação server-side
// Usa service_role para bypass de RLS já que o sistema usa autenticação customizada

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
      console.error('[CHAT] Missing environment variables');
      return jsonResponse({ 
        error: 'Configuração do servidor inválida',
        success: false
      }, 500);
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
      console.error('[CHAT] Error parsing JSON:', jsonError);
      return jsonResponse({ 
        error: 'Erro ao processar requisição JSON',
        success: false
      }, 400);
    }

    const { action, sender_id, receiver_id, message, user_id } = body;
    console.log('[CHAT] Request:', { action, sender_id: sender_id?.substring(0, 8), receiver_id: receiver_id?.substring(0, 8), hasMessage: !!message });

    // Buscar mensagens de uma conversa específica
    if (action === 'fetch' && user_id && receiver_id) {
      const { data: messages, error } = await supabaseAdmin
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${user_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${user_id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[CHAT] Error fetching messages:', error);
        return jsonResponse({ 
          error: 'Erro ao buscar mensagens',
          success: false,
          details: error.message
        }, 500);
      }

      // Marcar mensagens como lidas
      await supabaseAdmin
        .from('chat_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('receiver_id', user_id)
        .eq('sender_id', receiver_id)
        .is('read_at', null);

      return jsonResponse({ success: true, messages: messages || [] }, 200);
    }

    // Buscar todas as conversas do usuário
    if (action === 'conversations' && user_id) {
      const { data: messagesData, error } = await supabaseAdmin
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[CHAT] Error fetching conversations:', error);
        return jsonResponse({ 
          error: 'Erro ao buscar conversas',
          success: false,
          details: error.message
        }, 500);
      }

      return jsonResponse({ success: true, messages: messagesData || [] }, 200);
    }

    // Enviar mensagem (POST) - ação padrão quando não há action especificada
    if (!sender_id || !receiver_id || !message) {
      return jsonResponse({ 
        error: 'Parâmetros inválidos: sender_id, receiver_id e message são obrigatórios',
        success: false
      }, 400);
    }

    const trimmedMessage = (message as string).trim();
    if (!trimmedMessage) {
      return jsonResponse({ 
        error: 'Mensagem não pode estar vazia',
        success: false
      }, 400);
    }

    if (trimmedMessage.length > 500) {
      return jsonResponse({ 
        error: 'Mensagem muito longa (máximo 500 caracteres)',
        success: false
      }, 400);
    }

    console.log('[CHAT] Attempting to insert message:', { 
      sender_id: sender_id.substring(0, 8) + '...', 
      receiver_id: receiver_id.substring(0, 8) + '...',
      messageLength: trimmedMessage.length 
    });

    // Inserir mensagem
    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        sender_id: sender_id as string,
        receiver_id: receiver_id as string,
        message: trimmedMessage,
      })
      .select();

    if (insertError) {
      console.error('[CHAT] Insert error:', insertError);
      console.error('[CHAT] Error code:', insertError.code);
      console.error('[CHAT] Error message:', insertError.message);
      console.error('[CHAT] Error details:', JSON.stringify(insertError, null, 2));
      
      return jsonResponse({ 
        error: 'Erro ao enviar mensagem',
        success: false,
        code: insertError.code,
        details: insertError.message,
        hint: insertError.hint || null
      }, 500);
    }

    if (!insertedData || insertedData.length === 0) {
      console.error('[CHAT] No data returned from insert');
      return jsonResponse({ 
        error: 'Mensagem não foi retornada após inserção',
        success: false
      }, 500);
    }

    const newMessage = insertedData[0];
    console.log('[CHAT] Message inserted successfully:', newMessage.id);
    
    return jsonResponse({ 
      success: true, 
      message: newMessage 
    }, 200);

  } catch (error: any) {
    console.error('[CHAT] Unexpected error:', error);
    console.error('[CHAT] Error name:', error?.name);
    console.error('[CHAT] Error message:', error?.message);
    console.error('[CHAT] Error stack:', error?.stack);
    
    return jsonResponse({ 
      error: error?.message || 'Erro interno do servidor',
      success: false,
      details: error?.toString?.() || String(error),
      type: error?.name || 'UnknownError'
    }, 500);
  }
});
