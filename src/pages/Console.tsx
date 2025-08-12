
import React from 'react';
import MobileLayout from '../layouts/MobileLayout';
import { MyAccountColumn } from '@/components/console/MyAccountColumn';
import { EnhancedFriendsFeedColumn } from '@/components/console/EnhancedFriendsFeedColumn';
import { OfficialHotelTickerColumn } from '@/components/console/OfficialHotelTickerColumn';

export const Console: React.FC = () => {
  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#5A6573] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Console do Hotel</h1>
            <p className="text-white/80">Monitore atividades em tempo real</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
            {/* Left Column - My Account */}
            <div className="space-y-6">
              <MyAccountColumn />
            </div>

            {/* Center Column - Official Hotel Ticker */}
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
