import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface UseFollowProfileProps {
  targetHabboId?: string;
  targetHabboName?: string;
}

export const useFollowProfile = ({ targetHabboId, targetHabboName }: UseFollowProfileProps = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is following target user
  const { data: isFollowing, isLoading: isCheckingFollow } = useQuery({
    queryKey: ['isFollowing', user?.id, targetHabboId],
    queryFn: async () => {
      if (!user?.id || !targetHabboId) return false;
      
      const { data, error } = await supabase
        .from('console_profile_follows')
        .select('id')
        .eq('follower_user_id', user.id)
        .eq('target_habbo_id', targetHabboId)
        .single();

      if (error && error.code !== 'PGRST116') {
                return false;
      }

      return !!data;
    },
    enabled: !!(user?.id && targetHabboId)
  });

  // Get followers count
  const { data: followersCount = 0 } = useQuery({
    queryKey: ['followersCount', targetHabboId],
    queryFn: async () => {
      if (!targetHabboId) return 0;
      
      const { count, error } = await supabase
        .from('console_profile_follows')
        .select('*', { count: 'exact', head: true })
        .eq('target_habbo_id', targetHabboId);

      if (error) {
                return 0;
      }

      return count || 0;
    },
    enabled: !!targetHabboId
  });

  // Get following count for current user
  const { data: followingCount = 0 } = useQuery({
    queryKey: ['followingCount', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count, error } = await supabase
        .from('console_profile_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_user_id', user.id);

      if (error) {
                return 0;
      }

      return count || 0;
    },
    enabled: !!user?.id
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !targetHabboId || !targetHabboName) {
        throw new Error('Missing required data to follow user');
      }

      // Get current user's habbo name
      const { data: habboAccount } = await supabase
        .from('habbo_accounts')
        .select('habbo_name')
        .eq('supabase_user_id', user.id)
        .single();

      if (!habboAccount) {
        throw new Error('User habbo account not found');
      }

      const { error } = await supabase
        .from('console_profile_follows')
        .insert({
          follower_user_id: user.id,
          follower_habbo_name: habboAccount.habbo_name,
          target_habbo_id: targetHabboId,
          target_habbo_name: targetHabboName
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['followersCount'] });
      queryClient.invalidateQueries({ queryKey: ['followingCount'] });
      toast.success(`Agora você está seguindo ${targetHabboName}!`);
    },
    onError: (error) => {
            toast.error('Erro ao seguir usuário');
    }
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !targetHabboId) {
        throw new Error('Missing required data to unfollow user');
      }

      const { error } = await supabase
        .from('console_profile_follows')
        .delete()
        .eq('follower_user_id', user.id)
        .eq('target_habbo_id', targetHabboId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['followersCount'] });
      queryClient.invalidateQueries({ queryKey: ['followingCount'] });
      toast.success(`Você parou de seguir ${targetHabboName}`);
    },
    onError: (error) => {
            toast.error('Erro ao deixar de seguir usuário');
    }
  });

  const handleToggleFollow = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return {
    isFollowing: isFollowing ?? false,
    isCheckingFollow,
    followersCount,
    followingCount,
    handleToggleFollow,
    isToggling: followMutation.isPending || unfollowMutation.isPending
  };
};