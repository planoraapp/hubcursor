import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { HotelSelector } from '@/components/HotelSelector';
import { getAvailableHotels } from '@/utils/usernameUtils';
import { Loader2 } from 'lucide-react';
import { useQuickNotification } from '@/hooks/useNotification';
import { supabase } from '@/integrations/supabase/client';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { habboAccount, isLoggedIn, loading, login } = useAuth();
  
  // Estados do formulário
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedHotel, setSelectedHotel] = useState('br');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginMode, setLoginMode] = useState<'senha' | 'motto' | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [mottoStep, setMottoStep] = useState<'generate' | 'verify' | 'password' | 'complete'>('generate');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const { success, error } = useQuickNotification();

  // Lista dos hotéis Habbo
  const habboHotels = getAvailableHotels();

  // Gerar código de verificação
  const generateVerificationCode = () => {
    const randomNum = Math.floor(Math.random() * 90000) + 10000; // 5 dígitos
    const code = `HUB-${randomNum}`;
    setVerificationCode(code);
    setMottoStep('verify');
    return code;
  };

  // Verificar se já está logado
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/console');
    }
  }, [isLoggedIn, navigate]);

  // Função para verificar motto e criar conta
  const handleVerifyMotto = async () => {
    if (!username.trim() || !verificationCode.trim()) {
      error('Erro', 'Preencha todos os campos');
      return;
    }

    setIsVerifying(true);
    
    try {
      // Verificar se o usuário existe no Habbo
      const hotelDomain = selectedHotel === 'br' ? 'com.br' : selectedHotel;
      const habboApiUrl = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(username)}`;
      
      const habboResponse = await fetch(habboApiUrl);
      
      if (!habboResponse.ok) {
        throw new Error('Usuário não encontrado no Habbo Hotel');
      }

      const habboData = await habboResponse.json();
      
      // Verificar se o código está na motto
      if (!habboData.motto || !habboData.motto.includes(verificationCode)) {
        throw new Error(`Código ${verificationCode} não encontrado na sua motto. Verifique se você copiou corretamente.`);
      }

      // Verificar se usuário já existe (case-insensitive)
      const { data: existingAccounts } = await supabase
        .from('habbo_accounts')
        .select('*')
        .ilike('habbo_name', username)
        .limit(1);
      
      const existingAccount = existingAccounts?.[0];

      if (existingAccount) {
        setMottoStep('password');
        success('Usuário encontrado!', 'Digite uma nova senha para resetar sua conta.');
      } else {
        setMottoStep('password');
        success('Verificação bem-sucedida!', 'Agora crie uma senha para sua conta.');
      }
    } catch (err: any) {
      error('Erro', err.message || 'Erro na verificação');
    } finally {
      setIsVerifying(false);
    }
  };

  // Função para criar/resetar conta
  const handleCreateOrResetAccount = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      error('Erro', 'Preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('Erro', 'As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      error('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsCreatingAccount(true);
    
    try {
      console.log('🚀 [LOGIN] Chamando habbo-register-login com:', {
        habbo_name: username.trim(),
        verification_code: verificationCode.trim(),
        hotel: selectedHotel,
        password_length: newPassword.length
      });

      const { data, error: functionError } = await supabase.functions.invoke('habbo-complete-auth', {
        body: {
          action: 'register',
          habbo_name: username.trim(),
          verification_code: verificationCode.trim(),
          password: newPassword,
          hotel: selectedHotel
        }
      });

      console.log('📡 [LOGIN] Resposta da Edge Function:', { data, error: functionError });
      console.log('📊 [LOGIN] Data completo:', JSON.stringify(data, null, 2));
      console.log('⚠️ [LOGIN] Error completo:', JSON.stringify(functionError, null, 2));

      if (functionError) {
        console.error('❌ [LOGIN] Erro da Edge Function:', functionError);
        console.error('❌ [LOGIN] Data do erro:', data);
        throw new Error(data?.error || functionError.message || 'Erro na criação da conta');
      }

      if (data?.error) {
        console.error('❌ [LOGIN] Erro nos dados:', data.error);
        console.error('❌ [LOGIN] Detalhes:', data.details);
        throw new Error(data.error);
      }

      if (data?.success) {
        setMottoStep('complete');
        success('Sucesso!', data.message || 'Conta criada com sucesso!');
        
        // Auto-login com a senha que o usuário definiu
        setTimeout(async () => {
          const loginSuccess = await login(username.trim(), newPassword);
          if (loginSuccess) {
            // Redireciona automaticamente
          } else {
            success('Conta criada!', `Faça login com nome: ${username} e sua senha`);
          }
        }, 1500);
      }
    } catch (err: any) {
      let errorMessage = err.message || 'Erro na criação da conta';
      
      if (errorMessage.includes('já cadastrado')) {
        errorMessage = 'Este usuário já possui uma conta. Use a opção de login com senha.';
      }
      
      error('Erro', errorMessage);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Função de login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      return;
    }

    setIsLoggingIn(true);
    try {
      // Salvar país selecionado no localStorage para uso posterior
      localStorage.setItem('selected_habbo_hotel', selectedHotel);
      
      const success = await login(username.trim(), password);
      if (success) {
        // O redirecionamento será feito automaticamente pelo useEffect
      }
    } catch (error) {
      // Erro será tratado pelo hook useAuth
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
                backgroundImage: 'url(/assets/site/bghabbohub.png)',
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
              backgroundImage: 'url(/assets/site/bghabbohub.png)',
              backgroundRepeat: 'repeat',
              backgroundPosition: 'center',
              backgroundSize: 'auto'
            }}
          >
            <div className="max-w-2xl mx-auto mt-10">
              {/* Logo do HabboHub */}
              <div className="text-center mb-8">
                <img 
                  src="/assets/site/hubbeta.gif" 
                  alt="HabboHub" 
                  className="mx-auto mb-8"
                  style={{ 
                    imageRendering: 'pixelated',
                    maxWidth: '200px',
                    height: 'auto'
                  }}
                />
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
                      <div className="flex flex-wrap gap-2 mb-3 justify-center">
                        {habboHotels.map((hotel) => (
                          <button
                            key={hotel.code}
                            type="button"
                            onClick={() => setSelectedHotel(hotel.code)}
                            className={`transition-all duration-200 ${
                              selectedHotel === hotel.code
                                ? 'ring-2 ring-blue-500 rounded'
                                : ''
                            }`}
                            style={{ 
                              background: 'transparent',
                              border: 'none',
                              padding: '2px'
                            }}
                          >
                            <img
                              src={hotel.flag}
                              alt={hotel.name}
                              style={{ 
                                imageRendering: 'pixelated',
                                background: 'transparent',
                                height: '28px',
                                width: 'auto',
                                display: 'block',
                                objectFit: 'contain',
                                objectPosition: 'center'
                              }}
                              onError={(e) => {
                                console.error(`Erro ao carregar bandeira ${hotel.name}:`, hotel.flag);
                                // Fallback para bandeira local
                                e.currentTarget.src = `/flags/${hotel.code === 'us' ? 'flagcom' : hotel.code === 'br' ? 'flagbrazil' : hotel.code === 'de' ? 'flagdeus' : hotel.code === 'es' ? 'flagspain' : hotel.code === 'fr' ? 'flagfrance' : hotel.code === 'it' ? 'flagitaly' : hotel.code === 'nl' ? 'flagnetl' : hotel.code === 'tr' ? 'flagtrky' : hotel.code === 'fi' ? 'flafinland' : 'flagcom'}.png`;
                              }}
                            />
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        Hotel selecionado: <strong>{habboHotels.find(h => h.code === selectedHotel)?.name}</strong>
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

                    {/* Seleção do modo de login */}
                    {username.trim() && (
                      <div>
                        <div className="flex gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => setLoginMode('senha')}
                            className={`flex-1 px-3 py-2 rounded transition-colors flex items-center justify-center gap-2 sidebar-font-option-4 text-white ${
                              loginMode === 'senha'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-400 hover:bg-gray-500'
                            }`}
                            style={{ 
                              fontSize: '16px',
                              fontWeight: 'bold',
                              letterSpacing: '0.3px',
                              textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px'
                            }}
                          >
                            Senha
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginMode('motto');
                              generateVerificationCode();
                            }}
                            className={`flex-1 px-3 py-2 rounded transition-colors flex items-center justify-center gap-2 sidebar-font-option-4 text-white ${
                              loginMode === 'motto'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-400 hover:bg-gray-500'
                            }`}
                            style={{ 
                              fontSize: '16px',
                              fontWeight: 'bold',
                              letterSpacing: '0.3px',
                              textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px'
                            }}
                          >
                            Motto (Missão)
                          </button>
                        </div>

                        {/* Campo de senha */}
                        {loginMode === 'senha' && (
                          <div className="mb-4">
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
                        )}

                        {/* Campo de verificação por motto */}
                        {loginMode === 'motto' && mottoStep !== 'complete' && (
                          <div className="mb-4">
                            <div className="bg-white p-3 rounded-lg mb-3">
                              {/* Layout desktop: lado a lado */}
                              <div className="hidden md:flex md:gap-4 md:items-start">
                                {/* Lado esquerdo: título e campo */}
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800 mb-2 volter-font">
                                    <strong>Código para sua motto:</strong>
                                  </p>
                                  <Input
                                    value={verificationCode}
                                    readOnly
                                    className="border-2 border-yellow-300 text-white text-center sidebar-font-option-4"
                                    style={{ 
                                      fontSize: '16px',
                                      fontWeight: 'bold',
                                      letterSpacing: '0.3px',
                                      textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px',
                                      backgroundImage: 'url(https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/bg_colour_04.gif)',
                                      backgroundRepeat: 'repeat',
                                      backgroundSize: 'auto'
                                    }}
                                  />
                                </div>
                                
                                {/* Lado direito: botão copiar */}
                                <div className="flex items-end">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await navigator.clipboard.writeText(verificationCode);
                                        success('Código copiado!', 'Cole na sua motto do Habbo');
                                      } catch (err) {
                                        error('Erro ao copiar', 'Copie manualmente o código');
                                      }
                                    }}
                                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors flex items-center justify-center sidebar-font-option-4"
                                    style={{ 
                                      fontSize: '16px',
                                      fontWeight: 'bold',
                                      letterSpacing: '0.3px',
                                      textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px',
                                      border: '2px solid black',
                                      imageRendering: 'pixelated'
                                    }}
                                  >
                                    Copiar Código
                                  </button>
                                </div>
                              </div>

                              {/* Layout mobile: empilhado */}
                              <div className="md:hidden flex flex-col gap-2">
                                <p className="text-sm text-gray-800 volter-font">
                                  <strong>Código para sua motto:</strong>
                                </p>
                                <Input
                                  value={verificationCode}
                                  readOnly
                                  className="border-2 border-yellow-300 text-white text-center sidebar-font-option-4"
                                  style={{ 
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.3px',
                                    textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px',
                                    backgroundImage: 'url(https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/bg_colour_04.gif)',
                                    backgroundRepeat: 'repeat',
                                    backgroundSize: 'auto'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(verificationCode);
                                      success('Código copiado!', 'Cole na sua motto do Habbo');
                                    } catch (err) {
                                      error('Erro ao copiar', 'Copie manualmente o código');
                                    }
                                  }}
                                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors flex items-center justify-center sidebar-font-option-4"
                                  style={{ 
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.3px',
                                    textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px',
                                    border: '2px solid black',
                                    imageRendering: 'pixelated'
                                  }}
                                >
                                  Copiar Código
                                </button>
                              </div>

                              {/* Instruções (sempre abaixo) */}
                              <p className="text-xs text-gray-600 mt-3 volter-font">
                                Cole este código em sua motto no Habbo e clique em "Verificar Habbo"
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Campos de senha para criação/reset de conta */}
                          {mottoStep === 'password' && (
                            <div className="mb-4 space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Nova Senha (mínimo 6 caracteres)
                                </label>
                                <Input
                                  type="password"
                                  placeholder="Digite sua nova senha"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="border-2 border-gray-300 focus:border-blue-500"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Confirmar Senha
                                </label>
                                <Input
                                  type="password"
                                  placeholder="Confirme sua nova senha"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  className="border-2 border-gray-300 focus:border-blue-500"
                                  required
                                />
                              </div>
                            </div>
                          )}

                          {/* Mensagem de sucesso */}
                          {mottoStep === 'complete' && (
                            <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded">
                              <p className="text-green-800 text-center font-bold">
                                ✅ Conta criada com sucesso!
                              </p>
                              <p className="text-green-600 text-center text-sm mt-2">
                                Agora você pode fazer login com seu nome Habbo e a senha escolhida.
                              </p>
                            </div>
                          )}

                        {/* Botões de ação */}
                        <div className="space-y-2">
                          {loginMode === 'senha' && (
                            <Button
                              type="submit"
                              disabled={isLoggingIn || !password.trim()}
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
                          )}

                          {loginMode === 'motto' && mottoStep === 'verify' && (
                            <div className="flex justify-center">
                              <Button
                                type="button"
                                onClick={handleVerifyMotto}
                                disabled={isVerifying}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors flex items-center justify-center sidebar-font-option-4"
                                style={{ 
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  letterSpacing: '0.3px',
                                  textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px',
                                  border: '2px solid black',
                                  imageRendering: 'pixelated'
                                }}
                              >
                                {isVerifying ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Verificando...
                                  </>
                                ) : (
                                  'Verificar Habbo'
                                )}
                              </Button>
                            </div>
                          )}

                          {loginMode === 'motto' && mottoStep === 'password' && (
                            <div className="flex justify-center">
                              <Button
                                type="button"
                                onClick={handleCreateOrResetAccount}
                                disabled={isCreatingAccount || !newPassword.trim() || !confirmPassword.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors flex items-center justify-center sidebar-font-option-4"
                                style={{ 
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  letterSpacing: '0.3px',
                                  textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px',
                                  border: '2px solid black',
                                  imageRendering: 'pixelated'
                                }}
                              >
                                {isCreatingAccount ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Criando conta...
                                  </>
                                ) : (
                                  'Criar Conta'
                                )}
                              </Button>
                            </div>
                          )}

                          {loginMode === 'motto' && mottoStep === 'complete' && (
                            <div className="flex justify-center">
                              <Button
                                type="button"
                                onClick={() => {
                                  setLoginMode('senha');
                                  setMottoStep('generate');
                                  setNewPassword('');
                                  setConfirmPassword('');
                                  setVerificationCode('');
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors flex items-center justify-center sidebar-font-option-4"
                                style={{ 
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  letterSpacing: '0.3px',
                                  textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px',
                                  border: '2px solid black',
                                  imageRendering: 'pixelated'
                                }}
                              >
                                Fazer Login Agora
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
