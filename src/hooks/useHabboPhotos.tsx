
import { useUnifiedPhotoSystem } from './useUnifiedPhotoSystem';

export interface EnhancedHabboPhoto {
  id: string;
  url: string;
  previewUrl?: string;
  caption?: string;
  timestamp?: string;
  roomId?: string;
  roomName?: string;
  likesCount?: number;
  type?: string;
  source?: 'profile_scraping' | 's3_discovery' | 'known_working_example' | 'test_example' | 'api' | 'fallback';
}

export const useHabboPhotos = (username?: string, hotel: string = 'com.br') => {
  const { photos, isLoading, error } = useUnifiedPhotoSystem(
    username, 
    hotel === 'com.br' ? 'br' : hotel
  );

  // Convert to enhanced format
  const habboPhotos: EnhancedHabboPhoto[] = photos.map(photo => ({
    id: photo.id,
    url: photo.url,
    previewUrl: photo.url,
    caption: `Foto de ${username}`,
    timestamp: photo.timestamp ? new Date(photo.timestamp).toISOString() : undefined,
    roomName: photo.room_name,
    likesCount: photo.likes_count,
    type: 'PHOTO',
    source: 'profile_scraping'
  }));

  console.log(`[🔧 ENHANCED PHOTOS] Converted ${photos.length} photos for ${username}`);

  return { habboPhotos, isLoading, error };
};
