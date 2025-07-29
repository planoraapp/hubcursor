
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { getUserByName, getUserBadges, getAvatarUrl, getBadgeUrl } from '../services/habboApi';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoginAttempt: boolean;
}

// Gera código com prefixo HUB- padronizado
const generateVerificationCode = () => {
  const code = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `HUB-${code}`;
};

// Componente para exibir um emblema no modal
function SmallBadge({ badgeCode }: { badgeCode: string }) {
  const badgeUrl = getBadgeUrl(badgeCode);
  return (
    <img
      src={badgeUrl}
      alt={`Emblema ${badgeCode}`}
      className="w-8 h-8 object-contain rounded-full border border-gray-300"
      title={badgeCode}
    />
  );
}

export const ProfileModal = ({ isOpen, onClose, isLoginAttempt }: ProfileModalProps) => {
  const { isLoggedIn, userData, logout } = useAuth();
  const { toast } = useToast();
  const {
    user,
    habboAccount,
    getLinkedAccount,
    signUpWithHabbo,
    signInWithHabbo,
    verifyHabboMotto
  } = useSupabaseAuth();

  // Estados para login/cadastro no modal
  const [habboNameInput, setHabboNameInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginStep, setLoginStep] = useState(1);
  const [userHabboId, setUserHabboId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileBadges, setProfileBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setHabboNameInput('');
      setVerificationCode('');
      setPassword('');
      setConfirmPassword('');
      setUserHabboId(null);
      setIsProcessing(false);
      setProfileData(null);
      setProfileBadges([]);
      setError(null);
      
      if (isLoginAttempt) {
        setLoginStep(1);
        setLoading(false);
      } else if (userData) {
        setLoading(true);
        loadProfileData();
      }
    }
  }, [isOpen, isLoginAttempt, userData]);

  const loadProfileData = async () => {
    if (!userData) return;
    
    try {
      const user = await getUserByName(userData.name);
      if (user) {
        setProfileData(user);
        const badges = await getUserBadges(user.uniqueId);
        setProfileBadges(badges?.slice(0, 3) || []);
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

  // Funções de login/cadastro adaptadas para o modal
  const handleInitiateLoginVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habboNameInput.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu nome Habbo.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const habboUserCheck = await getUserByName(habboNameInput);

      if (!habboUserCheck || !habboUserCheck.motto) {
        toast({
          title: "Erro",
          description: `O Habbo "${habboNameInput}" não foi encontrado, está offline ou tem perfil privado.`,
          variant: "destructive"
        });
        return;
      }
      
      const newCode = generateVerificationCode();
      setVerificationCode(newCode);
      setLoginStep(2);
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
    if (!habboNameInput.trim() || !verificationCode) {
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
        setUserHabboId(habboUser.uniqueId);
        
        const linkedAccount = await getLinkedAccount(habboUser.uniqueId);
        
        if (linkedAccount) {
          setLoginStep(4); // Login com senha existente
          toast({
            title: "Sucesso",
            description: "Código verificado! Digite sua senha do Habbo Hub."
          });
        } else {
          setLoginStep(3); // Criar senha
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

  const handlePasswordActionInModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userHabboId) return;
    
    setIsProcessing(true);

    try {
      if (loginStep === 4) { // Login
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
        onClose();
        window.location.href = `/profile/${habboNameInput}`;
        
      } else if (loginStep === 3) { // Criar conta
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
        
        await signUpWithHabbo(userHabboId, habboNameInput, password);
        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso!"
        });
        onClose();
        window.location.href = `/profile/${habboNameInput}`;
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

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-amber-50 rounded-lg shadow-xl p-6 relative w-11/12 max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-700 hover:text-gray-900"
        >
          <X size={24} />
        </button>

        {isLoginAttempt ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Login / Vincular Habbo</h3>

            {loginStep === 1 && (
              <form onSubmit={handleInitiateLoginVerification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digite seu nome Habbo:
                  </label>
                  <input
                    type="text"
                    value={habboNameInput}
                    onChange={(e) => setHabboNameInput(e.target.value)}
                    placeholder="Nome do seu Habbo"
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

            {loginStep === 2 && (
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
                  onClick={handleVerifyMottoInModal}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
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
              <form onSubmit={handlePasswordActionInModal} className="space-y-4">
                <p className="text-gray-700">Crie uma senha para seu Habbo Hub:</p>
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
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Criando Conta...' : 'Criar Conta'}
                </button>
              </form>
            )}

            {loginStep === 4 && (
              <form onSubmit={handlePasswordActionInModal} className="space-y-4">
                <p className="text-gray-700">Sua conta Habbo Hub já existe. Digite sua senha:</p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Meu Perfil</h3>
            
            {loading && (
              <div className="flex justify-center items-center py-8">
                <span className="text-gray-600">Carregando informações...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-4 text-red-600">
                <p>{error}</p>
              </div>
            )}

            {isLoggedIn && userData && profileData && !loading && (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <img
                    src={`https://www.habbo.com/habbo-imaging/avatarimage?figure=${userData.figureString}&direction=2&head_direction=2&gesture=sml&size=l&frame=1`}
                    alt={userData.name}
                    className="w-24 h-auto rounded-lg border-4 border-yellow-400 shadow-lg"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                      profileData.online ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    title={profileData.online ? 'Online' : 'Offline'}
                  />
                </div>
                
                <h4 className="text-lg font-semibold text-gray-800">{userData.name}</h4>
                <p className="text-gray-600 italic">"{profileData.motto}"</p>
                <p className="text-sm text-gray-500">
                  Membro desde: {new Date(profileData.memberSince).toLocaleDateString('pt-BR')}
                </p>

                {profileBadges.length > 0 && (
                  <div>
                    <p className="text-gray-700 font-medium mb-2">Meus Emblemas:</p>
                    <div className="flex justify-center space-x-2">
                      {profileBadges.map((badge) => (
                        <SmallBadge key={badge.code} badgeCode={badge.code} />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.location.href = `/profile/${userData.name}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Ver Perfil Completo
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}

            {!isLoggedIn && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Você não está conectado. Para acessar seu perfil, conecte sua conta Habbo primeiro.
                </p>
                <button
                  onClick={() => {
                    window.location.href = '/connect-habbo';
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Conectar Conta Habbo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
