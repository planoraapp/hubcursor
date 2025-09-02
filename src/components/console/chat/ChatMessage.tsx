import React from 'react';
import { Message } from './ChatWindow';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatMessageProps {
  message: Message;
  otherUserName: string;
  currentUserName: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  otherUserName,
  currentUserName
}) => {
  const isOwn = message.isOwn;
  const userName = isOwn ? currentUserName : otherUserName;

  return (
    <div className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <img
          src={`https://www.habbo.com.br/habbo-imaging/avatarimage?hb=image&user=${userName}&headonly=1&direction=2&head_direction=${isOwn ? '4' : '2'}&action=&gesture=&size=m`}
          alt={userName}
          className="w-8 h-8 rounded-full border border-white/20"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://www.habbo.com.br/habbo-imaging/avatarimage?hb=image&user=guest&headonly=1&direction=2&head_direction=2&action=&gesture=&size=m';
          }}
        />
      </div>

      {/* Mensagem */}
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Nome do usuário */}
        <div className={`text-xs volter-font mb-1 ${isOwn ? 'text-blue-300' : 'text-yellow-300'}`}>
          {isOwn ? 'VOCÊ:' : `${userName}:`}
        </div>

        {/* Balão de fala */}
        <div className={`
          habbo-speech-bubble volter-font text-sm leading-relaxed
          ${isOwn 
            ? 'bg-blue-600 text-white right' 
            : 'bg-white text-black left'
          }
        `}>
          {message.text}
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-white/50 volter-font mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatDistanceToNow(message.timestamp, {
            addSuffix: true,
            locale: ptBR
          })}
        </div>
      </div>
    </div>
  );
};