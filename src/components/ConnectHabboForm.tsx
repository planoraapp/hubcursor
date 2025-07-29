
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useToast } from '../hooks/use-toast';
import { getUserByName } from '../services/habboApi';

// Gera código com prefixo HUB- padronizado
const generateVerificationCode = () => {
  const code = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `HUB-${code}`;
};

export const ConnectHabboForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    user,
    habboAccount,
    getLinkedAccount,
    createLinkedAccount,
    signUpWithHabbo,
    signInWithHabbo,
    verifyHabboMotto
  } = useSupabaseAuth();

  // Estados para login/cadastro por motto
  const [habboName, setHabboName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [userHabboId, setUserHabboId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para login direto por senha
  const [directLoginName, setDirectLoginName] = useState('');
  const [directLoginPassword, setDirectLoginPassword] = useState('');
  const [isDirectLoginProcessing, setIsDirectLoginProcessing] = useState(false);

  // Estados para cadastro por senha
  const [signupName, setSignupName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupStep, setSignupStep] = useState(1);
  const [signupHabboId, setSignupHabboId] = useState<string | null>(null);
  const [signupVerificationCode, setSignupVerificationCode] = useState('');
  const [isSignupProcessing, setIsSignupProcessing] = useState(false);

  // Reset states when user changes
  useEffect(() => {
    if (user && habboAccount) {
      navigate('/');
    }
  }, [user, habboAccount, navigate]);

  // Funções para login por motto
  const handleInitiateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentHabboName = habboName.trim();
    if (!currentHabboName) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu nome Habbo.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Lógica específica para "habbohub" (Admin)
    if (currentHabboName.toLowerCase() === 'habbohub') {
      setUserHabboId(`habbohub-id-${currentHabboName}`);
      setStep(3);
      toast({
        title: "Modo Admin",
        description: "Por favor, digite sua senha do Habbo Hub."
      });
      setIsProcessing(false);
      return;
    }

    try {
      const habboUserCheck = await getUserByName(currentHabboName);

      if (!habboUserCheck || !habboUserCheck.motto) {
        toast({
          title: "Erro",
          description: `O Habbo "${currentHabboName}" não foi encontrado, está offline ou tem perfil privado.`,
          variant: "destructive"
        });
        return;
      }
      
      const newCode = generateVerificationCode();
      setVerificationCode(newCode);
      setStep(2);
      toast({
        title: "Código Gerado",
        description: `Copie o código "${newCode}" e cole-o na sua motto do Habbo Hotel.`
      });

    } catch (err) {
      console.error('Erro ao iniciar verificação:', err);
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
    if (!habboName.trim() || !verificationCode) {
      toast({
        title: "Erro",
        description: "Erro na verificação. Por favor, reinicie o processo.",
        variant: "destructive"
      });
      setStep(1);
      return;
    }

    setIsProcessing(true);
    try {
      const habboUser = await verifyHabboMotto(habboName, verificationCode);
      
      if (habboUser) {
        setUserHabboId(habboUser.uniqueId);
        
        const linkedAccount = await getLinkedAccount(habboUser.uniqueId);
        
        if (linkedAccount) {
          setStep(4);
          toast({
            title: "Sucesso",
            description: "Código verificado! Digite sua senha do Habbo Hub."
          });
        } else {
          setStep(3);
          toast({
            title: "Sucesso",
            description: "Código verificado! Crie uma senha para o seu Habbo Hub."
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao verificar motto';
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

    try {
      if (step === 4) { // Login
        if (!password) {
          toast({
            title: "Erro",
            description: "Por favor, digite sua senha.",
            variant: "destructive"
          });
          return;
        }
        
        await signInWithHabbo(userHabboId, password);
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
        navigate('/');
        
      } else if (step === 3) { // Criar conta
        if (password.length < 6) {
          toast({
            title: "Erro",
            description: "A senha deve ter pelo menos 6 caracteres.",
            variant: "destructive"
          });
          return;
        }
        
        if (password !== confirmPassword) {
          toast({
            title: "Erro",
            description: "As senhas não coincidem.",
            variant: "destructive"
          });
          return;
        }
        
        await signUpWithHabbo(userHabboId, habboName, password);
        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso!"
        });
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na autenticação';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Funções para login direto por senha
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directLoginName.trim() || !directLoginPassword.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsDirectLoginProcessing(true);
    try {
      // Para usuários que já têm conta vinculada
      const habboUser = await getUserByName(directLoginName);
      if (habboUser) {
        await signInWithHabbo(habboUser.uniqueId, directLoginPassword);
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
        navigate('/');
      } else {
        // Para usuários admin como habbohub
        if (directLoginName.toLowerCase() === 'habbohub') {
          await signInWithHabbo(`habbohub-id-${directLoginName}`, directLoginPassword);
          toast({
            title: "Sucesso",
            description: "Login admin realizado com sucesso!"
          });
          navigate('/');
        } else {
          toast({
            title: "Erro",
            description: "Usuário não encontrado ou senha incorreta.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsDirectLoginProcessing(false);
    }
  };

  // Funções para cadastro por senha
  const handleSignupInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupPassword.trim() || !signupConfirmPassword.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
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

    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    setIsSignupProcessing(true);
    try {
      const habboUser = await getUserByName(signupName);
      if (!habboUser) {
        toast({
          title: "Erro",
          description: "Usuário Habbo não encontrado. Verifique o nome e se o perfil está público.",
          variant: "destructive"
        });
        return;
      }

      const newCode = generateVerificationCode();
      setSignupVerificationCode(newCode);
      setSignupHabboId(habboUser.uniqueId);
      setSignupStep(2);
      toast({
        title: "Verificação Necessária",
        description: `Copie o código "${newCode}" e cole-o na sua motto do Habbo Hotel para confirmar a conta.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar usuário Habbo.",
        variant: "destructive"
      });
    } finally {
      setIsSignupProcessing(false);
    }
  };

  const handleSignupVerify = async () => {
    if (!signupName.trim() || !signupVerificationCode) {
      toast({
        title: "Erro",
        description: "Erro na verificação. Por favor, reinicie o processo.",
        variant: "destructive"
      });
      setSignupStep(1);
      return;
    }

    setIsSignupProcessing(true);
    try {
      const habboUser = await verifyHabboMotto(signupName, signupVerificationCode);
      
      if (habboUser && signupHabboId) {
        await signUpWithHabbo(signupHabboId, signupName, signupPassword);
        toast({
          title: "Sucesso",
          description: "Conta criada e verificada com sucesso!"
        });
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na verificação';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSignupProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <Tabs defaultValue="motto" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="motto">Verificação por Motto</TabsTrigger>
          <TabsTrigger value="password">Login por Senha</TabsTrigger>
        </TabsList>

        <TabsContent value="motto" className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">Conectar com Verificação por Motto</h3>
            <p className="text-sm text-gray-600">Processo seguro usando sua motto do Habbo</p>
          </div>

          {step === 1 && (
            <form onSubmit={handleInitiateVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do seu Habbo:
                </label>
                <input
                  type="text"
                  value={habboName}
                  onChange={(e) => setHabboName(e.target.value)}
                  placeholder="Digite seu nome Habbo"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isProcessing}
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? 'Verificando...' : 'Gerar Código'}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center">
              <p className="text-gray-700">Copie este código para sua motto no Habbo Hotel:</p>
              <div
                className="bg-gray-100 p-3 rounded-lg border border-gray-300 cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(verificationCode);
                  toast({
                    title: "Copiado",
                    description: "Código copiado para a área de transferência!"
                  });
                }}
                title="Clique para copiar"
              >
                <p className="text-2xl font-bold text-blue-700 select-all">{verificationCode}</p>
              </div>
              <p className="text-sm text-gray-600">Certifique-se de estar online e com o perfil público.</p>
              <button
                onClick={handleVerifyMotto}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? 'Verificando Motto...' : 'Verificar Motto'}
              </button>
              <button
                onClick={() => setStep(1)}
                className="w-full px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
                disabled={isProcessing}
              >
                Voltar
              </button>
            </div>
          )}

          {(step === 3 || step === 4) && (
            <form onSubmit={handlePasswordAction} className="space-y-4">
              <p className="text-gray-700">
                {step === 3 ? 'Crie uma senha para seu Habbo Hub:' : 'Digite sua senha do Habbo Hub:'}
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={step === 3 ? "Nova Senha (min. 6 caracteres)" : "Sua senha"}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isProcessing}
              />
              {step === 3 && (
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar Senha"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isProcessing}
                />
              )}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? (step === 3 ? 'Criando Conta...' : 'Entrando...') : (step === 3 ? 'Criar Conta' : 'Entrar')}
              </button>
            </form>
          )}
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Login por Senha</h3>
                <p className="text-sm text-gray-600">Para contas já verificadas</p>
              </div>

              <form onSubmit={handleDirectLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Habbo:
                  </label>
                  <input
                    type="text"
                    value={directLoginName}
                    onChange={(e) => setDirectLoginName(e.target.value)}
                    placeholder="Digite seu nome Habbo"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isDirectLoginProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha:
                  </label>
                  <input
                    type="password"
                    value={directLoginPassword}
                    onChange={(e) => setDirectLoginPassword(e.target.value)}
                    placeholder="Sua senha do Habbo Hub"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isDirectLoginProcessing}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isDirectLoginProcessing}
                >
                  {isDirectLoginProcessing ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Cadastrar por Senha</h3>
                <p className="text-sm text-gray-600">Requer verificação por motto</p>
              </div>

              {signupStep === 1 && (
                <form onSubmit={handleSignupInitiate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Habbo:
                    </label>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Digite seu nome Habbo"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isSignupProcessing}
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
                      placeholder="Senha (min. 6 caracteres)"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isSignupProcessing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Senha:
                    </label>
                    <input
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Confirme sua senha"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isSignupProcessing}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={isSignupProcessing}
                  >
                    {isSignupProcessing ? 'Verificando...' : 'Continuar'}
                  </button>
                </form>
              )}

              {signupStep === 2 && (
                <div className="space-y-4 text-center">
                  <p className="text-gray-700">Copie este código para sua motto no Habbo Hotel:</p>
                  <div
                    className="bg-gray-100 p-3 rounded-lg border border-gray-300 cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(signupVerificationCode);
                      toast({
                        title: "Copiado",
                        description: "Código copiado para a área de transferência!"
                      });
                    }}
                    title="Clique para copiar"
                  >
                    <p className="text-2xl font-bold text-blue-700 select-all">{signupVerificationCode}</p>
                  </div>
                  <p className="text-sm text-gray-600">Após colar o código na motto, clique em verificar.</p>
                  <button
                    onClick={handleSignupVerify}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={isSignupProcessing}
                  >
                    {isSignupProcessing ? 'Verificando e Criando Conta...' : 'Verificar e Criar Conta'}
                  </button>
                  <button
                    onClick={() => setSignupStep(1)}
                    className="w-full px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
                    disabled={isSignupProcessing}
                  >
                    Voltar
                  </button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};
