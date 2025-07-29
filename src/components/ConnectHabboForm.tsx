import { useState, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';
import { getUserByName } from '../services/habboApi';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

const generateVerificationCode = () => {
  const code = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `HUB-${code}`;
};

export const ConnectHabboForm = () => {
  const [habboName, setHabboName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [userHabboId, setUserHabboId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  const { toast } = useToast();
  const { 
    user, 
    habboAccount, 
    getLinkedAccount, 
    signUpWithHabbo, 
    signInWithHabbo, 
    verifyHabboMotto,
    signOut 
  } = useSupabaseAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setDebugLog(prev => [...prev, `${timestamp}: ${message}`]);
  };

  // Check if user is admin (only habbohub gets automatic login)
  const checkIfAdmin = (name: string) => {
    return name.toLowerCase() === 'habbohub';
  };

  // Check if user is already logged in
  useEffect(() => {
    if (user && habboAccount) {
      addLog(`✅ Usuário já logado: ${habboAccount.habbo_name}`);
      setStep(5); // Already logged in
    }
  }, [user, habboAccount]);

  // If user is already logged in, show success state
  if (user && habboAccount) {
    return (
      <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Bem-vindo de Volta!</h2>
        <p className="text-gray-600 mb-6">
          Você já está logado no Habbo Hub como <strong>{habboAccount.habbo_name}</strong>.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = `/profile/${habboAccount.habbo_name}`}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Meu Perfil
          </button>
          <button
            onClick={() => signOut()}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

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

    const isAdmin = checkIfAdmin(habboName);
    setIsAdminUser(isAdmin);

    if (isAdmin) {
      addLog(`🔑 Usuário admin detectado: ${habboName}`);
      addLog(`⚡ Implementando login automático para admin`);
      
      setIsProcessing(true);
      
      try {
        // Para admin, usar o nome em lowercase como ID
        const adminHabboId = habboName.toLowerCase();
        setUserHabboId(adminHabboId);
        
        // Verificar se já existe conta vinculada
        const linkedAccount = await getLinkedAccount(adminHabboId);
        
        if (linkedAccount) {
          addLog('🔗 Conta administrativa já existe. Redirecionando para login.');
          setStep(3); // Login with existing password
          toast({
            title: "Admin Detectado",
            description: "Digite sua senha administrativa para acessar o Habbo Hub."
          });
        } else {
          addLog('✨ Primeira vez do admin. Preparando para criar conta administrativa.');
          setStep(4); // Create new account
          toast({
            title: "Admin Detectado",
            description: "Bem-vindo! Crie uma senha para sua conta administrativa."
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        addLog(`❌ Erro ao verificar conta admin: ${errorMessage}`);
        console.error('Erro ao verificar conta admin:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar conta administrativa. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Fluxo normal para usuários não-admin
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
      const newCode = generateVerificationCode();
      setVerificationCode(newCode);
      setStep(2);
      
      addLog(`🔑 Código de verificação gerado: ${newCode}`);
      toast({
        title: "Código Gerado",
        description: `Copie o código "${newCode}" e cole-o na sua motto do Habbo Hotel.`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addLog(`❌ Erro ao verificar nome Habbo: ${errorMessage}`);
      console.error('Erro ao verificar nome Habbo:', error);
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
      setStep(1);
      return;
    }

    setIsProcessing(true);
    addLog('🔍 Verificando sua motto no Habbo Hotel...');
    addLog(`🔎 Procurando por: "${verificationCode}"`);
    
    try {
      const habboUser = await verifyHabboMotto(habboName, verificationCode);
      
      if (habboUser) {
        addLog('✅ Código de verificação encontrado na motto!');
        const linkedAccount = await getLinkedAccount(userHabboId);
        
        if (linkedAccount) {
          addLog('🔗 Vínculo existente detectado.');
          setStep(3); // Login with existing password
          toast({
            title: "Sucesso",
            description: "Código verificado! Digite sua senha do Habbo Hub para acessar."
          });
        } else {
          addLog('✨ Nenhum vínculo existente. Preparando para criar.');
          setStep(4); // Create new account
          toast({
            title: "Sucesso",
            description: "Código verificado! Agora crie uma senha para o seu Habbo Hub."
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addLog(`❌ Erro ao verificar motto: ${errorMessage}`);
      console.error('Erro ao verificar motto:', error);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userHabboId) return;

    setIsProcessing(true);
    addLog('🔐 Iniciando ação de senha...');

    try {
      if (step === 3) {
        // Login with existing account
        addLog('➡️ Tentando login com senha existente...');
        if (!password) {
          toast({
            title: "Erro",
            description: "Por favor, digite sua senha.",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }

        await signInWithHabbo(userHabboId, password);
        addLog('✅ Login bem-sucedido!');
        toast({
          title: "Sucesso",
          description: isAdminUser ? "Login administrativo realizado com sucesso!" : "Login realizado com sucesso!"
        });
        window.location.href = `/profile/${habboName}`;
      } else if (step === 4) {
        // Create new account
        addLog('➡️ Tentando criar nova conta...');
        if (password.length < 6) {
          toast({
            title: "Erro",
            description: "A senha deve ter pelo menos 6 caracteres.",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }
        
        if (password !== confirmPassword) {
          toast({
            title: "Erro",
            description: "As senhas não coincidem.",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }

        await signUpWithHabbo(userHabboId, habboName, password);
        addLog('✅ Conta criada com sucesso!');
        toast({
          title: "Sucesso",
          description: isAdminUser ? "Conta administrativa criada com sucesso!" : "Conta criada e vinculada com sucesso!"
        });
        window.location.href = `/profile/${habboName}`;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const errorDetails = error instanceof Error && error.message ? error.message : JSON.stringify(error);
      
      addLog(`❌ Erro na ação de senha: ${errorMessage}`);
      console.error('Erro na ação de senha:', error);
      
      // Tratamento específico para erros comuns
      let userMessage = errorMessage;
      if (errorMessage.includes('User already registered')) {
        userMessage = "Este usuário já está registrado. Tente fazer login.";
      } else if (errorMessage.includes('Invalid login credentials')) {
        userMessage = "Senha incorreta. Verifique sua senha e tente novamente.";
      } else if (errorMessage.includes('row-level security')) {
        userMessage = "Erro de segurança. Aguarde um momento e tente novamente.";
      }
      
      toast({
        title: "Erro",
        description: userMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Debug Console */}
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
        <h3 className="text-yellow-400 mb-2">Console de Debug:</h3>
        {debugLog.map((log, index) => (
          <div key={index} className="mb-1">{log}</div>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
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
              {checkIfAdmin(habboName) && (
                <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    🔑 Usuário administrativo detectado - Login automático habilitado
                  </p>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              {isProcessing ? 'Verificando...' : checkIfAdmin(habboName) ? 'Acesso Administrativo' : 'Gerar Código de Verificação'}
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Passo 2: Verifique sua Motto</h2>
          <p className="text-gray-700 mb-4">
            Para vincular sua conta, defina sua motto (legenda) no Habbo Hotel para o código abaixo.
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
              <strong>💡 Dica:</strong> O código agora tem o formato "HUB-XXXXX" para facilitar a identificação na sua motto.
            </p>
          </div>
          <p className="text-gray-700 mb-6">
            Após atualizar sua motto no Habbo, clique no botão "Verificar Motto" abaixo.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleVerifyMotto}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              {isProcessing ? 'Verificando Motto...' : 'Verificar Motto'}
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
              disabled={isProcessing}
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {isAdminUser ? 'Acesso Administrativo' : 'Passo 3: Fazer Login'}
          </h2>
          <p className="text-gray-700 mb-4">
            {isAdminUser 
              ? `Bem-vindo, ${habboName}! Digite sua senha administrativa para acessar.`
              : 'Sua conta Habbo está verificada. Digite sua senha do Habbo Hub para acessar.'
            }
          </p>
          <form onSubmit={handlePasswordAction} className="space-y-4">
            <div>
              <label htmlFor="passwordLogin" className="block text-sm font-medium text-gray-700 mb-2">
                Senha do Habbo Hub:
              </label>
              <input
                id="passwordLogin"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-3">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {isProcessing ? 'Entrando...' : 'Entrar'}
              </button>
              <button
                onClick={() => setStep(1)}
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

      {step === 4 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {isAdminUser ? 'Configurar Conta Administrativa' : 'Passo 3: Criar Senha'}
          </h2>
          <p className="text-gray-700 mb-4">
            {isAdminUser 
              ? `Bem-vindo, ${habboName}! Crie uma senha para sua conta administrativa no Habbo Hub.`
              : 'Sua conta Habbo foi verificada! Agora crie uma senha para acessar seu perfil no Habbo Hub.'
            }
          </p>
          <form onSubmit={handlePasswordAction} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha (min. 6 caracteres):
              </label>
              <input
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {isProcessing ? 'Criando Conta...' : isAdminUser ? 'Criar Conta Administrativa' : 'Vincular e Criar Conta'}
              </button>
              <button
                onClick={() => setStep(1)}
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
    </div>
  );
};
