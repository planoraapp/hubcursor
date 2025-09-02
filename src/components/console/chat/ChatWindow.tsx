import React, { useState, useRef, useEffect } from 'react';
import { Conversation } from '../ChatColumn';
import { ArrowLeft, Send } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { RealChatWindow } from './RealChatWindow';
// Remove direct HabboAccount import and use interface

interface ChatWindowProps {
  conversation: Conversation;
  currentUser: {
    habbo_name: string;
    habbo_id?: string;
  };
  onBack: () => void;
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUser,
  onBack
}) => {
  // Use real chat window for actual conversations
  if (conversation.id && conversation.id !== '1' && conversation.id !== '2' && conversation.id !== '3') {
    return (
      <RealChatWindow
        conversationId={conversation.id}
        otherUserName={conversation.otherUser.habbo_name}
        onBack={onBack}
      />
    );
  }

  // Fallback to mock chat for demo conversations
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Ooh! Ooh! Você está online! :)) Quer jogar SnowStorm?',
      sender: conversation.otherUser.habbo_name,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isOwn: false
    },
    {
      id: '2', 
      text: 'Oi! Claro! :) Mas preciso sair com os cachorros primeiro. Pode ser em uma hora?',
      sender: currentUser.habbo_name,
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      isOwn: true
    },
    {
      id: '3',
      text: 'Perfeito! Me chama quando voltar então! 🐕',
      sender: conversation.otherUser.habbo_name,
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      isOwn: false
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: currentUser.habbo_name,
        timestamp: new Date(),
        isOwn: true
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header do chat */}
      <div className="flex items-center p-3 border-b border-white/20 bg-black/20">
        <button
          onClick={onBack}
          className="mr-3 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        
        <div className="flex items-center flex-1">
          <div className="relative mr-3">
            <img
              src={`https://www.habbo.com.br/habbo-imaging/avatarimage?hb=image&user=${conversation.otherUser.habbo_name}&headonly=1&direction=2&head_direction=2&action=&gesture=&size=m`}
              alt={conversation.otherUser.habbo_name}
              className="w-10 h-10 rounded-full border border-white/20"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://www.habbo.com.br/habbo-imaging/avatarimage?hb=image&user=guest&headonly=1&direction=2&head_direction=2&action=&gesture=&size=m';
              }}
            />
            {conversation.otherUser.online && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
            )}
          </div>
          
          <div>
            <div className="font-bold text-white volter-font">
              {conversation.otherUser.habbo_name}
            </div>
            <div className="text-xs text-white/60 volter-font">
              {conversation.otherUser.online ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </div>

      {/* Área das mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            otherUserName={conversation.otherUser.habbo_name}
            currentUserName={currentUser.habbo_name}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensagem */}
      <div className="p-3 border-t border-white/20 bg-black/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escreva sua mensagem..."
            className="flex-1 px-3 py-2 bg-black/30 border border-white/20 rounded-lg 
                       text-white placeholder-white/50 volter-font text-sm
                       focus:outline-none focus:border-blue-400"
            maxLength={500}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
                       rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};