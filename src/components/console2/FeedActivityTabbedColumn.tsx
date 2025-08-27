
import React from 'react';
import { FriendsActivityColumn } from './FriendsActivityColumn';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { useFriendsActivitiesDirect } from '@/hooks/useFriendsActivitiesDirect';

export const FeedActivityTabbedColumn: React.FC = () => {
  const { metadata, activities, isLoading, error } = useFriendsActivitiesDirect();

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-habbo-blue to-habbo-yellow">
      <div className="flex-1 p-4 overflow-hidden">
        {/* ✅ Monitor de sistema com dados reais */}
        <SystemHealthMonitor metadata={metadata} />
        
        {/* ✅ Feed de atividades melhorado */}
        <div className="h-full">
          <FriendsActivityColumn />
        </div>
      </div>
    </div>
  );
};
