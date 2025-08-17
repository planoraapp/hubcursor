
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Users, Home, Crown, Camera } from 'lucide-react';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { BadgesModal } from './modals/BadgesModal';
import { FriendsModal } from './modals/FriendsModal';
import { RoomsModal } from './modals/RoomsModal';
import { GroupsModal } from './modals/GroupsModal';

export const MyAccountColumn: React.FC = () => {
  const { isLoggedIn, habboAccount, myProfile, photos, isLoading } = useMyConsoleProfile();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-gray-400">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!isLoggedIn || !habboAccount) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-gray-400">Faça login para ver seu perfil</p>
        </CardContent>
      </Card>
    );
  }

  const stats = {
    badgesCount: myProfile?.selectedBadges?.length || 0,
    photosCount: photos.length,
    friendsCount: myProfile?.friendsCount || 0,
    roomsCount: myProfile?.roomsCount || 0,
    groupsCount: myProfile?.groupsCount || 0,
  };

  return (
    <>
      <Card className="bg-gray-800/50 border-gray-700 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            Minha Conta
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Profile Info */}
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-gray-600">
              <AvatarImage 
                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${myProfile?.figureString}&size=l&direction=2&head_direction=3&action=std`}
                style={{ imageRendering: 'pixelated' }}
              />
              <AvatarFallback className="bg-gray-600 text-white">
                {habboAccount.habbo_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate">{habboAccount.habbo_name}</h3>
              <p className="text-xs text-gray-400 truncate italic">
                "{myProfile?.motto || 'Sem motto'}"
              </p>
              <Badge className={myProfile?.online ? 'bg-green-600' : 'bg-red-600'}>
                {myProfile?.online ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>

          {/* Stats Grid - Updated with click handlers */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              className="flex flex-col items-center p-3 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-white h-auto"
              onClick={() => setActiveModal('badges')}
            >
              <Trophy className="w-5 h-5 text-yellow-400 mb-1" />
              <span className="text-lg font-bold">{stats.badgesCount}</span>
              <span className="text-xs text-gray-400">Emblemas</span>
            </Button>
            
            <Button
              variant="ghost"
              className="flex flex-col items-center p-3 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-white h-auto"
              onClick={() => setActiveModal('friends')}
            >
              <Users className="w-5 h-5 text-blue-400 mb-1" />
              <span className="text-lg font-bold">{stats.friendsCount}</span>
              <span className="text-xs text-gray-400">Amigos</span>
            </Button>
            
            <Button
              variant="ghost"
              className="flex flex-col items-center p-3 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-white h-auto"
              onClick={() => setActiveModal('rooms')}
            >
              <Home className="w-5 h-5 text-purple-400 mb-1" />
              <span className="text-lg font-bold">{stats.roomsCount}</span>
              <span className="text-xs text-gray-400">Quartos</span>
            </Button>
            
            <Button
              variant="ghost"
              className="flex flex-col items-center p-3 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-white h-auto"
              onClick={() => setActiveModal('groups')}
            >
              <Crown className="w-5 h-5 text-orange-400 mb-1" />
              <span className="text-lg font-bold">{stats.groupsCount}</span>
              <span className="text-xs text-gray-400">Grupos</span>
            </Button>
          </div>

          {/* Recent Photos */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-white">
              Fotos Recentes
            </h4>
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(0, 3).map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt="Foto do Habbo"
                    className="w-full aspect-square object-cover rounded border border-gray-600"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Camera className="w-6 h-6 mx-auto mb-1 text-gray-500" />
                <p className="text-xs text-gray-400">Nenhuma foto encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <BadgesModal
        isOpen={activeModal === 'badges'}
        onClose={() => setActiveModal(null)}
        badges={myProfile?.selectedBadges || []}
        userName={habboAccount?.habbo_name || ''}
      />
      
      <FriendsModal
        isOpen={activeModal === 'friends'}
        onClose={() => setActiveModal(null)}
        friends={[]} // TODO: Add friends data when available
        userName={habboAccount?.habbo_name || ''}
      />
      
      <RoomsModal
        isOpen={activeModal === 'rooms'}
        onClose={() => setActiveModal(null)}
        rooms={[]} // TODO: Add rooms data when available
        userName={habboAccount?.habbo_name || ''}
      />
      
      <GroupsModal
        isOpen={activeModal === 'groups'}
        onClose={() => setActiveModal(null)}
        groups={[]} // TODO: Add groups data when available
        userName={habboAccount?.habbo_name || ''}
      />
    </>
  );
};
