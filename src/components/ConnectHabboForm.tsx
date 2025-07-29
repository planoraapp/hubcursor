
import { useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { getUserByName } from '../services/habboApi';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

const generateVerificationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const ConnectHabboForm = () => {
  const [habboName, setHabboName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [userHabboId, setUserHabboId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  const { 
    user, 
    habboAccount, 
    getLinkedAccount, 
    signUpWithHabbo, 
    signInWithHabbo, 
    verifyHabboMotto 
  } = useSupabaseAuth();

  // If user is already logged in, show success state
  if (user && habboAccount) {
    return (
      <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Bem-vindo de Volta!</h2>
        <p className="text-gray-600 mb-6">
          Você já está logado no Habbo Hub como <strong>{habboAccount.habbo_name}</strong>.
        </p>
        <button
          onClick={() => window.location.href = `/profile/${habboAccount.habbo_name}`}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver Meu Perfil
        </button>
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

    setIsProcessing(true);
    try {
      const habboUser = await getUserByName(habboName);
      if (!habboUser || !habboUser.motto) {
        toast({
          title: "Erro",
          description: `O Habbo "${habboName}" não foi encontrado, está offline ou tem perfil privado.`,
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      setUserHabboId(habboUser.uniqueId); // Fixed: use uniqueId instead of id
      const newCode = generateVerificationCode();
      setVerificationCode(newCode);
      setStep(2);
      
      toast({
        title: "Código Gerado",
        description: `Copie o código "${newCode}" e cole-o na sua motto do Habbo Hotel.`
      });
    } catch (error) {
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
    try {
      const habboUser = await verifyHabboMotto(habboName, verificationCode);
      
      if (habboUser) {
        const linkedAccount = await getLinkedAccount(userHabboId);
        
        if (linkedAccount) {
          setStep(3); // Login with existing password
          toast({
            title: "Sucesso",
            description: "Código verificado! Digite sua senha do Habbo Hub para acessar."
          });
        } else {
          setStep(4); // Create new account
          toast({
            title: "Sucesso",
            description: "Código verificado! Agora crie uma senha para o seu Habbo Hub."
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar motto:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao verificar a motto.",
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
      if (step === 3) {
        // Login with existing account
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
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
        window.location.href = `/profile/${habboName}`;
      } else if (step === 4) {
        // Create new account
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
        toast({
          title: "Sucesso",
          description: "Conta criada e vinculada com sucesso!"
        });
        window.location.href = `/profile/${habboName}`;
      }
    } catch (error) {
      console.error('Erro na ação de senha:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
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
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              {isProcessing ? 'Verificando...' : 'Gerar Código de Verificação'}
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">Passo 3: Fazer Login</h2>
          <p className="text-gray-700 mb-4">
            Sua conta Habbo está verificada. Digite sua senha do Habbo Hub para acessar.
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">Passo 3: Criar Senha</h2>
          <p className="text-gray-700 mb-4">
            Sua conta Habbo foi verificada! Agora crie uma senha para acessar seu perfil no Habbo Hub.
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
                {isProcessing ? 'Criando Conta...' : 'Vincular e Criar Conta'}
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
