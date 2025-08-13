
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followService, type FollowData } from '@/services/followService';

export const useFollowSystem = (userId?: string) => {
  const queryClient = useQueryClient();

  // Get followers count
  const { data: followersCount = 0 } = useQuery({
    queryKey: ['followers-count', userId],
    queryFn: () => followService.getFollowersCount(userId!),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Get following count
  const { data: followingCount = 0 } = useQuery({
    queryKey: ['following-count', userId],
    queryFn: () => followService.getFollowingCount(userId!),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Get followers list
  const { data: followers = [] } = useQuery({
    queryKey: ['followers', userId],
    queryFn: () => followService.getFollowers(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get following list
  const { data: following = [] } = useQuery({
    queryKey: ['following', userId],
    queryFn: () => followService.getFollowing(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: ({ 
      followerUserId, 
      followedUserId, 
      followerHabboName, 
      followedHabboName 
    }: {
      followerUserId: string;
      followedUserId: string;
      followerHabboName: string;
      followedHabboName: string;
    }) => 
      followService.followUser(followerUserId, followedUserId, followerHabboName, followedHabboName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers-count'] });
      queryClient.invalidateQueries({ queryKey: ['following-count'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: ({ followerUserId, followedUserId }: { followerUserId: string; followedUserId: string }) =>
      followService.unfollowUser(followerUserId, followedUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers-count'] });
      queryClient.invalidateQueries({ queryKey: ['following-count'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });

  return {
    followersCount,
    followingCount,
    followers,
    following,
    followUser: followMutation.mutate,
    unfollowUser: unfollowMutation.mutate,
    isFollowing: followMutation.isPending,
    isUnfollowing: unfollowMutation.isPending,
  };
};
