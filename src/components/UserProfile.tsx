
import { User, LogIn, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface UserProfileProps {
  collapsed?: boolean;
}

export const UserProfile = ({ collapsed = false }: UserProfileProps) => {
  const { isLoggedIn, userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (isLoggedIn && userData) {
      navigate(`/profile/${userData.name}`);
    } else {
      navigate('/connect-habbo');
    }
  };

  if (collapsed) {
    return (
      <div className="p-2 flex justify-center">
        <button
          onClick={handleProfileClick}
          className="w-12 h-12 rounded-lg bg-white/80 hover:bg-white hover:shadow-sm transition-all duration-200 flex items-center justify-center"
          title={isLoggedIn ? 'Meu Perfil' : 'Entrar'}
        >
          {isLoggedIn ? <User size={20} /> : <LogIn size={20} />}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg mb-4 shadow-sm">
      {isLoggedIn && userData ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <img 
              src={`https://www.habbo.com/habbo-imaging/avatarimage?figure=${userData.figureString}&direction=2&head_direction=2&gesture=sml&size=s&frame=1`}
              alt={userData.name}
              className="w-10 h-10 rounded border-2 border-gray-300"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm">{userData.name}</h3>
              <p className="text-xs text-gray-600 italic">"{userData.motto}"</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleProfileClick}
              className="flex-1 bg-blue-500 text-white text-xs py-2 px-3 rounded hover:bg-blue-600 transition-colors"
            >
              Ver Perfil
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white text-xs py-2 px-3 rounded hover:bg-red-600 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-gray-300 flex items-center justify-center">
              <User size={20} className="text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm">Visitante</h3>
              <p className="text-xs text-gray-600">Não conectado</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/connect-habbo')}
            className="w-full bg-green-500 text-white text-xs py-2 px-3 rounded hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <LogIn size={16} />
            <span>Entrar com Habbo</span>
          </button>
        </div>
      )}
    </div>
  );
};
