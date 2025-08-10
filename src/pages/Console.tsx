
import React, { useState, useCallback } from 'react';
import { MyAccountColumn } from '@/components/console/MyAccountColumn';
import { HotelFeedColumn } from '@/components/console/HotelFeedColumn';
import { FriendsFeedColumn } from '@/components/console/FriendsFeedColumn';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

const Console: React.FC = () => {
  const { isLoggedIn, habboAccount } = useUnifiedAuth();
  const [currentProfileUniqueId, setCurrentProfileUniqueId] = useState<string>(
    habboAccount?.habbo_name || 'Beebop'
  );
  const [activeFriendsTab, setActiveFriendsTab] = useState<'recent' | 'list'>('recent');

  const handleSearchUser = useCallback((uniqueId: string) => {
    setCurrentProfileUniqueId(uniqueId);
  }, []);

  const handleNavigateToFriendsTab = useCallback((tab: 'recent' | 'list') => {
    setActiveFriendsTab(tab);
  }, []);

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#4B5563] min-h-screen p-4 md:p-8">
        {/* Column 1: My Account */}
        <div className="lg:col-span-1">
          <MyAccountColumn />
        </div>

        {/* Column 2: Hotel Feed */}
        <div className="lg:col-span-1">
          <HotelFeedColumn />
        </div>

        {/* Column 3: Friends Feed */}
        <div className="lg:col-span-1">
          <FriendsFeedColumn
            onSearchUser={handleSearchUser}
            activeTab={activeFriendsTab}
            onTabChange={handleNavigateToFriendsTab}
          />
        </div>
      </div>
    </div>
  );
};

export default Console;
