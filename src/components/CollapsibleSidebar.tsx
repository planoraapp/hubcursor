
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, LogIn, LogOut } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { navigationConfig } from '@/config/navigation';

interface CollapsibleSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  activeSection,
  setActiveSection
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { isLoggedIn, habboAccount, logout } = useUnifiedAuth();

  useEffect(() => {
    const event = new CustomEvent('sidebarStateChange', {
      detail: { isCollapsed }
    });
    window.dispatchEvent(event);
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={`
      fixed left-0 top-0 h-full 
      bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200
      border-r border-amber-300 shadow-lg z-40
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Header with Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-amber-300">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <img 
              src="/assets/LogoHabbo.png" 
              alt="HabboHub" 
              className="w-8 h-8"
              style={{ imageRendering: 'pixelated' }}
            />
            <h1 className="text-lg font-bold text-amber-900 volter-font">
              HabboHub
            </h1>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-amber-200 text-amber-700 hover:text-amber-900 transition-colors"
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Login Area */}
      <div className="p-4 border-b border-amber-300">
        {isLoggedIn && habboAccount ? (
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            {!isCollapsed && (
              <>
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?size=s&user=${habboAccount.habbo_name}&action=wav&direction=2&head_direction=2&gesture=sml`}
                    alt={habboAccount.habbo_name} 
                  />
                  <AvatarFallback className="bg-amber-300 text-amber-900">
                    {habboAccount.habbo_name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-900 truncate">
                    {habboAccount.habbo_name}
                  </p>
                  <p className="text-xs text-amber-700">
                    Habbo {habboAccount.hotel?.toUpperCase()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-amber-700 hover:text-amber-900 hover:bg-amber-200"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
            {isCollapsed && (
              <Avatar className="w-8 h-8">
                <AvatarImage 
                  src={`https://www.habbo.com.br/habbo-imaging/avatarimage?size=s&user=${habboAccount.habbo_name}&action=wav&direction=2&head_direction=2&gesture=sml`}
                  alt={habboAccount.habbo_name} 
                />
                <AvatarFallback className="bg-amber-300 text-amber-900 text-xs">
                  {habboAccount.habbo_name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ) : (
          <div className={`${isCollapsed ? 'flex justify-center' : ''}`}>
            {!isCollapsed ? (
              <Link to="/login">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  <LogIn className="w-4 h-4 mr-2" />
                  Fazer Login
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                  <LogIn className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-2 space-y-1 scrollbar-stealth overflow-y-auto">
        {navigationConfig.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActiveSection(item.id)}
              className={`
                group relative flex items-center px-3 py-3 rounded-xl transition-all duration-200
                ${active 
                  ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-amber-900 shadow-md' 
                  : 'text-amber-700 hover:text-amber-900 hover:bg-amber-200'
                }
                ${isCollapsed ? 'justify-center' : 'justify-start'}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
              
              {!isCollapsed && (
                <>
                  <span className="ml-3 font-medium volter-font text-sm">
                    {item.label}
                  </span>
                  
                  {item.isNew && (
                    <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      NOVO
                    </span>
                  )}
                </>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="
                  absolute left-full ml-2 px-3 py-2 bg-amber-800 text-white text-sm rounded-lg
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200 whitespace-nowrap z-50 border border-amber-600
                ">
                  {item.label}
                  {item.isNew && (
                    <span className="ml-2 bg-red-500 text-xs px-1.5 py-0.5 rounded">NOVO</span>
                  )}
                </div>
              )}

              {/* Active indicator */}
              {active && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-amber-900 rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-amber-300">
        {!isCollapsed ? (
          <div className="text-center">
            <p className="text-xs text-amber-700 volter-font">
              HabboHub v2.0
            </p>
            <p className="text-xs text-amber-600 mt-1">
              by Beebop
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Online" />
          </div>
        )}
      </div>
    </div>
  );
};
