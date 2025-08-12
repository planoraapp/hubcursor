
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  ShoppingBag, 
  Star, 
  Settings,
  PaintBucket,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  User,
  BookOpen,
  Trophy,
  Gamepad2
} from 'lucide-react';

interface CollapsibleSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  isNew?: boolean;
}

const menuItems: MenuItem[] = [
  { id: 'inicio', label: 'Início', path: '/', icon: Home },
  { id: 'console', label: 'Habbo Console', path: '/console', icon: User, isNew: true },
  { id: 'editor', label: 'Editor Visual', path: '/editor', icon: PaintBucket },
  { id: 'catalogo', label: 'Catálogo', path: '/catalogo', icon: ShoppingBag },
  { id: 'forum', label: 'Fórum', path: '/forum', icon: MessageSquare },
  { id: 'tops', label: 'Ranking', path: '/tops', icon: Trophy },
  { id: 'marketplace', label: 'Marketplace', path: '/marketplace', icon: Star },
  { id: 'games', label: 'Jogos', path: '/games', icon: Gamepad2 },
  { id: 'blog', label: 'Blog', path: '/blog', icon: BookOpen },
  { id: 'configuracoes', label: 'Configurações', path: '/configuracoes', icon: Settings }
];

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  activeSection,
  setActiveSection
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Dispatch custom event when sidebar state changes
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

  return (
    <div className={`
      fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
      border-r border-slate-700/50 shadow-2xl backdrop-blur-sm z-40
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Header with Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <img 
              src="/assets/LogoHabbo.png" 
              alt="HabboHub" 
              className="w-8 h-8"
              style={{ imageRendering: 'pixelated' }}
            />
            <h1 className="text-lg font-bold text-white volter-font">
              HabboHub
            </h1>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-2 space-y-1">
        {menuItems.map((item) => {
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
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
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
                  absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200 whitespace-nowrap z-50 border border-slate-600
                ">
                  {item.label}
                  {item.isNew && (
                    <span className="ml-2 bg-red-500 text-xs px-1.5 py-0.5 rounded">NOVO</span>
                  )}
                </div>
              )}

              {/* Active indicator */}
              {active && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        {!isCollapsed ? (
          <div className="text-center">
            <p className="text-xs text-slate-400 volter-font">
              HabboHub v2.0
            </p>
            <p className="text-xs text-slate-500 mt-1">
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
