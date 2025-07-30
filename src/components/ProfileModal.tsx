
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../hooks/use-toast';
import { getUserByName, getAvatarUrl } from '../lib/habboApi';
import { supabase } from '../integrations/supabase/client';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

// Generate verification code with HUB- prefix
const generateVerificationCode = () => {
  const code = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HUB-${code}`;
};

// Helper function for badge URLs
const getBadgeUrl = (badgeCode: string) => `https://images.habbo.com/c_images/album1584/${badgeCode}.png`;

interface SmallBadgeProps {
  badgeCode: string;
}

function SmallBadge({ badgeCode }: SmallBadgeProps) {
  const badgeUrl = getBadgeUrl(badgeCode);
  return (
    <img
      src={badgeUrl}
      alt={`Emblema ${badgeCode}`}
      className="w-8 h-8 object-contain bg-gray-200 p-1 rounded-full border border-gray-300"
      title={badgeCode}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/assets/placeholder_badge.png';
      }}
    />
  );
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  usernameFromApp?: string;
  isLoginAttempt: boolean;
}

export default function ProfileModal({ isOpen, onClose, usernameFromApp, isLoginAttempt }: ProfileModalProps) {
  const [userData, setUserData] = useState<any>(null);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [habboNameInput, setHabboNameInput] = useState(usernameFromApp || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginStep, setLoginStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'password' | 'motto'>('password');
  const [userHabboId, setUserHabboId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();
  const {
    getLinkedAccount,
    signUpWithHabbo,
    signInWithHabbo,
    verifyHabboMotto,
    signOut
  } = useSupabaseAuth();

  useEffect(() => {
    setUserData(null);
    setUserBadges([]);
    setLoading(true);
    setError(null);
    setVerificationCode('');
    setPassword('');
    setConfirmPassword('');
    setUserHabboId(null);
    setIsProcessing(false);

    if (isOpen) {
      if (isLoginAttempt) {
        setLoginStep(1);
        setHabboNameInput(usernameFromApp || '');
        setActiveTab('password');
      } else {
        setLoginStep(0);
        const fetchProfileData = async () => {
          if (!usernameFromApp) {
            setError('Nenhum usuário logado para exibir o perfil.');
            setLoading(false);
            return;
          }
          try {
            const user = await getUserByName(usernameFromApp);
            if (user) {
              setUserData(user);
              setUserBadges(user.selectedBadges || []);
            } else {
              setError('Perfil não encontrado ou privado.');
            }
          } catch (err) {
            console.error('Erro ao buscar perfil para o modal:', err);
            setError('Falha ao carregar perfil. Tente novamente.');
          } finally {
            setLoading(false);
          }
        };
        fetchProfileData();
      }
    }
  }, [isOpen, usernameFromApp, isLoginAttempt]);

  if (!isOpen) return null;

  const handleLoginByPasswordInModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentHabboName = habboNameInput.trim();
    if (!currentHabboName || !password) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu nome Habbo e sua senha.",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);

    try {
      const { data: linkedAccount, error: fetchLinkError } = await supabase
        .from('habbo_accounts')
        .select('habbo_id, supabase_user_id')
        .eq('habbo_name', currentHabboName)
        .single();

      if (fetchLinkError && fetchLinkError.code === 'PGRST116') {
        toast({
          title: "Erro",
          description: "Conta não encontrada. Use a aba 'Verificação por Motto' para criar uma conta.",
          variant: "destructive"
        });
        setIsProcessing(false);
        setActiveTab('motto');
        return;
      } else if (fetchLinkError) {
        toast({
          title: "Erro",
          description: "Erro ao verificar sua conta. Tente novamente.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      await signInWithHabbo(linkedAccount.habbo_id, password);
      toast({
        title: "Sucesso",
        description: "Login bem-sucedido no Habbo Hub!"
      });
      onClose();
      window.location.href = `/profile/${currentHabboName}`;
    } catch (err) {
      console.error('Erro inesperado no login:', err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitiateMottoVerificationInModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentHabboName = habboNameInput.trim();
    if (!currentHabboName) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu nome Habbo.",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);

    try {
      const habboUserCheck = await getUserByName(currentHabboName);
      if (!habboUserCheck) {
        toast({
          title: "Erro",
          description: `O Habbo "${currentHabboName}" não foi encontrado.`,
          variant: "destructive"
        });
        return;
      }
      if (!habboUserCheck.motto) {
        toast({
          title: "Erro",
          description: `O Habbo "${currentHabboName}" está offline ou com perfil privado.`,
          variant: "destructive"
        });
        return;
      }

      const existingLink = await getLinkedAccount(habboUserCheck.uniqueId);
      if (existingLink) {
        toast({
          title: "Info",
          description: "Este Habbo já está vinculado a uma conta. Use a aba 'Login por Senha'."
        });
        setHabboNameInput(currentHabboName);
        setActiveTab('password');
        return;
      }

      const newCode = generateVerificationCode();
      setVerificationCode(newCode);
      setLoginStep(2);
      setUserHabboId(habboUserCheck.uniqueId);
      toast({
        title: "Código Gerado",
        description: `Copie o código "${newCode}" e cole-o na sua motto do Habbo Hotel.`
      });
    } catch (err) {
      console.error('Erro ao iniciar verificação no modal:', err);
      toast({
        title: "Erro",
        description: "Não foi possível verificar o nome Habbo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyMottoInModal = async () => {
    if (!habboNameInput.trim() || !verificationCode || userHabboId === null) {
      toast({
        title: "Erro",
        description: "Erro na verificação. Por favor, reinicie o processo.",
        variant: "destructive"
      });
      setLoginStep(1);
      return;
    }
    setIsProcessing(true);

    try {
      const habboUser = await verifyHabboMotto(habboNameInput, verificationCode);
      if (habboUser) {
        setLoginStep(3);
        toast({
          title: "Sucesso",
          description: "Código verificado! Agora crie uma senha para o seu Habbo Hub."
        });
      }
    } catch (err: any) {
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

  const handleCreateOrLoginAccountInModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

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

    try {
      await signUpWithHabbo(userHabboId!, habboNameInput, password);
      toast({
        title: "Sucesso",
        description: "Conta criada e vinculada!"
      });
      onClose();
      window.location.href = `/profile/${habboNameInput}`;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]" onClick={onClose}>
      <div className="bg-amber-50 rounded-lg shadow-xl p-6 relative w-11/12 max-w-sm border border-gray-900" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-700 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
          </svg>
        </button>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <span className="text-gray-600">Preparando...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-red-600">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {isLoginAttempt || (loginStep > 0 && loginStep < 5) ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center volter-font">Login / Vincular Habbo</h3>

                {loginStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex space-x-2 mb-4">
                      <button
                        onClick={() => setActiveTab('password')}
                        className={`flex-1 py-2 px-4 text-sm font-medium rounded-md volter-font ${
                          activeTab === 'password'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Login por Senha
                      </button>
                      <button
                        onClick={() => setActiveTab('motto')}
                        className={`flex-1 py-2 px-4 text-sm font-medium rounded-md volter-font ${
                          activeTab === 'motto'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Verificação por Motto
                      </button>
                    </div>

                    {activeTab === 'password' && (
                      <form onSubmit={handleLoginByPasswordInModal} className="space-y-4">
                        <input
                          type="text"
                          value={habboNameInput}
                          onChange={(e) => setHabboNameInput(e.target.value)}
                          placeholder="Nome do seu Habbo"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={isProcessing}
                        />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Sua senha do Habbo Hub"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={isProcessing}
                        />
                        <button
                          type="submit"
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 volter-font"
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Entrando...' : 'Entrar'}
                        </button>
                      </form>
                    )}

                    {activeTab === 'motto' && (
                      <form onSubmit={handleInitiateMottoVerificationInModal} className="space-y-4">
                        <input
                          type="text"
                          value={habboNameInput}
                          onChange={(e) => setHabboNameInput(e.target.value)}
                          placeholder="Nome do seu Habbo"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={isProcessing}
                        />
                        <button
                          type="submit"
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 volter-font"
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Verificando...' : 'Gerar Código de Verificação'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {loginStep === 2 && (
                  <div className="space-y-4 text-center">
                    <h4 className="text-lg font-semibold">Verifique sua Motto</h4>
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
                      <p className="text-2xl font-bold text-blue-700 select-all volter-font">{verificationCode}</p>
                    </div>
                    <p className="text-sm text-gray-600">Certifique-se de estar online e com o perfil público.</p>
                    <button
                      onClick={handleVerifyMottoInModal}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 volter-font"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Verificando Motto...' : 'Verificar Motto'}
                    </button>
                    <button
                      onClick={() => setLoginStep(1)}
                      className="w-full px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
                      disabled={isProcessing}
                    >
                      Voltar
                    </button>
                  </div>
                )}

                {loginStep === 3 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-center">Crie sua Senha</h4>
                    <p className="text-gray-700">Sua conta Habbo foi verificada! Agora crie uma senha para acessar seu perfil no Habbo Hub.</p>
                    <form onSubmit={handleCreateOrLoginAccountInModal} className="space-y-4">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nova Senha (min. 6 caracteres)"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isProcessing}
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar Senha"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isProcessing}
                      />
                      <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 volter-font"
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Criando Conta...' : 'Criar Conta'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              loginStep === 0 && userData && (
                <div className="flex flex-col items-center text-center space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 volter-font">Meu Perfil Habbo</h3>
                  <div className="relative">
                    <img
                      src={getAvatarUrl(userData.name)}
                      alt={`Avatar de ${userData.name}`}
                      className="w-24 h-auto rounded-lg border-4 border-yellow-400 shadow-lg"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${userData.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 volter-font">{userData.name}</h4>
                  <p className="text-gray-600 italic">"{userData.motto}"</p>
                  <p className="text-sm text-gray-500">
                    Membro desde: {new Date(userData.memberSince).toLocaleDateString('pt-BR')}
                  </p>
                  {userBadges.length > 0 && (
                    <div>
                      <p className="text-gray-700 font-medium mb-2">Meus Emblemas:</p>
                      <div className="flex justify-center space-x-2">
                        {userBadges.slice(0, 3).map((badge) => (
                          <SmallBadge key={badge.code} badgeCode={badge.code} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.location.href = `/profile/${userData.name}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors volter-font"
                    >
                      Ver Perfil Completo
                    </button>
                    <button
                      onClick={() => signOut()}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors volter-font"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
