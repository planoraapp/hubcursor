
import React from 'react';
import { News } from './News';
import { Rankings } from './Rankings';
import { RoomsChart } from './RoomsChart';
import { ExploreRooms } from './ExploreRooms';
import { AdSpace } from './AdSpace';
import { HabboFontDemo } from './HabboFontDemo';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <HabboFontDemo />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <News />
          <RoomsChart />
          <ExploreRooms />
        </div>
        
        <div className="space-y-6">
          <Rankings />
          <AdSpace type="medium" />
        </div>
      </div>
    </div>
  );
};
