import { useState, useCallback } from 'react';

interface ProfileNavigationState {
  viewingUser: string | null;
  viewingUserUniqueId: string | undefined;
  photosProfileUser: string | null;
  photosProfileHotel: string | null;
  photosProfileHistory: Array<{ username: string; hotel: string }>;
}

interface UseProfileNavigationReturn {
  state: ProfileNavigationState;
  navigateToProfile: (username: string, hotelDomain?: string, uniqueId?: string) => void;
  navigateToProfileFromPhotos: (username: string, hotelDomain: string) => void;
  navigateBackFromPhotos: () => void;
  clearProfile: () => void;
}

/**
 * Hook para gerenciar navegação de perfis de forma centralizada
 */
export const useProfileNavigation = (): UseProfileNavigationReturn => {
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const [viewingUserUniqueId, setViewingUserUniqueId] = useState<string | undefined>(undefined);
  const [photosProfileUser, setPhotosProfileUser] = useState<string | null>(null);
  const [photosProfileHotel, setPhotosProfileHotel] = useState<string | null>(null);
  const [photosProfileHistory, setPhotosProfileHistory] = useState<Array<{ username: string; hotel: string }>>([]);

  const navigateToProfile = useCallback((username: string, hotelDomain?: string, uniqueId?: string) => {
    const cleanedUsername = (username || '').trim();
    setViewingUser(cleanedUsername);
    setViewingUserUniqueId(uniqueId);
    
    if (hotelDomain) {
      setPhotosProfileHotel(hotelDomain);
    }
  }, []);

  const navigateToProfileFromPhotos = useCallback((username: string, hotelDomain: string) => {
    const cleanedUsername = (username || '').trim();
    
    // Adicionar ao histórico se houver um perfil atual
    if (photosProfileUser && photosProfileHotel) {
      setPhotosProfileHistory(prev => [...prev, { username: photosProfileUser, hotel: photosProfileHotel }]);
    }
    
    setPhotosProfileUser(cleanedUsername);
    setPhotosProfileHotel(hotelDomain);
    setViewingUser(cleanedUsername);
    
    // Tentar extrair uniqueId do histórico se disponível
    // (pode ser melhorado buscando da API se necessário)
  }, [photosProfileUser, photosProfileHotel]);

  const navigateBackFromPhotos = useCallback(() => {
    if (photosProfileHistory.length > 0) {
      const previous = photosProfileHistory[photosProfileHistory.length - 1];
      setPhotosProfileHistory(prev => prev.slice(0, -1));
      setPhotosProfileUser(previous.username);
      setPhotosProfileHotel(previous.hotel);
      setViewingUser(previous.username);
    } else {
      // Se não houver histórico, limpar
      setPhotosProfileUser(null);
      setPhotosProfileHotel(null);
      setViewingUser(null);
    }
  }, [photosProfileHistory]);

  const clearProfile = useCallback(() => {
    setViewingUser(null);
    setViewingUserUniqueId(undefined);
    setPhotosProfileUser(null);
    setPhotosProfileHotel(null);
    setPhotosProfileHistory([]);
  }, []);

  return {
    state: {
      viewingUser,
      viewingUserUniqueId,
      photosProfileUser,
      photosProfileHotel,
      photosProfileHistory
    },
    navigateToProfile,
    navigateToProfileFromPhotos,
    navigateBackFromPhotos,
    clearProfile
  };
};

