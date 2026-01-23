/**
 * Normalizador de Dados de Fotos
 * Garante consistência na comunicação entre APIs, páginas e perfis
 */

import { EnhancedPhoto } from '@/types/habbo';

/**
 * Normaliza um objeto de foto para o formato EnhancedPhoto padrão
 * Aceita vários formatos de entrada e converte para o formato unificado
 */
export function normalizePhoto(photo: any): EnhancedPhoto {
  // Extrair photo_id (fonte de verdade) - pode vir em vários formatos
  const photoId = photo.photo_id || photo.photoId || photo.id || '';
  
  // Extrair userName/habbo_name
  const userName = photo.userName || photo.habbo_name || photo.user_name || photo.user || '';
  
  // Extrair URL da imagem (prioridade: imageUrl > s3_url > preview_url > url)
  const imageUrl = photo.imageUrl || photo.s3_url || photo.preview_url || photo.url || '';
  
  // Extrair nome do quarto
  const roomName = photo.roomName || photo.room_name || photo.roomName || '';
  const roomId = photo.roomId || photo.room_id || photo.roomId;
  
  // Extrair data (pode vir em vários formatos)
  const date = photo.date || photo.taken_date || photo.takenDate || '';
  const timestamp = photo.timestamp || photo.timestamp_taken || 
    (photo.taken_date ? new Date(photo.taken_date).getTime() : undefined);
  
  // Extrair tipo da foto
  const type = photo.type || photo.photo_type || 'PHOTO';
  
  // Likes podem vir como número ou array
  const likes = Array.isArray(photo.likes) ? photo.likes : [];
  const likesCount = photo.likesCount ?? photo.likes_count ?? 
    (typeof photo.likes === 'number' ? photo.likes : likes.length);
  
  return {
    id: photoId,
    photo_id: photoId,
    userName,
    imageUrl,
    date,
    timestamp,
    likes,
    likesCount,
    userLiked: photo.userLiked ?? photo.user_liked ?? false,
    type: type as 'SELFIE' | 'PHOTO' | 'USER_CREATION',
    contentWidth: photo.contentWidth ?? photo.content_width,
    contentHeight: photo.contentHeight ?? photo.content_height,
    caption: photo.caption,
    roomName,
    roomId: typeof roomId === 'string' || typeof roomId === 'number' ? roomId : undefined,
    s3_url: photo.s3_url || imageUrl,
    preview_url: photo.preview_url || imageUrl,
    taken_date: photo.taken_date || date,
    photo_type: photo.photo_type || type,
    hotel: photo.hotel,
    hotelDomain: photo.hotelDomain || photo.hotel_domain || photo.hotel,
  };
}

/**
 * Normaliza um array de fotos
 */
export function normalizePhotos(photos: any[]): EnhancedPhoto[] {
  return photos.map(normalizePhoto);
}

/**
 * Extrai o photo_id de forma consistente de qualquer objeto de foto
 */
export function getPhotoId(photo: any): string {
  return photo?.photo_id || photo?.photoId || photo?.id || '';
}

/**
 * Extrai o userName de forma consistente
 */
export function getPhotoUserName(photo: any): string {
  return photo?.userName || photo?.habbo_name || photo?.user_name || photo?.user || '';
}

