
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Newspaper, MessageCircle, Package, Award, Palette, ShoppingCart, Settings, User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';
import { UserProfile } from './UserProfile';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';

interface CollapsibleSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const CollapsibleSidebar = ({ activeSection, setActiveSection }: CollapsibleSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'noticias', label: t('noticias'), icon: Newspaper, path: '/noticias' },
    { id: 'forum', label: t('forum'), icon: MessageCircle, path: '/forum' },
    { id: 'catalogo', label: t('catalogo'), icon: Package, path: '/catalogo' },
    { id: 'emblemas', label: t('emblemas'), icon: Award, path: '/emblemas' },
    { id: 'editor', label: t('editor'), icon: Palette, path: '/editor' },
    { id: 'mercado', label: t('mercado'), icon: ShoppingCart, path: '/mercado' },
    { id: 'ferramentas', label: 'Ferramentas', icon: Settings, path: '/ferramentas' },
  ];

  const handleNavClick = (item: any) => {
    setActiveSection(item.id);
    navigate(item.path);
  };

  const handleConnectHabbo = () => {
    navigate('/connect-habbo');
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-100 to-slate-200 shadow-xl flex flex-col min-h-screen transition-all duration-300`}>
      {/* Header com Logo e Toggle */}
      <div className="relative">
        <div className="text-center p-6">
          <img 
            src="/assets/habbohub.png" 
            alt="HABBO HUB" 
            className={`mx-auto mb-4 ${isCollapsed ? 'w-12' : 'max-w-[180px]'} h-auto transition-all duration-300`}
          />
        </div>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-white border border-gray-300 rounded-full p-1 shadow-md hover:shadow-lg transition-shadow z-10"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      
      {/* User Profile */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} transition-all duration-300`}>
        <UserProfile collapsed={isCollapsed} />
      </div>
      
      {/* Navigation */}
      <nav className={`flex flex-col space-y-2 ${isCollapsed ? 'px-2' : 'px-4'} flex-1 transition-all duration-300`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                ${activeSection === item.id 
                  ? 'bg-sky-400 text-white shadow-md' 
                  : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-sm'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={20} />
              <span className={`${isCollapsed ? 'hidden' : 'block'} transition-all duration-300`}>{item.label}</span>
            </button>
          );
        })}
        
        {/* Botão de Login/Conectar */}
        <button
          onClick={handleConnectHabbo}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium bg-green-500 text-white hover:bg-green-600 hover:shadow-sm"
          title={isCollapsed ? (isLoggedIn ? 'Perfil' : 'Entrar') : ''}
        >
          {isLoggedIn ? <User size={20} /> : <LogIn size={20} />}
          <span className={`${isCollapsed ? 'hidden' : 'block'} transition-all duration-300`}>
            {isLoggedIn ? 'Meu Perfil' : 'Entrar'}
          </span>
        </button>
      </nav>
      
      {/* Premium Ad */}
      {!isCollapsed && (
        <div className="p-4 bg-white/80 backdrop-blur-sm mx-4 rounded-lg mb-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-2">{t('habboPremiumTitle')}</h3>
          <p className="text-sm text-gray-600 mb-3">{t('habboPremiumDesc')}</p>
          <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200">
            {t('subscribeNow')}
          </button>
        </div>
      )}
      
      {/* Language Selector */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} transition-all duration-300`}>
        <LanguageSelector collapsed={isCollapsed} />
      </div>
    </aside>
  );
};
