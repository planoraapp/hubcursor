
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ExternalLink, X } from 'lucide-react';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: any[];
  userName: string;
  onSelectFriend?: (friendName: string) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({ 
  isOpen, 
  onClose, 
  friends, 
  userName,
  onSelectFriend
}) => {
  const getAvatarUrl = (figureString: string) => {
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${figureString}&size=s&direction=2&head_direction=3&action=std`;
  };

  const handleFriendClick = (friendName: string) => {
    if (onSelectFriend) {
      onSelectFriend(friendName);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700 text-white">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl text-white">
              <Users className="w-5 h-5 text-blue-400" />
              Amigos de {userName} ({friends.length})
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {friends.map((friend) => (
              <div 
                key={friend.uniqueId}
                className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors border border-gray-700"
                onClick={() => handleFriendClick(friend.name)}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12 border border-gray-600">
                    <AvatarImage src={getAvatarUrl(friend.figureString)} />
                    <AvatarFallback className="bg-gray-700 text-white">
                      {friend.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                    friend.online ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate text-white">{friend.name}</p>
                    <Badge 
                      variant={friend.online ? "default" : "secondary"} 
                      className={`text-xs ${friend.online ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}
                    >
                      {friend.online ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 truncate italic">
                    "{friend.motto || 'Sem motto'}"
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-white">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {friends.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum amigo encontrado</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
