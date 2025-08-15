
import React, { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';
import { MyAccountColumn } from '@/components/console/MyAccountColumn';
import { HotelPhotoFeedColumn } from '@/components/console2/HotelPhotoFeedColumn';
import { UserSearchColumn } from '@/components/console2/UserSearchColumn';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

const Console: React.FC = () => {
  const [activeSection, setActiveSection] = useState('console');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isLoggedIn } = useUnifiedAuth();

  useEffect(() => {
    const handleSidebarChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarChange as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a365d] via-[#2d3748] to-[#1a202c] flex">
      <CollapsibleSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      
      <div className={`flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      } p-6`}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Console do Habbo</h1>
          <p className="text-white/70">Gerencie sua experiência no HabboHub</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Left Column - My Account */}
          <div className="xl:col-span-1">
            <MyAccountColumn />
          </div>

          {/* Center Column - Hotel Feed */}
          <div className="xl:col-span-1">
            <HotelPhotoFeedColumn />
          </div>

          {/* Right Column - User Discovery */}
          <div className="xl:col-span-1">
            <UserSearchColumn />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Console;
