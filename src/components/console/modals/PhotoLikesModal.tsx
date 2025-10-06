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
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`absolute inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={handleBackdropClick}
    >
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      {/* Modal que desliza de baixo para cima */}
      <div className={`relative w-full max-w-md mx-4 bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-t-2xl shadow-2xl transform transition-all duration-300 ease-out max-h-[50vh] flex flex-col ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-400 to-yellow-300 border-b-2 border-yellow-500 rounded-t-xl">
          <h3 className="text-sm font-bold flex items-center gap-2 text-white" style={{
            textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
          }}>
            <Heart className="w-5 h-5 text-white" />
            Curtidas ({likes.length})
          </h3>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-full p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
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
    </div>
  );
};
