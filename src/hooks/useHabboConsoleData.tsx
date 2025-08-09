
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { habboProxyService, HabboUser } from '@/services/habboProxyService';
import { consoleInteractionsService } from '@/services/consoleInteractionsService';
import { useUnifiedAuth } from './useUnifiedAuth';

export const useHabboConsoleData = (targetUsername?: string) => {
  const { habboAccount } = useUnifiedAuth();
  const [searchUsername, setSearchUsername] = useState(targetUsername || '');
  const [selectedUser, setSelectedUser] = useState<HabboUser | null>(null);

  // Fetch user profile
  const { 
    data: userProfile, 
    isLoading: profileLoading, 
    error: profileError,
    refetch: refetchProfile 
  } = useQuery({
    queryKey: ['habbo-user-profile', searchUsername],
    queryFn: () => habboProxyService.getUserProfile(searchUsername),
    enabled: !!searchUsername,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Fetch user badges
  const { 
    data: userBadges = [], 
    isLoading: badgesLoading 
  } = useQuery({
    queryKey: ['habbo-user-badges', searchUsername],
    queryFn: () => habboProxyService.getUserBadges(searchUsername),
    enabled: !!searchUsername && !!userProfile,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch user photos
  const { 
    data: userPhotos = [], 
    isLoading: photosLoading 
  } = useQuery({
    queryKey: ['habbo-user-photos', searchUsername],
    queryFn: () => habboProxyService.getUserPhotos(searchUsername),
    enabled: !!searchUsername && !!userProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch ticker activities
  const { 
    data: tickerActivities = [], 
    isLoading: tickerLoading 
  } = useQuery({
    queryKey: ['habbo-ticker'],
    queryFn: () => habboProxyService.getTicker(),
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 15 * 1000, // 15 seconds
  });

  // Fetch console interactions
  const { 
    data: likes = [], 
    isLoading: likesLoading,
    refetch: refetchLikes 
  } = useQuery({
    queryKey: ['console-likes', searchUsername],
    queryFn: () => consoleInteractionsService.getLikes(searchUsername),
    enabled: !!searchUsername,
    staleTime: 30 * 1000, // 30 seconds
  });

  const { 
    data: comments = [], 
    isLoading: commentsLoading,
    refetch: refetchComments 
  } = useQuery({
    queryKey: ['console-comments', searchUsername],
    queryFn: () => consoleInteractionsService.getComments(searchUsername),
    enabled: !!searchUsername,
    staleTime: 30 * 1000, // 30 seconds
  });

  const { 
    data: follows = [], 
    isLoading: followsLoading,
    refetch: refetchFollows 
  } = useQuery({
    queryKey: ['console-follows', searchUsername],
    queryFn: () => consoleInteractionsService.getFollows(searchUsername),
    enabled: !!searchUsername,
    staleTime: 30 * 1000, // 30 seconds
  });

  const { 
    data: hasLiked = false, 
    refetch: refetchHasLiked 
  } = useQuery({
    queryKey: ['console-has-liked', searchUsername],
    queryFn: () => consoleInteractionsService.hasUserLiked(searchUsername),
    enabled: !!searchUsername && !!habboAccount,
    staleTime: 30 * 1000, // 30 seconds
  });

  const { 
    data: isFollowing = false, 
    refetch: refetchIsFollowing 
  } = useQuery({
    queryKey: ['console-is-following', searchUsername],
    queryFn: () => consoleInteractionsService.isUserFollowing(searchUsername),
    enabled: !!searchUsername && !!habboAccount,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Interaction methods
  const toggleLike = async () => {
    if (!habboAccount || !searchUsername) return false;

    try {
      const success = hasLiked 
        ? await consoleInteractionsService.removeLike(searchUsername)
        : await consoleInteractionsService.addLike(searchUsername, userProfile?.uniqueId);
      
      if (success) {
        await refetchLikes();
        await refetchHasLiked();
      }
      
      return success;
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    }
  };

  const addComment = async (commentText: string) => {
    if (!habboAccount || !searchUsername || !commentText.trim()) return false;

    try {
      const success = await consoleInteractionsService.addComment(
        searchUsername,
        commentText.trim(),
        habboAccount.habbo_name,
        userProfile?.uniqueId
      );
      
      if (success) {
        await refetchComments();
      }
      
      return success;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const success = await consoleInteractionsService.deleteComment(commentId);
      
      if (success) {
        await refetchComments();
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  };

  const toggleFollow = async () => {
    if (!habboAccount || !searchUsername) return false;

    try {
      const success = isFollowing 
        ? await consoleInteractionsService.unfollowUser(searchUsername)
        : await consoleInteractionsService.followUser(
            searchUsername,
            habboAccount.habbo_name,
            userProfile?.uniqueId
          );
      
      if (success) {
        await refetchFollows();
        await refetchIsFollowing();
      }
      
      return success;
    } catch (error) {
      console.error('Error toggling follow:', error);
      return false;
    }
  };

  // Update selected user when profile changes
  useEffect(() => {
    if (userProfile) {
      setSelectedUser(userProfile);
    }
  }, [userProfile]);

  return {
    // Search state
    searchUsername,
    setSearchUsername,
    
    // User data
    userProfile: selectedUser,
    userBadges,
    userPhotos,
    
    // Loading states
    isLoading: profileLoading || badgesLoading || photosLoading,
    profileLoading,
    badgesLoading,
    photosLoading,
    tickerLoading,
    
    // Error states
    profileError,
    
    // Ticker
    tickerActivities,
    
    // Console interactions
    likes,
    comments,
    follows,
    hasLiked,
    isFollowing,
    
    // Interaction loading states
    interactionsLoading: likesLoading || commentsLoading || followsLoading,
    
    // Methods
    searchUser: (username: string) => {
      setSearchUsername(username);
      refetchProfile();
    },
    toggleLike,
    addComment,
    deleteComment,
    toggleFollow,
    
    // Refetch methods
    refetchProfile,
    refetchLikes,
    refetchComments,
    refetchFollows,
    
    // Utility methods
    getAvatarUrl: (figureString: string, size?: 'xs' | 's' | 'm' | 'l') => 
      habboProxyService.getAvatarUrl(figureString, size),
    getBadgeUrl: (badgeCode: string) => 
      habboProxyService.getBadgeUrl(badgeCode),
  };
};
