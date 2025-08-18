
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Home, Users, Star, ExternalLink } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  description: string;
  ownerName: string;
  ownerUniqueId: string;
  tags: string[];
  maxUsers: number;
  userCount: number;
  score: number;
  thumbnailUrl?: string;
  roomType?: string;
}

interface RoomsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rooms: Room[];
  habboName: string;
}

export const RoomsModal: React.FC<RoomsModalProps> = ({
  open,
  onOpenChange,
  rooms,
  habboName
}) => {
  const getRoomThumbnailUrl = (roomId: string) => {
    // URL padrão para thumbnails de quartos do Habbo
    return `https://images.habbo.com/c_images/reception/room_icon_${roomId}.png`;
  };

  const getRoomImageUrl = (roomId: string) => {
    // URL alternativa para imagens de quartos
    return `https://habbo-stories-content.s3.amazonaws.com/room_thumbs/${roomId}.png`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-white/95 backdrop-blur-sm border-2 border-black rounded-lg">
        <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-t-lg -m-6 mb-4">
          <DialogTitle className="text-2xl volter-font flex items-center gap-2">
            <Home className="w-6 h-6" />
            Quartos de {habboName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 volter-font">Este usuário não possui quartos públicos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    {/* Thumbnail do quarto */}
                    <div className="flex-shrink-0">
                      <img
                        src={room.thumbnailUrl || getRoomThumbnailUrl(room.id)}
                        alt={`Quarto ${room.name}`}
                        className="w-16 h-16 rounded-lg border border-gray-300 bg-gray-100"
                        onError={(e) => {
                          // Fallback para URL alternativa
                          const target = e.target as HTMLImageElement;
                          if (target.src !== getRoomImageUrl(room.id)) {
                            target.src = getRoomImageUrl(room.id);
                          } else {
                            // Fallback final - ícone padrão
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-icon')) {
                              const fallback = document.createElement('div');
                              fallback.className = 'fallback-icon w-16 h-16 bg-blue-100 rounded-lg border border-gray-300 flex items-center justify-center';
                              fallback.innerHTML = '<svg class="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>';
                              parent.appendChild(fallback);
                            }
                          }
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 volter-font truncate">
                          {room.name}
                        </h3>
                        {room.roomType && (
                          <Badge className="bg-blue-100 text-blue-800 volter-font text-xs">
                            {room.roomType}
                          </Badge>
                        )}
                      </div>

                      {room.description && (
                        <p className="text-sm text-gray-600 volter-font mb-2 line-clamp-2">
                          {room.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        {room.tags && room.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {room.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs volter-font">
                                #{tag}
                              </Badge>
                            ))}
                            {room.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs volter-font">
                                +{room.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <span className="volter-font flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {room.userCount}/{room.maxUsers}
                          </span>
                          {room.score > 0 && (
                            <span className="volter-font flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {room.score}
                            </span>
                          )}
                        </div>

                        <a
                          href={`https://www.habbo.com.br/room/${room.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 volter-font flex items-center gap-1"
                        >
                          Visitar
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
