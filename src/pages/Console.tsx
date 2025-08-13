
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { MyAccountColumn } from '@/components/console/MyAccountColumn';
import { UserDiscoveryColumn } from '@/components/console/UserDiscoveryColumn';
import { PlaceholderColumn } from '@/components/console/PlaceholderColumn';
import { useInitializeUserFeed } from '@/hooks/useInitializeUserFeed';
import { Radio, Activity, Users, Menu } from 'lucide-react';

export const Console: React.FC = () => {
  const { isInitializing } = useInitializeUserFeed();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#5A6573] text-white">
            {/* Header with Sidebar Toggle */}
            <div className="flex items-center gap-4 p-4 border-b border-white/10">
              <SidebarTrigger className="text-white hover:bg-white/10 p-2 rounded-lg">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">Console do Hotel</h1>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-lg border border-green-400/30">
                      <Radio className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-200">Sistema Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-white/80">Monitore atividades em tempo real</p>
                  {isInitializing && (
                    <div className="flex items-center gap-2 text-blue-300">
                      <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Inicializando seu feed...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                {/* Left Column - My Account */}
                <div className="space-y-6">
                  <MyAccountColumn />
                </div>

                {/* Center Column - Hotel Feed Placeholder */}
                <div className="xl:col-span-1">
                  <PlaceholderColumn 
                    title="Feed do Hotel"
                    description="O sistema de feed está sendo reconstruído com nova arquitetura em tempo real. Nova versão otimizada em breve!"
                    icon={Activity}
                  />
                </div>

                {/* Right Column - User Discovery */}
                <div className="xl:col-span-1">
                  <UserDiscoveryColumn />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
