
import { useQuery } from '@tanstack/react-query';
import { useUnifiedAuth } from './useUnifiedAuth';
import { habboProxyService, HabboUser, HabboPhoto } from '@/services/habboProxyService';
import { consoleInteractionsService, ConsoleFollow } from '@/services/consoleInteractionsService';

export const useMyConsoleProfile = () => {
  const { habboAccount, isLoggedIn } = useUnifiedAuth();
  
  // Fetch my profile data
  const { 
    data: myProfile, 
    isLoading: profileLoading, 
    error: profileError 
  } = useQuery({
    queryKey: ['my-console-profile', habboAccount?.habbo_name],
    queryFn: () => habboProxyService.getUserProfile(habboAccount!.habbo_name),
    enabled: !!habboAccount?.habbo_name,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch my photos
  const { 
    data: photos = [], 
    isLoading: photosLoading 
  } = useQuery({
    queryKey: ['my-console-photos', habboAccount?.habbo_name],
    queryFn: () => habboProxyService.getUserPhotos(habboAccount!.habbo_name),
    enabled: !!habboAccount?.habbo_name,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch my profile interactions
  const { 
    data: myLikes = [], 
    isLoading: likesLoading 
  } = useQuery({
    queryKey: ['my-console-likes', habboAccount?.habbo_name],
    queryFn: () => consoleInteractionsService.getLikes(habboAccount!.habbo_name),
    enabled: !!habboAccount?.habbo_name,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const { 
    data: myComments = [], 
    isLoading: commentsLoading 
  } = useQuery({
    queryKey: ['my-console-comments', habboAccount?.habbo_name],
    queryFn: () => consoleInteractionsService.getComments(habboAccount!.habbo_name),
    enabled: !!habboAccount?.habbo_name,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const { 
    data: followers = [], 
    isLoading: followersLoading 
  } = useQuery({
    queryKey: ['my-console-followers', habboAccount?.habbo_name],
    queryFn: () => consoleInteractionsService.getFollows(habboAccount!.habbo_name),
    enabled: !!habboAccount?.habbo_name,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const { 
    data: following = [], 
    isLoading: followingLoading 
  } = useQuery({
    queryKey: ['my-console-following', habboAccount?.habbo_name],
    queryFn: () => consoleInteractionsService.getFollowing(habboAccount!.habbo_name),
    enabled: !!habboAccount?.habbo_name,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    isLoggedIn,
    habboAccount,
    myProfile,
    photos,
    myLikes,
    myComments,
    followers,
    following,
    isLoading: profileLoading || photosLoading || likesLoading || commentsLoading || followersLoading || followingLoading,
    error: profileError,
  };
};
