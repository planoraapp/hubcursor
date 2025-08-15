
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { PhotoModal } from './PhotoModal';

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

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, className = '' }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Ordenar fotos cronologicamente (mais recentes primeiro)
  const sortedPhotos = [...photos].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <div className={`grid grid-cols-3 gap-1 ${className}`}>
        {sortedPhotos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square overflow-hidden cursor-pointer group bg-gray-100 rounded-sm"
            onClick={() => setSelectedPhoto(photo)}
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
            
            {/* Overlay com likes no hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex items-center gap-1 text-white text-sm font-medium">
                <Heart className="w-4 h-4 fill-white" />
                <span>{photo.likes}</span>
              </div>
            </div>
          </div>
        ))}
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
