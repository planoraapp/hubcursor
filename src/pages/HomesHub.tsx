
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';
import { HotelSelector } from '@/components/HotelSelector';
import { useHotel } from '@/contexts/HotelContext';
import MobileLayout from '@/layouts/MobileLayout';

const HomesHub: React.FC = () => {
  const { user, habboAccount, isLoggedIn } = useAuth();
  const { currentHotel } = useHotel();
  const [searchUsername, setSearchUsername] = useState('');
  const [activeSection, setActiveSection] = useState('homes');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      // Normalizar o nome para lowercase para evitar problemas de case sensitivity
      const normalizedUsername = searchUsername.trim().toLowerCase();
      navigate(`/home/${normalizedUsername}`);
    }
  };

  const goToMyHome = () => {
    if (habboAccount?.habbo_name) {
      // Usar o nome exato do banco, mas navegar para lowercase
      const normalizedUsername = habboAccount.habbo_name.toLowerCase();
      navigate(`/home/${normalizedUsername}`);
    }
  };

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 volter-font" style={{
              textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
            }}>
              🏠 Habbo Homes
            </h1>
            <p className="text-xl text-white mb-4" style={{
              textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
            }}>
              Explore e personalize casas virtuais nostálgicas
            </p>
            
            <div className="flex justify-center mb-6">
              <HotelSelector />
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Minha Home (apenas para usuários logados) */}
            {isLoggedIn && habboAccount && (
              <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 volter-font">Minha Home</h2>
                    <p className="text-gray-600">Personalize sua casa virtual</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-800">{habboAccount.habbo_name}</span>
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded volter-font">
                      {habboAccount.hotel?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Acesse sua home personalizada e edite widgets, stickers e background
                  </p>
                  <Button 
                    onClick={goToMyHome}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-6 volter-font"
                  >
                    Ir para Minha Home
                  </Button>
                </div>
              </Card>
            )}

            {/* Pesquisar Homes */}
            <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 volter-font">Explorar Homes</h2>
                  <p className="text-gray-600">Visite a home de outros usuários</p>
                </div>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Digite o nome de usuário do Habbo..."
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    className="flex-1 border-2 border-gray-300 focus:border-blue-500"
                  />
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold px-6 volter-font"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>
                
                <p className="text-sm text-gray-500">
                  💡 Digite o nome do usuário para encontrar sua home. Visualizando contexto: Hotel {currentHotel.toUpperCase()}
                </p>
              </form>
            </Card>

            {/* Informações para usuários não logados */}
            {!isLoggedIn && (
              <Card className="p-6 bg-yellow-50 border-2 border-yellow-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-yellow-800" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-800 mb-2 volter-font">Crie sua própria Home!</h3>
                  <p className="text-yellow-700 mb-4">
                    Faça login para personalizar sua home com widgets, stickers e backgrounds únicos
                  </p>
                  <Button 
                    onClick={() => navigate('/login')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold volter-font"
                  >
                    Conectar Conta Habbo
                  </Button>
                </div>
              </Card>
            )}

            {/* Dicas */}
            <Card className="p-6 bg-blue-50 border-2 border-blue-300">
              <h3 className="text-lg font-bold text-blue-800 mb-3 volter-font">💡 Como funcionam as Homes?</h3>
              <div className="space-y-2 text-blue-700 text-sm">
                <p>• <strong>Widgets:</strong> Adicione componentes interativos como avatar, guestbook e player de música</p>
                <p>• <strong>Personalização:</strong> Arraste e redimensione elementos quando estiver no modo de edição</p>
                <p>• <strong>Backgrounds:</strong> Escolha cores sólidas ou imagens para o fundo da sua home</p>
                <p>• <strong>Guestbook:</strong> Permita que visitantes deixem mensagens na sua home</p>
                <p>• <strong>Multi-Hotel:</strong> Usuários são únicos por hotel - o mesmo nome pode existir em hotéis diferentes</p>
              </div>
            </Card>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 volter-font" style={{
              textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
            }}>
              🏠 Habbo Homes
            </h1>
            <p className="text-xl text-white mb-4" style={{
              textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
            }}>
              Explore e personalize casas virtuais nostálgicas
            </p>
            
            <div className="flex justify-center mb-6">
              <HotelSelector />
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Minha Home (apenas para usuários logados) */}
            {isLoggedIn && habboAccount && (
              <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 volter-font">Minha Home</h2>
                    <p className="text-gray-600">Personalize sua casa virtual</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-800">{habboAccount.habbo_name}</span>
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded volter-font">
                      {habboAccount.hotel?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Acesse sua home personalizada e edite widgets, stickers e background
                  </p>
                  <Button 
                    onClick={goToMyHome}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-6 volter-font"
                  >
                    Ir para Minha Home
                  </Button>
                </div>
              </Card>
            )}

            {/* Pesquisar Homes */}
            <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 volter-font">Explorar Homes</h2>
                  <p className="text-gray-600">Visite a home de outros usuários</p>
                </div>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Digite o nome de usuário do Habbo..."
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    className="flex-1 border-2 border-gray-300 focus:border-blue-500"
                  />
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold px-6 volter-font"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>
                
                <p className="text-sm text-gray-500">
                  💡 Digite o nome do usuário para encontrar sua home. Visualizando contexto: Hotel {currentHotel.toUpperCase()}
                </p>
              </form>
            </Card>

            {/* Rest of existing code for mobile info and tips cards... */}
            {!isLoggedIn && (
              <Card className="p-6 bg-yellow-50 border-2 border-yellow-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-yellow-800" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-800 mb-2 volter-font">Crie sua própria Home!</h3>
                  <p className="text-yellow-700 mb-4">
                    Faça login para personalizar sua home com widgets, stickers e backgrounds únicos
                  </p>
                  <Button 
                    onClick={() => navigate('/login')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold volter-font"
                  >
                    Conectar Conta Habbo
                  </Button>
                </div>
              </Card>
            )}

            <Card className="p-6 bg-blue-50 border-2 border-blue-300">
              <h3 className="text-lg font-bold text-blue-800 mb-3 volter-font">💡 Como funcionam as Homes?</h3>
              <div className="space-y-2 text-blue-700 text-sm">
                <p>• <strong>Widgets:</strong> Adicione componentes interativos como avatar, guestbook e player de música</p>
                <p>• <strong>Personalização:</strong> Arraste e redimensione elementos quando estiver no modo de edição</p>
                <p>• <strong>Backgrounds:</strong> Escolha cores sólidas ou imagens para o fundo da sua home</p>
                <p>• <strong>Guestbook:</strong> Permita que visitantes deixem mensagens na sua home</p>
                <p>• <strong>Multi-Hotel:</strong> Usuários são únicos por hotel - o mesmo nome pode existir em hotéis diferentes</p>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomesHub;
