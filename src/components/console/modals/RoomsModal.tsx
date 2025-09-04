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
        <div className="flex items-center justify-between p-4 border-b border-black bg-green-500">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <Home className="w-5 h-5" />
            Quartos ({rooms.length})
          </h3>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-black hover:bg-black/20">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            {rooms.map((room) => (
              <div key={room.id} className="p-3 bg-white/10 rounded border border-black">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-white">{room.name}</div>
                    <div className="text-sm text-white/60">{room.description}</div>
                    <div className="text-xs text-white/40">
                      Criado: {new Date(room.creationTime).toLocaleDateString('pt-BR')}
                    </div>
                    {room.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {room.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs bg-white/20 text-white/80 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-sm text-white">{room.maximumVisitors}</div>
                    <div className="text-xs text-white/60">máx</div>
                    {room.rating > 0 && (
                      <div className="text-xs text-yellow-400 mt-1">
                        ⭐ {room.rating}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
