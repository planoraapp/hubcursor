import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, RefreshCw, AlertCircle, CheckCircle, Bug } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUserByName } from '../services/habboApi';
import { PanelCard } from '../components/PanelCard';
import { PageHeader } from '../components/PageHeader';
import { useToast } from '../hooks/use-toast';

export default function ConnectHabbo() {
  const [habboName, setHabboName] = useState('');
  const [step, setStep] = useState<'input' | 'verification' | 'success'>('input');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const { loginWithVerification, isLoggedIn, isAdminUser, devMode } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const generateVerificationCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setVerificationCode(code);
    addDebugInfo(`🔑 Generated verification code: ${code}`);
    setStep('verification');
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

    setIsLoading(true);
    setDebugInfo([]);
    addDebugInfo('🔍 Iniciando verificação de usuário...');

    try {
      const user = await getUserByName(habboName.trim());
      
      if (!user) {
        addDebugInfo('❌ Usuário não encontrado na API do Habbo');
        toast({
          title: "Usuário não encontrado",
          description: "Verifique se o nome está correto e tente novamente.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      addDebugInfo(`✅ Usuário encontrado: ${user.name}`);
      addDebugInfo(`👤 Online: ${user.online ? 'Sim' : 'Não'}`);
      addDebugInfo(`💬 Motto atual: "${user.motto}"`);
      addDebugInfo(`🔓 Perfil público: ${user.profileVisible ? 'Sim' : 'Não'}`);

      // Check if user is admin
      const isAdmin = isAdminUser(habboName.trim());
      if (isAdmin) {
        addDebugInfo('🛡️ Usuário admin detectado!');
        
        if (devMode) {
          addDebugInfo('🛠️ Modo DEV ativo - tentando login direto...');
          const loginSuccess = await loginWithVerification(habboName.trim(), '');
          
          if (loginSuccess) {
            addDebugInfo('✅ Login admin realizado com sucesso!');
            setStep('success');
            toast({
              title: "Admin Login",
              description: "Login de administrador realizado com sucesso!",
            });
            
            setTimeout(() => {
              navigate('/');
            }, 2000);
            setIsLoading(false);
            return;
          }
        }
      }

      if (!user.profileVisible) {
        addDebugInfo('❌ Perfil privado detectado');
        toast({
          title: "Perfil Privado",
          description: "Seu perfil precisa estar público para fazer login.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      addDebugInfo('✅ Usuário válido! Gerando código de verificação...');
      generateVerificationCode();
      
    } catch (error) {
      console.error('Error checking user:', error);
      addDebugInfo('❌ Erro ao verificar usuário na API');
      toast({
        title: "Erro",
        description: "Erro ao verificar usuário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    addDebugInfo('🔍 Iniciando verificação do código...');

    try {
      const loginSuccess = await loginWithVerification(habboName.trim(), verificationCode);
      
      if (loginSuccess) {
        addDebugInfo('✅ Verificação e login realizados com sucesso!');
        setStep('success');
        toast({
          title: "Sucesso!",
          description: "Login realizado com sucesso!",
        });
        
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        addDebugInfo('❌ Falha na verificação ou login');
        toast({
          title: "Erro na Verificação",
          description: "Código não encontrado na motto ou erro no login.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      addDebugInfo('❌ Erro durante verificação');
      toast({
        title: "Erro",
        description: "Erro durante a verificação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetProcess = () => {
    setStep('input');
    setHabboName('');
    setVerificationCode('');
    setDebugInfo([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex flex-col">
      <PageHeader title="Conectar Habbo" />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          {step === 'input' && (
            <PanelCard title="Conectar Habbo">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Instruções:</strong> Digite seu nome Habbo para conectar sua conta aos recursos exclusivos do hub.
                </p>
                {devMode && (
                  <p className="text-sm text-green-700 mt-2">
                    <strong>🛠️ Modo DEV:</strong> Admins podem fazer login direto sem verificação.
                  </p>
                )}
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
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !habboName.trim()}
                  className="w-full bg-[#008800] text-white py-3 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
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
                    disabled={isLoading}
                    className="w-full bg-[#008800] text-white py-3 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
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
      </div>
    </div>
  );
}
