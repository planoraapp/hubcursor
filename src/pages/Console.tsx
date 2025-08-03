
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { UserProfileCard } from '../components/console/UserProfileCard';
import { ProfileNavigation } from '../components/console/ProfileNavigation';
import { ProfileSections } from '../components/console/ProfileSections';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

const Console = () => {
  const [activeSection, setActiveSection] = useState('console');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeProfileSection, setActiveProfileSection] = useState('feed');
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

  const renderContent = () => (
    <div className="space-y-6">
      <UserProfileCard />
      <ProfileNavigation 
        activeSection={activeProfileSection} 
        setActiveSection={setActiveProfileSection} 
      />
      <ProfileSections activeSection={activeProfileSection} />
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Console Habbo"
            icon="/assets/2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 min-h-full">
            {renderContent()}
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
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Console;
