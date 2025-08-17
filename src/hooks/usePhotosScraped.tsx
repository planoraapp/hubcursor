
import { useUnifiedPhotoSystem } from './useUnifiedPhotoSystem';

// Legacy hook - now uses the unified system
export const usePhotosScraped = (username?: string, hotel: string = 'br', forceRefresh: boolean = false) => {
  const { photos, isLoading, error, refetch, photoCount } = useUnifiedPhotoSystem(
    username, 
    hotel, 
    { forceRefresh, cacheTime: 5 }
  );

  // Convert to legacy format for backward compatibility
  const scrapedPhotos = photos.map(photo => ({
    id: photo.id,
    photo_id: photo.id, // Map id to photo_id
    imageUrl: photo.url, // Map url to imageUrl
    date: photo.takenOn, // Map takenOn to date
    likes: photo.likes_count || 0, // Map likes_count to likes
    timestamp: photo.timestamp,
    roomName: photo.roomName || photo.room_name
  }));

  const refreshPhotos = () => {
    console.log('%c[🔄 LEGACY PHOTOS] Refresh called via legacy hook', 'background: #FF9800; color: white; padding: 4px 8px; border-radius: 4px;');
    return refetch(forceRefresh);
  };

  return { 
    scrapedPhotos, 
    isLoading, 
    error,
    refreshPhotos,
    photoCount 
  };
};
