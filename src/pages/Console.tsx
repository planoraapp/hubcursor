
import React, { useState, useEffect } from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MyAccountColumn } from '@/components/console/MyAccountColumn';
import { HotelPhotoFeedColumn } from '@/components/console2/HotelPhotoFeedColumn';
import { UserSearchColumn } from '@/components/console2/UserSearchColumn';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

const Console: React.FC = () => {
  const [activeSection, setActiveSection] = useState('console');
  const { isLoggedIn } = useUnifiedAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#1a365d] via-[#2d3748] to-[#1a202c] flex">
        <NewAppSidebar />
        
        <div className="flex-1 p-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white mb-2">Console do Habbo</h1>
            <p className="text-white/70">Gerencie sua experiência no HabboHub</p>
          </div>

          {/* Layout Fixo Mobile-First - 3 colunas com largura fixa */}
          <div className="flex gap-4 h-[calc(100vh-10rem)] overflow-hidden">
            {/* Left Column - My Account - Largura fixa mobile */}
            <div className="w-[360px] flex-shrink-0">
              <MyAccountColumn />
            </div>

            {/* Center Column - Hotel Feed - Largura fixa mobile */}
            <div className="w-[360px] flex-shrink-0">
              <HotelPhotoFeedColumn />
            </div>

            {/* Right Column - User Discovery - Largura fixa mobile */}
            <div className="w-[360px] flex-shrink-0">
              <UserSearchColumn />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Console;
