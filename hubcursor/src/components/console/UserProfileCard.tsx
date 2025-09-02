
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
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, loading = false }) => {
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
};
