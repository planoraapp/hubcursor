import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Activity, Search } from 'lucide-react';
import { MyAccountColumn } from './MyAccountColumn';
import { FeedActivityTabbedColumn } from '../console2/FeedActivityTabbedColumn';
import { SearchColumn } from './SearchColumn';
import { cn } from '@/lib/utils';

type TabType = 'account' | 'feed' | 'search';

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
    color: 'bg-yellow-600',
    hoverColor: 'hover:bg-yellow-500',
    activeColor: 'bg-yellow-500 shadow-lg shadow-yellow-500/20'
  },
  {
    id: 'feed',
    label: 'Feed',
    icon: <Activity className="w-4 h-4" />,
    color: 'bg-gray-800',
    hoverColor: 'hover:bg-gray-700',
    activeColor: 'bg-gray-700 shadow-lg shadow-gray-700/20'
  },
  {
    id: 'search',
    label: 'Buscar',
    icon: <Search className="w-4 h-4" />,
    color: 'bg-amber-700',
    hoverColor: 'hover:bg-amber-600',
    activeColor: 'bg-amber-600 shadow-lg shadow-amber-600/20'
  }
];

export const TabbedConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('account');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <MyAccountColumn />;
      case 'feed':
        return <FeedActivityTabbedColumn />;
      case 'search':
        return <SearchColumn />;
      default:
        return <MyAccountColumn />;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-[calc(100vh-12rem)] flex flex-col">
      {/* Main content area */}
      <div className="flex-1 min-h-0">
        {renderTabContent()}
      </div>

      {/* Tab navigation at bottom */}
      <div className="mt-4 bg-[#2D1810]/90 backdrop-blur-sm border border-[#8B4513]/30 rounded-lg p-2">
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-2 text-xs font-bold transition-all duration-200 border-2 volter-font",
                activeTab === tab.id
                  ? `${tab.activeColor} text-white border-white/30`
                  : `${tab.color} ${tab.hoverColor} text-white/80 hover:text-white border-transparent hover:border-white/20`
              )}
              style={{
                textShadow: activeTab === tab.id 
                  ? '1px 1px 2px rgba(0,0,0,0.8)' 
                  : '1px 1px 1px rgba(0,0,0,0.6)'
              }}
            >
              <div className={cn(
                "transition-transform duration-200",
                activeTab === tab.id ? "scale-110" : "scale-100"
              )}>
                {tab.icon}
              </div>
              <span className="leading-none">
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};