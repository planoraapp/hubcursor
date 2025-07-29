
import { useState } from 'react';
import { Shield, User, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useToast } from '../hooks/use-toast';
import { PanelCard } from './PanelCard';
import { getUserByName } from '../services/habboApi';

const generateVerificationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const ConnectHabboForm = () => {
  const [habboName, setHabboName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'input' | 'verification' | 'login' | 'signup' | 'success'>('input');
  const [userHabboId, setUserHabboId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const { getLinkedAccount, signUpWithHabbo, signInWithHabbo, verifyHabboMotto } = useSupabaseAuth();
  const { toast } = useToast();

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
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
    setDebugInfo([]);
    addDebugInfo('🔍 Verificando usuário Habbo...');

    try {
      const habboUser = await getUserByName(habboName.trim());
      
      if (!habboUser || !habboUser.motto) {
        addDebugInfo('❌ Usuário não encontrado ou perfil privado');
        toast({
          title: "Usuário não encontrado",
          description: "Verifique se o nome está correto e se o perfil está público.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      addDebugInfo(`✅ Usuário encontrado: ${habboUser.name}`);
      addDebugInfo(`👤 Online: ${habboUser.online ? 'Sim' : 'Não'}`);
      addDebugInfo(`💬 Motto atual: "${habboUser.motto}"`);

      setUserHabboId(habboUser.id);
      const code = generateVerificationCode();
      setVerificationCode(code);
      addDebugInfo(`🔑 Código gerado: ${code}`);
      setStep('verification');
    } catch (error) {
      addDebugInfo('❌ Erro ao verificar usuário');
      toast({
        title: "Erro",
        description: "Erro ao verificar usuário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userHabboId || !verificationCode) {
      toast({
        title: "Erro",
        description: "Erro na verificação. Reinicie o processo.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    addDebugInfo('🔍 Verificando código na motto...');

    try {
      const habboUser = await verifyHabboMotto(habboName, verificationCode);
      addDebugInfo(`✅ Código verificado na motto: "${habboUser.motto}"`);

      // Check if account already exists
      const linkedAccount = await getLinkedAccount(userHabboId);
      
      if (linkedAccount) {
        addDebugInfo('🔑 Conta existente encontrada - solicitando login');
        setStep('login');
        toast({
          title: "Conta encontrada",
          description: "Digite sua senha para entrar no Habbo Hub.",
        });
      } else {
        addDebugInfo('🆕 Nova conta - solicitando criação de senha');
        setStep('signup');
        toast({
          title: "Nova conta",
          description: "Crie uma senha para sua conta no Habbo Hub.",
        });
      }
    } catch (error) {
      addDebugInfo('❌ Falha na verificação');
      toast({
        title: "Erro na verificação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userHabboId || !password) {
      toast({
        title: "Erro",
        description: "Por favor, digite sua senha.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    addDebugInfo('🔐 Tentando login...');

    try {
      await signInWithHabbo(userHabboId, password);
      addDebugInfo('✅ Login realizado com sucesso!');
      setStep('success');
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!",
      });
    } catch (error) {
      addDebugInfo('❌ Falha no login');
      toast({
        title: "Erro de login",
        description: "Senha incorreta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userHabboId || !password || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

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

    setIsProcessing(true);
    addDebugInfo('🆕 Criando nova conta...');

    try {
      await signUpWithHabbo(userHabboId, habboName, password);
      addDebugInfo('✅ Conta criada com sucesso!');
      setStep('success');
      toast({
        title: "Sucesso",
        description: "Conta criada e vinculada com sucesso!",
      });
    } catch (error) {
      addDebugInfo('❌ Falha na criação da conta');
      toast({
        title: "Erro",
        description: "Erro ao criar conta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProcess = () => {
    setStep('input');
    setHabboName('');
    setVerificationCode('');
    setPassword('');
    setConfirmPassword('');
    setUserHabboId(null);
    setDebugInfo([]);
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {step === 'input' && (
        <PanelCard title="Conectar Habbo">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Instruções:</strong> Digite seu nome Habbo para conectar sua conta aos recursos exclusivos do hub.
            </p>
          </div>

          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do seu Habbo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={habboName}
                  onChange={(e) => setHabboName(e.target.value)}
                  placeholder="Digite seu nome Habbo..."
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || !habboName.trim()}
              className="w-full bg-[#008800] text-white py-3 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <Shield size={18} />
                  <span>Continuar</span>
                </>
              )}
            </button>
          </form>
        </PanelCard>
      )}

      {step === 'verification' && (
        <PanelCard title="Verificação de Conta">
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-bold text-yellow-800 mb-2">📋 Passo 1: Copie o código</h3>
              <div className="bg-white p-3 rounded border font-mono text-lg font-bold text-center border-dashed border-2 border-yellow-300">
                {verificationCode}
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">✏️ Passo 2: Cole na sua motto</h3>
              <p className="text-sm text-blue-700 mb-2">
                1. Abra o Habbo Hotel<br/>
                2. Clique no seu avatar<br/>
                3. Cole o código na sua <strong>motto</strong><br/>
                4. Salve e clique em "Verificar"
              </p>
            </div>

            <form onSubmit={handleVerification} className="space-y-4">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#008800] text-white py-3 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>Verificando motto...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Verificar Código</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetProcess}
                className="w-full bg-gray-500 text-white py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                ← Voltar
              </button>
            </form>
          </div>
        </PanelCard>
      )}

      {step === 'login' && (
        <PanelCard title="Login no Habbo Hub">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <p className="text-sm text-green-700">
              <strong>Conta encontrada!</strong> Digite sua senha para entrar no Habbo Hub.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha do Habbo Hub
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha..."
                className="w-full px-4 py-3 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
                required
                disabled={isProcessing}
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || !password}
              className="w-full bg-[#008800] text-white py-3 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Entrar</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetProcess}
              className="w-full bg-gray-500 text-white py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              ← Voltar
            </button>
          </form>
        </PanelCard>
      )}

      {step === 'signup' && (
        <PanelCard title="Criar Conta no Habbo Hub">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <p className="text-sm text-blue-700">
              <strong>Nova conta!</strong> Crie uma senha para acessar os recursos exclusivos do Habbo Hub.
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha (mínimo 6 caracteres)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha..."
                className="w-full px-4 py-3 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
                required
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha..."
                className="w-full px-4 py-3 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
                required
                disabled={isProcessing}
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || !password || !confirmPassword}
              className="w-full bg-[#008800] text-white py-3 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  <span>Criando conta...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Criar Conta</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetProcess}
              className="w-full bg-gray-500 text-white py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              ← Voltar
            </button>
          </form>
        </PanelCard>
      )}

      {step === 'success' && (
        <PanelCard title="Login Realizado!">
          <div className="text-center space-y-4">
            <CheckCircle size={48} className="text-green-500 mx-auto" />
            <h3 className="text-lg font-bold text-green-700">
              🎉 Bem-vindo ao Habbo Hub!
            </h3>
            <p className="text-gray-600">
              Sua conta foi conectada com sucesso.<br/>
              Redirecionando para o painel principal...
            </p>
          </div>
        </PanelCard>
      )}

      {/* Debug Panel */}
      {debugInfo.length > 0 && (
        <PanelCard title="Debug Info">
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index} className="mb-1">{info}</div>
            ))}
          </div>
        </PanelCard>
      )}
    </div>
  );
};
