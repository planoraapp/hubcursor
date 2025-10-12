import React, { useState } from 'react';
import { PhotoModal } from './PhotoModal';

interface Photo {
  id: string;
  imageUrl: string;
  date: string;
  likes: number;
}

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePhotoClick = (photo: Photo) => {
    if (onPhotoClick) {
      // Se há callback, usa ele (para navegação por abas)
      onPhotoClick(photo);
    } else {
      // Senão, abre modal (comportamento padrão)
      setSelectedPhoto(photo);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  if (photos.length === 0) {
    return (
      <div className="text-center text-white/60 py-4">
        <p className="text-sm">Nenhuma foto disponível</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative bg-white/5 rounded-lg overflow-hidden cursor-pointer aspect-square hover:bg-white/10 transition-all duration-200"
            onClick={() => handlePhotoClick(photo)}
          >
            <img
              src={photo.imageUrl}
              alt={`Foto ${photo.id}`}
              className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/150x150/4B5563/FFFFFF?text=Foto+Não+Disponível';
              }}
              loading="lazy"
            />
            
            {/* Overlay com informações */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
            
            {/* Ícone de likes no canto inferior direito */}
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {photo.likes} ❤️
            </div>
          </div>
        ))}
      </div>

      {/* Modal para exibir foto em tela cheia (apenas se não há callback) */}
      {!onPhotoClick && selectedPhoto && (
        <PhotoModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          photo={selectedPhoto}
        />
      )}
    </>
  );
};