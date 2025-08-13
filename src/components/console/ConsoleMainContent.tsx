
import React from 'react';
import { Card } from '@/components/ui/card';

export const ConsoleMainContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Console Dashboard</h1>
        <p className="text-white/70">Manage your Habbo Hub experience</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
          <p className="text-white/70">System statistics and information</p>
        </Card>
        
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">Activity</h3>
          <p className="text-white/70">Recent activity and logs</p>
        </Card>
        
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">Settings</h3>
          <p className="text-white/70">Configuration options</p>
        </Card>
      </div>
    </div>
  );
};
