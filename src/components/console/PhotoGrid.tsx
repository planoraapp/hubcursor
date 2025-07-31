
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Photo {
  id: string;
  url: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  takenAt?: string;
}

interface PhotoGridProps {
  photos: Photo[];
  onLikeToggle: (photoId: string) => void;
  isLoggedIn: boolean;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onLikeToggle, isLoggedIn }) => {
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

  if (photos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma foto encontrada
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <div 
            key={photo.id} 
            className="relative group cursor-pointer aspect-square overflow-hidden rounded-lg"
            onClick={() => openModal(index)}
          >
            <img 
              src={photo.url} 
              alt="User photo"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-white text-sm">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{photo.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{photo.comments}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={selectedPhotoIndex !== null} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
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
                alt="Enlarged photo"
                className="w-full max-h-[70vh] object-contain"
              />

              <div className="p-4 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant={selectedPhoto.isLiked ? "default" : "outline"}
                      size="sm"
                      onClick={() => onLikeToggle(selectedPhoto.id)}
                      disabled={!isLoggedIn}
                      className="flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      {selectedPhoto.likes}
                    </Button>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      <span>{selectedPhoto.comments} comentários</span>
                    </div>
                  </div>
                  {selectedPhoto.takenAt && (
                    <span className="text-sm text-muted-foreground">
                      {new Date(selectedPhoto.takenAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  {selectedPhotoIndex! + 1} de {photos.length}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
