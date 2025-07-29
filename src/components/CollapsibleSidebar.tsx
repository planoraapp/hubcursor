
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';
import { UserProfilePopover } from './UserProfilePopover';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { getUserByName } from '../services/habboApi';

interface CollapsibleSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const CollapsibleSidebar = ({ activeSection, setActiveSection }: CollapsibleSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false); // Mudado para false por padrão
  const [isPinned, setIsPinned] = useState(true); // Mudado para true por padrão
  const [isHovered, setIsHovered] = useState(false);
  const [habboData, setHabboData] = useState<any>(null);
  const { t } = useLanguage();
  const { isLoggedIn, habboAccount, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Fetch current Habbo data when logged in
  useEffect(() => {
    if (isLoggedIn && habboAccount) {
      getUserByName(habboAccount.habbo_name).then(data => {
        setHabboData(data);
      }).catch(console.error);
    }
  }, [isLoggedIn, habboAccount]);

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

  // Add admin link if user is admin
  if (isAdmin()) {
    navItems.push({
      id: 'adminhub',
      label: 'Admin Hub',
      icon: '/assets/ferramentas.png',
      path: '/adminhub'
    });
  }

  const handleNavClick = (item: any) => {
    setActiveSection(item.id);
    setIsPinned(true);
    navigate(item.path);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setIsPinned(!isCollapsed);
  };

  const shouldShowExpanded = !isCollapsed && (isPinned || isHovered);

  // Send sidebar state to parent components
  useEffect(() => {
    const event = new CustomEvent('sidebarStateChange', {
      detail: { isCollapsed: !shouldShowExpanded }
    });
    window.dispatchEvent(event);
  }, [shouldShowExpanded]);

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
              src={shouldShowExpanded ? "/assets/habbohub.gif" : "/assets/hub.gif"}
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
        
        {/* Avatar Interativo com Popover */}
        <div className={`${shouldShowExpanded ? 'px-4' : 'px-2'} mb-6 transition-all duration-300`}>
          <UserProfilePopover side="right" align="start">
            <div className="flex flex-col items-center cursor-pointer hover:bg-amber-100 rounded-lg p-2 transition-colors">
              <div className="relative mb-2">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                  <img
                    src={isLoggedIn && habboData ? 
                      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${habboData.figureString}&direction=2&head_direction=2&gesture=sml&size=s&frame=1&headonly=1` 
                      : '/assets/frank.png'
                    }
                    alt={isLoggedIn && habboAccount ? habboAccount.habbo_name : 'Frank'}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white ${isLoggedIn && habboAccount ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              {shouldShowExpanded && (
                <div className="text-center">
                  <h3 className="font-bold text-gray-800 text-sm volter-font">{isLoggedIn && habboAccount ? habboAccount.habbo_name : 'Visitante'}</h3>
                  <p className="text-xs text-gray-600 volter-font">{isLoggedIn && habboData ? habboData.motto : 'Não conectado'}</p>
                </div>
              )}
            </div>
          </UserProfilePopover>
        </div>
        
        {/* Navigation */}
        <nav className={`flex flex-col space-y-2 ${shouldShowExpanded ? 'px-4' : 'px-2'} flex-1 transition-all duration-300`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`
                flex items-center rounded-lg transition-all duration-200 font-medium border-0 outline-0 overflow-hidden
                ${activeSection === item.id 
                  ? 'bg-gray-300 text-gray-800 shadow-md' 
                  : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                }
                ${!shouldShowExpanded ? 'justify-center w-16 h-16' : 'h-12'}
              `}
              title={!shouldShowExpanded ? item.label : ''}
            >
              <div className={`flex items-center justify-center ${!shouldShowExpanded ? 'w-16 h-16' : 'w-12 h-12'}`}>
                <img src={item.icon} alt={item.label} className={`${!shouldShowExpanded ? 'w-8 h-8' : 'w-5 h-5'}`} />
              </div>
              {shouldShowExpanded && (
                <span className="ml-3 volter-font transition-all duration-300">{item.label}</span>
              )}
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
