
import React from 'react';
import MobileLayout from '../layouts/MobileLayout';
import { MyAccountColumn } from '@/components/console/MyAccountColumn';
import { EnhancedFriendsFeedColumn } from '@/components/console/EnhancedFriendsFeedColumn';
import { OfficialHotelTickerColumn } from '@/components/console/OfficialHotelTickerColumn';
import { useInitializeUserFeed } from '@/hooks/useInitializeUserFeed';
import { useActivityDetector } from '@/hooks/useActivityDetector';
import { Loader2, Radio } from 'lucide-react';

export const Console: React.FC = () => {
  const { isInitializing } = useInitializeUserFeed();
  
  // Initialize activity detection system
  const { isLoading: isDetectorLoading } = useActivityDetector({
    hotel: 'com.br',
    limit: 20,
    enabled: true
  });

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#5A6573] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">Console do Hotel</h1>
              <div className="flex items-center gap-2">
                {isDetectorLoading && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-lg border border-blue-400/30">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-300" />
                    <span className="text-xs text-blue-200">Analisando atividades</span>
                  </div>
                )}
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Inicializando seu feed...</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
            {/* Left Column - My Account */}
            <div className="space-y-6">
              <MyAccountColumn />
            </div>

            {/* Center Column - Hotel Feed */}
            <div className="xl:col-span-1">
              <OfficialHotelTickerColumn />
            </div>

            {/* Right Column - Enhanced Friends Feed */}
            <div className="xl:col-span-1">
              <EnhancedFriendsFeedColumn />
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};
