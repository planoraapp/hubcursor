
import React from 'react';
import { Camera, Heart } from 'lucide-react';

interface Photo {
  id: string;
  imageUrl: string;
  date: string;
  likes: number;
}

interface PhotosSectionProps {
  photos: Photo[];
  userName: string;
  isLoading?: boolean;
}

export const PhotosSection: React.FC<PhotosSectionProps> = ({ 
  photos, 
  userName, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-white/5 rounded-lg border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-white/80" />
          <h4 className="text-sm font-medium text-white/80">Carregando fotos...</h4>
        </div>
        <div className="grid grid-cols-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-square bg-white/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="p-6 bg-white/5 rounded-lg border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-white/80" />
          <h4 className="text-sm font-medium text-white/80">Fotos (0)</h4>
        </div>
        <div className="text-center py-8 text-white/60">
          <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nenhuma foto encontrada</p>
          <p className="text-xs mt-1">
            As fotos são obtidas diretamente do perfil público do Habbo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/5 rounded-lg border-white/20">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-white/80" />
        <h4 className="text-sm font-medium text-white/80">
          {userName === 'Minhas Fotos' ? 'Minhas Fotos' : `Fotos de ${userName}`} ({photos.length})
        </h4>
      </div>
      
      <div className="grid grid-cols-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative overflow-hidden group aspect-square">
            <img 
              src={photo.imageUrl} 
              alt="Foto Habbo" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/150x150/4B5563/FFFFFF?text=Foto+Não+Disponível`;
              }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
              <span className="text-xs text-white/80">{photo.date}</span>
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <Heart className="w-3 h-3 text-red-400" />
                <span>{photo.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
