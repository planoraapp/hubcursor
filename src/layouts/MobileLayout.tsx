import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '../components/UserProfile';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
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

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const handleConnectHabbo = () => {
    navigate('/connect-habbo');
  };

  return (
    <div className="min-h-screen bg-repeat pb-20" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-100 to-slate-200 shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/assets/habbohub.png" 
            alt="HABBO HUB" 
            className="h-8"
          />
          <span className="font-bold text-gray-800">Habbo Hub</span>
        </div>
        
        <UserProfile collapsed={false} />
      </div>

      {/* Main Content */}
      <main className="p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 min-h-[calc(100vh-12rem)]">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-slate-100 to-slate-200 border-t border-gray-300 px-4 py-2 shadow-lg">
        <div className="flex justify-around items-center">
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <img src={item.icon} alt={item.label} className="w-6 h-6" />
              <span className="text-xs text-gray-700">{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={handleConnectHabbo}
            className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <img src="/assets/frank.png" alt="Entrar" className="w-6 h-6" />
            <span className="text-xs text-gray-700">
              {isLoggedIn ? 'Perfil' : 'Entrar'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;
