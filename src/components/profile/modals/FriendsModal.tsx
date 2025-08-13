
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ExternalLink } from 'lucide-react';
import { UserProfileModal } from '@/components/UserProfileModal';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: any[];
  userName: string;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({ 
  isOpen, 
  onClose, 
  friends, 
  userName 
}) => {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const getAvatarUrl = (figureString: string) => {
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${figureString}&size=s&direction=2&head_direction=3&action=std`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Amigos de {userName} ({friends.length})
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
              {friends.map((friend) => (
                <div 
                  key={friend.uniqueId}
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                  onClick={() => setSelectedFriend(friend.name)}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={getAvatarUrl(friend.figureString)} />
                      <AvatarFallback>{friend.name[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      friend.online ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{friend.name}</p>
                      <Badge variant={friend.online ? "default" : "secondary"} className="text-xs">
                        {friend.online ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate italic">
                      "{friend.motto || 'Sem motto'}"
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="p-1">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {friends.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum amigo encontrado</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {selectedFriend && (
        <UserProfileModal
          open={!!selectedFriend}
          setOpen={() => setSelectedFriend(null)}
          habboName={selectedFriend}
        />
      )}
    </>
  );
};
