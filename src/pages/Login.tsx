
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useHubLogin } from '@/hooks/useHubLogin';
import { HOTELS_CONFIG, getAllHotels } from '@/config/hotels';
import { HabboUser } from '@/services/authService';

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
  
  // Estados de controle da interface
  const [step, setStep] = useState<'username' | 'verification' | 'password'>('username');
  const [isPasswordMode, setIsPasswordMode] = useState(false);

  // Verificar se já está logado ao carregar a página
  useEffect(() => {
    const user = checkAuthStatus();
    if (user) {
      navigate('/console');
    }
  }, [checkAuthStatus, navigate]);

  // Gerar código de verificação
  const handleGenerateCode = () => {
    if (!username.trim()) {
      return;
    }

    const code = generateCode();
    setGeneratedCode(code);
    setStep('verification');
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
      
      // Verificar se usuário já tem conta
      const userCheck = await checkExistingUser(username, hotelConfig.id);
      
      if (userCheck.exists) {
        // Usuário já tem conta, pedir senha
        setStep('password');
      } else {
        // Usuário novo, pedir para criar senha
        setStep('password');
      }
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
    setStep('username');
    setIsPasswordMode(false);
    setVerificationCode('');
    setGeneratedCode('');
    setPassword('');
    setConfirmPassword('');
    setVerifiedUser(null);
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
          <main className="flex-1 p-8 bg-repeat min-h-screen" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
            <div className="max-w-md mx-auto mt-10">
              {/* Logo do HabboHub */}
              <div className="text-center mb-8">
                <img 
                  src="/assets/habbohub.gif" 
                  alt="HabboHub Logo" 
                  className="mx-auto w-32 h-auto"
                />
              </div>

              <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900 volter-font">
                    Conectar Conta Habbo
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    {step === 'username' && !isPasswordMode && 'Digite seu nome de usuário'}
                    {step === 'verification' && 'Coloque o código em sua motto no Habbo'}
                    {step === 'password' && 'Defina sua senha'}
                    {isPasswordMode && 'Faça login com sua senha'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Passo 1: Nome de usuário e seleção de hotel */}
                  {step === 'username' && !isPasswordMode && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome de Usuário Habbo
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Digite seu username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="flex-1 border-2 border-gray-300 focus:border-blue-500"
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-12 h-10 p-0">
                                <img 
                                  src={HOTELS_CONFIG[selectedHotel].flag} 
                                  alt="Flag" 
                                  className="w-6 h-4 object-cover"
                                />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {Object.entries(HOTELS_CONFIG).map(([key, hotel]) => (
                                <DropdownMenuItem 
                                  key={key}
                                  onClick={() => setSelectedHotel(key)}
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
                        <p className="text-xs text-gray-500 mt-1">
                          Hotel: {HOTELS_CONFIG[selectedHotel].name}
                        </p>
                      </div>
                      
                      <Button
                        onClick={handleGenerateCode}
                        disabled={isLoading || !username.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      >
                        {isLoading ? 'Gerando código...' : '🔑 Gerar Código de Verificação'}
                      </Button>

                      {/* Login com senha existente */}
                      <div className="pt-4 border-t border-gray-200 space-y-2">
                        <Button
                          onClick={() => setIsPasswordMode(true)}
                          variant="outline"
                          className="w-full"
                        >
                          🔐 Já tenho uma conta
                        </Button>
                        
                        {/* Botão para criar conta de teste */}
                        <Button
                          onClick={createTestAccount}
                          variant="outline"
                          className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        >
                          🧪 Criar Conta de Teste (Beebop)
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Passo 2: Verificação do código */}
                  {step === 'verification' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800 font-bold">
                          Código gerado: {generatedCode}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          1. Copie o código acima
                        </p>
                        <p className="text-xs text-blue-600">
                          2. Cole em sua motto no Habbo {HOTELS_CONFIG[selectedHotel].name}
                        </p>
                        <p className="text-xs text-blue-600">
                          3. Clique em "Verificar Código" abaixo
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Código de Verificação
                        </label>
                        <Input
                          type="text"
                          placeholder="Digite o código da sua motto"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                          className="border-2 border-gray-300 focus:border-blue-500 text-center font-mono"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleVerifyCode}
                          disabled={isLoading || !verificationCode.trim()}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                          {isLoading ? 'Verificando...' : '✅ Verificar Código'}
                        </Button>
                        <Button
                          onClick={goBack}
                          variant="outline"
                          className="px-4"
                        >
                          ↩️
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Passo 3: Definição de senha */}
                  {step === 'password' && verifiedUser && (
                    <div className="space-y-4">
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <img 
                            src={verifiedUser.habbo_avatar} 
                            alt="Avatar" 
                            className="w-8 h-8"
                          />
                          <div>
                            <p className="text-sm text-green-800 font-bold">
                              {verifiedUser.habbo_username}
                            </p>
                            <p className="text-xs text-green-600">
                              Hotel: {HOTELS_CONFIG[selectedHotel].name}
                            </p>
                          </div>
                        </div>
                      </div>

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
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                        >
                          {isLoading ? 'Criando conta...' : '💾 Criar Conta'}
                        </Button>
                        <Button
                          onClick={goBack}
                          variant="outline"
                          className="px-4"
                        >
                          ↩️
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Login com senha existente (modo alternativo) */}
                  {isPasswordMode && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome de Usuário Habbo
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Digite seu username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="flex-1 border-2 border-gray-300 focus:border-blue-500"
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-12 h-10 p-0">
                                <img 
                                  src={HOTELS_CONFIG[selectedHotel].flag} 
                                  alt="Flag" 
                                  className="w-6 h-4 object-cover"
                                />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {Object.entries(HOTELS_CONFIG).map(([key, hotel]) => (
                                <DropdownMenuItem 
                                  key={key}
                                  onClick={() => setSelectedHotel(key)}
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
                      </div>
                      
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
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleLoginWithPassword}
                          disabled={isLoading || !username || !password}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                          {isLoading ? 'Fazendo login...' : '🔐 Fazer Login'}
                        </Button>
                        <Button
                          onClick={() => {
                            setIsPasswordMode(false);
                            resetProcess();
                          }}
                          variant="outline"
                          className="px-4"
                        >
                          ↩️
                        </Button>
                      </div>

                      {/* Link para criar nova conta */}
                      <div className="pt-4 border-t border-gray-200 text-center">
                        <Button
                          onClick={() => {
                            setIsPasswordMode(false);
                            resetProcess();
                          }}
                          variant="ghost"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Não tem conta? Criar nova conta
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Informações do usuário verificado */}
                  {currentUser && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex items-center gap-2">
                        <img 
                          src={currentUser.habbo_avatar} 
                          alt="Avatar" 
                          className="w-8 h-8"
                        />
                        <div>
                          <p className="text-sm text-blue-800 font-bold">
                            {currentUser.habbo_username}
                          </p>
                          <p className="text-xs text-blue-600">
                            Hotel: {HOTELS_CONFIG[selectedHotel]?.name || 'Desconhecido'}
                          </p>
                        </div>
                      </div>
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
