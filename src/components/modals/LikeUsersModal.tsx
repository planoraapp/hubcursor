import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Users } from 'lucide-react';
import { PhotoLike } from '@/types/habbo';

interface LikeUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  likes: PhotoLike[];
  photoId: string;
  onUserClick?: (userName: string) => void;
}

export const LikeUsersModal: React.FC<LikeUsersModalProps> = ({
  isOpen,
  onClose,
  likes,
  photoId,
  onUserClick
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h atrás`;
    return `${Math.floor(minutes / 1440)}d atrás`;
  };

  const getAvatarUrl = (habboName: string) => {
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(habboName)}&size=s&direction=2&head_direction=3&headonly=1`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span>Curtidas</span>
            <Badge variant="secondary" className="ml-auto">
              {likes.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3">
            {likes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma curtida ainda</p>
              </div>
            ) : (
              likes.map((like) => (
                <div
                  key={like.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={getAvatarUrl(like.habbo_name)}
                      alt={`Avatar de ${like.habbo_name}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${encodeURIComponent(like.habbo_name)}&size=s&direction=2&head_direction=3&headonly=1`;
                      }}
                    />
                    <AvatarFallback className="text-xs">
                      {like.habbo_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onUserClick?.(like.habbo_name)}
                      className="text-sm font-medium hover:text-primary transition-colors truncate"
                    >
                      {like.habbo_name}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(like.created_at)}
                    </p>
                  </div>
                  
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
