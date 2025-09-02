
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
        <DialogContent className="max-w-4xl max-h-[80vh] bg-[#4A5568] text-white border-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-pink-400" />
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
                      <AvatarFallback className="bg-white/20 text-white">
                        {friend.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#4A5568] ${
                      friend.online ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate text-white">{friend.name}</p>
                      <Badge 
                        variant={friend.online ? "default" : "secondary"} 
                        className={`text-xs ${
                          friend.online 
                            ? "bg-green-500/20 text-green-300 border-green-400/30" 
                            : "bg-white/10 text-white/60 border-white/20"
                        }`}
                      >
                        {friend.online ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/60 truncate italic">
                      "{friend.motto || 'Sem motto'}"
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="p-1 text-white/60 hover:text-white hover:bg-white/10">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {friends.length === 0 && (
              <div className="text-center text-white/60 py-8">
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
