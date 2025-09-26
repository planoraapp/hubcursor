import React, { useState, useEffect } from 'react';
import { ConversationsList } from './chat/ConversationsList';
import { ChatWindow } from './chat/ChatWindow';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { chatService, type Conversation as RealConversation } from '@/services/chatService';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  participants: string[];
  otherUser: {
    habbo_name: string;
    figureString?: string;
    online?: boolean;
  };
  lastMessage?: {
    text: string;
    timestamp: Date;
    sender: string;
  };
}

// Add interface for starting conversation from external source
interface ChatColumnProps {
  startConversationWith?: string; // habbo name to start conversation with
  onConversationStarted?: () => void;
}

export const ChatColumn: React.FC<ChatColumnProps> = ({ 
  startConversationWith, 
  onConversationStarted 
}) => {
  const { habboAccount } = useMyConsoleProfile();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [showChatWindow, setShowChatWindow] = useState(false);

  // Get real conversations from Supabase
  const { data: realConversations = [], refetch } = useQuery({
    queryKey: ['conversations', habboAccount?.habbo_name],
    queryFn: () => chatService.getConversations(habboAccount!.habbo_name),
    enabled: !!habboAccount?.habbo_name,
    staleTime: 30000, // 30 seconds
  });

  // Convert real conversations to UI format
  const conversations: Conversation[] = realConversations.map(realConv => ({
    id: realConv.id,
    participants: [realConv.participant_1, realConv.participant_2],
    otherUser: realConv.otherUser,
    lastMessage: realConv.lastMessage
  }));

  // Handle starting conversation from external source
  useEffect(() => {
    const handleStartConversation = async () => {
      if (startConversationWith && habboAccount?.habbo_name && startConversationWith !== habboAccount.habbo_name) {
        try {
          const conversationId = await chatService.createOrGetConversation(
            habboAccount.habbo_name, 
            startConversationWith
          );
          
          // Create conversation object for UI
          const newConversation: Conversation = {
            id: conversationId,
            participants: [habboAccount.habbo_name, startConversationWith],
            otherUser: {
              habbo_name: startConversationWith,
              figureString: 'hr-100-61.hd-180-1.ch-210-66.lg-270-82.sh-305-62',
              online: true
            }
          };
          
          setActiveConversation(newConversation);
          setShowChatWindow(true);
          onConversationStarted?.();
        } catch (error) {
                  }
      }
    };

    handleStartConversation();
  }, [startConversationWith, habboAccount?.habbo_name, onConversationStarted]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!habboAccount?.habbo_name) return;

    const subscription = chatService.subscribeToConversations(
      habboAccount.habbo_name,
      () => {
        refetch();
      }
    );

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [habboAccount?.habbo_name, refetch]);

  // Mock conversations data (fallback)
  const mockConversations: Conversation[] = [
    {
      id: '1',
      participants: ['Beebop', 'EZ-C'],
      otherUser: {
        habbo_name: 'EZ-C',
        figureString: 'hr-100-61.hd-180-1.ch-210-66.lg-270-82.sh-305-62',
        online: true
      },
      lastMessage: {
        text: 'Vamos jogar SnowStorm? :)',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        sender: 'EZ-C'
      }
    },
    {
      id: '2',
      participants: ['Beebop', 'Lu,a'],
      otherUser: {
        habbo_name: 'Lu,a',
        figureString: 'hr-515-45.hd-600-1.ch-215-66.lg-270-82.sh-305-62',
        online: false
      },
      lastMessage: {
        text: 'Obrigada pela ajuda com o quarto!',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        sender: 'Lu,a'
      }
    },
    {
      id: '3',
      participants: ['Beebop', 'Realcristianw'],
      otherUser: {
        habbo_name: 'Realcristianw',
        figureString: 'hr-100-61.hd-180-1.ch-210-66.lg-270-82.sh-305-62',
        online: true
      },
      lastMessage: {
        text: 'Oi! Como está?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        sender: 'Realcristianw'
      }
    }
  ];

  const handleConversationSelect = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setShowChatWindow(true);
  };

  const handleBackToList = () => {
    setShowChatWindow(false);
    setActiveConversation(null);
  };

  if (!habboAccount) {
    return (
      <div className="h-full flex items-center justify-center text-white volter-font">
        <div className="text-center">
          <div className="mb-2">🔒</div>
          <div>Login necessário para acessar o chat</div>
        </div>
      </div>
    );
  }

  if (showChatWindow && activeConversation) {
    return (
      <ChatWindow 
        conversation={activeConversation} 
        currentUser={habboAccount}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <ConversationsList 
      conversations={conversations.length > 0 ? conversations : mockConversations}
      onConversationSelect={handleConversationSelect}
    />
  );
};