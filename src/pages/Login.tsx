
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDirectAuth } from '@/hooks/useDirectAuth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isLoading, 
    currentUser, 
    verifyUser, 
    registerUser, 
    loginWithPassword, 
    checkAuthStatus 
  } = useDirectAuth();
  
  const [username, setUsername] = useState('');
  const [motto, setMotto] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Verificar se já está logado ao carregar a página
  useEffect(() => {
    const user = checkAuthStatus();
    if (user) {
      navigate('/console');
    }
  }, [checkAuthStatus, navigate]);

  const handleVerifyUser = async () => {
    const user = await verifyUser(username, motto);
    if (user) {
      setShowPasswordSection(true);
    }
  };

  const handleRegisterUser = async () => {
    const success = await registerUser(username, motto, password);
    if (success) {
      navigate('/console');
    }
  };

  const handleLoginWithPassword = async () => {
    const success = await loginWithPassword(username, password);
    if (success) {
      navigate('/console');
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-8 bg-repeat min-h-screen" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
            <div className="max-w-md mx-auto mt-20">
              <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900 volter-font">
                    Conectar Conta Habbo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Verificação por Motto */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username Habbo
                      </label>
                      <Input
                        type="text"
                        placeholder="Digite seu username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border-2 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motto Habbo
                      </label>
                      <Input
                        type="text"
                        placeholder="Digite sua motto atual"
                        value={motto}
                        onChange={(e) => setMotto(e.target.value)}
                        className="border-2 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    
                    <Button
                      onClick={handleVerifyUser}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      {isLoading ? 'Verificando...' : '🔍 Verificar Usuário'}
                    </Button>
                  </div>

                  {/* Seção de Senha (aparece após verificação) */}
                  {showPasswordSection && (
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nova Senha
                        </label>
                        <Input
                          type="password"
                          placeholder="Digite uma senha para sua conta"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="border-2 border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      
                      <Button
                        onClick={handleRegisterUser}
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      >
                        {isLoading ? 'Criando conta...' : '💾 Criar Conta'}
                      </Button>
                    </div>
                  )}

                  {/* Login com Senha (sempre visível) */}
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha da Conta
                      </label>
                      <Input
                        type="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-2 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    
                    <Button
                      onClick={handleLoginWithPassword}
                      disabled={isLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                    >
                      🔐 Fazer Login
                    </Button>
                  </div>

                  {/* Informações do usuário verificado */}
                  {currentUser && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">
                        <strong>Usuário verificado:</strong> {currentUser.habbo_username}
                      </p>
                      <p className="text-sm text-blue-600">
                        Motto: {currentUser.habbo_motto}
                      </p>
                    </div>
                  )}
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
