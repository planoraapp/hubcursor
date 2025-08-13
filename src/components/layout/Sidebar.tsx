
import React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  return (
    <div className={`
      fixed left-0 top-0 h-full bg-gradient-to-b from-[#2d3748] to-[#1a202c] 
      border-r border-white/10 transition-all duration-300 z-10
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-white hover:bg-white/10 mb-4"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
        
        {!collapsed && (
          <div className="text-white">
            <h2 className="text-lg font-semibold mb-4">Console</h2>
            <nav className="space-y-2">
              <div className="px-3 py-2 rounded-md hover:bg-white/10 cursor-pointer">
                Dashboard
              </div>
              <div className="px-3 py-2 rounded-md hover:bg-white/10 cursor-pointer">
                Settings
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};
