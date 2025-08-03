
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { UserProfilePopover } from '../components/UserProfilePopover';
import { HabboMobileDock, DockItem } from '../components/ui/habbo-mobile-dock';
import { getUserByName } from '../services/habboApi';

const MobileLayout = ({ children }: { children: React.ReactNode }) => {
  const [habboData, setHabboData] = useState<any>(null);
  const { isLoggedIn, habboAccount, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

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
    { id: 'console', label: t('console'), icon: '/assets/ferramentas.png', order: 3 },
    { id: 'tools', label: t('tools'), icon: '/assets/ferramentas.png', order: 4 },
    { id: 'more', label: t('more'), icon: '/assets/ferramentas.png', order: 5 },
    // Ferramentas (irão para o popover)
    { id: 'catalogo', label: t('catalogo'), icon: '/assets/Carrinho.png', order: 6 },
    { id: 'emblemas', label: t('emblemas'), icon: '/assets/emblemas.png', order: 7 },
    { id: 'editor', label: t('editor'), icon: '/assets/editorvisuais.png', order: 8 },
    { id: 'mercado', label: t('mercado'), icon: '/assets/Diamante.png', order: 9 },
    // Páginas extras (irão para "Mais")
    { id: 'noticias', label: t('noticias'), icon: '/assets/news.png', order: 10 },
    { id: 'eventos', label: 'Eventos', icon: '/assets/eventos.png', order: 11 },
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
      'eventos': '/eventos',
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
      '/eventos': 'eventos',
      '/admin-hub': 'admin-hub'
    };

    return routeToItemMap[path] || 'home';
  };

  const userAvatarUrl = isLoggedIn && habboData ? 
    `https://www.habbo.com/habbo-imaging/avatarimage?figure=${habboData.figureString}&direction=2&head_direction=2&gesture=sml&size=s&frame=1&headonly=1` 
    : '/assets/frank.png';

  return (
    <div className="min-h-screen bg-repeat pb-20" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      {/* Header with logo and avatar */}
      <div className="bg-amber-50 shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/assets/habbohub.gif" 
            alt="HABBO HUB" 
            className="h-10 w-auto"
          />
        </div>
        <div className="flex items-center space-x-4">
          <UserProfilePopover side="bottom" align="end">
            <div className="flex items-center cursor-pointer hover:bg-amber-100 rounded-lg p-2 transition-colors">
              <div className="relative">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg">
                  <img
                    src={userAvatarUrl}
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

      {/* HabboMobileDock */}
      <HabboMobileDock
        menuItems={allDockItems}
        userAvatarUrl={userAvatarUrl}
        onItemClick={handleDockItemClick}
        activeItemId={getCurrentActiveSection()}
        isLoggedIn={isLoggedIn}
        currentPath={location.pathname}
      />
    </div>
  );
};

export default MobileLayout;
