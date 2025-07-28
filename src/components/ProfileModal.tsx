
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoginAttempt: boolean;
}

export const ProfileModal = ({ isOpen, onClose, isLoginAttempt }: ProfileModalProps) => {
  const { isLoggedIn, userData, login, logout } = useAuth();
  const { toast } = useToast();
  const [habboNameInput, setHabboNameInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
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
      const success = await login(habboNameInput);
      if (success) {
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
        onClose();
      } else {
        toast({
          title: "Erro",
          description: "Usuário não encontrado. Verifique o nome.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer login. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Sucesso",
      description: "Logout realizado com sucesso!"
    });
    onClose();
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
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Login Habbo</h3>
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <input
                type="text"
                value={habboNameInput}
                onChange={(e) => setHabboNameInput(e.target.value)}
                placeholder="Nome do seu Habbo"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                disabled={isProcessing}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {isProcessing ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Meu Perfil</h3>
            {userData && (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <img
                    src={`https://www.habbo.com/habbo-imaging/avatarimage?figure=${userData.figureString}&direction=2&head_direction=2&gesture=sml&size=l&frame=1`}
                    alt={userData.name}
                    className="w-24 h-auto rounded-lg border-4 border-yellow-400 shadow-lg"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                      userData.online ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    title={userData.online ? 'Online' : 'Offline'}
                  />
                </div>
                <h4 className="text-lg font-semibold text-gray-800">{userData.name}</h4>
                <p className="text-gray-600 italic">"{userData.motto}"</p>
                
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
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
