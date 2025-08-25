import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, Activity, Search, MessageSquare } from 'lucide-react';
import { MyAccountColumn } from './MyAccountColumn';
import { FeedActivityTabbedColumn } from '../console2/FeedActivityTabbedColumn';
import { ChatColumn } from './ChatColumn';
import { SearchColumn } from './SearchColumn';
import { PixelFrame } from './PixelFrame';
import { cn } from '@/lib/utils';

type TabType = 'account' | 'feed' | 'chat' | 'search';

interface TabButton {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  activeColor: string;
}

const tabs: TabButton[] = [
  {
    id: 'account',
    label: 'Minha Conta',
    icon: <User className="w-4 h-4" />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'feed',
    label: 'Feed',
    icon: <Activity className="w-4 h-4" />,
    color: '#2D3748',
    hoverColor: '#4A5568',
    activeColor: '#1A202C'
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: <MessageSquare className="w-4 h-4" />,
    color: '#9333EA',
    hoverColor: '#A855F7',
    activeColor: '#7C3AED'
  },
  {
    id: 'search',
    label: 'Buscar',
    icon: <Search className="w-4 h-4" />,
    color: '#8B4513',
    hoverColor: '#A0522D',
    activeColor: '#654321'
  }
];

interface TabbedConsoleProps {
  startChatWith?: string;
}

export const TabbedConsole: React.FC<TabbedConsoleProps> = ({ startChatWith }) => {
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [chatTarget, setChatTarget] = useState<string | undefined>(startChatWith);

  // Auto-switch to chat tab when starting a conversation
  React.useEffect(() => {
    if (startChatWith) {
      setActiveTab('chat');
      setChatTarget(startChatWith);
    }
  }, [startChatWith]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <MyAccountColumn />;
      case 'feed':
        return <FeedActivityTabbedColumn />;
      case 'chat':
        return (
          <ChatColumn 
            startConversationWith={chatTarget}
            onConversationStarted={() => setChatTarget(undefined)}
          />
        );
      case 'search':
        return <SearchColumn onStartConversation={(targetName) => {
          setActiveTab('chat');
          setChatTarget(targetName);
        }} />;
      default:
        return <MyAccountColumn />;
    }
  };

  return (
    <PixelFrame title="Console do Habbo" className="mx-auto h-[calc(100vh-12rem)]">
      <div className="flex flex-col h-full">
        {/* Main content area */}
        <div className="flex-1 min-h-0 mb-4">
          {renderTabContent()}
        </div>

        {/* Tab navigation at bottom */}
        <div className="flex-shrink-0">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pixel-nav-button habbo-text-shadow",
                  activeTab === tab.id ? "active" : ""
                )}
                style={{
                  backgroundColor: activeTab === tab.id ? tab.activeColor : tab.color,
                  color: activeTab === tab.id ? '#2B2300' : '#FFFFFF'
                }}
              >
                <div className={cn(
                  "transition-transform duration-200",
                  activeTab === tab.id ? "scale-110" : "scale-100"
                )}>
                  {tab.icon}
                </div>
                <span className="leading-none text-[10px]">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </PixelFrame>
  );
};