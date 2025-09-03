import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Loader2, Users, Home, Award, Camera, Activity } from 'lucide-react';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { useOptimizedPhotos } from '@/hooks/useOptimizedPhotos';
import { PhotoGrid } from './PhotoGrid';
import { BadgesModal } from '@/components/profile/modals/BadgesModal';
import { FriendsModal } from '@/components/profile/modals/FriendsModal';
import { GroupsModal } from '@/components/profile/modals/GroupsModal';
import { RoomsModal } from '@/components/profile/modals/RoomsModal';
import { ActivityModal } from '@/components/profile/modals/ActivityModal';

interface UnifiedProfileViewProps {
  habboName: string;
  hotel?: string;
  onBack?: () => void;
  onClose?: () => void;
}

type ModalType = 'badges' | 'friends' | 'groups' | 'rooms' | 'activity' | null;

export const UnifiedProfileView: React.FC<UnifiedProfileViewProps> = ({
  habboName,
  hotel = 'com.br',
  onBack,
  onClose
}) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError 
  } = useCompleteProfile(habboName, hotel);

  const { 
    photos, 
    isLoading: photosLoading, 
    loadPhotos 
  } = useOptimizedPhotos(habboName, hotel === 'com.br' ? 'br' : hotel);

  const handleRefreshPhotos = async () => {
    try {
      await loadPhotos(true);
      console.log('[✅ UNIFIED PROFILE] Photo refresh completed for:', habboName);
    } catch (error) {
      console.error('[❌ UNIFIED PROFILE] Photo refresh failed for:', habboName, error);
    }
  };

  const getAvatarUrl = (figureString?: string, name?: string) => {
    if (figureString) {
      return `https://www.habbo.${hotel}/habbo-imaging/avatarimage?figure=${figureString}&size=l&direction=2&head_direction=3&action=std`;
    }
    return `https://www.habbo.${hotel}/habbo-imaging/avatarimage?user=${name}&size=l&direction=2&head_direction=3&action=std`;
  };

  if (profileLoading) {
    return (
      <Card className="h-full flex flex-col bg-[#5A6573] text-white border-0 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Carregando...</CardTitle>
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-white/60" />
            <p className="text-sm text-white/60">Carregando perfil...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (profileError || !profile) {
    return (
      <Card className="h-full flex flex-col bg-[#5A6573] text-white border-0 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Erro</CardTitle>
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-white/60">Erro ao carregar perfil</p>
            <p className="text-xs text-white/40 mt-1">{profileError?.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Emblemas',
      value: profile.stats.badgesCount,
      icon: Award,
      modal: 'badges' as ModalType
    },
    {
      label: 'Quartos',
      value: profile.stats.roomsCount,
      icon: Home,
      modal: 'rooms' as ModalType
    },
    {
      label: 'Amigos',
      value: profile.stats.friendsCount,
      icon: Users,
      modal: 'friends' as ModalType
    },
    {
      label: 'Grupos',
      value: profile.stats.groupsCount,
      icon: Users,
      modal: 'groups' as ModalType
    }
  ];

  return (
    <>
      <Card className="h-full flex flex-col bg-[#5A6573] text-white border-0 shadow-none overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Perfil do Habbo</CardTitle>
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                ✕
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
          {/* Avatar and Basic Info */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 bg-white/10">
              <img
                src={getAvatarUrl(profile.figureString, profile.name)}
                alt={`Avatar de ${profile.name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getAvatarUrl(undefined, profile.name);
                }}
              />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">{profile.name}</h3>
              <p className="text-white/70 italic text-sm mt-1">"{profile.motto || 'Sem motto'}"</p>
              
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge className={`${profile.online ? 'bg-green-500' : 'bg-red-500'} text-white text-xs`}>
                  {profile.online ? 'Online' : 'Offline'}
                </Badge>
                <Badge variant="outline" className="text-white/80 border-white/30 text-xs">
                  {hotel.replace('com.', '').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Social Stats */}
          <div className="grid grid-cols-3 gap-3 text-center bg-white/5 p-3 rounded-lg border border-white/10">
            <div>
              <div className="text-lg font-bold text-white">{photos.length}</div>
              <div className="text-xs text-white/60">Fotos</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">0</div>
              <div className="text-xs text-white/60">Seguidores</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">0</div>
              <div className="text-xs text-white/60">Seguindo</div>
            </div>
          </div>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                onClick={() => setActiveModal(stat.modal)}
              >
                <CardContent className="p-3 text-center">
                  <stat.icon className="w-5 h-5 mx-auto mb-2 text-white/80" />
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Photos Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Fotos ({photos.length})
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefreshPhotos}
                disabled={photosLoading}
                className="text-white/80 hover:text-white hover:bg-white/10 border-white/30"
              >
                {photosLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <PhotoGrid 
              photos={photos.map(photo => ({
                id: photo.id,
                imageUrl: photo.imageUrl,
                date: photo.timestamp ? new Date(photo.timestamp).toISOString() : new Date().toISOString(),
                likes: photo.likes || 0
              }))} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {activeModal === 'badges' && (
        <BadgesModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          badges={profile.data.badges}
          userName={profile.name}
        />
      )}

      {activeModal === 'friends' && (
        <FriendsModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          friends={profile.data.friends}
          userName={profile.name}
        />
      )}

      {activeModal === 'groups' && (
        <GroupsModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          groups={profile.data.groups}
          userName={profile.name}
        />
      )}

      {activeModal === 'rooms' && (
        <RoomsModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          rooms={profile.data.rooms}
          userName={profile.name}
        />
      )}

      {activeModal === 'activity' && (
        <ActivityModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          activityCount={0}
          userName={profile.name}
        />
      )}
    </>
  );
};