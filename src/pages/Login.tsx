import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHubLogin } from '@/hooks/useHubLogin';
import { HOTELS_CONFIG, getAllHotels } from '@/config/hotels';
import { HabboUser } from '@/services/authService';
import { Copy, Check, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    currentUser,
    generateCode,
    verifyUserWithCode,
    registerUser,
    loginWithPassword,
    checkExistingUser,
    checkAuthStatus,
    createTestAccount
  } = useHubLogin();
  
  // Estados do formulário
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [selectedHotel, setSelectedHotel] = useState('brazil');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifiedUser, setVerifiedUser] = useState<HabboUser | null>(null);
  const [userExists, setUserExists] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  
  // Estados de controle da interface
  const [step, setStep] = useState<'username' | 'verification' | 'password'>('username');
  const [activeTab, setActiveTab] = useState<'password' | 'motto'>('password');

  // Verificar se já está logado ao carregar a página
  useEffect(() => {
    const user = checkAuthStatus();
    if (user) {
      navigate('/console');
    }
  }, [checkAuthStatus, navigate]);

  // Verificar se usuário existe e gerar avatar
  const handleUsernameSubmit = async () => {
    if (!username.trim()) {
      return;
    }

    const hotelConfig = HOTELS_CONFIG[selectedHotel];
    
    // Gerar URL do avatar
    const avatarUrl = `https://www.habbo.${hotelConfig.domain}/habbo-imaging/avatarimage?user=${username}&size=l&direction=2&head_direction=3&gesture=wav&action=std`;
    setAvatarUrl(avatarUrl);

    // Verificar se usuário já tem conta
    const userCheck = await checkExistingUser(username, hotelConfig.id);
    setUserExists(userCheck.exists);

    if (userCheck.exists) {
      // Usuário existe, mostrar opções de login
      setStep('verification');
    } else {
      // Usuário novo, ir direto para verificação por motto
      setActiveTab('motto');
      const code = generateCode();
      setGeneratedCode(code);
      setStep('verification');
    }
  };

  // Gerar código de verificação
  const handleGenerateCode = () => {
    if (!username.trim()) {
      return;
    }

    const code = generateCode();
    setGeneratedCode(code);
    setStep('verification');
  };

  // Copiar código para área de transferência
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar código:', err);
    }
  };

  // Verificar usuário com código
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      return;
    }

    const hotelConfig = HOTELS_CONFIG[selectedHotel];
    const user = await verifyUserWithCode(username, verificationCode, hotelConfig.id);
    
    if (user) {
      setVerifiedUser(user);
      setStep('password');
    }
  };

  // Criar conta com senha
  const handleCreateAccount = async () => {
    if (!password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    if (!verifiedUser) {
      return;
    }

    const success = await registerUser(verifiedUser, password);
    if (success) {
      navigate('/console');
    }
  };

  // Login com senha existente
  const handleLoginWithPassword = async () => {
    if (!username || !password) {
      return;
    }

    const hotelConfig = HOTELS_CONFIG[selectedHotel];
    const success = await loginWithPassword(username, password, hotelConfig.id);
    if (success) {
      navigate('/console');
    }
  };

  // Resetar processo
  const resetProcess = () => {
    setUsername('');
    setVerificationCode('');
    setGeneratedCode('');
    setPassword('');
    setConfirmPassword('');
    setVerifiedUser(null);
    setUserExists(false);
    setAvatarUrl('');
    setCodeCopied(false);
    setStep('username');
    setActiveTab('password');
  };

  // Voltar para passo anterior
  const goBack = () => {
    if (step === 'verification') {
      setStep('username');
    } else if (step === 'password') {
      setStep('verification');
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main 
            className="flex-1 p-8 bg-repeat min-h-screen" 
            style={{ 
              backgroundImage: 'url(/assets/bghabbohub.png)',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'cover'
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
                    {step === 'username' ? '🎮 Verificação de Usuário' : 
                     step === 'verification' ? '🔐 Verificação de Conta' : 
                     '🔑 Configuração de Senha'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Passo 1: Nome de usuário e hotel */}
                  {step === 'username' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome de Usuário
                        </label>
                        <Input
                          type="text"
                          placeholder="Digite seu nome de usuário"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="border-2 border-gray-300 focus:border-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hotel de Origem
                        </label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between border-2 border-gray-300">
                              <div className="flex items-center gap-2">
                                <img 
                                  src={HOTELS_CONFIG[selectedHotel].flag} 
                                  alt={HOTELS_CONFIG[selectedHotel].name}
                                  className="w-4 h-3"
                                />
                                <span>{HOTELS_CONFIG[selectedHotel].name}</span>
                              </div>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            {getAllHotels().map((hotel) => (
                              <DropdownMenuItem
                                key={hotel.id}
                                onClick={() => setSelectedHotel(hotel.id)}
                                className="flex items-center gap-2"
                              >
                                <img 
                                  src={hotel.flag} 
                                  alt={hotel.name} 
                                  className="w-4 h-3 object-cover"
                                />
                                <span>{hotel.name}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <Button
                        onClick={handleUsernameSubmit}
                        disabled={isLoading || !username}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      >
                        {isLoading ? 'Verificando...' : '🔍 Verificar Usuário'}
                      </Button>
                    </>
                  )}

                  {/* Passo 2: Verificação */}
                  {step === 'verification' && (
                    <>
                      {/* Avatar do usuário */}
                      {avatarUrl && (
                        <div className="text-center mb-4">
                          <img 
                            src={avatarUrl} 
                            alt={`Avatar de ${username}`}
                            className="w-24 h-32 mx-auto"
                            style={{ imageRendering: 'pixelated' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <p className="text-sm text-gray-600 volter-font mt-2">
                            {username} - {HOTELS_CONFIG[selectedHotel].name}
                          </p>
                        </div>
                      )}

                      {/* Tabs para diferentes métodos de verificação */}
                      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'password' | 'motto')}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="password">🔐 Login com Senha</TabsTrigger>
                          <TabsTrigger value="motto">📝 Verificação por Motto</TabsTrigger>
                        </TabsList>

                        {/* Tab: Login com Senha */}
                        <TabsContent value="password" className="space-y-4">
                          {userExists ? (
                            <>
                              <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                  Senha da Conta
                                </label>
                                <Input
                                  id="password"
                                  type="password"
                                  placeholder="Digite sua senha"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className="border-2 border-gray-300 focus:border-blue-500"
                                />
                              </div>
                              
                              <Button
                                onClick={handleLoginWithPassword}
                                disabled={isLoading || !username || !password}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                              >
                                {isLoading ? 'Fazendo login...' : '🔐 Fazer Login'}
                              </Button>
                            </>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-gray-600 volter-font">
                                Conta não encontrada. Use a verificação por motto para criar uma nova conta.
                              </p>
                            </div>
                          )}
                        </TabsContent>

                        {/* Tab: Verificação por Motto */}
                        <TabsContent value="motto" className="space-y-4">
                          <div className="text-center">
                            <h3 className="text-lg font-bold volter-font mb-2">
                              Código de Verificação
                            </h3>
                            <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-300">
                              <p className="text-sm text-gray-600 volter-font mb-2">
                                Copie este código e cole na sua motto no Habbo:
                              </p>
                              <div className="flex items-center justify-center gap-2">
                                <code className="text-lg font-mono font-bold text-blue-600 bg-white px-3 py-1 rounded border">
                                  {generatedCode}
                                </code>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCopyCode}
                                  className="flex items-center gap-1"
                                >
                                  {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  {codeCopied ? 'Copiado!' : 'Copiar'}
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Código da Motto
                            </label>
                            <Input
                              type="text"
                              placeholder="Cole o código da sua motto aqui"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              className="border-2 border-gray-300 focus:border-blue-500"
                            />
                          </div>
                          
                          <Button
                            onClick={handleVerifyCode}
                            disabled={isLoading || !verificationCode}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                          >
                            {isLoading ? 'Verificando...' : '✅ Verificar Motto'}
                          </Button>
                        </TabsContent>
                      </Tabs>

                      {/* Botão voltar */}
                      <Button
                        onClick={goBack}
                        variant="outline"
                        className="w-full"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                      </Button>
                    </>
                  )}

                  {/* Passo 3: Configuração de senha */}
                  {step === 'password' && verifiedUser && (
                    <>
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold volter-font">
                          {userExists ? 'Redefinir Senha' : 'Criar Nova Conta'}
                        </h3>
                        <p className="text-sm text-gray-600 volter-font">
                          {userExists ? 'Digite sua nova senha' : 'Configure uma senha para sua conta'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nova Senha
                        </label>
                        <Input
                          type="password"
                          placeholder="Digite sua senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="border-2 border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmar Senha
                        </label>
                        <Input
                          type="password"
                          placeholder="Confirme sua senha"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="border-2 border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCreateAccount}
                          disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                          {isLoading ? 'Criando conta...' : '✅ Criar Conta'}
                        </Button>
                        <Button
                          onClick={goBack}
                          variant="outline"
                          className="px-4"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Botão para criar conta de teste */}
                  <div className="pt-4 border-t border-gray-200 text-center">
                    <Button
                      onClick={createTestAccount}
                      variant="outline"
                      className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    >
                      🧪 Criar Conta de Teste (Beebop)
                    </Button>
                  </div>
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