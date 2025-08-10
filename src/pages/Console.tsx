
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { MyAccountColumn } from '../components/console/MyAccountColumn';
import { HotelFeedColumn } from '../components/console/HotelFeedColumn';
import { FriendsFeedColumn } from '../components/console/FriendsFeedColumn';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

const Console = () => {
  const [activeSection, setActiveSection] = useState('console');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  const renderMainContent = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          <FriendsFeedColumn />
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Console Habbo"
            icon="/assets/2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          {/* Mobile: Stack columns vertically */}
          <div className="space-y-6">
            <MyAccountColumn />
            <HotelFeedColumn />
            <FriendsFeedColumn />
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <PageHeader 
            title="Console Habbo"
            icon="/assets/2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default Console;
