
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followService } from '@/services/followService';
import { useAuth } from './useAuth';

interface UseFollowSystemProps {
  targetHabboId?: string;
  targetHabboName?: string;
}

export const useFollowSystem = ({ targetHabboId, targetHabboName }: UseFollowSystemProps = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is following target user
  const { data: isFollowing, isLoading: isCheckingFollow } = useQuery({
    queryKey: ['isFollowing', user?.id, targetHabboId],
    queryFn: () => {
      if (!user?.id || !targetHabboId) return false;
      return followService.isFollowing(user.id, targetHabboId);
    },
    enabled: !!(user?.id && targetHabboId)
  });

  // Get followers count
  const { data: followersCount = 0 } = useQuery({
    queryKey: ['followersCount', targetHabboId],
    queryFn: () => {
      if (!targetHabboId) return 0;
      return followService.getFollowersCount(targetHabboId);
    },
    enabled: !!targetHabboId
  });

  // Get following count
  const { data: followingCount = 0 } = useQuery({
    queryKey: ['followingCount', user?.id],
    queryFn: () => {
      if (!user?.id) return 0;
      return followService.getFollowingCount(user.id);
    },
    enabled: !!user?.id
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async ({ habboId, habboName, followerHabboName }: { 
      habboId: string; 
      habboName: string; 
      followerHabboName: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return followService.followUser(user.id, habboId, followerHabboName, habboName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['followersCount'] });
      queryClient.invalidateQueries({ queryKey: ['followingCount'] });
    }
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async (habboId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      return followService.unfollowUser(user.id, habboId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['followersCount'] });
      queryClient.invalidateQueries({ queryKey: ['followingCount'] });
    }
  });

  const handleFollow = async (followerHabboName: string) => {
    if (!targetHabboId || !targetHabboName) return;
    
    try {
      await followMutation.mutateAsync({
        habboId: targetHabboId,
        habboName: targetHabboName,
        followerHabboName
      });
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async () => {
    if (!targetHabboId) return;
    
    try {
      await unfollowMutation.mutateAsync(targetHabboId);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  return {
    isFollowing: isFollowing ?? false,
    isCheckingFollow,
    followersCount,
    followingCount,
    handleFollow,
    handleUnfollow,
    isFollowLoading: followMutation.isPending,
    isUnfollowLoading: unfollowMutation.isPending
  };
};
