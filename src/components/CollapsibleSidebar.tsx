
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';
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
  const { isLoggedIn, userData } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'noticias', label: t('noticias'), icon: '/assets/news.png', path: '/noticias' },
    { id: 'eventos', label: 'Eventos', icon: '/assets/eventos.png', path: '/eventos' },
    { id: 'forum', label: t('forum'), icon: '/assets/BatePapo1.png', path: '/forum' },
    { id: 'catalogo', label: t('catalogo'), icon: '/assets/Carrinho.png', path: '/catalogo' },
    { id: 'emblemas', label: t('emblemas'), icon: '/assets/emblemas.png', path: '/emblemas' },
    { id: 'editor', label: t('editor'), icon: '/assets/editorvisuais.png', path: '/editor' },
    { id: 'mercado', label: t('mercado'), icon: '/assets/Diamante.png', path: '/mercado' },
    { id: 'ferramentas', label: 'Ferramentas', icon: '/assets/ferramentas.png', path: '/ferramentas' },
  ];

  const handleNavClick = (item: any) => {
    setActiveSection(item.id);
    setIsPinned(true);
    navigate(item.path);
  };

  const handleAvatarClick = () => {
    setIsPinned(true);
    navigate('/connect-habbo');
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setIsPinned(!isCollapsed);
  };

  const shouldShowExpanded = !isCollapsed && (isPinned || isHovered);

  return (
    <aside 
      className={`${shouldShowExpanded ? 'w-64' : 'w-20'} bg-amber-50 shadow-xl flex flex-col min-h-screen fixed left-0 top-0 z-20 transition-all duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
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
        
        {/* Avatar Interativo */}
        <div className={`${shouldShowExpanded ? 'px-4' : 'px-2'} mb-6 cursor-pointer transition-all duration-300`} onClick={handleAvatarClick}>
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                <img
                  src={isLoggedIn && userData ? `https://www.habbo.com/habbo-imaging/avatarimage?figure=${userData.figureString}&direction=2&head_direction=2&gesture=sml&size=s&frame=1` : '/assets/frank.png'}
                  alt={isLoggedIn && userData ? userData.name : 'Frank'}
                  className="w-full h-full object-cover object-top scale-110 translate-y-1"
                />
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white ${isLoggedIn && userData ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            {shouldShowExpanded && (
              <div className="text-center">
                <h3 className="font-bold text-gray-800 text-sm">{isLoggedIn && userData ? userData.name : 'Visitante'}</h3>
                <p className="text-xs text-gray-600">{isLoggedIn && userData ? userData.motto : 'Não conectado'}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <nav className={`flex flex-col space-y-2 ${shouldShowExpanded ? 'px-4' : 'px-2'} flex-1 transition-all duration-300`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium border-0 outline-0
                ${activeSection === item.id 
                  ? 'bg-gray-300 text-gray-800 shadow-md' 
                  : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                }
                ${!shouldShowExpanded ? 'justify-center w-16 h-16' : ''}
              `}
              title={!shouldShowExpanded ? item.label : ''}
            >
              <img src={item.icon} alt={item.label} className="w-5 h-5" />
              <span className={`${!shouldShowExpanded ? 'hidden' : 'block'} transition-all duration-300`}>{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Language Selector */}
        <div className={`${shouldShowExpanded ? 'px-4' : 'px-2'} transition-all duration-300`}>
          <LanguageSelector collapsed={!shouldShowExpanded} />
        </div>
      </div>
    </aside>
  );
};
