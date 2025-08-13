
import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ConsoleMainContent } from '@/components/console/ConsoleMainContent';
import { MyAccountColumn } from '@/components/console/MyAccountColumn';

const Console: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a365d] via-[#2d3748] to-[#1a202c] flex">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="flex h-full">
          {/* Console Main Content */}
          <div className="flex-1 p-6">
            <ConsoleMainContent />
          </div>
          
          {/* Right Sidebar - My Account */}
          <div className="w-80 p-6 border-l border-white/10">
            <MyAccountColumn />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Console;
