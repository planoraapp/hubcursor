import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { X, Search, Send } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { cn } from '@/lib/utils';
import { getAvatarHeadUrl } from '@/utils/avatarHelpers';

interface Friend {
  uniqueId: string;
  name: string;
  motto: string;
  online: boolean;
  hotelDomain?: string;
  hotelCode?: string;
  figureString?: string;
}

interface SendMessageModalProps {
  friends: Friend[];
  isOpen: boolean;
  onClose: () => void;
  onSelectFriend: (friendName: string) => Promise<void>;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  friends,
  isOpen,
  onClose,
  onSelectFriend
}) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Filtrar amigos baseado no termo de busca
  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) {
      // Se não há busca, retornar 6 amigos aleatórios
      const shuffled = [...friends].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 6);
    }
    
    // Filtrar por nome (case-insensitive)
    return friends.filter(friend =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [friends, searchTerm]);

  // Selecionar até 6 amigos para exibição (primeiros 6 dos filtrados)
  const displayFriends = filteredFriends.slice(0, 6);

  const handleFriendClick = async (friend: Friend) => {
    if (isSending) return;
    
    setIsSending(true);
    try {
      await onSelectFriend(friend.name);
      onClose();
      setSearchTerm('');
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getHotelDomain = (friend: Friend): string => {
    if (friend.hotelDomain) return friend.hotelDomain;
    if (friend.hotelCode) {
      if (friend.hotelCode === 'br') return 'com.br';
      if (friend.hotelCode === 'tr') return 'com.tr';
      return friend.hotelCode;
    }
    return 'com.br'; // Default
  };

  const getHotelCode = (friend: Friend): string => {
    return friend.hotelCode || friend.hotelDomain?.replace('com.', '') || 'br';
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 p-4">
      {/* Overlay transparente para fechar ao clicar fora */}
      <div 
        className="absolute inset-0 bg-transparent" 
        onClick={onClose}
      ></div>
      
      <div 
        className="relative bg-gray-900 border-2 border-black rounded-lg w-full max-w-lg overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header amarelo com estilo Habbo */}
        <div className="bg-yellow-400 border-b-2 border-black relative overflow-hidden" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px'
        }}>
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-[#2B2300]" />
              <h3 className="text-lg font-bold text-[#2B2300]" style={{
                textShadow: '1px 1px 0px rgba(255,255,255,0.5)'
              }}>
                Enviar Mensagem
              </h3>
            </div>
            <Button 
              onClick={onClose} 
              variant="ghost" 
              size="sm" 
              className="hover:bg-black/20 text-[#2B2300]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-4 bg-gray-900" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
          backgroundSize: '100% 2px'
        }}>
          {/* Campo de busca */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Buscar amigo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Grid de amigos (3 colunas) */}
          {displayFriends.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {displayFriends.map((friend) => (
                <button
                  key={friend.uniqueId}
                  onClick={() => handleFriendClick(friend)}
                  disabled={isSending}
                  className={cn(
                    "relative p-3 bg-white/5 border border-white/20 rounded hover:bg-white/10 hover:border-yellow-400/50 transition-all cursor-pointer flex flex-col items-center gap-2",
                    isSending && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {/* Avatar head */}
                  <div className="relative">
                    <img
                      src={getAvatarHeadUrl(
                        friend.name,
                        getHotelCode(friend),
                        friend.figureString,
                        'l'
                      )}
                      alt={friend.name}
                      className="w-16 h-16 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${encodeURIComponent(friend.name)}&size=l&direction=2&head_direction=3&headonly=1`;
                      }}
                    />
                    {/* Indicador online/offline */}
                    <div className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 border-2 border-gray-900 rounded-full",
                      friend.online ? "bg-green-500" : "bg-gray-500"
                    )}></div>
                  </div>
                  
                  {/* Nome */}
                  <div className="w-full">
                    <div className="text-xs font-semibold text-white truncate text-center">
                      {friend.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              <p className="text-sm">
                {searchTerm.trim() 
                  ? `Nenhum amigo encontrado para "${searchTerm}"`
                  : 'Nenhum amigo disponível'}
              </p>
            </div>
          )}

          {/* Mensagem de carregamento */}
          {isSending && (
            <div className="mt-4 text-center text-white/60 text-sm">
              Iniciando conversa...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
