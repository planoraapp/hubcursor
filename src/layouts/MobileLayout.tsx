
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { UserProfilePopover } from '../components/UserProfilePopover';
import { getUserByName } from '../services/habboApi';

const MobileLayout = ({ children }: { children: React.ReactNode }) => {
  const [showExpandedDock, setShowExpandedDock] = useState(false);
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

  const mainNavItems = [
    { id: 'home', label: 'Home', icon: '/assets/home.png', path: '/' },
    { id: 'noticias', label: t('noticias'), icon: '/assets/news.png', path: '/noticias' },
    { id: 'eventos', label: 'Eventos', icon: '/assets/eventos.png', path: '/eventos' },
    { id: 'forum', label: t('forum'), icon: '/assets/BatePapo1.png', path: '/forum' },
    { id: 'catalogo', label: t('catalogo'), icon: '/assets/Carrinho.png', path: '/catalogo' },
  ];

  const additionalNavItems = [
    { id: 'emblemas', label: t('emblemas'), icon: '/assets/emblemas.png', path: '/emblemas' },
    { id: 'editor', label: t('editor'), icon: '/assets/editorvisuais.png', path: '/editor' },
    { id: 'mercado', label: t('mercado'), icon: '/assets/Diamante.png', path: '/mercado' },
    { id: 'ferramentas', label: 'Ferramentas', icon: '/assets/ferramentas.png', path: '/ferramentas' },
    { id: 'console', label: 'Console', icon: '/assets/ferramentas.png', path: '/console' },
  ];

  // Add admin link if user is admin
  if (isAdmin()) {
    additionalNavItems.push({
      id: 'admin-hub',
      label: 'Admin Hub',
      icon: '/assets/ferramentas.png',
      path: '/admin-hub'
    });
  }

  const handleNavClick = (path: string) => {
    navigate(path);
    setShowExpandedDock(false);
  };

  const getCurrentActiveSection = () => {
    const path = location.pathname;
    const allItems = [...mainNavItems, ...additionalNavItems];
    const activeItem = allItems.find(item => item.path === path);
    return activeItem?.id || 'home';
  };

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
            </div>
          </UserProfilePopover>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Bottom dock */}
      <div className="fixed bottom-0 left-0 right-0 bg-amber-50 shadow-lg border-t border-amber-200 z-50">
        <div className="flex items-center justify-center px-4 py-2">
          {/* Main navigation items */}
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                getCurrentActiveSection() === item.id
                  ? 'bg-amber-200 text-amber-800'
                  : 'text-gray-600 hover:bg-amber-100'
              }`}
            >
              <img src={item.icon} alt={item.label} className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
          
          {/* Expand button */}
          <button
            onClick={() => setShowExpandedDock(!showExpandedDock)}
            className="flex flex-col items-center justify-center p-3 rounded-lg text-gray-600 hover:bg-amber-100 transition-all duration-200"
          >
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${showExpandedDock ? 'rotate-45' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs font-medium">Mais</span>
          </button>
        </div>

        {/* Expanded dock */}
        {showExpandedDock && (
          <div className="border-t border-amber-200 bg-amber-50 p-4">
            <div className="grid grid-cols-4 gap-2">
              {additionalNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                    getCurrentActiveSection() === item.id
                      ? 'bg-amber-200 text-amber-800'
                      : 'text-gray-600 hover:bg-amber-100'
                  }`}
                >
                  <img src={item.icon} alt={item.label} className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium text-center">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileLayout;
