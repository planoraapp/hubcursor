
import React, { useState, useEffect } from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MyAccountColumn } from '@/components/console/MyAccountColumn';
import { FeedActivityTabbedColumn } from '@/components/console2/FeedActivityTabbedColumn';
import { UserSearchColumn } from '@/components/console2/UserSearchColumn';
import { useAuth } from '@/hooks/useAuth';

const Console: React.FC = () => {
  const [activeSection, setActiveSection] = useState('console');
  const { isLoggedIn } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-repeat flex" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <div className="p-4 overflow-hidden">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2 volter-font drop-shadow-lg" 
                  style={{
                    textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                  }}>
                Console do Habbo
              </h1>
              <p className="text-white/70 volter-font drop-shadow">Gerencie sua experiência no HabboHub</p>
            </div>

            <div className="flex gap-4 h-[calc(100vh-12rem)] overflow-x-auto overflow-y-hidden">
              <div className="w-[320px] flex-shrink-0">
                <MyAccountColumn />
              </div>

              <div className="w-[320px] flex-shrink-0">
                <FeedActivityTabbedColumn />
              </div>

              <div className="w-[320px] flex-shrink-0">
                <UserSearchColumn />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Console;
