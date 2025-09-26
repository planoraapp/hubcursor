
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
    hotel,
    { cacheTime: 15 }
  );

  // Convert to enhanced database format
  const habboPhotos: HabboPhotoEnhanced[] = photos.map(photo => ({
    id: photo.id,
    photo_id: photo.photo_id,
    habbo_name: username || '',
    habbo_id: `${hotel}-unknown`,
    hotel: hotel,
    s3_url: photo.imageUrl,
    preview_url: photo.imageUrl,
    internal_user_id: undefined,
    timestamp_taken: photo.timestamp,
    caption: `Foto de ${username}`,
    room_name: photo.roomName,
    taken_date: photo.timestamp ? new Date(photo.timestamp).toISOString() : new Date().toISOString(),
    likes_count: photo.likes,
    photo_type: 'PHOTO',
    source: photo.source,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

    return { habboPhotos, isLoading, error };
};
