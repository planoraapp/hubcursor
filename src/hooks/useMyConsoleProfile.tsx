
import { useQuery } from '@tanstack/react-query';
import { useUnifiedAuth } from './useUnifiedAuth';
import { habboProxyService, HabboUser } from '@/services/habboProxyService';
import { consoleInteractionsService } from '@/services/consoleInteractionsService';

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
    data: myFollows = [], 
    isLoading: followsLoading 
  } = useQuery({
    queryKey: ['my-console-follows', habboAccount?.habbo_name],
    queryFn: () => consoleInteractionsService.getFollows(habboAccount!.habbo_name),
    enabled: !!habboAccount?.habbo_name,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    isLoggedIn,
    habboAccount,
    myProfile,
    myLikes,
    myComments,
    myFollows,
    isLoading: profileLoading || likesLoading || commentsLoading || followsLoading,
    error: profileError,
  };
};
