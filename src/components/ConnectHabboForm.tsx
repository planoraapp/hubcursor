import { useState, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';
import { getUserByName } from '../services/habboApi';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Admin users with direct password access
const ADMIN_CREDENTIALS = {
  'beebop': '290684',
  'habbohub': '290684'
};

// Gera código com prefixo HUB- padronizado
const generateVerificationCode = () => {
  const code = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `HUB-${code}`;
};

const STORAGE_KEY = 'habbo_verification_code';
const STORAGE_HABBO_KEY = 'habbo_name_for_code';

export const ConnectHabboForm = () => {
  // Motto verification states
  const [habboName, setHabboName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [mottoStep, setMottoStep] = useState(1);
  const [userHabboId, setUserHabboId] = useState<string | null>(null);
  
  // Password login states
  const [loginHabboName, setLoginHabboName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupHabboName, setSignupHabboName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState<{habboName: string, habboId: string} | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    user, 
    habboAccount, 
    loading: authLoading,
    getLinkedAccount, 
    signUpWithHabbo, 
    signInWithHabbo, 
    verifyHabboMotto,
    signOut 
  } = useSupabaseAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const logEntry = `${timestamp}: ${message}`;
    console.log(logEntry);
    setDebugLog(prev => [...prev, logEntry]);
  };

  useEffect(() => {
    const savedCode = localStorage.getItem(STORAGE_KEY);
    const savedHabboName = localStorage.getItem(STORAGE_HABBO_KEY);
    
    if (savedCode && savedHabboName === habboName && habboName) {
      setVerificationCode(savedCode);
      addLog(`🔄 Código persistido carregado: ${savedCode} para ${habboName}`);
    }
  }, [habboName]);

  // Check if already logged in
  useEffect(() => {
    if (user && habboAccount) {
      addLog(`✅ Usuário já logado: ${habboAccount.habbo_name}`);
      navigate('/');
    }
  }, [user, habboAccount, navigate]);

  if (user && habboAccount) {
    return null;
  }

  // Password login handlers
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginHabboName.trim() || !loginPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    addLog(`🔐 Tentando login por senha para: ${loginHabboName}`);

    try {
      // Check for admin credentials first
      if (ADMIN_CREDENTIALS[loginHabboName.toLowerCase()] === loginPassword) {
        addLog(`👑 Login admin detectado para: ${loginHabboName}`);
        
        // For admin users, create/login directly
        const habboUser = await getUserByName(loginHabboName);
        if (habboUser) {
          try {
            await signInWithHabbo(habboUser.uniqueId, loginPassword);
            addLog('✅ Login admin bem-sucedido!');
            navigate('/');
            return;
          } catch (signInError) {
            // If sign in fails, try to create the account
            await signUpWithHabbo(habboUser.uniqueId, loginHabboName, loginPassword);
            addLog('✅ Conta admin criada e login realizado!');
            navigate('/');
            return;
          }
        }
      }

      // For regular users, check if account exists
      const habboUser = await getUserByName(loginHabboName);
      if (!habboUser) {
        toast({
          title: "Erro",
          description: "Usuário Habbo não encontrado.",
          variant: "destructive"
        });
        return;
      }

      const linkedAccount = await getLinkedAccount(habboUser.uniqueId);
      if (!linkedAccount) {
        toast({
          title: "Conta não encontrada",
          description: "Esta conta ainda não foi registrada. Use a aba 'Criar Conta' primeiro.",
          variant: "destructive"
        });
        return;
      }

      await signInWithHabbo(habboUser.uniqueId, loginPassword);
      addLog('✅ Login por senha bem-sucedido!');
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!"
      });
      navigate('/');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      addLog(`❌ Erro no login por senha: ${errorMessage}`);
      
      if (errorMessage.includes('Invalid login credentials')) {
        toast({
          title: "Erro",
          description: "Nome de usuário ou senha incorretos.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupHabboName.trim() || !signupPassword || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (signupPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    addLog(`📝 Tentando criar conta para: ${signupHabboName}`);

    try {
      const habboUser = await getUserByName(signupHabboName);
      if (!habboUser) {
        toast({
          title: "Erro",
          description: "Usuário Habbo não encontrado ou perfil privado.",
          variant: "destructive"
        });
        return;
      }

      const existingAccount = await getLinkedAccount(habboUser.uniqueId);
      if (existingAccount) {
        toast({
          title: "Erro",
          description: "Esta conta Habbo já está registrada. Use a aba 'Fazer Login'.",
          variant: "destructive"
        });
        return;
      }

      // Create account but mark as pending verification
      setPendingVerification({ habboName: signupHabboName, habboId: habboUser.uniqueId });
      
      toast({
        title: "Conta Criada",
        description: "Conta criada! Agora você precisa verificar seu perfil Habbo para completar o registro."
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na criação da conta';
      addLog(`❌ Erro na criação da conta: ${errorMessage}`);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPendingAccount = async () => {
    if (!pendingVerification) return;

    setIsProcessing(true);
    try {
      const newCode = generateVerificationCode();
      setVerificationCode(newCode);
      localStorage.setItem(STORAGE_KEY, newCode);
      localStorage.setItem(STORAGE_HABBO_KEY, pendingVerification.habboName);
      
      toast({
        title: "Código Gerado",
        description: `Copie o código "${newCode}" e cole-o na sua motto do Habbo Hotel para completar o registro.`
      });
      
      // Switch to motto verification with pre-filled data
      setHabboName(pendingVerification.habboName);
      setUserHabboId(pendingVerification.habboId);
      setMottoStep(2);
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar código de verificação.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitiateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habboName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu nome Habbo.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    addLog(`🔍 Verificando Habbo "${habboName}" na API...`);
    
    try {
      const habboUser = await getUserByName(habboName);
      
      if (!habboUser || !habboUser.motto) {
        addLog(`❌ Habbo "${habboName}" não encontrado ou perfil privado.`);
        toast({
          title: "Erro",
          description: `O Habbo "${habboName}" não foi encontrado, está offline ou tem perfil privado.`,
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      addLog(`✅ Habbo encontrado: ${habboUser.name}`);
      addLog(`💬 Motto atual: "${habboUser.motto}"`);
      
      setUserHabboId(habboUser.uniqueId);
      
      const hubCodePattern = /HUB-[A-Z0-9]{5}/gi;
      const existingCode = habboUser.motto.match(hubCodePattern);
      
      if (existingCode && existingCode.length > 0) {
        const foundCode = existingCode[0].toUpperCase();
        addLog(`🔍 Código HUB encontrado na motto: ${foundCode}`);
        setVerificationCode(foundCode);
        localStorage.setItem(STORAGE_KEY, foundCode);
        localStorage.setItem(STORAGE_HABBO_KEY, habboName);
        setMottoStep(2);
        toast({
          title: "Código Encontrado",
          description: `Código "${foundCode}" já está na sua motto. Você pode verificar agora ou gerar um novo.`
        });
      } else {
        const newCode = generateVerificationCode();
        setVerificationCode(newCode);
        localStorage.setItem(STORAGE_KEY, newCode);
        localStorage.setItem(STORAGE_HABBO_KEY, habboName);
        setMottoStep(2);
        
        addLog(`🔑 Código de verificação gerado: ${newCode}`);
        toast({
          title: "Código Gerado",
          description: `Copie o código "${newCode}" e cole-o na sua motto do Habbo Hotel.`
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addLog(`❌ Erro ao verificar nome Habbo: ${errorMessage}`);
      toast({
        title: "Erro",
        description: "Não foi possível verificar o nome Habbo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyMotto = async () => {
    if (!habboName.trim() || !verificationCode || !userHabboId) {
      toast({
        title: "Erro",
        description: "Erro na verificação. Por favor, reinicie o processo.",
        variant: "destructive"
      });
      setMottoStep(1);
      return;
    }

    setIsProcessing(true);
    addLog('🔍 Verificando sua motto no Habbo Hotel...');
    
    try {
      const habboUser = await verifyHabboMotto(habboName, verificationCode);
      
      if (habboUser) {
        addLog('✅ Código de verificação encontrado na motto!');
        
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_HABBO_KEY);

        // If this is from pending verification, complete the signup
        if (pendingVerification && pendingVerification.habboName === habboName) {
          await signUpWithHabbo(userHabboId, habboName, signupPassword);
          setPendingVerification(null);
          toast({
            title: "Sucesso",
            description: "Conta verificada e criada com sucesso!"
          });
          navigate('/');
          return;
        }
        
        const linkedAccount = await getLinkedAccount(userHabboId);
        
        if (linkedAccount) {
          addLog('🔗 Vínculo existente detectado. Redirecionando para login.');
          setMottoStep(3);
          toast({
            title: "Conta Encontrada",
            description: "Sua conta foi verificada! Digite sua senha para acessar."
          });
        } else {
          addLog('✨ Nenhum vínculo existente. Redirecionando para criação de conta.');
          setMottoStep(4);
          toast({
            title: "Sucesso",
            description: "Código verificado! Agora crie uma senha para o seu Habbo Hub."
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addLog(`❌ Erro ao verificar motto: ${errorMessage}`);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMottoPasswordAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userHabboId) return;

    setIsProcessing(true);
    addLog('🔐 Iniciando ação de senha...');

    try {
      if (mottoStep === 3) {
        addLog('➡️ Tentando login com senha existente...');
        if (!loginPassword) {
          toast({
            title: "Erro",
            description: "Por favor, digite sua senha.",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }

        await signInWithHabbo(userHabboId, loginPassword);
        addLog('✅ Login bem-sucedido!');
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
        
        navigate('/');
        
      } else if (mottoStep === 4) {
        addLog('➡️ Tentando criar nova conta...');
        if (signupPassword.length < 6) {
          toast({
            title: "Erro",
            description: "A senha deve ter pelo menos 6 caracteres.",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }
        
        if (signupPassword !== confirmPassword) {
          toast({
            title: "Erro",
            description: "As senhas não coincidem.",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }

        await signUpWithHabbo(userHabboId, habboName, signupPassword);
        addLog('✅ Conta criada com sucesso!');
        
        if (habboName.toLowerCase() === 'habbohub') {
          addLog('🔑 [Admin] Conta administrativa criada com sucesso');
        }
        
        toast({
          title: "Sucesso",
          description: "Conta criada e vinculada com sucesso!",
          duration: 3000
        });
        
        navigate('/');
      }
    } catch (error) {
      let errorMessage = 'Erro desconhecido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      addLog(`❌ Erro na ação de senha: ${errorMessage}`);
      
      let userMessage = errorMessage;
      if (errorMessage.includes('Invalid login credentials')) {
        userMessage = "Senha incorreta. Verifique sua senha e tente novamente.";
      } else if (errorMessage.includes('User already registered')) {
        userMessage = "Este usuário já está registrado. Tente fazer login.";
      }
      
      toast({
        title: "Erro",
        description: userMessage,
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Console de Debug */}
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
        <h3 className="text-yellow-400 mb-2">Console de Debug:</h3>
        {debugLog.map((log, index) => (
          <div key={index} className="mb-1">{log}</div>
        ))}
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Login por Senha</TabsTrigger>
            <TabsTrigger value="motto">Verificação por Motto</TabsTrigger>
          </TabsList>
          
          <TabsContent value="password" className="space-y-4">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Login e Cadastro</h2>
              
              {pendingVerification && (
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800 mb-2">
                    Conta criada para <strong>{pendingVerification.habboName}</strong>! 
                    Agora você precisa verificar seu perfil Habbo para completar o registro.
                  </p>
                  <button
                    onClick={handleVerifyPendingAccount}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    disabled={isProcessing}
                  >
                    Verificar Perfil Habbo
                  </button>
                </div>
              )}

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Fazer Login</TabsTrigger>
                  <TabsTrigger value="signup">Criar Conta</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Habbo:
                      </label>
                      <input
                        type="text"
                        value={loginHabboName}
                        onChange={(e) => setLoginHabboName(e.target.value)}
                        placeholder="Seu nome no Habbo"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Senha:
                      </label>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Sua senha"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Entrando...' : 'Fazer Login'}
                    </button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handlePasswordSignup} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Habbo:
                      </label>
                      <input
                        type="text"
                        value={signupHabboName}
                        onChange={(e) => setSignupHabboName(e.target.value)}
                        placeholder="Seu nome no Habbo"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Senha:
                      </label>
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Crie uma senha (mín. 6 caracteres)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Senha:
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme sua senha"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Criando Conta...' : 'Criar Conta'}
                    </button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
          
          <TabsContent value="motto" className="space-y-4">
            {mottoStep === 1 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Passo 1: Nome do Habbo</h2>
                <form onSubmit={handleInitiateVerification} className="space-y-4">
                  <div>
                    <label htmlFor="habboName" className="block text-sm font-medium text-gray-700 mb-2">
                      Qual é o seu nome no Habbo Hotel?
                    </label>
                    <input
                      id="habboName"
                      type="text"
                      value={habboName}
                      onChange={(e) => setHabboName(e.target.value)}
                      placeholder="Ex: SeuNomeHabbo"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Verificando...' : 'Verificar Habbo'}
                  </button>
                </form>
              </div>
            )}

            {mottoStep === 2 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Passo 2: Verifique sua Motto</h2>
                <p className="text-gray-700 mb-4">
                  Para vincular sua conta, certifique-se de que sua motto (legenda) no Habbo Hotel contém o código abaixo.
                  Certifique-se de que você está <strong>online</strong> no Habbo Hotel.
                </p>
                <div
                  className="bg-gray-100 p-4 rounded-lg border border-gray-300 mb-4 text-center cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(verificationCode);
                    toast({
                      title: "Copiado",
                      description: "Código copiado para a área de transferência!"
                    });
                  }}
                  title="Clique para copiar"
                >
                  <p className="text-xl font-bold text-blue-700 select-all">{verificationCode}</p>
                  <span className="text-sm text-gray-500">Clique no código para copiar</span>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Dica:</strong> O código tem o formato "HUB-XXXXX" e foi salvo automaticamente. 
                    Se você já tem este código na sua motto, pode verificar diretamente.
                  </p>
                </div>
                <p className="text-gray-700 mb-6">
                  Após garantir que sua motto contém o código, clique em "Verificar Motto".
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleVerifyMotto}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Verificando Motto...' : 'Verificar Motto'}
                  </button>
                  <button
                    onClick={() => setMottoStep(1)}
                    className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                    disabled={isProcessing}
                  >
                    Voltar
                  </button>
                </div>
              </div>
            )}

            {mottoStep === 3 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Passo 3: Fazer Login</h2>
                <p className="text-gray-700 mb-4">
                  Sua conta Habbo está verificada. Digite sua senha do Habbo Hub para acessar.
                </p>
                <form onSubmit={handleMottoPasswordAction} className="space-y-4">
                  <div>
                    <label htmlFor="passwordLogin" className="block text-sm font-medium text-gray-700 mb-2">
                      Senha do Habbo Hub:
                    </label>
                    <input
                      id="passwordLogin"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="space-y-3">
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Entrando...' : 'Entrar'}
                    </button>
                    <button
                      onClick={() => setMottoStep(1)}
                      type="button"
                      className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                      disabled={isProcessing}
                    >
                      Voltar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {mottoStep === 4 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Passo 3: Criar Senha</h2>
                <p className="text-gray-700 mb-4">
                  Sua conta Habbo foi verificada! Agora crie uma senha para acessar seu perfil no Habbo Hub.
                </p>
                <form onSubmit={handleMottoPasswordAction} className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Nova Senha (min. 6 caracteres):
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Crie uma senha"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Senha:
                    </label>
                    <input
                      id="confirmNewPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua senha"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="space-y-3">
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Criando Conta...' : 'Vincular e Criar Conta'}
                    </button>
                    <button
                      onClick={() => setMottoStep(1)}
                      type="button"
                      className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                      disabled={isProcessing}
                    >
                      Voltar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
