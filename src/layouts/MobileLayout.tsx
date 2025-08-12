import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUnifiedAuth } from '../hooks/useUnifiedAuth';
import { useLanguage } from '../hooks/useLanguage';
import { UserProfilePopover } from '../components/UserProfilePopover';
import { HabboMobileDock, DockItem } from '../components/ui/habbo-mobile-dock';
import { AnimatedConsole } from '../components/AnimatedConsole';
import { getUserByName } from '../services/habboApi';

const MobileLayout = ({ children }: { children: React.ReactNode }) => {
  const [habboData, setHabboData] = useState<any>(null);
  const { isLoggedIn, habboAccount } = useUnifiedAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is admin
  const isAdmin = () => {
    return habboAccount?.is_admin === true;
  };

  // Fetch current Habbo data when logged in
  useEffect(() => {
    if (isLoggedIn && habboAccount) {
      getUserByName(habboAccount.habbo_name).then(data => {
        setHabboData(data);
      }).catch(console.error);
    }
  }, [isLoggedIn, habboAccount]);

  // Define todos os itens de menu para a dock
  const allDockItems: DockItem[] = [
    { id: 'home', label: t('home'), icon: '/assets/home.png', order: 1 },
    { id: 'forum', label: t('forum'), icon: '/assets/BatePapo1.png', order: 2 },
    { id: 'console', label: t('console'), icon: 'animated', order: 3 },
    { id: 'tools', label: t('tools'), icon: '/assets/ferramentas.png', order: 4 },
    { id: 'more', label: t('more'), icon: '/assets/ferramentas.png', order: 5 },
    // Ferramentas (irão para o popover)
    { id: 'catalogo', label: t('catalogo'), icon: '/assets/Carrinho.png', order: 6 },
    { id: 'emblemas', label: t('emblemas'), icon: '/assets/emblemas.png', order: 7 },
    { id: 'editor', label: t('editor'), icon: '/assets/editorvisuais.png', order: 8 },
    { id: 'mercado', label: t('mercado'), icon: '/assets/Diamante.png', order: 9 },
    // Páginas extras (irão para "Mais")
    { id: 'noticias', label: t('noticias'), icon: '/assets/news.png', order: 10 },
  ];

  // Adicionar admin link se user é admin
  if (isAdmin()) {
    allDockItems.push({
      id: 'admin-hub',
      label: 'Admin Hub',
      icon: '/assets/ferramentas.png',
      order: 12
    });
  }

  const handleDockItemClick = (itemId: string) => {
    const routeMap: Record<string, string> = {
      'home': '/',
      'forum': '/forum',
      'console': '/console',
      'catalogo': '/catalogo',
      'emblemas': '/emblemas',
      'editor': '/editor',
      'mercado': '/mercado',
      'noticias': '/noticias',
      'admin-hub': '/admin-hub'
    };

    const route = routeMap[itemId];
    if (route) {
      navigate(route);
    }
  };

  const getCurrentActiveSection = () => {
    const path = location.pathname;
    const routeToItemMap: Record<string, string> = {
      '/': 'home',
      '/forum': 'forum',
      '/console': 'console',
      '/catalogo': 'catalogo',
      '/emblemas': 'emblemas',
      '/editor': 'editor',
      '/mercado': 'mercado',
      '/noticias': 'noticias',
      '/admin-hub': 'admin-hub'
    };

    return routeToItemMap[path] || 'home';
  };

  // Avatar para mobile - só cabeça com direção diagonal
  const userAvatarUrl = isLoggedIn && habboData ? 
    `https://www.habbo.com/habbo-imaging/avatarimage?figure=${habboData.figureString}&direction=4&head_direction=4&gesture=sml&size=s&frame=1&headonly=1` 
    : '/assets/frank.png';

  // Avatar para header mobile - também só cabeça diagonal
  const headerAvatarUrl = isLoggedIn && habboData ? 
    `https://www.habbo.com/habbo-imaging/avatarimage?figure=${habboData.figureString}&direction=4&head_direction=4&gesture=sml&size=s&frame=1&headonly=1` 
    : '/assets/frank.png';

  // Console central - usa AnimatedConsole se for a página console
  const currentSection = getCurrentActiveSection();
  const consoleElement = currentSection === 'console' ? (
    <AnimatedConsole isActive={true} className="w-12 h-12" />
  ) : (
    <img 
      src="/assets/consoleoff.png" 
      alt="Console" 
      className="w-12 h-12"
      style={{ imageRendering: 'pixelated' }}
    />
  );

  return (
    <div className="min-h-screen bg-repeat pb-20" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      {/* Header with logo and avatar - aplicando cor bege */}
      <div 
        className="shadow-lg p-4 flex items-center justify-between border-b-4"
        style={{ 
          backgroundColor: '#f5f5dc',
          borderBottomColor: '#000'
        }}
      >
        <div className="flex items-center">
          <img 
            src="/assets/habbohub.gif" 
            alt="HABBO HUB" 
            className="h-10 w-auto"
          />
        </div>
        <div className="flex items-center space-x-4">
          <UserProfilePopover side="bottom" align="end">
            <div className="flex items-center cursor-pointer hover:bg-black/10 rounded-lg p-2 transition-colors">
              <div className="relative">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-black shadow-lg">
                  <img
                    src={headerAvatarUrl}
                    alt={isLoggedIn && habboAccount ? habboAccount.habbo_name : 'Frank'}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white ${isLoggedIn && habboAccount ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>
          </UserProfilePopover>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>

      {/* HabboMobileDock com Console Central Animado */}
      <HabboMobileDock
        menuItems={allDockItems}
        userAvatarUrl={userAvatarUrl}
        onItemClick={handleDockItemClick}
        activeItemId={getCurrentActiveSection()}
        isLoggedIn={isLoggedIn}
        currentPath={location.pathname}
        customCenterElement={consoleElement}
      />
    </div>
  );
};

export default MobileLayout;
