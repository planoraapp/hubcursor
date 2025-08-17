
import { useUnifiedPhotoSystem } from './useUnifiedPhotoSystem';

export interface HabboPhotoEnhanced {
  id: string;
  photo_id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  s3_url: string;
  preview_url?: string;
  internal_user_id?: string;
  timestamp_taken?: number;
  caption?: string;
  room_name?: string;
  taken_date?: string;
  likes_count: number;
  photo_type: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export const useHabboPhotosEnhanced = (username?: string, hotel: string = 'br') => {
  const { photos, isLoading, error } = useUnifiedPhotoSystem(
    username, 
    hotel
  );

  // Convert to enhanced database format
  const habboPhotos: HabboPhotoEnhanced[] = photos.map(photo => ({
    id: photo.id,
    photo_id: photo.id,
    habbo_name: username || '',
    habbo_id: `${hotel}-unknown`,
    hotel: hotel,
    s3_url: photo.url,
    preview_url: photo.url,
    internal_user_id: undefined,
    timestamp_taken: photo.timestamp ? new Date(photo.timestamp).getTime() : Date.now(),
    caption: `Foto de ${username}`,
    room_name: photo.room_name,
    taken_date: photo.timestamp ? new Date(photo.timestamp).toISOString() : new Date().toISOString(),
    likes_count: photo.likes_count || 0,
    photo_type: 'PHOTO',
    source: 'profile_scraping',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  console.log(`[🔧 DB ENHANCED PHOTOS] Converted ${photos.length} photos for ${username}`);

  return { habboPhotos, isLoading, error };
};
