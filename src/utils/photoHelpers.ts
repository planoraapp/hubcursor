
interface ScrapedPhoto {
  id: string;
  photo_id: string;
  imageUrl: string;
  date: string;
  likes: number;
  timestamp?: number;
  roomName?: string;
}

interface ModalPhoto {
  id: string;
  url: string;
  previewUrl?: string;
  caption?: string;
  timestamp?: string;
  roomId?: string;
  roomName?: string;
  likesCount?: number;
  type?: string;
}

export const convertScrapedPhotosToModalFormat = (scrapedPhotos: ScrapedPhoto[], userName: string): ModalPhoto[] => {
  return scrapedPhotos.map(photo => ({
    id: photo.id || photo.photo_id,
    url: photo.imageUrl,
    previewUrl: photo.imageUrl,
    caption: `Foto de ${userName}`,
    timestamp: photo.date,
    roomName: photo.roomName,
    likesCount: photo.likes,
    type: 'PHOTO'
  }));
};
