
import { useState, useCallback } from 'react';
import { useUnifiedPhotoSystem } from './useUnifiedPhotoSystem';

export interface PhotoLoadingState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  retryCount: number;
}

export const useOptimizedPhotos = (username?: string, hotel: string = 'br') => {
  const [loadingState, setLoadingState] = useState<PhotoLoadingState>({
    isLoading: false,
    hasError: false,
    retryCount: 0
  });

  const { 
    photos, 
    isLoading: systemLoading, 
    error: systemError, 
    refetch,
    photoCount 
  } = useUnifiedPhotoSystem(username, hotel, { 
    cacheTime: 5, // 5 minutes cache for optimal performance
    forceRefresh: false 
  });

  // Lazy loading with error boundaries
  const loadPhotos = useCallback(async (force = false) => {
    if (!username) return;

    setLoadingState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      errorMessage: undefined
    }));

    try {
      console.log(`[🔄 OPTIMIZED PHOTOS] Loading photos for ${username}...`);
      await refetch(force);
      
      setLoadingState(prev => ({
        ...prev,
        isLoading: false,
        retryCount: 0
      }));
      
      console.log(`[✅ OPTIMIZED PHOTOS] Successfully loaded ${photoCount} photos`);
    } catch (error: any) {
      console.error(`[❌ OPTIMIZED PHOTOS] Failed to load photos:`, error);
      
      setLoadingState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        errorMessage: error.message || 'Failed to load photos',
        retryCount: prev.retryCount + 1
      }));
    }
  }, [username, refetch, photoCount]);

  // Auto-retry with exponential backoff
  const retryLoadPhotos = useCallback(() => {
    const delay = Math.min(1000 * Math.pow(2, loadingState.retryCount), 10000);
    setTimeout(() => loadPhotos(true), delay);
  }, [loadPhotos, loadingState.retryCount]);

  const isLoading = systemLoading || loadingState.isLoading;
  const hasError = !!systemError || loadingState.hasError;
  const errorMessage = systemError?.message || loadingState.errorMessage;

  return {
    photos,
    photoCount,
    isLoading,
    hasError,
    errorMessage,
    retryCount: loadingState.retryCount,
    
    // Actions
    loadPhotos,
    retryLoadPhotos,
    refreshPhotos: () => loadPhotos(true),
    
    // Utils
    hasPhotos: photoCount > 0,
    isEmpty: !isLoading && !hasError && photoCount === 0,
    canRetry: hasError && loadingState.retryCount < 3
  };
};
