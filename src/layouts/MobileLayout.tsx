
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { ProfileModal } from '../components/ProfileModal';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const { t } = useLanguage();
  const { isLoggedIn, userData } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const navItems = [
    { id: 'noticias', label: t('noticias'), icon: '/assets/news.png', path: '/noticias' },
    { id: 'eventos', label: 'Eventos', icon: '/assets/eventos.png', path: '/eventos' },
    { id: 'forum', label: t('forum'), icon: '/assets/BatePapo1.png', path: '/forum' },
    { id: 'catalogo', label: t('catalogo'), icon: '/assets/Carrinho.png', path: '/catalogo' },
    { id: 'ferramentas', label: 'Ferramentas', icon: '/assets/ferramentas.png', path: '/ferramentas' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const handleAvatarClick = () => {
    setShowProfileModal(true);
  };

  return (
    <div className="min-h-screen bg-repeat pb-20" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      {/* Header */}
      <div className="bg-amber-50 shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/assets/habbohub.png" 
            alt="HABBO HUB" 
            className="h-8"
          />
          <span className="font-bold text-gray-800">Habbo Hub</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="cursor-pointer" onClick={handleAvatarClick}>
            <div className="relative">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                <img
                  src={isLoggedIn && userData ? `https://www.habbo.com/habbo-imaging/avatarimage?figure=${userData.figureString}&direction=2&head_direction=2&gesture=sml&size=s&frame=1` : '/assets/frank.png'}
                  alt={isLoggedIn && userData ? userData.name : 'Frank'}
                  className="w-full h-full object-cover object-top scale-110 translate-y-1"
                />
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white ${isLoggedIn && userData ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 min-h-[calc(100vh-12rem)]">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-50 border-t-2 border-amber-200 px-4 py-2 shadow-lg">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <img src={item.icon} alt={item.label} className="w-6 h-6" />
              <span className="text-xs text-gray-700">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        isLoginAttempt={!isLoggedIn}
      />
    </div>
  );
};

export default MobileLayout;
