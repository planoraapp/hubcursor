import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useI18n } from '@/contexts/I18nContext';
import { checkMessageSpam } from '@/utils/spamFilter';
import { rateLimiter, RATE_LIMITS } from '@/utils/rateLimiter';

export const usePhotoComments = (photoId: string, photoOwnerName?: string) => {
  const { habboAccount } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  // Validar photoId antes de fazer query
  // Aceita qualquer string não vazia (pode ser UUID, número, ou outro formato)
  const isValidPhotoId = photoId && 
    typeof photoId === 'string' && 
    photoId.trim().length > 0 &&
    photoId.trim() !== 'undefined' &&
    photoId.trim() !== 'null';

  // Get comments for a photo
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['photo-comments', photoId],
    queryFn: async () => {
      if (!isValidPhotoId) {
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('photo_comments')
          .select('id, user_id, habbo_name, comment_text, created_at')
          .eq('photo_id', photoId.trim())
          .order('created_at', { ascending: true });

        if (error) {
          // Se for erro 400, pode ser que a tabela não tenha essa coluna ou RLS está bloqueando
          // Não fazer throw para não quebrar a UI, apenas logar
          if (error.code === 'PGRST116' || error.message?.includes('400')) {
            console.warn('[usePhotoComments] Erro ao buscar comentários (possível problema de schema ou RLS):', error.message);
            return [];
          }
          throw error;
        }
        return data || [];
      } catch (error: any) {
        // Tratar erros de forma silenciosa para não quebrar a UI
        console.warn('[usePhotoComments] Erro ao buscar comentários:', error?.message || error);
        return [];
      }
    },
    enabled: isValidPhotoId,
    retry: false, // Não tentar novamente se falhar (evita spam de requisições)
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  const commentsCount = comments.length;

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (commentText: string) => {
      if (!habboAccount?.supabase_user_id || !habboAccount?.habbo_name) {
        throw new Error('Usuário não autenticado');
      }

      if (!commentText.trim()) {
        throw new Error('Comentário não pode estar vazio');
      }

      const userId = habboAccount.supabase_user_id;

      // 1. Verificar filtros anti-spam
      const spamCheck = checkMessageSpam(userId, commentText);
      if (!spamCheck.isValid) {
        throw new Error(spamCheck.reason || 'Comentário bloqueado por filtro anti-spam.');
      }

      // 2. Verificar rate limit (5 comentários a cada 8 segundos)
      const limitKey = `photo_comment_${userId}`;
      const limitCheck = rateLimiter.checkLimit(limitKey, RATE_LIMITS.PHOTO_COMMENT);
      
      if (!limitCheck.allowed) {
        throw new Error(limitCheck.message || 'Você está comentando muito rápido.');
      }

      const { error } = await supabase
        .from('photo_comments')
        .insert({
          photo_id: photoId,
          user_id: userId,
          habbo_name: habboAccount.habbo_name,
          comment_text: commentText.trim()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-comments', photoId] });
      toast.success(t('toast.commentAdded'));
    },
    onError: (error: any) => {
      // Exibir mensagem de erro específica se disponível
      const errorMessage = error?.message || t('toast.commentAddError');
      toast.error(errorMessage);
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('photo_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-comments', photoId] });
      toast.success(t('toast.commentDeleted'));
    },
    onError: (error: any) => {
            toast.error(t('toast.commentDeleteError'));
    }
  });

  // Report comment mutation (prepare for future moderation system)
  const reportCommentMutation = useMutation({
    mutationFn: async ({ commentId, reason }: { commentId: string; reason?: string }) => {
      if (!habboAccount?.supabase_user_id || !habboAccount?.habbo_name) {
        throw new Error('Usuário não autenticado');
      }

      // For now, just log the report (can be enhanced later with comment_reports table)
            // Future: Insert into comment_reports table
      toast.success(t('toast.commentReported'));
    },
    onError: (error: any) => {
            toast.error(t('toast.commentReportError'));
    }
  });

  const addComment = (text: string) => {
    addCommentMutation.mutate(text);
  };

  const deleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  const reportComment = (commentId: string, reason?: string) => {
    reportCommentMutation.mutate({ commentId, reason });
  };

  // Get last 2 comments for preview
  const lastTwoComments = comments.slice(-2);

  // Check if current user can delete a comment (own comment or photo owner)
  const canDeleteComment = (comment: any) => {
    if (!habboAccount?.habbo_name) return false;
    
    // Pode deletar se for o autor do comentário
    const isCommentAuthor = comment.user_id === habboAccount.supabase_user_id || 
                           comment.habbo_name === habboAccount.habbo_name;
    
    // Pode deletar se for o dono da foto
    const isPhotoOwner = photoOwnerName && photoOwnerName === habboAccount.habbo_name;
    
    return isCommentAuthor || isPhotoOwner;
  };

  return {
    comments,
    commentsCount,
    lastTwoComments,
    commentsLoading,
    addComment,
    deleteComment,
    reportComment,
    canDeleteComment,
    isAddingComment: addCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    isReportingComment: reportCommentMutation.isPending
  };
};