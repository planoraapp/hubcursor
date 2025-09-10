import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { HOTELS_CONFIG, getAllHotels } from '@/config/hotels';
import { HabboUser, AuthService } from '@/services/authService';
import { Copy, Check, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const {
    habboAccount,
    isLoggedIn,
    loading,
    loginWithPassword,
    logout
  } = useUnifiedAuth();
  
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
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados de controle da interface
  const [step, setStep] = useState<'username' | 'verification' | 'password'>('password');
  const [activeTab, setActiveTab] = useState<'password' | 'motto'>('password');

  // Função para gerar código de verificação
  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Função para login direto
  const handleDirectLogin = async () => {
    if (!username.trim() || !password.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      await loginWithPassword(username.trim(), password);
      // O redirecionamento será feito automaticamente pelo useEffect
    } catch (error: any) {
      console.error('Erro no login:', error);
      // O erro será tratado pelo hook useUnifiedAuth
    } finally {
      setIsLoading(false);
    }
  };

  // Função para verificar se é usuário admin (não mais necessária - usar is_admin do DB)
  // const isAdminUser = (username: string) => {
  //   const adminUsers = ['beebop', 'habbohub'];
  //   return adminUsers.includes(username.toLowerCase());
  // };

  // Verificar se já está logado ao carregar a página
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/console');
    }
  }, [isLoggedIn, navigate]);

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
    const userCheck = await AuthService.checkExistingUser(username, hotelConfig.id);
    setUserExists(userCheck.exists);

    // Sempre ir para o campo de senha primeiro
    setStep('password');
    setActiveTab('password');
    
    if (!userCheck.exists) {
      // Se usuário não existe, também preparar verificação por motto
      const code = generateCode();
      setGeneratedCode(code);
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
    const result = await AuthService.verifyUserWithCode(username, verificationCode, hotelConfig.id);
    const user = result.success ? result.user : null;
    
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

    const result = await AuthService.registerUser(verifiedUser, password);
    const success = result.success;
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
    const success = await loginWithPassword(username, password);
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
                    🔐 HabboHub - Login e Cadastro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Formulário de Login Direto */}
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold volter-font">
                        🔐 Login HabboHub
                      </h3>
                      <p className="text-sm text-gray-600 volter-font">
                        Digite seu nome Habbo e senha para fazer login
                      </p>
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
                        onKeyPress={(e) => e.key === 'Enter' && handleDirectLogin()}
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
                        onKeyPress={(e) => e.key === 'Enter' && handleDirectLogin()}
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
                      onClick={handleDirectLogin}
                      disabled={isLoading || !username.trim() || !password.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      {isLoading ? 'Fazendo login...' : '🔐 Fazer Login'}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Não tem conta? 
                        <button 
                          onClick={() => setStep('username')}
                          className="text-blue-600 hover:text-blue-800 ml-1 underline"
                        >
                          Criar nova conta
                        </button>
                      </p>
                    </div>
                  </div>

                  <hr className="my-6 border-gray-300" />

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
                        disabled={loading || !username}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      >
                        {loading ? 'Verificando...' : '🔍 Verificar Usuário'}
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
                            disabled={loading || !username || !password}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                          >
                            {loading ? 'Fazendo login...' : '🔐 Fazer Login'}
                          </Button>
                          
                          {!userExists && (
                            <div className="text-center py-2">
                              <p className="text-sm text-orange-600 volter-font">
                                ⚠️ Conta não encontrada. Use a verificação por motto para criar uma nova conta.
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
                            disabled={loading || !verificationCode}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                          >
                            {loading ? 'Verificando...' : '✅ Verificar Motto'}
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
                  {step === 'password' && (verifiedUser || userExists || (username.toLowerCase() === 'habbohub' && selectedHotel === 'brazil')) && (
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

                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold volter-font">
                          {userExists ? 'Login' : 'Criar Nova Conta'}
                        </h3>
                        <p className="text-sm text-gray-600 volter-font">
                          {userExists ? 'Digite sua senha para fazer login' : 'Configure uma senha para sua conta'}
                        </p>
                      </div>

                      {userExists ? (
                        // Para qualquer usuário existente, mostrar campo de senha e botão de login
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Senha da Conta
                            </label>
                            <Input
                              type="password"
                              placeholder={username.toLowerCase() === 'habbohub' ? "Digite a senha (151092)" : 
                                         username.toLowerCase() === 'beebop' ? "Digite a senha (290684)" : 
                                         "Digite sua senha"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="border-2 border-gray-300 focus:border-blue-500"
                              onKeyPress={(e) => e.key === 'Enter' && handleLoginWithPassword()}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={handleLoginWithPassword}
                              disabled={loading || !password}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                              {loading ? 'Fazendo login...' : '🔐 Fazer Login'}
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
                      ) : (
                        // Para outros usuários, mostrar campos de senha e confirmação
                        <>
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
                              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                              {loading ? 'Criando conta...' : '✅ Criar Conta'}
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
                    </>
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