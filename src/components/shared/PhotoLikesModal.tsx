import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Heart } from 'lucide-react';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[60vh] p-0">
        <div className="bg-[#4A5568] text-white rounded-lg overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Curtidas ({likes.length})
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-80 overflow-y-auto px-4 pb-4">
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
      </DialogContent>
    </Dialog>
  );
};