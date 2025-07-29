import React, { useState, useEffect } from 'react';
import { Home, Calendar, MessageCircle, Package, Award, Palette, ShoppingCart, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { UserProfilePopover } from '../components/UserProfilePopover';
import { getUserByName } from '../services/habboApi';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { isLoggedIn, habboAccount } = useAuth();
  const [habboData, setHabboData] = useState<any>(null);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'noticias', label: t('noticias'), icon: MessageCircle, path: '/noticias' },
    { id: 'eventos', label: 'Eventos', icon: Calendar, path: '/eventos' },
    { id: 'forum', label: t('forum'), icon: MessageCircle, path: '/forum' },
    { id: 'catalogo', label: t('catalogo'), icon: Package, path: '/catalogo' },
    { id: 'emblemas', label: t('emblemas'), icon: Award, path: '/emblemas' },
    { id: 'editor', label: t('editor'), icon: Palette, path: '/editor' },
    { id: 'mercado', label: t('mercado'), icon: ShoppingCart, path: '/mercado' }
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  useEffect(() => {
    if (isLoggedIn && habboAccount) {
      getUserByName(habboAccount.habbo_name).then(data => {
        setHabboData(data);
      }).catch(console.error);
    }
  }, [isLoggedIn, habboAccount]);

  return (
    <div className="flex flex-col min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      {/* Header */}
      <header className="bg-amber-50/95 backdrop-blur-sm border-b border-amber-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <img 
            src="/assets/habbohub.gif" 
            alt="HABBO HUB" 
            className="w-8 h-8"
          />
          <h1 className="font-bold text-gray-800 volter-font">HABBO HUB</h1>
        </div>
        
        <UserProfilePopover side="bottom" align="end">
          <div className="relative cursor-pointer">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img
                src={isLoggedIn && habboData ? 
                  `https://www.habbo.com/habbo-imaging/avatarimage?figure=${habboData.figureString}&direction=2&head_direction=2&gesture=sml&size=s&frame=1&headonly=1` 
                  : '/assets/frank.png'
                }
                alt={isLoggedIn && habboAccount ? habboAccount.habbo_name : 'Frank'}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${isLoggedIn && habboAccount ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </UserProfilePopover>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Dock Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-amber-50/95 backdrop-blur-sm border-t border-amber-200 px-4 py-2 z-30">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-sky-400 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-amber-100'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs volter-font">{item.label}</span>
              </button>
            );
          })}
          
          <UserProfilePopover side="top" align="center">
            <button className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-gray-600 hover:bg-amber-100 transition-all duration-200">
              <div className="relative">
                <div className="w-5 h-5 rounded-full overflow-hidden border border-amber-300">
                  <img
                    src={isLoggedIn && habboData ? 
                      `https://www.habbo.com/habbo-imaging/avatarimage?figure=${habboData.figureString}&direction=2&head_direction=2&gesture=sml&size=s&frame=1&headonly=1` 
                      : '/assets/frank.png'
                    }
                    alt={isLoggedIn && habboAccount ? habboAccount.habbo_name : 'Perfil'}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${isLoggedIn && habboAccount ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              <span className="text-xs volter-font">Perfil</span>
            </button>
          </UserProfilePopover>
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;
