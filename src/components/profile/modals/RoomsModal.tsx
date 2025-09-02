
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, ExternalLink, Users, Star } from 'lucide-react';

interface RoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: any[];
  userName: string;
}

export const RoomsModal: React.FC<RoomsModalProps> = ({ 
  isOpen, 
  onClose, 
  rooms, 
  userName 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Quartos de {userName} ({rooms.length})
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
            {rooms.map((room) => (
              <div 
                key={room.id}
                className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm leading-tight flex-1 mr-2">{room.name}</h3>
                  <Button variant="ghost" size="sm" className="p-1 flex-shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                
                {room.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                    {room.description}
                  </p>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {room.maximumVisitors || 'N/A'}
                      </span>
                      {room.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {room.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {room.creationTime && (
                    <div className="text-xs text-muted-foreground">
                      Criado: {formatDate(room.creationTime)}
                    </div>
                  )}
                  
                  {room.tags && room.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {room.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {rooms.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Home className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum quarto encontrado</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
