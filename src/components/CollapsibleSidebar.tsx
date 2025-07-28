
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'noticias', label: t('noticias'), icon: '/assets/news.png', path: '/noticias' },
    { id: 'forum', label: t('forum'), icon: '/assets/BatePapo1.png', path: '/forum' },
    { id: 'catalogo', label: t('catalogo'), icon: '/assets/Carrinho.png', path: '/catalogo' },
    { id: 'emblemas', label: t('emblemas'), icon: '/assets/emblemas.png', path: '/emblemas' },
    { id: 'editor', label: t('editor'), icon: '/assets/editorvisuais.png', path: '/editor' },
    { id: 'mercado', label: t('mercado'), icon: '/assets/Diamante.png', path: '/mercado' },
    { id: 'ferramentas', label: 'Ferramentas', icon: '/assets/ferramentas.png', path: '/ferramentas' },
  ];

  const handleNavClick = (item: any) => {
    setActiveSection(item.id);
    setIsPinned(true); // Pina a sidebar quando clica em qualquer seção
    navigate(item.path);
  };

  const handleConnectHabbo = () => {
    setIsPinned(true); // Pina a sidebar quando clica
    navigate('/connect-habbo');
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setIsPinned(!isCollapsed); // Se expandir, pina. Se colapsar, despina
  };

  const shouldShowExpanded = !isCollapsed && (isPinned || isHovered);

  return (
    <aside 
      className={`${shouldShowExpanded ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-100 to-slate-200 shadow-xl flex flex-col min-h-screen transition-all duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header com Logo e Toggle */}
      <div className="relative">
        <div className="text-center p-6">
          <img 
            src="/assets/habbohub.png" 
            alt="HABBO HUB" 
            className={`mx-auto mb-4 ${shouldShowExpanded ? 'max-w-[180px]' : 'w-12'} h-auto transition-all duration-300`}
          />
        </div>
        
        <button
          onClick={handleToggleCollapse}
          className="absolute -right-3 top-8 bg-white border border-gray-300 rounded-full p-1 shadow-md hover:shadow-lg transition-shadow z-10"
        >
          {shouldShowExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
      
      {/* User Profile */}
      <div className={`${shouldShowExpanded ? 'px-4' : 'px-2'} transition-all duration-300`}>
        <UserProfile collapsed={!shouldShowExpanded} />
      </div>
      
      {/* Navigation */}
      <nav className={`flex flex-col space-y-2 ${shouldShowExpanded ? 'px-4' : 'px-2'} flex-1 transition-all duration-300`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`
              flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
              ${activeSection === item.id 
                ? 'bg-sky-400 text-white shadow-md' 
                : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-sm'
              }
              ${!shouldShowExpanded ? 'justify-center' : ''}
            `}
            title={!shouldShowExpanded ? item.label : ''}
          >
            <img src={item.icon} alt={item.label} className="w-5 h-5" />
            <span className={`${!shouldShowExpanded ? 'hidden' : 'block'} transition-all duration-300`}>{item.label}</span>
          </button>
        ))}
        
        {/* Botão de Login/Conectar */}
        <button
          onClick={handleConnectHabbo}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium bg-green-500 text-white hover:bg-green-600 hover:shadow-sm"
          title={!shouldShowExpanded ? (isLoggedIn ? 'Perfil' : 'Entrar') : ''}
        >
          <img src="/assets/frank.png" alt="Entrar" className="w-5 h-5" />
          <span className={`${!shouldShowExpanded ? 'hidden' : 'block'} transition-all duration-300`}>
            {isLoggedIn ? 'Meu Perfil' : 'Entrar'}
          </span>
        </button>
      </nav>
      
      {/* Language Selector */}
      <div className={`${shouldShowExpanded ? 'px-4' : 'px-2'} transition-all duration-300`}>
        <LanguageSelector collapsed={!shouldShowExpanded} />
      </div>
    </aside>
  );
};
