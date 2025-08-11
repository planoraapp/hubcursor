
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, Users, Settings, ShoppingCart, Edit, Camera, Gamepad2, User, MessageSquare, Heart, Trophy, Newspaper } from 'lucide-react';
import { useSimpleAuth } from '../hooks/useSimpleAuth';

interface CollapsibleSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const CollapsibleSidebar = ({ activeSection, setActiveSection }: CollapsibleSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useSimpleAuth();

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('sidebarStateChange', {
      detail: { isCollapsed: newState }
    }));
  };

  const menuItems = [
    { id: 'home', name: 'Início', icon: Home, path: '/' },
    { id: 'console', name: 'Console Habbo', icon: Gamepad2, path: '/console' },
    { id: 'editor', name: 'Editor', icon: Edit, path: '/editor' },
    { id: 'catalogo', name: 'Catálogo', icon: ShoppingCart, path: '/catalogo' },
    { id: 'mercado', name: 'Marketplace', icon: Trophy, path: '/mercado' }, // Corrigido para /mercado
    { id: 'news', name: 'Notícias', icon: Newspaper, path: '/news' },
    { id: 'forum', name: 'Fórum', icon: MessageSquare, path: '/forum' },
    { id: 'photos', name: 'Galeria', icon: Camera, path: '/photos' },
    // Links removidos até terem rotas definidas:
    // { id: 'profile', name: 'Meu Perfil', icon: User, path: `/profile/${habboAccount?.habbo_name}` },
    // { id: 'settings', name: 'Configurações', icon: Settings, path: '/configuracoes' },
  ];

  const handleNavigation = (item: any) => {
    setActiveSection(item.id);
    navigate(item.path);
  };

  // Update active section based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find(item => item.path === currentPath);
    if (currentItem) {
      setActiveSection(currentItem.id);
    }
  }, [location.pathname]);

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-lg transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-blue-500/30">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">HH</span>
              </div>
              <span className="font-bold text-lg">HabboHub</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-blue-500/30 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              activeSection === item.id
                ? 'bg-blue-500/50 border-l-4 border-white shadow-md'
                : 'hover:bg-blue-500/30'
            }`}
            title={isCollapsed ? item.name : ''}
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium">{item.name}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4">
        {!isCollapsed && (
          <div className="text-xs text-blue-200 text-center">
            <p>HabboHub v2.0</p>
            <p>© 2024</p>
          </div>
        )}
      </div>
    </div>
  );
};
