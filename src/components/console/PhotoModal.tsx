
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Heart, MessageCircle, Share2, Eye } from 'lucide-react';
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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-transparent border-0">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
        
        <div className="relative bg-background rounded-lg overflow-hidden border shadow-2xl flex flex-col h-full">
          {/* Imagem principal */}
          <div className="flex-1 flex items-center justify-center bg-black/20 p-8">
            <img
              src={photo.imageUrl}
              alt="Foto ampliada"
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              loading="lazy"
            />
          </div>
          
          {/* Hub.gif logo - canto inferior esquerdo */}
          <div className="absolute bottom-4 left-4">
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
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {photo.date}
          </div>
          
          {/* Informações detalhadas abaixo da foto */}
          <div className="p-4 bg-background border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              {/* Likes */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-red-500">
                  <Heart className="w-5 h-5" />
                  <span className="font-semibold">{photo.likes}</span>
                </div>
                <span className="text-xs text-muted-foreground">Curtidas</span>
              </div>
              
              {/* Comentários (placeholder) */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-blue-500">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-semibold">0</span>
                </div>
                <span className="text-xs text-muted-foreground">Comentários</span>
              </div>
              
              {/* Visualizações (placeholder) */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-green-500">
                  <Eye className="w-5 h-5" />
                  <span className="font-semibold">{Math.floor(Math.random() * 100) + 1}</span>
                </div>
                <span className="text-xs text-muted-foreground">Visualizações</span>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Curtir
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Comentar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
