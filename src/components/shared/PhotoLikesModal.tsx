import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, X } from 'lucide-react';

interface PhotoLike {
  id: string;
  habbo_name: string;
  created_at: string;
}

interface PhotoLikesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  likes: PhotoLike[];
  isLoading: boolean;
}

export const PhotoLikesModal: React.FC<PhotoLikesModalProps> = ({
  open,
  onOpenChange,
  likes,
  isLoading
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Modal que desliza de baixo para cima */}
      <div 
        className={`relative w-full max-w-sm bg-[#4A5568] text-white rounded-t-lg shadow-2xl transform transition-transform duration-300 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-bold">Curtidas ({likes.length})</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="max-h-80 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-16">
              <Loader2 className="w-6 h-6 animate-spin text-white/60" />
            </div>
          ) : likes.length > 0 ? (
            <div className="space-y-3">
              {likes.map((like) => (
                <div key={like.id} className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage 
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${like.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`}
                      alt={like.habbo_name}
                    />
                    <AvatarFallback className="bg-white/20 text-white text-xs">
                      {like.habbo_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{like.habbo_name}</p>
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