
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera } from 'lucide-react';

interface PhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: any[];
  userName: string;
}

export const PhotosModal: React.FC<PhotosModalProps> = ({ 
  isOpen, 
  onClose, 
  photos, 
  userName 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Fotos de {userName} ({photos.length})
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
            {photos.map((photo) => (
              <a 
                key={photo.id} 
                href={photo.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block group bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-colors"
              >
                <img
                  src={photo.url}
                  alt={`Foto de ${userName}`}
                  className="aspect-square object-cover w-full h-full bg-gray-100 group-hover:opacity-90 transition-opacity rounded"
                  loading="lazy"
                />
                {photo.takenOn && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {new Date(photo.takenOn).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </a>
            ))}
          </div>
          
          {photos.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhuma foto encontrada</p>
              <p className="text-sm mt-2">Fotos não disponíveis publicamente</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
