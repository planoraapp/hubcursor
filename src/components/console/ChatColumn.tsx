import React, { useState } from 'react';
import { ConversationsList } from './chat/ConversationsList';
import { ChatWindow } from './chat/ChatWindow';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';

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

export const ChatColumn: React.FC = () => {
  const { habboAccount } = useMyConsoleProfile();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [showChatWindow, setShowChatWindow] = useState(false);

  // Mock conversations data
  const conversations: Conversation[] = [
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
      conversations={conversations}
      onConversationSelect={handleConversationSelect}
    />
  );
};