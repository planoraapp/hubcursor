
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { habboProxyService, HabboUser, HabboPhoto } from '@/services/habboProxyService';
import { consoleInteractionsService, ConsoleFollow } from '@/services/consoleInteractionsService';
import { getHotelDomain } from '@/utils/habboDomains';

export const useMyConsoleProfile = () => {
  const { habboAccount, isLoggedIn } = useAuth();
  
  // Log detailed auth state for debugging
  console.log('[🔍 MY CONSOLE PROFILE] Auth state:', {
    isLoggedIn,
    habboName: habboAccount?.habbo_name,
    hotel: habboAccount?.hotel,
    hasAccount: !!habboAccount
  });
  
  // Standardize hotel domain mapping
  const getApiHotel = (hotel: string) => {
    if (hotel === 'br') return 'com.br';
    return hotel || 'com.br';
  };

  // Fetch my profile data
  const { 
    data: myProfile, 
    isLoading: profileLoading, 
    error: profileError 
  } = useQuery({
    queryKey: ['my-console-profile', habboAccount?.habbo_name, habboAccount?.hotel],
    queryFn: async () => {
      if (!habboAccount?.habbo_name) {
        throw new Error('Habbo account name is required');
      }
      
      const apiHotel = getApiHotel(habboAccount.hotel);
      console.log(`[🔍 MY CONSOLE PROFILE] Fetching profile for ${habboAccount.habbo_name} on ${apiHotel}`);
      
      const profile = await habboProxyService.getUserProfile(habboAccount.habbo_name, apiHotel);
      console.log('[✅ MY CONSOLE PROFILE] Profile fetched successfully:', profile?.name || 'No name');
      return profile;
    },
    enabled: !!habboAccount?.habbo_name && !!habboAccount?.hotel,
    staleTime: 2 * 60 * 1000, // 2 minutes for fresh data
    retry: 3,
  });

  // Fetch my photos
  const { 
    data: photos = [], 
    isLoading: photosLoading 
  } = useQuery({
    queryKey: ['my-console-photos', habboAccount?.habbo_name, habboAccount?.hotel],
    queryFn: async () => {
      if (!habboAccount?.habbo_name) {
        throw new Error('Habbo account name is required');
      }
      
      const apiHotel = getApiHotel(habboAccount.hotel);
      console.log(`[📸 MY CONSOLE PHOTOS] Fetching photos for ${habboAccount.habbo_name} on ${apiHotel}`);
      
      const userPhotos = await habboProxyService.getUserPhotos(habboAccount.habbo_name, apiHotel);
      console.log(`[✅ MY CONSOLE PHOTOS] Fetched ${userPhotos?.length || 0} photos`);
      return userPhotos;
    },
    enabled: !!habboAccount?.habbo_name && !!habboAccount?.hotel,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Fetch my profile interactions
  const { 
    data: myLikes = [], 
    isLoading: likesLoading 
  } = useQuery({
    queryKey: ['my-console-likes', habboAccount?.habbo_name],
    queryFn: async () => {
      if (!habboAccount?.habbo_name) {
        throw new Error('Habbo account name is required');
      }
      return consoleInteractionsService.getLikes(habboAccount.habbo_name);
    },
    enabled: !!habboAccount?.habbo_name,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });

  const { 
    data: myComments = [], 
    isLoading: commentsLoading 
  } = useQuery({
    queryKey: ['my-console-comments', habboAccount?.habbo_name],
    queryFn: async () => {
      if (!habboAccount?.habbo_name) {
        throw new Error('Habbo account name is required');
      }
      return consoleInteractionsService.getComments(habboAccount.habbo_name);
    },
    enabled: !!habboAccount?.habbo_name,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });

  const { 
    data: followers = [], 
    isLoading: followersLoading 
  } = useQuery({
    queryKey: ['my-console-followers', habboAccount?.habbo_name],
    queryFn: async () => {
      if (!habboAccount?.habbo_name) {
        throw new Error('Habbo account name is required');
      }
      return consoleInteractionsService.getFollows(habboAccount.habbo_name);
    },
    enabled: !!habboAccount?.habbo_name,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });

  const { 
    data: following = [], 
    isLoading: followingLoading 
  } = useQuery({
    queryKey: ['my-console-following', habboAccount?.habbo_name],
    queryFn: async () => {
      if (!habboAccount?.habbo_name) {
        throw new Error('Habbo account name is required');
      }
      return consoleInteractionsService.getFollowing(habboAccount.habbo_name);
    },
    enabled: !!habboAccount?.habbo_name,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
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
