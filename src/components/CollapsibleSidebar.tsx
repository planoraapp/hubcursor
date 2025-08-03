
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AnimatedConsole } from './AnimatedConsole';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const CollapsibleSidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isAdmin } = useAuth();

  useEffect(() => {
    const event = new CustomEvent('sidebarStateChange', {
      detail: { isCollapsed }
    });
    window.dispatchEvent(event);
  }, [isCollapsed]);

  const menuItems = [
    { id: 'home', name: 'Home', icon: '/assets/home.png', path: '/' },
    { id: 'forum', name: 'Fórum', icon: '/assets/BatePapo1.png', path: '/forum' },
    { id: 'console', name: 'Console', icon: 'animated', path: '/console' },
    { id: 'noticias', name: 'Notícias', icon: '/assets/news.png', path: '/noticias' },
    { id: 'mercado', name: 'Mercado', icon: '/assets/Diamante.png', path: '/mercado' },
    { id: 'catalogo', name: 'Catálogo', icon: '/assets/Carrinho.png', path: '/catalogo' },
    { id: 'emblemas', name: 'Emblemas', icon: '/assets/emblemas.png', path: '/emblemas' },
    { id: 'editor', name: 'Editor', icon: '/assets/editorvisuais.png', path: '/editor' },
    { id: 'ferramentas', name: 'Ferramentas', icon: '/assets/ferramentas.png', path: '/ferramentas' },
  ];

  if (isAdmin()) {
    menuItems.push({
      id: 'admin-hub',
      name: 'Admin Hub',
      icon: '/assets/ferramentas.png',
      path: '/admin-hub'
    });
  }

  const handleItemClick = (item: typeof menuItems[0]) => {
    setActiveSection(item.id);
    navigate(item.path);
  };

  const getCurrentActiveSection = () => {
    const path = location.pathname;
    const routeToItemMap: Record<string, string> = {
      '/': 'home',
      '/forum': 'forum',
      '/console': 'console',
      '/noticias': 'noticias',
      '/mercado': 'mercado',
      '/catalogo': 'catalogo',
      '/emblemas': 'emblemas',
      '/editor': 'editor',
      '/ferramentas': 'ferramentas',
      '/admin-hub': 'admin-hub'
    };

    return routeToItemMap[path] || 'home';
  };

  const currentSection = getCurrentActiveSection();

  return (
    <div className={`fixed left-0 top-0 h-full transition-all duration-300 z-40 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`} style={{ backgroundColor: '#f5f5dc' }}>
      {/* Header */}
      <div className="relative" style={{ backgroundColor: '#f5f5dc' }}>
        {!isCollapsed && (
          <div className="p-4">
            <img src="/assets/habbohub.gif" alt="HABBO HUB" className="w-full h-auto" />
          </div>
        )}
        
        {/* Collapse button positioned below logo */}
        <div className="absolute right-2" style={{ top: isCollapsed ? '16px' : '80px' }}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 bg-white/80 hover:bg-white rounded-lg flex items-center justify-center text-lg font-bold shadow-md transition-colors border-2 border-black"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-b-2 border-black mx-4"></div>

      {/* Menu Items */}
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = currentSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'hover:bg-white/50 text-gray-700'
                }`}
              >
                <div className={`flex items-center justify-center ${isCollapsed ? 'w-8 h-8' : 'w-8 h-8'}`}>
                  {item.icon === 'animated' ? (
                    <AnimatedConsole 
                      isActive={isActive && currentSection === 'console'} 
                      className="w-8 h-8"
                    />
                  ) : (
                    <img 
                      src={item.icon} 
                      alt={item.name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                </div>
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <img src="/assets/LogoSulake1.png" alt="Sulake" className="h-6 mx-auto opacity-50" />
          <p className="text-xs text-gray-500 mt-1">Habbo Hub v3.0</p>
        </div>
      )}
    </div>
  );
};
