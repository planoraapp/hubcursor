
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  takenOn?: string;
}

interface InstagramPhotoGridProps {
  photos: Photo[];
  habboName: string;
}

export const InstagramPhotoGrid: React.FC<InstagramPhotoGridProps> = ({ photos, habboName }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const openModal = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeModal = () => {
    setSelectedPhotoIndex(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (selectedPhotoIndex === null) return;
    
    if (direction === 'prev' && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    } else if (direction === 'next' && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  const openHabboProfile = () => {
    if (selectedPhoto) {
      window.open(`https://www.habbo.com.br/profile/${habboName}/photo/${selectedPhoto.id}`, '_blank');
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center text-white/60 py-4">
        <p className="text-sm">Nenhuma foto encontrada</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3">
        {photos.map((photo, index) => (
          <div 
            key={photo.id} 
            className="aspect-square relative cursor-pointer group overflow-hidden"
            onClick={() => openModal(index)}
          >
            <img
              src={photo.url}
              alt={`Foto ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ))}
      </div>

      <Dialog open={selectedPhotoIndex !== null} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black">
          {selectedPhoto && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={closeModal}
              >
                <X className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-12 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={openHabboProfile}
                title="Ver no Habbo"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>

              {selectedPhotoIndex! > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => navigatePhoto('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}

              {selectedPhotoIndex! < photos.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => navigatePhoto('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}

              <img 
                src={selectedPhoto.url} 
                alt="Foto ampliada"
                className="w-full max-h-[80vh] object-contain"
              />

              <div className="p-4 bg-black text-white">
                <div className="flex items-center justify-between">
                  <div className="text-center text-sm text-gray-300">
                    {selectedPhotoIndex! + 1} de {photos.length}
                  </div>
                  {selectedPhoto.takenOn && (
                    <span className="text-sm text-gray-400">
                      {new Date(selectedPhoto.takenOn).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
