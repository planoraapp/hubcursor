
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consoleInteractionsService } from '@/services/consoleInteractionsService';
import { useUnifiedAuth } from './useUnifiedAuth';

export const useConsoleInteractions = (targetHabboName: string) => {
  const { habboAccount } = useUnifiedAuth();
  const queryClient = useQueryClient();

  // Get likes for the target user
  const { data: likes = [], isLoading: likesLoading } = useQuery({
    queryKey: ['console-likes', targetHabboName],
    queryFn: () => consoleInteractionsService.getLikes(targetHabboName),
    enabled: !!targetHabboName,
  });

  // Get comments for the target user
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['console-comments', targetHabboName],
    queryFn: () => consoleInteractionsService.getComments(targetHabboName),
    enabled: !!targetHabboName,
  });

  // Get followers for the target user
  const { data: followers = [], isLoading: followersLoading } = useQuery({
    queryKey: ['console-followers', targetHabboName],
    queryFn: () => consoleInteractionsService.getFollows(targetHabboName),
    enabled: !!targetHabboName,
  });

  // Check if current user has liked the target
  const { data: hasLiked = false } = useQuery({
    queryKey: ['console-has-liked', targetHabboName],
    queryFn: () => consoleInteractionsService.hasUserLiked(targetHabboName),
    enabled: !!targetHabboName && !!habboAccount,
  });

  // Check if current user is following the target
  const { data: isFollowing = false } = useQuery({
    queryKey: ['console-is-following', targetHabboName],
    queryFn: () => consoleInteractionsService.isUserFollowing(targetHabboName),
    enabled: !!targetHabboName && !!habboAccount,
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => consoleInteractionsService.addLike(targetHabboName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['console-likes', targetHabboName] });
      queryClient.invalidateQueries({ queryKey: ['console-has-liked', targetHabboName] });
    },
  });

  // Unlike mutation
  const unlikeMutation = useMutation({
    mutationFn: () => consoleInteractionsService.removeLike(targetHabboName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['console-likes', targetHabboName] });
      queryClient.invalidateQueries({ queryKey: ['console-has-liked', targetHabboName] });
    },
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: () => {
      if (!habboAccount?.habbo_name) throw new Error('Not authenticated');
      return consoleInteractionsService.followUser(targetHabboName, habboAccount.habbo_name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['console-followers', targetHabboName] });
      queryClient.invalidateQueries({ queryKey: ['console-is-following', targetHabboName] });
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: () => consoleInteractionsService.unfollowUser(targetHabboName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['console-followers', targetHabboName] });
      queryClient.invalidateQueries({ queryKey: ['console-is-following', targetHabboName] });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (commentText: string) => {
      if (!habboAccount?.habbo_name) throw new Error('Not authenticated');
      return consoleInteractionsService.addComment(targetHabboName, commentText, habboAccount.habbo_name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['console-comments', targetHabboName] });
    },
  });

  const handleLike = () => {
    if (hasLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  const handleFollow = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const handleAddComment = (commentText: string) => {
    addCommentMutation.mutate(commentText);
  };

  return {
    likes,
    comments,
    followers,
    hasLiked,
    isFollowing,
    handleLike,
    handleFollow,
    handleAddComment,
    isLoading: likesLoading || commentsLoading || followersLoading,
    likesCount: likes.length,
    commentsCount: comments.length,
    followersCount: followers.length,
  };
};
