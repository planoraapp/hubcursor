import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Trophy, Users, Home, Crown, UserPlus, UserCheck, Camera, RefreshCw, ExternalLink } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { useFollowProfile } from '@/hooks/useFollowProfile';
import { useOptimizedPhotos } from '@/hooks/useOptimizedPhotos';
import { PhotoGrid } from '@/components/console/PhotoGrid';
import { PhotoLikesModal } from '@/components/shared/PhotoLikesModal';
import { PhotoCommentsModal } from '@/components/shared/PhotoCommentsModal';
import { BadgesModal } from '@/components/profile/modals/BadgesModal';
import { FriendsModal } from '@/components/profile/modals/FriendsModal';
import { GroupsModal } from '@/components/profile/modals/GroupsModal';
import { RoomsModal } from '@/components/profile/modals/RoomsModal';
import { CountryFlag } from '@/components/shared/CountryFlag';

interface UserProfileInColumnProps {
  username: string;
  onBack: () => void;
}

export const UserProfileInColumn: React.FC<UserProfileInColumnProps> = ({ username, onBack }) => {
  const [activeModal, setActiveModal] = useState<'badges' | 'friends' | 'groups' | 'rooms' | null>(null);
  
  const { habboUser, avatarUrl, isLoading } = useUserProfile(username);
  
  // Get complete profile data for stats and modals
  const { data: completeProfile, isLoading: profileLoading } = useCompleteProfile(
    username,
    habboUser?.hotel === 'br' ? 'com.br' : (habboUser?.hotel || 'com.br')
  );

  // Get photos
  const { 
    photos, 
    photoCount, 
    isLoading: photosLoading, 
    refreshPhotos
  } = useOptimizedPhotos(username, habboUser?.hotel || 'br');

  // Follow system
  const {
    isFollowing,
    followersCount,
    followingCount,
    handleToggleFollow,
    isToggling
  } = useFollowProfile({
    targetHabboId: habboUser?.habbo_id,
    targetHabboName: habboUser?.habbo_name || username
  });

  if (isLoading || profileLoading) {
    return (
      <Card className="bg-[#4A5568] text-white border-0 shadow-none h-full flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white/60 mx-auto mb-2" />
            <p className="text-white/60 text-sm">Carregando perfil...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!habboUser) {
    return (
      <Card className="bg-[#4A5568] text-white border-0 shadow-none h-full flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/80 mb-4">Usuário não encontrado</p>
            <Button 
              onClick={onBack}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Map photos for PhotoGrid
  const photoGridData = photos.map(photo => ({
    id: photo.id,
    imageUrl: photo.imageUrl,
    date: photo.date || new Date().toLocaleDateString('pt-BR'),
    likes: photo.likes || 0
  }));

  return (
    <Card className="bg-[#4A5568] text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
      {/* Header with back button */}
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <Button 
            onClick={onBack}
            size="sm"
            variant="ghost" 
            className="text-white/80 hover:text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="text-lg">{habboUser?.habbo_name || username}</CardTitle>
          <Badge 
            variant={completeProfile?.online ? "default" : "secondary"}
            className={`ml-auto text-xs ${completeProfile?.online 
              ? "bg-green-500/20 text-green-300 border-green-500/30" 
              : "bg-white/10 text-white/60 border-white/20"
            }`}
          >
            {completeProfile?.online ? "Online" : "Offline"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-4" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent'}}>
        {/* Avatar and Basic Info with Full Body Avatar */}
        <div className="flex items-start space-x-4">
          {/* Full Body Avatar with Flag */}
          <div className="relative flex-shrink-0">
            <img
              src={`https://www.habbo.${habboUser?.hotel === 'br' ? 'com.br' : (habboUser?.hotel || 'com.br')}/habbo-imaging/avatarimage?figure=${completeProfile?.figureString}&size=l&direction=2&head_direction=3&action=std`}
              alt={`Avatar de ${habboUser?.habbo_name || username}`}
              className="w-24 h-32 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${username}&size=l&direction=2&head_direction=3&action=std`;
              }}
            />
            {/* Online Status */}
            {completeProfile?.online && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#4A5568] rounded-full"></div>
            )}
            {/* Country Flag - Bottom Right Corner of Avatar */}
            <div className="absolute bottom-1 right-1">
              <CountryFlag hotel={habboUser?.hotel || 'br'} />
            </div>
          </div>
          
          {/* Profile Info - Right Side */}
          <div className="flex-1 min-w-0 pt-2">
            <h3 className="text-xl font-bold text-white truncate">{habboUser?.habbo_name || username}</h3>
            <p className="text-sm text-white/60 mt-1 break-words">
              {completeProfile?.motto || habboUser?.motto || 'Sem motto definido'}
            </p>
          </div>
        </div>

        {/* Social Stats - Information Only */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-lg p-3 text-center border border-white/20">
            <div className="text-xl font-bold text-white">{photoCount}</div>
            <div className="text-xs text-white/60">Fotos</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center border border-white/20">
            <div className="text-xl font-bold text-white">{followersCount}</div>
            <div className="text-xs text-white/60">Seguidores</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center border border-white/20">
            <div className="text-xl font-bold text-white">{followingCount}</div>
            <div className="text-xs text-white/60">Seguindo</div>
          </div>
        </div>

        {/* Follow Button */}
        <Button
          onClick={handleToggleFollow}
          disabled={isToggling}
          className={`w-full ${
            isFollowing 
              ? 'bg-white/20 hover:bg-white/30 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isToggling ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : isFollowing ? (
            <UserCheck className="w-4 h-4 mr-2" />
          ) : (
            <UserPlus className="w-4 h-4 mr-2" />
          )}
          {isToggling ? 'Carregando...' : isFollowing ? 'Seguindo' : 'Seguir'}
        </Button>

        {/* Action Buttons - Centralized Layout */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveModal('badges')}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20 hover:border-white/30"
          >
            <Trophy className="h-5 w-5 text-yellow-400" />
            <div className="text-center">
              <div className="text-sm font-medium text-white">{completeProfile?.data?.badges?.length || 0}</div>
              <div className="text-xs text-white/60">Emblemas</div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveModal('rooms')}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20 hover:border-white/30"
          >
            <Home className="h-5 w-5 text-green-400" />
            <div className="text-center">
              <div className="text-sm font-medium text-white">{completeProfile?.data?.rooms?.length || 0}</div>
              <div className="text-xs text-white/60">Quartos</div>
            </div>
          </button>

          <button
            onClick={() => setActiveModal('friends')}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20 hover:border-white/30"
          >
            <Users className="h-5 w-5 text-pink-400" />
            <div className="text-center">
              <div className="text-sm font-medium text-white">{completeProfile?.data?.friends?.length || 0}</div>
              <div className="text-xs text-white/60">Amigos</div>
            </div>
          </button>

          <button
            onClick={() => setActiveModal('groups')}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20 hover:border-white/30"
          >
            <Crown className="h-5 w-5 text-purple-400" />
            <div className="text-center">
              <div className="text-sm font-medium text-white">{completeProfile?.data?.groups?.length || 0}</div>
              <div className="text-xs text-white/60">Grupos</div>
            </div>
          </button>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={refreshPhotos}
            disabled={photosLoading}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            {photosLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Atualizar Fotos
          </Button>
        </div>

        {/* Photos Grid */}
        {photos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-3">
              Fotos ({photos.length})
            </h4>
            <PhotoGrid photos={photoGridData} />
          </div>
        )}

        {/* Loading/No Photos States */}
        {photosLoading && (
          <div className="text-xs text-white/60 flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Carregando fotos...
          </div>
        )}
        
        {photos.length === 0 && !photosLoading && (
          <div className="text-center text-white/60 py-8">
            <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma foto encontrada</p>
          </div>
        )}
      </CardContent>

      {/* Modals */}
      <BadgesModal 
        isOpen={activeModal === 'badges'} 
        onClose={() => setActiveModal(null)}
        badges={completeProfile?.data.badges || []}
        userName={habboUser?.habbo_name || username}
      />
      
      <FriendsModal 
        isOpen={activeModal === 'friends'} 
        onClose={() => setActiveModal(null)}
        friends={completeProfile?.data.friends || []}
        userName={habboUser?.habbo_name || username}
      />
      
      <GroupsModal 
        isOpen={activeModal === 'groups'} 
        onClose={() => setActiveModal(null)}
        groups={completeProfile?.data.groups || []}
        userName={habboUser?.habbo_name || username}
      />
      
      <RoomsModal 
        isOpen={activeModal === 'rooms'} 
        onClose={() => setActiveModal(null)}
        rooms={completeProfile?.data.rooms || []}
        userName={habboUser?.habbo_name || username}
      />
    </Card>
  );
};