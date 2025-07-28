
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getUserByName } from '../services/habboApi';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../hooks/useAuth';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

// Função para gerar código de verificação
const generateVerificationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Funções de localStorage para simular banco de dados
const getHabboHubAccount = (habboId: string) => {
  try {
    const accounts = JSON.parse(localStorage.getItem('habboHubAccounts') || '{}');
    return accounts[habboId];
  } catch (e) {
    console.error("Erro ao ler accounts do localStorage", e);
    return null;
  }
};

const saveHabboHubAccount = (habboId: string, accountData: any) => {
  try {
    const accounts = JSON.parse(localStorage.getItem('habboHubAccounts') || '{}');
    accounts[habboId] = accountData;
    localStorage.setItem('habboHubAccounts', JSON.stringify(accounts));
  } catch (e) {
    console.error("Erro ao salvar accounts no localStorage", e);
  }
};

const ConnectHabbo: React.FC = () => {
  const [habboName, setHabboName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [userHabboId, setUserHabboId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const navigate = useNavigate();
  const { isLoggedIn, userData, login, logout } = useAuth();
  const isMobile = useIsMobile();

  // Verificar se já está logado
  useEffect(() => {
    if (isLoggedIn && userData) {
      setHabboName(userData.name);
      setStep(5);
    }
  }, [isLoggedIn, userData]);

  // Passo 1: Verificar nome Habbo e gerar código
  const handleInitiateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habboName.trim()) {
      toast.error('Por favor, digite seu nome Habbo.');
      return;
    }

    setIsProcessing(true);
    try {
      const habboUser = await getUserByName(habboName);
      if (!habboUser) {
        toast.error(`O Habbo "${habboName}" não foi encontrado.`);
        return;
      }

      const newCode = generateVerificationCode();
      setVerificationCode(newCode);
      setStep(2);
      toast.info(`Código gerado: ${newCode}. Adicione-o à sua motto no Habbo Hotel.`);
    } catch (err) {
      console.error('Erro ao verificar nome Habbo:', err);
      toast.error('Não foi possível verificar o nome Habbo. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Passo 2: Verificar motto
  const handleVerifyMotto = async () => {
    if (!habboName.trim() || !verificationCode) {
      toast.error('Erro na verificação. Por favor, reinicie o processo.');
      setStep(1);
      return;
    }

    setIsProcessing(true);
    toast.info('Verificando sua motto no Habbo Hotel...');
    
    try {
      const habboUser = await getUserByName(habboName);

      if (habboUser && habboUser.motto && habboUser.motto.includes(verificationCode)) {
        setUserHabboId(habboUser.uniqueId);

        const existingAccount = getHabboHubAccount(habboUser.uniqueId);
        if (existingAccount) {
          setStep(3); // Login com senha
          toast.success('Código verificado! Digite sua senha do Habbo Hub.');
        } else {
          setStep(4); // Criar nova senha
          toast.success('Código verificado! Crie uma senha para o Habbo Hub.');
        }
      } else {
        toast.error('Código não encontrado na sua motto. Certifique-se de que está online e a motto está correta.');
      }
    } catch (err) {
      console.error('Erro ao verificar motto:', err);
      toast.error('Ocorreu um erro ao verificar a motto. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Passo 3 e 4: Login ou criação de conta
  const handlePasswordAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userHabboId) return;

    setIsProcessing(true);

    if (step === 3) { // Login
      if (!password) {
        toast.error('Por favor, digite sua senha.');
        setIsProcessing(false);
        return;
      }

      const accountData = getHabboHubAccount(userHabboId);
      if (accountData && accountData.password === password) {
        // Login via useAuth
        const loginSuccess = await login(habboName);
        if (loginSuccess) {
          toast.success('Login realizado com sucesso!');
          navigate(`/profile/${habboName}`);
        }
      } else {
        toast.error('Senha incorreta. Tente novamente.');
      }
    } else if (step === 4) { // Criar conta
      if (password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres.');
        setIsProcessing(false);
        return;
      }
      if (password !== confirmPassword) {
        toast.error('As senhas não coincidem.');
        setIsProcessing(false);
        return;
      }

      // Salvar nova conta
      saveHabboHubAccount(userHabboId, { 
        habboName, 
        password, 
        createdAt: new Date().toISOString() 
      });

      // Login via useAuth
      const loginSuccess = await login(habboName);
      if (loginSuccess) {
        toast.success('Conta criada e vinculada com sucesso!');
        navigate(`/profile/${habboName}`);
      }
    }
    setIsProcessing(false);
  };

  // Logout
  const handleLogout = () => {
    logout();
    setStep(1);
    setHabboName('');
    setPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setUserHabboId(null);
    toast.info('Você saiu da sua conta Habbo Hub.');
  };

  const renderContent = () => (
    <div className="space-y-6">
      {/* Passo 5: Usuário já logado */}
      {step === 5 && (
        <PanelCard title="Bem-vindo de volta!">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <img 
                src="/assets/frank.png" 
                alt="Habbo Hub" 
                className="w-16 h-16 object-contain" 
              />
            </div>
            <p className="text-gray-700 mb-4">
              Você já está logado no Habbo Hub como <strong>{habboName}</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => navigate(`/profile/${habboName}`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Ver Meu Perfil
              </Button>
              <Button 
                onClick={handleLogout}
                variant="destructive"
              >
                Sair do Habbo Hub
              </Button>
            </div>
          </div>
        </PanelCard>
      )}

      {/* Passo 1: Nome Habbo */}
      {step === 1 && (
        <PanelCard title="Passo 1: Digite seu Nome Habbo">
          <form onSubmit={handleInitiateVerification} className="space-y-4">
            <div className="flex justify-center mb-4">
              <img 
                src="/assets/frank.png" 
                alt="Habbo Hub" 
                className="w-12 h-12 object-contain" 
              />
            </div>
            <div>
              <label htmlFor="habboName" className="block text-sm font-medium text-gray-700 mb-2">
                Qual é o seu nome no Habbo Hotel?
              </label>
              <Input
                id="habboName"
                type="text"
                value={habboName}
                onChange={(e) => setHabboName(e.target.value)}
                placeholder="Ex: SeuNomeHabbo"
                required
                disabled={isProcessing}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isProcessing}
            >
              {isProcessing ? 'Verificando...' : 'Gerar Código de Verificação'}
            </Button>
          </form>
        </PanelCard>
      )}

      {/* Passo 2: Verificar motto */}
      {step === 2 && (
        <PanelCard title="Passo 2: Verifique sua Motto">
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <img 
                src="/assets/Elevador.png" 
                alt="Verificação" 
                className="w-12 h-12 object-contain" 
              />
            </div>
            <p className="text-gray-700">
              Para vincular sua conta, defina sua <strong>motto (legenda)</strong> no Habbo Hotel para o código abaixo.
              Certifique-se de que você está <strong>online</strong> no Habbo Hotel.
            </p>
            <div
              className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300 text-center cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(verificationCode);
                toast.info('Código copiado para a área de transferência!');
              }}
              title="Clique para copiar"
            >
              <p className="text-2xl font-bold text-blue-600 select-all font-mono">
                {verificationCode}
              </p>
              <span className="text-sm text-gray-500">Clique no código para copiar</span>
            </div>
            <p className="text-sm text-gray-600">
              Após atualizar sua motto no Habbo, clique em "Verificar Motto".
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleVerifyMotto}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isProcessing}
              >
                {isProcessing ? 'Verificando Motto...' : 'Verificar Motto'}
              </Button>
              <Button 
                onClick={() => setStep(1)}
                variant="outline"
                disabled={isProcessing}
              >
                Voltar
              </Button>
            </div>
          </div>
        </PanelCard>
      )}

      {/* Passo 3: Login */}
      {step === 3 && (
        <PanelCard title="Passo 3: Login no Habbo Hub">
          <form onSubmit={handlePasswordAction} className="space-y-4">
            <div className="flex justify-center mb-4">
              <img 
                src="/assets/Check2.png" 
                alt="Login" 
                className="w-12 h-12 object-contain" 
              />
            </div>
            <p className="text-gray-700 mb-4">
              Sua conta Habbo foi verificada! Digite sua senha do Habbo Hub para acessar.
            </p>
            <div>
              <label htmlFor="passwordLogin" className="block text-sm font-medium text-gray-700 mb-2">
                Senha do Habbo Hub:
              </label>
              <Input
                id="passwordLogin"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                disabled={isProcessing}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isProcessing}
              >
                {isProcessing ? 'Entrando...' : 'Entrar'}
              </Button>
              <Button 
                onClick={() => setStep(1)}
                variant="outline"
                disabled={isProcessing}
              >
                Voltar
              </Button>
            </div>
          </form>
        </PanelCard>
      )}

      {/* Passo 4: Criar senha */}
      {step === 4 && (
        <PanelCard title="Passo 3: Criar Senha para o Habbo Hub">
          <form onSubmit={handlePasswordAction} className="space-y-4">
            <div className="flex justify-center mb-4">
              <img 
                src="/assets/Check2.png" 
                alt="Criar Conta" 
                className="w-12 h-12 object-contain" 
              />
            </div>
            <p className="text-gray-700 mb-4">
              Sua conta Habbo foi verificada! Crie uma senha para acessar o Habbo Hub.
            </p>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha (min. 6 caracteres):
              </label>
              <Input
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha"
                required
                disabled={isProcessing}
              />
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha:
              </label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                required
                disabled={isProcessing}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isProcessing}
              >
                {isProcessing ? 'Criando Conta...' : 'Vincular e Criar Conta'}
              </Button>
              <Button 
                onClick={() => setStep(1)}
                variant="outline"
                disabled={isProcessing}
              >
                Voltar
              </Button>
            </div>
          </form>
        </PanelCard>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout>
        {renderContent()}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <PageHeader 
            title="Vincular Conta Habbo"
            icon="/assets/hub.gif"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConnectHabbo;
