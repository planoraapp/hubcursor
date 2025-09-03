
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ExternalLink, Heart, Calendar, MapPin } from 'lucide-react';

interface Photo {
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

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  currentPhotoIndex: number;
  userName: string;
  hotel?: string;
  onPrevious: () => void;
  onNext: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  onClose,
  photos,
  currentPhotoIndex,
  userName,
  hotel = 'com.br',
  onPrevious,
  onNext
}) => {
  const currentPhoto = photos[currentPhotoIndex];

  if (!currentPhoto) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data desconhecida';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black border-0">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm p-4 flex justify-between items-center">
            <div className="text-white">
              <h3 className="font-semibold">Foto de {userName}</h3>
              <p className="text-sm text-white/70">
                {currentPhotoIndex + 1} de {photos.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-white hover:bg-white/20"
              >
                <a
                  href={`https://www.habbo.${hotel}/profile/${userName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main image area */}
          <div className="flex-1 flex items-center justify-center p-16 pt-20 pb-24">
            <img
              src={currentPhoto.url}
              alt={currentPhoto.caption || `Foto de ${userName}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/400x300/4B5563/FFFFFF?text=Foto+Não+Disponível`;
              }}
            />
          </div>

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={onPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
                disabled={currentPhotoIndex === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={onNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
                disabled={currentPhotoIndex === photos.length - 1}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Footer with photo details */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 text-white">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {currentPhoto.timestamp && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-white/70" />
                  <span>{formatDate(currentPhoto.timestamp)}</span>
                </div>
              )}
              
              {currentPhoto.roomName && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-white/70" />
                  <span>{currentPhoto.roomName}</span>
                </div>
              )}
              
              {currentPhoto.likesCount !== undefined && currentPhoto.likesCount > 0 && (
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                  <span>{currentPhoto.likesCount} curtidas</span>
                </div>
              )}
            </div>
            
            {currentPhoto.caption && (
              <p className="mt-2 text-white/90 italic">
                "{currentPhoto.caption}"
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
