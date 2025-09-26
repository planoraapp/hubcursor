import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, X } from 'lucide-react';

interface HabboRoom {
  id: number;
  name: string;
  description: string;
  creationTime: string;
  maximumVisitors: number;
  rating: number;
  tags: string[];
  thumbnailUrl: string | null;
  imageUrl: string | null;
}

interface RoomsModalProps {
  rooms: HabboRoom[];
  isOpen: boolean;
  onClose: () => void;
}

export const RoomsModal: React.FC<RoomsModalProps> = ({ rooms, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-black rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-black bg-yellow-400">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#2B2300' }}>
            <Home className="w-5 h-5" />
            Quartos ({rooms.length})
          </h3>
          <Button onClick={onClose} variant="ghost" size="sm" style={{ color: '#2B2300' }} className="hover:bg-black/20">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-3">
            {rooms.map((room) => (
              <div key={room.id} className="p-3 bg-white/10 rounded border border-black">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                      {room.thumbnailUrl || room.imageUrl ? (
                        <img
                          src={room.thumbnailUrl || room.imageUrl}
                          alt={`Miniatura de ${room.name}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://images.habbo.com/c_images/room_thumbnails/${room.id}.png`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                          {room.id}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{room.name}</div>
                      <div className="text-sm text-white/60 truncate">{room.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>Criado: {new Date(room.creationTime).toLocaleDateString('pt-BR')}</span>
                    <span>{room.maximumVisitors} máx</span>
                  </div>
                  {room.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {room.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="text-xs bg-white/20 text-white/80 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {room.rating > 0 && (
                    <div className="text-xs text-yellow-400">
                      ⭐ {room.rating}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
