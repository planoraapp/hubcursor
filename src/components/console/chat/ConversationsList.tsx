import React from 'react';
import { Conversation } from '../ChatColumn';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationsListProps {
  conversations: Conversation[];
  onConversationSelect: (conversation: Conversation) => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  onConversationSelect
}) => {
  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-white volter-font">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <div className="text-sm opacity-80">Nenhuma conversa ainda</div>
          <div className="text-xs opacity-60 mt-2">
            Busque por amigos para começar a conversar
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto space-y-2 p-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onConversationSelect(conversation)}
          className="flex items-center p-3 bg-black/20 rounded-lg border border-white/10 
                     hover:bg-black/30 transition-colors cursor-pointer group"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0 mr-3">
            <img
              src={`https://www.habbo.com.br/habbo-imaging/avatarimage?hb=image&user=${conversation.otherUser.habbo_name}&headonly=1&direction=2&head_direction=2&action=&gesture=&size=m`}
              alt={conversation.otherUser.habbo_name}
              className="w-10 h-10 rounded-full border border-white/20"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://www.habbo.com.br/habbo-imaging/avatarimage?hb=image&user=guest&headonly=1&direction=2&head_direction=2&action=&gesture=&size=m';
              }}
            />
            {/* Status online */}
            {conversation.otherUser.online && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
            )}
          </div>

          {/* Conteúdo da conversa */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white volter-font text-sm truncate">
                {conversation.otherUser.habbo_name}
              </span>
              {conversation.lastMessage && (
                <span className="text-xs text-white/60 volter-font flex-shrink-0">
                  {formatDistanceToNow(conversation.lastMessage.timestamp, {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </span>
              )}
            </div>
            
            {conversation.lastMessage && (
              <div className="text-sm text-white/80 volter-font truncate">
                {conversation.lastMessage.sender === conversation.otherUser.habbo_name 
                  ? conversation.lastMessage.text
                  : `Você: ${conversation.lastMessage.text}`
                }
              </div>
            )}
          </div>

          {/* Indicador de nova mensagem */}
          <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      ))}
    </div>
  );
};