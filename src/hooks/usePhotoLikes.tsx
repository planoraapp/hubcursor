import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PhotoLike } from '@/types/habbo';

export const usePhotoLikes = (photoId: string) => {
  const { habboAccount } = useAuth();
  const queryClient = useQueryClient();

  // Get likes for a photo
  const { data: likes = [], isLoading: likesLoading } = useQuery({
    queryKey: ['photo-likes', photoId],
    queryFn: async (): Promise<PhotoLike[]> => {
      const { data, error } = await supabase
        .from('photo_likes')
        .select('id, user_id, habbo_name, created_at')
        .eq('photo_id', photoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!photoId,
  });

  // Check if current user liked the photo
  const userLiked = likes.some(like => like.user_id === habboAccount?.supabase_user_id);
  const likesCount = likes.length;

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!habboAccount?.supabase_user_id || !habboAccount?.habbo_name) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se já curtiu antes de tentar inserir
      const { data: existingLike } = await supabase
        .from('photo_likes')
        .select('id')
        .eq('photo_id', photoId)
        .eq('user_id', habboAccount.supabase_user_id)
        .single();

      if (existingLike) {
        // Já curtiu, não fazer nada
        return;
      }

      const { error } = await supabase
        .from('photo_likes')
        .insert({
          photo_id: photoId,
          user_id: habboAccount.supabase_user_id,
          habbo_name: habboAccount.habbo_name
        });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-likes', photoId] });
    },
    onError: (error: any) => {
      console.error('Erro ao curtir foto:', error);
      // Não mostrar toast de erro para duplicação
      if (!error.message?.includes('duplicate') && error.code !== '23505') {
        toast.error('Erro ao curtir foto');
      }
    }
  });

  // Unlike mutation
  const unlikeMutation = useMutation({
    mutationFn: async () => {
      if (!habboAccount?.supabase_user_id) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('photo_likes')
        .delete()
        .eq('photo_id', photoId)
        .eq('user_id', habboAccount.supabase_user_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-likes', photoId] });
      toast.success('Curtida removida');
    },
    onError: (error: any) => {
            toast.error('Erro ao remover curtida');
    }
  });

  const toggleLike = () => {
    if (userLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  return {
    likes,
    likesCount,
    userLiked,
    likesLoading,
    toggleLike,
    isToggling: likeMutation.isPending || unlikeMutation.isPending
  };
};