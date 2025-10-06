
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { UserProfileModal } from '@/components/UserProfileModal';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: any[];
  userName: string;
  onNavigateToProfile?: (username: string) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({ 
  isOpen, 
  onClose, 
  friends, 
  userName,
  onNavigateToProfile
}) => {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const getAvatarUrl = (figureString: string) => {
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${figureString}&size=m&direction=2&head_direction=3&action=std`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-transparent border-0 p-0 overflow-hidden rounded-lg" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
          backgroundSize: '100% 2px'
        }}>
          {/* Borda superior amarela com textura pontilhada */}
          <div className="bg-yellow-400 border-2 border-black border-b-0 rounded-t-lg relative overflow-hidden" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '8px 8px'
          }}>
            <div className="pixel-pattern absolute inset-0 opacity-20"></div>
            <DialogHeader className="p-4 relative z-10">
              <DialogTitle className="flex items-center gap-2 text-white font-bold text-sm" style={{
                textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
              }}>
                <Users className="w-5 h-5 text-white" />
                Amigos de {userName} ({friends.length})
              </DialogTitle>
            </DialogHeader>
          </div>
          
          {/* Conteúdo principal com fundo de linhas horizontais */}
          <div className="bg-gray-900 relative overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
            backgroundSize: '100% 2px',
            height: '60vh'
          }}>
            <div className="relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                {friends.map((friend) => (
                  <div 
                    key={friend.uniqueId}
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                    onClick={() => {
                      if (onNavigateToProfile) {
                        onNavigateToProfile(friend.name);
                      } else {
                        setSelectedFriend(friend.name);
                      }
                    }}
                  >
                    <div className="relative">
                      <div className="w-16 h-16 overflow-hidden flex items-center justify-center">
                        <img
                          src={getAvatarUrl(friend.figureString)}
                          alt={friend.name}
                          className="w-full h-full object-contain object-top"
                          style={{ 
                            objectPosition: 'center top',
                            transform: 'scale(1.6) translateY(-8px)',
                            transformOrigin: 'center top'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
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
                  </div>
                ))}
              </div>
              
              {friends.length === 0 && (
                <div className="text-center text-white/60 py-8">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhum amigo encontrado</p>
                </div>
            )}
            </div>
          </div>
        
        {/* Borda inferior amarela com textura pontilhada */}
        <div className="bg-yellow-400 border-2 border-black border-t-0 rounded-b-lg relative overflow-hidden" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px'
        }}>
          <div className="pixel-pattern absolute inset-0 opacity-20"></div>
          <div className="p-2 relative z-10"></div>
        </div>
        </DialogContent>
      </Dialog>

      {selectedFriend && !onNavigateToProfile && (
        <UserProfileModal
          open={!!selectedFriend}
          setOpen={() => setSelectedFriend(null)}
          habboName={selectedFriend}
        />
      )}
    </>
  );
};
