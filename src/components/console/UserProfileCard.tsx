
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MapPin, Trophy, Users, Home, Crown } from 'lucide-react';
import { getAvatarUrl, getBadgeUrl } from '@/services/habboApi';

interface UserData {
  uniqueId?: string;
  id: string;
  name: string;
  motto: string;
  online: boolean;
  memberSince: string;
  selectedBadges: any[];
  figureString: string;
}

interface UserProfileCardProps {
  user: UserData;
  loading?: boolean;
  theme?: 'basic' | 'habbo';
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, loading = false, theme = 'habbo' }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Carregando perfil...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Nenhum usuário selecionado</p>
            <p className="text-sm mt-2">Use a busca acima para encontrar um usuário</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const avatarUrl = user.figureString ? 
    `https://www.habbo.com/habbo-imaging/avatarimage?figure=${user.figureString}&direction=2&head_direction=2&gesture=sml&size=l` :
    getAvatarUrl(user.name);

  // Versão básica (fallback)
  if (theme === 'basic') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 border-2 border-gray-200">
              <AvatarImage src={avatarUrl} alt={user.name} />
              <AvatarFallback className="text-lg font-bold">
                {user.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {user.name}
                <div className={`w-3 h-3 rounded-full ${user.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </CardTitle>
              <p className="text-gray-600 italic mb-2">"{user.motto}"</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Desde {user.memberSince}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.online ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="badges">Emblemas</TabsTrigger>
              <TabsTrigger value="friends">Amigos</TabsTrigger>
              <TabsTrigger value="rooms">Quartos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Emblemas Destacados
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {user.selectedBadges?.slice(0, 6).map((badge, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <img 
                          src={getBadgeUrl(badge.code)} 
                          alt={badge.name}
                          className="w-8 h-8"
                          title={badge.name}
                        />
                      </div>
                    )) || <p className="text-gray-500 text-sm">Nenhum emblema destacado</p>}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="badges" className="mt-4">
              <div>
                <h3 className="font-semibold mb-3">Todos os Emblemas ({user.selectedBadges?.length || 0})</h3>
                <div className="grid grid-cols-6 gap-3 max-h-60 overflow-y-auto">
                  {user.selectedBadges?.map((badge, index) => (
                    <div key={index} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50">
                      <img 
                        src={getBadgeUrl(badge.code)} 
                        alt={badge.name}
                        className="w-8 h-8 mb-1"
                      />
                      <span className="text-xs text-center text-gray-600" title={badge.name}>
                        {badge.name?.length > 15 ? badge.name.substring(0, 15) + '...' : badge.name}
                      </span>
                    </div>
                  )) || <p className="text-gray-500 text-sm col-span-6">Nenhum emblema encontrado</p>}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="friends" className="mt-4">
              <div className="text-center text-gray-500 py-8">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Lista de amigos não disponível</p>
                <p className="text-sm">Esta funcionalidade requer acesso à API privada do Habbo</p>
              </div>
            </TabsContent>
            
            <TabsContent value="rooms" className="mt-4">
              <div className="text-center text-gray-500 py-8">
                <Home className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Quartos não disponíveis</p>
                <p className="text-sm">Esta funcionalidade requer acesso à API privada do Habbo</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Versão Habbo (design autêntico)
  return (
    <div className="habbo-profile-card bg-gradient-to-b from-blue-100 to-blue-200 border-4 border-blue-800 p-4 shadow-lg" style={{ imageRendering: 'pixelated' }}>
      {/* Cabeçalho com avatar grande */}
      <div className="habbo-header bg-gradient-to-r from-purple-400 to-purple-600 border-2 border-purple-800 p-3 mb-3 shadow-inner">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt={user.name}
            className="habbo-avatar w-16 h-16 border-2 border-white"
            style={{ imageRendering: 'pixelated' }}
          />
          <div>
            <h3 className="font-volter font-bold text-white text-lg text-shadow-lg">
              {user.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-3 h-3 rounded-full ${user.online ? 'bg-green-400' : 'bg-gray-400'} border border-white`}></div>
              <span className="text-white text-sm font-volter">
                {user.online ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-purple-100 text-sm font-volter italic mt-1">
              "{user.motto}"
            </p>
          </div>
        </div>
      </div>
      
      {/* Informações com estilo Habbo */}
      <div className="habbo-info bg-white border-2 border-gray-400 p-3 mb-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="habbo-stat bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-400 p-2">
            <div className="text-xs text-gray-600 font-volter">📅 Membro desde</div>
            <div className="font-volter font-bold text-sm">{user.memberSince}</div>
          </div>
          <div className="habbo-stat bg-gradient-to-r from-green-100 to-green-200 border border-green-400 p-2">
            <div className="text-xs text-gray-600 font-volter">🌐 Status</div>
            <div className="font-volter font-bold text-sm">{user.online ? 'Online' : 'Offline'}</div>
          </div>
        </div>
      </div>

      {/* Tabs estilo Habbo */}
      <div className="habbo-tabs">
        <div className="habbo-tab-list flex gap-1 mb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`habbo-tab-button px-3 py-1 text-sm font-volter font-bold border-2 ${
              activeTab === 'overview' 
                ? 'bg-gradient-to-r from-blue-400 to-blue-600 border-blue-800 text-white' 
                : 'bg-gradient-to-r from-gray-200 to-gray-300 border-gray-500 text-gray-700 hover:from-gray-300 hover:to-gray-400'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`habbo-tab-button px-3 py-1 text-sm font-volter font-bold border-2 ${
              activeTab === 'badges' 
                ? 'bg-gradient-to-r from-blue-400 to-blue-600 border-blue-800 text-white' 
                : 'bg-gradient-to-r from-gray-200 to-gray-300 border-gray-500 text-gray-700 hover:from-gray-300 hover:to-gray-400'
            }`}
          >
            Emblemas
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`habbo-tab-button px-3 py-1 text-sm font-volter font-bold border-2 ${
              activeTab === 'friends' 
                ? 'bg-gradient-to-r from-blue-400 to-blue-600 border-blue-800 text-white' 
                : 'bg-gradient-to-r from-gray-200 to-gray-300 border-gray-500 text-gray-700 hover:from-gray-300 hover:to-gray-400'
            }`}
          >
            Amigos
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`habbo-tab-button px-3 py-1 text-sm font-volter font-bold border-2 ${
              activeTab === 'rooms' 
                ? 'bg-gradient-to-r from-blue-400 to-blue-600 border-blue-800 text-white' 
                : 'bg-gradient-to-r from-gray-200 to-gray-300 border-gray-500 text-gray-700 hover:from-gray-300 hover:to-gray-400'
            }`}
          >
            Quartos
          </button>
        </div>
        
        {/* Conteúdo das tabs */}
        <div className="habbo-tab-content bg-white border-2 border-gray-400 p-3">
          {activeTab === 'overview' && (
            <div>
              <h3 className="font-volter font-bold mb-3 flex items-center gap-2">
                🏆 Emblemas Destacados
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.selectedBadges?.slice(0, 6).map((badge, index) => (
                  <div key={index} className="flex flex-col items-center p-1">
                    <img 
                      src={getBadgeUrl(badge.code)} 
                      alt={badge.name}
                      className="habbo-badge w-8 h-8"
                      style={{ imageRendering: 'pixelated' }}
                      title={badge.name}
                    />
                  </div>
                )) || <p className="text-gray-500 text-sm font-volter">Nenhum emblema destacado</p>}
              </div>
            </div>
          )}
          
          {activeTab === 'badges' && (
            <div>
              <h3 className="font-volter font-bold mb-3">Todos os Emblemas ({user.selectedBadges?.length || 0})</h3>
              <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto">
                {user.selectedBadges?.map((badge, index) => (
                  <div key={index} className="flex flex-col items-center p-1 border border-gray-300 hover:bg-gray-50">
                    <img 
                      src={getBadgeUrl(badge.code)} 
                      alt={badge.name}
                      className="habbo-badge w-8 h-8 mb-1"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <span className="text-xs text-center text-gray-600 font-volter" title={badge.name}>
                      {badge.name?.length > 12 ? badge.name.substring(0, 12) + '...' : badge.name}
                    </span>
                  </div>
                )) || <p className="text-gray-500 text-sm col-span-6 font-volter">Nenhum emblema encontrado</p>}
              </div>
            </div>
          )}
          
          {activeTab === 'friends' && (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">👥</div>
              <p className="font-volter">Lista de amigos não disponível</p>
              <p className="text-sm font-volter">Esta funcionalidade requer acesso à API privada do Habbo</p>
            </div>
          )}
          
          {activeTab === 'rooms' && (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">🏠</div>
              <p className="font-volter">Quartos não disponíveis</p>
              <p className="text-sm font-volter">Esta funcionalidade requer acesso à API privada do Habbo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
