import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { habboAccount, isLoggedIn, loading, login } = useAuth();
  
  // Estados do formulário
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('br');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Lista dos hotéis Habbo com suas bandeiras
  const habboHotels = [
    { code: 'br', name: 'Brasil', flag: '/flags/br.png', apiUrl: 'https://www.habbo.com.br/api/public' },
    { code: 'com', name: 'Internacional', flag: '/flags/us.png', apiUrl: 'https://www.habbo.com/api/public' },
    { code: 'de', name: 'Alemanha', flag: '/flags/de.png', apiUrl: 'https://www.habbo.de/api/public' },
    { code: 'es', name: 'Espanha', flag: '/flags/es.png', apiUrl: 'https://www.habbo.es/api/public' },
    { code: 'fi', name: 'Finlândia', flag: '/flags/fi.png', apiUrl: 'https://www.habbo.fi/api/public' },
    { code: 'fr', name: 'França', flag: '/flags/fr.png', apiUrl: 'https://www.habbo.fr/api/public' },
    { code: 'it', name: 'Itália', flag: '/flags/it.png', apiUrl: 'https://www.habbo.it/api/public' },
    { code: 'nl', name: 'Holanda', flag: '/flags/nl.png', apiUrl: 'https://www.habbo.nl/api/public' },
    { code: 'tr', name: 'Turquia', flag: '/flags/tr.png', apiUrl: 'https://www.habbo.com.tr/api/public' }
  ];

  // Verificar se já está logado
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/console');
    }
  }, [isLoggedIn, navigate]);

  // Função de login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      return;
    }

    setIsLoggingIn(true);
    try {
      // Salvar país selecionado no localStorage para uso posterior
      localStorage.setItem('selected_habbo_hotel', selectedCountry);
      
      const success = await login(username.trim(), password);
      if (success) {
        // O redirecionamento será feito automaticamente pelo useEffect
      }
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <CollapsibleAppSidebar />
          <SidebarInset className="flex-1">
            <main 
              className="flex-1 p-8 bg-repeat min-h-screen flex items-center justify-center" 
              style={{ 
                backgroundImage: 'url(/assets/bghabbohub.png)',
                backgroundRepeat: 'repeat',
                backgroundPosition: 'center',
                backgroundSize: 'auto'
              }}
            >
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-white">Carregando...</p>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main 
            className="flex-1 p-8 bg-repeat min-h-screen" 
            style={{ 
              backgroundImage: 'url(/assets/bghabbohub.png)',
              backgroundRepeat: 'repeat',
              backgroundPosition: 'center',
              backgroundSize: 'auto'
            }}
          >
            <div className="max-w-2xl mx-auto mt-10">
              {/* Logo do HabboHub */}
              <div className="text-center mb-8">
                <img 
                  src="/assets/hubbeta.gif" 
                  alt="HabboHub" 
                  className="w-32 h-32 mx-auto mb-4"
                  style={{ imageRendering: 'pixelated' }}
                />
                <h1 className="text-3xl font-bold text-white volter-font" 
                    style={{ textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black' }}>
                  HabboHub
                </h1>
                <p className="text-white volter-font" 
                   style={{ textShadow: '1px 1px 0px black' }}>
                  Portal do Habbo
                </p>
              </div>

              {/* Card de Login */}
              <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-center volter-font">
                    🔐 HabboHub - Login
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Seleção de País */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🌍 Hotel Habbo
                      </label>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {habboHotels.map((hotel) => (
                          <button
                            key={hotel.code}
                            type="button"
                            onClick={() => setSelectedCountry(hotel.code)}
                            className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all duration-200 ${
                              selectedCountry === hotel.code
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <img
                              src={hotel.flag}
                              alt={hotel.name}
                              className="w-8 h-6 object-cover rounded-sm mb-1"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            <span className="text-xs font-medium text-gray-700 text-center">
                              {hotel.name}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        Hotel selecionado: <strong>{habboHotels.find(h => h.code === selectedCountry)?.name}</strong>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Habbo
                      </label>
                      <Input
                        type="text"
                        placeholder="Digite seu nome Habbo"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border-2 border-gray-300 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha
                      </label>
                      <Input
                        type="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-2 border-gray-300 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Contas de teste:</strong><br/>
                        • habbohub (senha: 151092)<br/>
                        • beebop (senha: 290684)
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoggingIn || !username.trim() || !password.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Fazendo login...
                        </>
                      ) : (
                        '🔐 Fazer Login'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Login;