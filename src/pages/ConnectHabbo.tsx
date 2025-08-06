
import { ConnectHabboFormEnhanced } from '../components/ConnectHabboFormEnhanced';
import { DebugAuthInfo } from '../components/DebugAuthInfo';
import { AdSpace } from '../components/AdSpace';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { useState } from 'react';

const ConnectHabbo = () => {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Conectar Conta Habbo"
            icon="/assets/2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <AdSpace type="horizontal" className="mb-6" />
          <DebugAuthInfo />
          <ConnectHabboFormEnhanced />
          <AdSpace type="wide" className="mt-6" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat bg-cover" 
         style={{ 
           backgroundImage: 'url(/assets/bghabbohub.png)',
           margin: 0,
           padding: 0,
           width: '100vw',
           height: '100vh'
         }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection="connect" setActiveSection={() => {}} />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-4 md:p-8">
            <PageHeader 
              title="Conectar Conta Habbo"
              icon="/assets/2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png"
              backgroundImage="/assets/1360__-3C7.png"
            />
            
            <AdSpace type="horizontal" className="mb-6" />
            
            <DebugAuthInfo />
            
            <div className="flex justify-center">
              <ConnectHabboFormEnhanced />
            </div>
            
            <AdSpace type="wide" className="mt-6" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConnectHabbo;
