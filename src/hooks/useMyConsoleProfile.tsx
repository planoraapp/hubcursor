import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { unifiedHabboService } from '@/services/unifiedHabboService';

export const useMyConsoleProfile = () => {
  const { habboAccount, isLoggedIn } = useAuth();
  
  // Helper para mapear hotel
  const getApiHotel = (hotel: string) => {
    return hotel === 'br' ? 'com.br' : (hotel || 'com.br');
  };

  // Fetch my profile data - OTIMIZADO: só carrega quando necessário
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
    enabled: !!habboAccount?.habbo_name && !!habboAccount?.hotel && isLoggedIn, // Só executa se logado
    staleTime: 5 * 60 * 1000, // 5 minutos (aumentado de 2)
    gcTime: 15 * 60 * 1000, // 15 minutos
    retry: 1, // Reduzido de 2
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Fetch my photos - OTIMIZADO: lazy loading
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
    enabled: !!habboAccount?.habbo_name && !!habboAccount?.hotel && isLoggedIn, // Só executa se logado
    staleTime: 10 * 60 * 1000, // 10 minutos (aumentado de 5)
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 1, // Reduzido
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    myProfile,
    photos,
    profileLoading,
    photosLoading,
    profileError,
    habboAccount,
    isLoggedIn,
    isLoading: profileLoading || photosLoading
  };
};