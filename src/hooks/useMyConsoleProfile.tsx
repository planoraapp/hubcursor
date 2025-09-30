import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { unifiedHabboService } from '@/services/unifiedHabboService';

export const useMyConsoleProfile = () => {
  const { habboAccount, isLoggedIn } = useAuth();
  
  // Helper para mapear hotel
  const getApiHotel = (hotel: string) => {
    return hotel === 'br' ? 'com.br' : (hotel || 'com.br');
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
      return await unifiedHabboService.getUserProfile(habboAccount.habbo_name, apiHotel);
    },
    enabled: !!habboAccount?.habbo_name && !!habboAccount?.hotel,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
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
      return await unifiedHabboService.getUserPhotos(habboAccount.habbo_name, apiHotel);
    },
    enabled: !!habboAccount?.habbo_name && !!habboAccount?.hotel,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    myProfile,
    photos,
    isLoading: profileLoading || photosLoading,
    error: profileError,
    isLoggedIn,
    habboAccount
  };
};