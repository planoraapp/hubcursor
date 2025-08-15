
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: {
    id: string;
    imageUrl: string;
    date: string;
    likes: number;
  };
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ isOpen, onClose, photo }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 bg-transparent border-0">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
        
        <div className="relative bg-white rounded-lg overflow-hidden border-2 border-white shadow-2xl">
          <img
            src={photo.imageUrl}
            alt="Foto ampliada"
            className="w-full max-h-[70vh] object-contain"
            loading="lazy"
          />
          
          {/* Hub.gif logo - canto inferior esquerdo */}
          <div className="absolute bottom-2 left-2">
            <img
              src="/hub.gif"
              alt="Hub"
              className="w-8 h-8 opacity-80"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          
          {/* Data - canto inferior direito */}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {photo.date}
          </div>
          
          {/* Informações abaixo da foto */}
          <div className="p-3 bg-white border-t">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Heart className="w-4 h-4 text-red-500" />
              <span>{photo.likes} curtidas</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
