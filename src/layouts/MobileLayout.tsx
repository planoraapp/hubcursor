import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Newspaper, MessageCircle, Calendar, ShoppingBag, Award, Palette, Banknote } from 'lucide-react';
import { HabboMobileDock, DockItem } from '../components/ui/habbo-mobile-dock';
import { useAuth } from '../hooks/useAuth';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, isLoggedIn } = useAuth();

  const allMenuItems: DockItem[] = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'noticias', label: 'Notícias', icon: Newspaper },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'forum', label: 'Fórum', icon: MessageCircle },
    { id: 'catalogo', label: 'Catálogo', icon: ShoppingBag },
    { id: 'emblemas', label: 'Emblemas', icon: Award },
    { id: 'editor', label: 'Editor', icon: Palette },
    { id: 'mercado', label: 'Mercado', icon: Banknote },
  ];

  const handleNavigation = (itemId: string) => {
    if (itemId === 'home') {
      navigate('/');
    } else {
      navigate(`/${itemId}`);
    }
  };

  const getActiveId = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    return path.substring(1); // Remove leading slash
  };

  return (
    <div className="min-h-screen bg-repeat md:hidden" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#f0ede6] border-b-2 border-[#5a5a5a] shadow-lg">
        <div className="flex justify-between items-center p-4">
          <img 
            src="/assets/habbohub.gif" 
            alt="HABBO HUB" 
            className="h-8"
            onError={(e) => {
              e.currentTarget.src = "/assets/habbohub.png";
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-24 min-h-screen">
        <div className="p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 min-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Dock */}
      <HabboMobileDock
        menuItems={allMenuItems}
        userAvatarUrl={userData?.figureString ? `https://www.habbo.com/habbo-imaging/avatarimage?figure=${userData.figureString}&direction=2&head_direction=2&gesture=sml&size=s&frame=1` : undefined}
        onItemClick={handleNavigation}
        activeItemId={getActiveId()}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
};

export default MobileLayout;