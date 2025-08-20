import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const usePhotoComments = (photoId: string) => {
  const { habboAccount } = useAuth();
  const queryClient = useQueryClient();

  // Get comments for a photo
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['photo-comments', photoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photo_comments')
        .select('id, user_id, habbo_name, comment_text, created_at')
        .eq('photo_id', photoId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!photoId,
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

      const { error } = await supabase
        .from('photo_comments')
        .insert({
          photo_id: photoId,
          user_id: habboAccount.supabase_user_id,
          habbo_name: habboAccount.habbo_name,
          comment_text: commentText.trim()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-comments', photoId] });
      toast.success('Comentário adicionado!');
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    }
  });

  const addComment = (text: string) => {
    addCommentMutation.mutate(text);
  };

  // Get last 2 comments for preview
  const lastTwoComments = comments.slice(-2);

  return {
    comments,
    commentsCount,
    lastTwoComments,
    commentsLoading,
    addComment,
    isAddingComment: addCommentMutation.isPending
  };
};