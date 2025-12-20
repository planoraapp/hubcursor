// ========================================
// EDGE FUNCTION: Photo Interactions
// ========================================
// Centraliza operações de likes e comentários com validação server-side
// Inclui rate limiting e logging de atividades

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitCheck {
  canProceed: boolean;
  error?: string;
  waitTime?: number;
}

// Configurações de rate limiting
const RATE_LIMITS = {
  like: {
    perPhoto: { count: 1, window: 10000 }, // 1 like por foto a cada 10 segundos
    perUser: { count: 50, window: 60000 }, // 50 likes por minuto total
  },
  comment: {
    perPhoto: { count: 3, window: 600000 }, // 3 comentários por foto a cada 10 minutos
    perUser: { count: 20, window: 60000 }, // 20 comentários por minuto total
    minInterval: 30000, // 30 segundos entre comentários na mesma foto
  },
};

/**
 * Verifica rate limiting para likes
 */
async function checkLikeRateLimit(
  supabase: any,
  userId: string,
  photoId: string
): Promise<RateLimitCheck> {
  const now = new Date();
  const tenSecondsAgo = new Date(now.getTime() - RATE_LIMITS.like.perPhoto.window);

  // Verificar likes recentes nesta foto
  const { data: recentLikes, error } = await supabase
    .from('photo_likes')
    .select('created_at')
    .eq('photo_id', photoId)
    .eq('user_id', userId)
    .gte('created_at', tenSecondsAgo.toISOString());

  if (error) {
    console.error('Error checking rate limit:', error);
    return { canProceed: true }; // Em caso de erro, permitir (fail open)
  }

  if (recentLikes && recentLikes.length > 0) {
    return {
      canProceed: false,
      error: 'Você já curtiu esta foto recentemente. Aguarde alguns segundos.',
      waitTime: RATE_LIMITS.like.perPhoto.window,
    };
  }

  return { canProceed: true };
}

/**
 * Verifica rate limiting para comentários
 */
async function checkCommentRateLimit(
  supabase: any,
  userId: string,
  photoId: string
): Promise<RateLimitCheck> {
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - RATE_LIMITS.comment.perPhoto.window);
  const thirtySecondsAgo = new Date(now.getTime() - RATE_LIMITS.comment.minInterval);

  // Verificar comentários recentes nesta foto (últimos 10 minutos)
  const { data: recentComments, error } = await supabase
    .from('photo_comments')
    .select('created_at')
    .eq('photo_id', photoId)
    .eq('user_id', userId)
    .gte('created_at', tenMinutesAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error checking comment rate limit:', error);
    return { canProceed: true };
  }

  // Verificar limite de comentários por foto (3 em 10 minutos)
  if (recentComments && recentComments.length >= RATE_LIMITS.comment.perPhoto.count) {
    return {
      canProceed: false,
      error: `Você atingiu o limite de ${RATE_LIMITS.comment.perPhoto.count} comentários nesta foto. Aguarde alguns minutos.`,
      waitTime: RATE_LIMITS.comment.perPhoto.window,
    };
  }

  // Verificar intervalo mínimo entre comentários (30 segundos)
  if (recentComments && recentComments.length > 0) {
    const lastComment = recentComments[0];
    const lastCommentTime = new Date(lastComment.created_at);
    if (lastCommentTime > thirtySecondsAgo) {
      const waitTime = RATE_LIMITS.comment.minInterval - (now.getTime() - lastCommentTime.getTime());
      return {
        canProceed: false,
        error: 'Aguarde 30 segundos entre comentários nesta foto.',
        waitTime,
      };
    }
  }

  return { canProceed: true };
}

// Helper para respostas JSON
const jsonResponse = (data: any, status = 200) => 
  new Response(JSON.stringify(data), { 
    status, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error: 'Não autorizado' }, 401);

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) return jsonResponse({ error: 'Token inválido' }, 401);

    const { action, photoId, habboName, habboHotel, commentText } = await req.json();
    if (!photoId || !habboName) return jsonResponse({ error: 'Parâmetros inválidos' }, 400);

    // Processar ação
    switch (action) {
      case 'like': {
        const rateLimitCheck = await checkLikeRateLimit(supabaseClient, user.id, photoId);
        if (!rateLimitCheck.canProceed) {
          return jsonResponse({ error: rateLimitCheck.error }, 429);
        }

        const { error: likeError } = await supabaseClient
          .from('photo_likes')
          .insert({ photo_id: photoId, user_id: user.id, habbo_name: habboName });

        // Se já existe (constraint UNIQUE), retornar sucesso silenciosamente
        if (likeError && likeError.code !== '23505') throw likeError;
        return jsonResponse({ success: true });
      }

      case 'unlike': {
        const { error } = await supabaseClient
          .from('photo_likes')
          .delete()
          .eq('photo_id', photoId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return jsonResponse({ success: true });
      }

      case 'comment': {
        const trimmedText = commentText?.trim() || '';
        if (!trimmedText) return jsonResponse({ error: 'Comentário não pode estar vazio' }, 400);
        if (trimmedText.length > 500) return jsonResponse({ error: 'Comentário muito longo (máximo 500 caracteres)' }, 400);

        const rateLimitCheck = await checkCommentRateLimit(supabaseClient, user.id, photoId);
        if (!rateLimitCheck.canProceed) return jsonResponse({ error: rateLimitCheck.error }, 429);

        const { data: comment, error: commentError } = await supabaseClient
          .from('photo_comments')
          .insert({ 
            photo_id: photoId, 
            user_id: user.id, 
            habbo_name: habboName, 
            hotel: habboHotel || 'br',
            comment_text: trimmedText 
          })
          .select()
          .single();

        if (commentError) throw commentError;
        return jsonResponse({ success: true, comment });
      }

      default:
        return jsonResponse({ error: 'Ação inválida' }, 400);
    }
  } catch (error: any) {
    console.error('Error in photo-interactions function:', error);
    return jsonResponse({ error: error.message || 'Erro interno do servidor' }, 500);
  }
});

