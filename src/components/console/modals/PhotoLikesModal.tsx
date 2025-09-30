import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface PhotoLike {
  id: string;
  habbo_name: string;
  created_at: string;
}

interface PhotoLikesModalProps {
  likes: PhotoLike[];
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoLikesModal: React.FC<PhotoLikesModalProps> = ({ likes, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border border-black rounded-t-lg w-full max-h-[70vh] overflow-hidden z-50 transform transition-transform duration-300 ease-out">
        <div className="flex items-center justify-between p-4 border-b border-black bg-yellow-400">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#2B2300' }}>
            <Heart className="w-5 h-5" />
            Curtidas ({likes.length})
          </h3>
          <Button onClick={onClose} variant="ghost" size="sm" style={{ color: '#2B2300' }} className="hover:bg-black/20">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[55vh]">
          {likes.length > 0 ? (
            <div className="space-y-3">
              {likes.map((like) => (
                <div key={like.id} className="flex items-center space-x-3 p-3 bg-white/10 rounded border border-black">
                  <div className="w-10 h-10 flex-shrink-0">
                    <img
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${like.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`}
                      alt={like.habbo_name}
                      className="w-full h-full rounded"
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${like.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{like.habbo_name}</div>
                    <div className="text-xs text-white/60">
                      {new Date(like.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              <Heart className="w-8 h-8 mx-auto mb-2 text-white/40" />
              <p>Nenhuma curtida ainda</p>
            </div>
          )}
        </div>
    </div>
  );
};
