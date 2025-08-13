
import React, { useState } from 'react';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';
import { MyAccountColumn } from '@/components/console/MyAccountColumn';
import { OptimizedHotelFeedColumn } from '@/components/console2/OptimizedHotelFeedColumn';
import { OptimizedUserDiscoveryColumn } from '@/components/console2/OptimizedUserDiscoveryColumn';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

const Console: React.FC = () => {
  const [activeSection, setActiveSection] = useState('console');
  const { isLoggedIn } = useUnifiedAuth();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a365d] via-[#2d3748] to-[#1a202c] flex">
        <CollapsibleSidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />
        
        <div className="flex-1 ml-64 p-6 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Console do Habbo</h2>
            <p className="text-white/70">Faça login para acessar o console</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a365d] via-[#2d3748] to-[#1a202c] flex">
      <CollapsibleSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      
      <div className="flex-1 ml-64 p-6">
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
            <OptimizedHotelFeedColumn />
          </div>

          {/* Right Column - User Discovery */}
          <div className="xl:col-span-1">
            <OptimizedUserDiscoveryColumn />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Console;
