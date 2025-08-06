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
    { id: 'homes', name: 'Homes', icon: '/assets/home.png', path: '/homes' },
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
      '/homes': 'homes',
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
    }`} style={{ backgroundColor: '#ffefd5' }}>
      {/* Header com Logo */}
      <div className="relative p-4" style={{ backgroundColor: '#ffefd5' }}>
        {isCollapsed ? (
          <div className="flex justify-center">
            <img 
              src="/assets/hub.gif" 
              alt="HUB" 
              className="w-12 h-12 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        ) : (
          <img 
            src="/assets/habbohub.gif" 
            alt="HABBO HUB" 
            className="w-full h-auto object-contain" 
            style={{ imageRendering: 'pixelated' }}
          />
        )}
      </div>

      {/* Botão de colapso posicionado na linha divisória */}
      <div className="relative">
        <div className="border-b-2 border-black mx-4"></div>
        <div className="absolute right-2 top-0 transform -translate-y-1/2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 bg-white/80 hover:bg-white rounded-lg flex items-center justify-center text-lg font-bold shadow-md transition-colors border-2 border-black"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4">
        <div className="space-y-3">
          {menuItems.map((item) => {
            const isActive = currentSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-md'
                    : 'hover:bg-white/50'
                }`}
              >
                <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
                  {item.icon === 'animated' ? (
                    <AnimatedConsole 
                      isActive={isActive && currentSection === 'console'} 
                      className="w-10 h-10"
                    />
                  ) : (
                    <img 
                      src={item.icon} 
                      alt={item.name}
                      className="w-10 h-10 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                </div>
                {!isCollapsed && (
                  <span className={`font-medium text-base volter-font flex-1 text-left ${
                    isActive ? 'text-white' : 'text-white'
                  }`} style={{
                    textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                  }}>
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
