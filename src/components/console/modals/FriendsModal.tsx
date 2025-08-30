import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, X, MessageSquare } from 'lucide-react';

interface Friend {
  uniqueId: string;
  name: string;
  motto: string;
  online: boolean;
}

interface FriendsModalProps {
  friends: Friend[];
  isOpen: boolean;
  onClose: () => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({ friends, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-black rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-black bg-pink-500">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <Users className="w-5 h-5" />
            Amigos ({friends.length})
          </h3>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-black hover:bg-black/20">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            {friends.map((friend) => (
              <div key={friend.uniqueId} className="flex items-center space-x-3 p-3 bg-white/10 rounded border border-black">
                <div className="relative">
                  <img 
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${friend.name}&size=s`}
                    alt={friend.name}
                    className="w-12 h-12 rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${friend.name}&size=s`;
                    }}
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 border border-black rounded-full ${
                    friend.online ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{friend.name}</div>
                  <div className="text-sm text-white/60">{friend.motto}</div>
                  <div className="text-xs text-white/40">
                    {friend.online ? '🟢 Online' : '🔴 Offline'}
                  </div>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
