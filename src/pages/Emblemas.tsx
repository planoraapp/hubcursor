
import React, { useState, useEffect } from 'react';
import { NewAppSidebar } from '../components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PageHeader } from '../components/PageHeader';
import { CleanBadgesGrid } from '../components/CleanBadgesGrid';
import { useLanguage } from '../hooks/useLanguage';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

const Emblemas = () => {
  const { t } = useLanguage();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // Listen for sidebar state changes
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
    <div className="flex-1 p-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg h-full flex flex-col overflow-hidden">
        <CleanBadgesGrid />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title={t('badgesTitle')}
            icon="/assets/emblemas.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <CleanBadgesGrid />
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <SidebarProvider>
      <div 
        className="flex min-h-screen w-full"
        style={{ 
          backgroundImage: "url('/assets/bghabbohub.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }}
      >
        <NewAppSidebar />
        
        <main className="flex-1">
          <div className="flex flex-col min-h-screen">
            <PageHeader 
              title={t('badgesTitle')}
              icon="/assets/emblemas.png"
            />
            
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Emblemas;
