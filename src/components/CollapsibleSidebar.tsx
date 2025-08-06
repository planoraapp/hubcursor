import React, { useState, useEffect, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Sidebar } from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from './UserProfile';

interface CollapsibleSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({ activeSection, setActiveSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user, habboAccount } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const shouldCollapse = window.innerWidth < 768;
      setIsCollapsed(shouldCollapse);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const event = new CustomEvent('sidebarStateChange', { detail: { isCollapsed } });
    window.dispatchEvent(event);
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div>
      {/* Mobile View: Sheet component */}
      {isCollapsed && (
        <Sheet>
          <SheetTrigger asChild>
            <Menu className="absolute top-4 left-4 text-white cursor-pointer" />
          </SheetTrigger>
          <SheetContent className="w-64 bg-gray-900 text-white">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navegue pelo Habbo Hub
              </SheetDescription>
            </SheetHeader>
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} habboName={habboAccount?.habbo_name || ''} />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop View: Fixed sidebar */}
      {!isCollapsed && (
        <div
          ref={sidebarRef}
          className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-md z-50"
        >
          <div className="p-4">
            <h1 className="text-lg font-bold mb-4 volter-font">Habbo Hub</h1>
            {user && habboAccount ? (
              <UserProfile />
            ) : (
              <p className="text-sm">Faça login para ver mais.</p>
            )}
          </div>
          <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} habboName={habboAccount?.habbo_name || ''} />
        </div>
      )}
    </div>
  );
};
