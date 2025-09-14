import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { chatService, type ChatMessage } from '@/services/chatService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RealChatWindowProps {
  conversationId: string;
  otherUserName: string;
  onBack: () => void;
}

export const RealChatWindow: React.FC<RealChatWindowProps> = ({
  conversationId,
  otherUserName,
  onBack
}) => {
  const { habboAccount } = useMyConsoleProfile();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Get messages for this conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatService.getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 5000, // Poll every 5 seconds as backup
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageText: string) => 
      chatService.sendMessage(conversationId, habboAccount!.habbo_name, messageText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setInputText('');
    },
    onError: (error) => {
            toast.error('Erro ao enviar mensagem');
    }
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = chatService.subscribeToMessages(conversationId, (newMessage) => {
      queryClient.setQueryData(['messages', conversationId], (oldMessages: ChatMessage[] = []) => {
        // Avoid duplicates
        if (oldMessages.some(msg => msg.id === newMessage.id)) return oldMessages;
        return [...oldMessages, newMessage];
      });
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [conversationId, queryClient]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(inputText.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!habboAccount) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
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
              src={`https://www.habbo.com.br/habbo-imaging/avatarimage?hb=image&user=${otherUserName}&headonly=1&direction=2&head_direction=2&action=&gesture=&size=m`}
              alt={otherUserName}
              className="w-10 h-10 rounded-full border border-white/20"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://www.habbo.com.br/habbo-imaging/avatarimage?hb=image&user=guest&headonly=1&direction=2&head_direction=2&action=&gesture=&size=m';
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
          </div>
          
          <div>
            <div className="font-bold text-white volter-font">
              {otherUserName}
            </div>
            <div className="text-xs text-white/60 volter-font">
              Online
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_habbo_name === habboAccount.habbo_name;
          
          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <img
                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?hb=image&user=${message.sender_habbo_name}&headonly=1&direction=2&head_direction=2&action=&gesture=&size=s`}
                alt={message.sender_habbo_name}
                className="w-8 h-8 rounded-full border border-white/20 flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://www.habbo.com.br/habbo-imaging/avatarimage?hb=image&user=guest&headonly=1&direction=2&head_direction=2&action=&gesture=&size=s';
                }}
              />
              
              {/* Message Bubble */}
              <div className="flex flex-col max-w-[70%]">
                <div
                  className={`px-4 py-3 rounded-2xl bg-white text-gray-900 shadow-lg border border-gray-200`}
                >
                  <div className="font-medium text-xs text-gray-500 mb-1 volter-font">
                    {message.sender_habbo_name}
                  </div>
                  <div className="volter-font text-sm leading-relaxed">
                    {message.message_text}
                  </div>
                </div>
                
                {/* Timestamp */}
                <div className={`text-xs text-white/50 mt-1 volter-font ${isOwn ? 'text-right' : 'text-left'}`}>
                  {formatDistanceToNow(new Date(message.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
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
            disabled={sendMessageMutation.isPending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || sendMessageMutation.isPending}
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