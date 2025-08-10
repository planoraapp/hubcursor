import { useState } from 'react';
import { Search, User, Shield, AlertCircle, Users, Home, Award } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { 
  getUserByName, 
  getUserBadges, 
  getUserFriends, 
  getUserGroups, 
  getUserRooms,
  getAvatarUrl,
  getBadgeUrl,
  type HabboUser,
  type HabboBadge,
  type HabboGroup,
  type HabboRoom,
  type HabboFriend
} from '../services/habboApi';

export const ProfileChecker = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<HabboUser | null>(null);
  const [userBadges, setUserBadges] = useState<HabboBadge[] | null>(null);
  const [userFriends, setUserFriends] = useState<HabboFriend[] | null>(null);
  const [userGroups, setUserGroups] = useState<HabboGroup[] | null>(null);
  const [userRooms, setUserRooms] = useState<HabboRoom[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setUserProfile(null);
    setUserBadges(null);
    setUserFriends(null);
    setUserGroups(null);
    setUserRooms(null);

    try {
      console.log('Buscando usuário:', username);
      
      // Buscar usuário por nome
      const user = await getUserByName(username.trim());
      
      if (!user) {
        setError('Usuário não encontrado. Verifique o nome e tente novamente.');
        setLoading(false);
        return;
      }

      if (!user.profileVisible) {
        setError('Este usuário configurou seu perfil como privado. De acordo com a política de privacidade do Habbo, nenhuma informação detalhada pode ser exibida.');
        setLoading(false);
        return;
      }

      setUserProfile(user);

      // Buscar dados adicionais do usuário
      const [badges, friends, groups, rooms] = await Promise.all([
        getUserBadges(user.uniqueId),
        getUserFriends(user.uniqueId),
        getUserGroups(user.uniqueId),
        getUserRooms(user.uniqueId)
      ]);

      setUserBadges(badges);
      setUserFriends(friends);
      setUserGroups(groups);
      setUserRooms(rooms);

      console.log('Dados do usuário carregados:', { user, badges, friends, groups, rooms });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      setError('Erro ao carregar perfil. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (online: boolean) => {
    return online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (user: HabboUser) => {
    if (user.online) return 'Online';
    const lastAccess = new Date(user.lastAccessTime);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `Offline - ${diffHours}h atrás`;
    }
    return `Offline - ${formatDate(user.lastAccessTime)}`;
  };

  return (
    <div className="space-y-8">
      <PanelCard title="Verificador de Perfil">
        <p className="text-lg text-gray-600 mb-4">
          Busque informações públicas sobre usuários do Habbo Hotel.
        </p>
        
        <div className="flex space-x-4">
          <div className="relative flex-1">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Digite o nome do usuário..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !username.trim()}
            className="bg-[#008800] text-white px-6 py-3 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Search size={18} />
            <span>{loading ? 'Buscando...' : 'Buscar'}</span>
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-700">
            <Shield size={16} />
            <span className="text-sm font-medium volter-font">Privacidade Garantida</span>
          </div>
          <p className="text-sm text-blue-600 mt-1 volter-font">
            Respeitamos a privacidade dos usuários. Apenas informações públicas são exibidas.
          </p>
        </div>
      </PanelCard>

      {error && (
        <PanelCard>
          <div className="border-l-4 border-red-400 p-4 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle size={20} />
              <h3 className="font-bold">Erro</h3>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        </PanelCard>
      )}

      {userProfile && (
        <div className="space-y-6">
          <PanelCard title="Perfil do Usuário">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={getAvatarUrl(userProfile.figureString)}
                alt={`Avatar de ${userProfile.name}`}
                className="w-20 h-20 rounded-lg border-2 border-gray-300"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-2xl text-gray-800">{userProfile.name}</h3>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(userProfile.online)}`}>
                    {getStatusText(userProfile)}
                  </span>
                </div>
                <p className="text-gray-600 italic mb-2">"{userProfile.motto}"</p>
                <p className="text-sm text-gray-500">
                  Membro desde: {formatDate(userProfile.memberSince)}
                </p>
              </div>
            </div>

            {userProfile.selectedBadges && userProfile.selectedBadges.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-700 mb-3">Emblemas Selecionados:</h4>
                <div className="grid grid-cols-5 gap-3">
                  {userProfile.selectedBadges.map((badge, index) => (
                    <div key={index} className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <img
                        src={getBadgeUrl(badge.code)}
                        alt={badge.name}
                        className="w-8 h-8 mb-1"
                        title={badge.description}
                      />
                      <span className="text-xs font-medium text-gray-700 text-center">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </PanelCard>

          {userBadges && userBadges.length > 0 && (
            <PanelCard title="Todos os Emblemas">
              <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {userBadges.map((badge, index) => (
                  <div key={index} className="flex flex-col items-center p-1">
                    <img
                      src={getBadgeUrl(badge.code)}
                      alt={badge.name}
                      className="w-6 h-6"
                      title={badge.description}
                    />
                  </div>
                ))}
              </div>
            </PanelCard>
          )}

          {userFriends && userFriends.length > 0 && (
            <PanelCard title="Amigos">
              <div className="flex items-center space-x-2 mb-3">
                <Users size={20} className="text-blue-500" />
                <span className="font-medium text-gray-700">{userFriends.length} amigos</span>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {userFriends.slice(0, 24).map((friend, index) => (
                  <div key={index} className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                    <img
                      src={getAvatarUrl(friend.figureString, 's')}
                      alt={`Avatar de ${friend.name}`}
                      className="w-8 h-8 rounded mb-1"
                    />
                    <span className="text-xs font-medium text-gray-700 text-center truncate w-full">{friend.name}</span>
                  </div>
                ))}
              </div>
              {userFriends.length > 24 && (
                <p className="text-sm text-gray-500 mt-2">
                  E mais {userFriends.length - 24} amigos...
                </p>
              )}
            </PanelCard>
          )}

          {userGroups && userGroups.length > 0 && (
            <PanelCard title="Grupos">
              <div className="space-y-3">
                {userGroups.map((group, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={getBadgeUrl(group.badgeCode)}
                      alt={`Emblema do ${group.name}`}
                      className="w-8 h-8"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{group.name}</h4>
                      <p className="text-sm text-gray-600">{group.memberCount || 0} membros</p>
                    </div>
                  </div>
                ))}
              </div>
            </PanelCard>
          )}

          {userRooms && userRooms.length > 0 && (
            <PanelCard title="Quartos">
              <div className="flex items-center space-x-2 mb-3">
                <Home size={20} className="text-green-500" />
                <span className="font-medium text-gray-700">{userRooms.length} quartos</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userRooms.map((room, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-1">{room.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{room.userCount} usuários</span>
                      <span className="text-yellow-600">⭐ {room.rating || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </PanelCard>
          )}
        </div>
      )}
    </div>
  );
};
