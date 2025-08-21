
import React, { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { PhotoModal } from './PhotoModal';
import { useInternalSocialData } from '@/hooks/useInternalSocialData';

interface Photo {
  id: string;
  imageUrl: string;
  date: string;
  likes: number;
}

interface PhotoGridProps {
  photos: Photo[];
  className?: string;
}

const PhotoGridItem: React.FC<{ photo: Photo; onSelect: (photo: Photo) => void }> = ({ photo, onSelect }) => {
  const { socialData } = useInternalSocialData(photo.id);

  return (
    <div
      className="relative aspect-square overflow-hidden cursor-pointer group bg-muted rounded-sm"
      onClick={() => onSelect(photo)}
    >
      <img
        src={photo.imageUrl}
        alt="Foto do usuário"
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = `https://placehold.co/150x150/4B5563/FFFFFF?text=Foto+Não+Disponível`;
        }}
      />
      
      {/* Overlay com likes e comentários internos */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white text-sm font-medium">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            <span>{socialData.likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{socialData.commentsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, className = '' }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Manter ordem cronológica original das fotos (já vem ordenado do backend)
  const sortedPhotos = photos;

  return (
    <>
      <div className={`grid grid-cols-3 gap-1 ${className}`}>
        {sortedPhotos.map((photo) => {
          return <PhotoGridItem key={photo.id} photo={photo} onSelect={setSelectedPhoto} />;
        })}
      </div>

      {selectedPhoto && (
        <PhotoModal
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photo={selectedPhoto}
        />
      )}
    </>
  );
};
