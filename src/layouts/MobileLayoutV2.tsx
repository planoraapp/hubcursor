import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUnifiedAuth } from '../hooks/useUnifiedAuth';
import { useLanguage } from '../hooks/useLanguage';
import { UserProfilePopover } from '../components/UserProfilePopover';
import { UserLoginModal } from '../components/UserLoginModal';
import { getUserByName } from '../services/habboApi';
import { 
  Home, 
  House, 
  MessageSquare, 
  Newspaper, 
  Wrench, 
  ChevronUp,
  User,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const MobileLayoutV2 = ({ children }: { children: React.ReactNode }) => {
  const [habboData, setHabboData] = useState<any>(null);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const { isLoggedIn, habboAccount } = useUnifiedAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Buscar dados do usuário quando logado
  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoggedIn && habboAccount?.name) {
        try {
          const data = await getUserByName(habboAccount.name);
          setHabboData(data);
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      }
    };

    fetchUserData();
  }, [isLoggedIn, habboAccount]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setShowToolsMenu(false);
  };

  const mainMenuItems = [
    { id: 'home', label: 'Início', icon: Home, path: '/' },
    { id: 'homes', label: 'Homes', icon: House, path: '/homes' },
    { id: 'console', label: 'Console', icon: MessageSquare, path: '/console' },
    { id: 'journal', label: 'Jornal', icon: Newspaper, path: '/journal' },
  ];

  const toolsMenuItems = [
    { id: 'tools', label: 'Ferramentas', icon: Wrench, path: '/ferramentas' },
    { id: 'catalog', label: 'Catálogo', icon: Wrench, path: '/catalogo' },
    { id: 'badges', label: 'Emblemas', icon: Wrench, path: '/emblemas' },
    { id: 'market', label: 'Mercado', icon: Wrench, path: '/mercado' },
    { id: 'events', label: 'Eventos', icon: Wrench, path: '/eventos' },
    { id: 'profile', label: 'Perfil', icon: User, path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-repeat" style={{ 
      backgroundImage: 'url(/assets/bghabbohub.png)',
      backgroundRepeat: 'repeat'
    }}>
      {/* Header Mobile */}
      <header 
        className="sticky top-0 z-50 bg-white border-b-2 border-black px-4 py-3 flex items-center justify-between"
        style={{ 
          borderBottomColor: '#000'
        }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/assets/bghabbohub.png" 
            alt="HABBO HUB" 
            className="h-8 w-auto"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* User Section */}
        <div className="flex items-center space-x-2">
          {isLoggedIn && habboData ? (
            <UserProfilePopover 
              user={habboData} 
              habboAccount={habboAccount}
            />
          ) : (
            <UserLoginModal />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 min-h-screen">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-black px-2 py-2"
        style={{ borderTopColor: '#000' }}
      >
        <div className="flex items-center justify-around">
          {/* Main Menu Items */}
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* Tools Menu with Dropdown */}
          <Popover open={showToolsMenu} onOpenChange={setShowToolsMenu}>
            <PopoverTrigger asChild>
              <button
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  showToolsMenu 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Wrench className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Ferramentas</span>
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-64 p-2 mb-2" 
              side="top"
              align="center"
            >
              <div className="grid grid-cols-2 gap-2">
                {toolsMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-xs font-medium text-center">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>
    </div>
  );
};

export default MobileLayoutV2;
