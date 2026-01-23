import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, X, MessageSquare } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

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
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-black rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-black bg-yellow-400">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#2B2300' }}>
            <Users className="w-5 h-5" />
            Amigos ({friends.length})
          </h3>
          <Button onClick={onClose} variant="ghost" size="sm" style={{ color: '#2B2300' }} className="hover:bg-black/20">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-3">
            {friends.map((friend) => (
              <div key={friend.uniqueId} className="p-3 bg-white/10 rounded border border-black">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img 
                        src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${friend.name}&size=s`}
                        alt={friend.name}
                        className="w-10 h-10 rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${friend.name}&size=s`;
                        }}
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 border border-black rounded-full ${
                        friend.online ? "bg-green-500" : "bg-red-500"
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{friend.name}</div>
                      <div className="text-sm text-white/60 truncate">{friend.motto}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`text-xs px-2 py-1 rounded ${
                      friend.online ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                    }`}>
                      {friend.online ? `🟢 ${t('status.online')}` : `🔴 ${t('status.offline')}`}
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1">
                      <MessageSquare className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
