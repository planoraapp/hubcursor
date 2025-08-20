
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Camera, RefreshCw, Loader2, AlertCircle, Trophy, Users, Home, Crown, Star, Activity, Heart, UserPlus } from 'lucide-react';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { useOptimizedPhotos } from '@/hooks/useOptimizedPhotos';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { PhotoGrid } from './PhotoGrid';
import { PhotoLikesModal } from '@/components/shared/PhotoLikesModal';
import { PhotoCommentsModal } from '@/components/shared/PhotoCommentsModal';
import { BadgesModal } from '@/components/profile/modals/BadgesModal';
import { FriendsModal } from '@/components/profile/modals/FriendsModal';
import { GroupsModal } from '@/components/profile/modals/GroupsModal';
import { RoomsModal } from '@/components/profile/modals/RoomsModal';

export const MyAccountColumn: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'badges' | 'friends' | 'groups' | 'rooms' | null>(null);
  const { isLoggedIn, habboAccount, myProfile, isLoading } = useMyConsoleProfile();
  const { 
    photos, 
    photoCount, 
    isLoading: photosLoading, 
    hasError: photosError,
    errorMessage,
    refreshPhotos,
    canRetry,
    retryLoadPhotos
  } = useOptimizedPhotos(
    habboAccount?.habbo_name,
    (habboAccount as any)?.hotel || 'br'
  );

  const { data: completeProfile } = useCompleteProfile(
    habboAccount?.habbo_name || '',
    (habboAccount as any)?.hotel === 'br' ? 'com.br' : (habboAccount as any)?.hotel || 'com.br'
  );

  if (!isLoggedIn || !habboAccount) {
    return (
      <Card className="bg-[#5A6573] text-white border-0 shadow-none h-full">
        <CardContent className="p-6 text-center">
          <User className="w-12 h-12 text-white/50 mx-auto mb-4" />
          <p className="text-white/80">Faça login para ver seu perfil</p>
        </CardContent>
      </Card>
    );
  }

  const handleRefreshPhotos = async () => {
    console.log('%c[🔄 MY ACCOUNT] Manual photo refresh initiated', 'background: #FF9800; color: white; padding: 4px 8px; border-radius: 4px;');
    try {
      await refreshPhotos();
      console.log('[✅ MY ACCOUNT] Photo refresh completed');
    } catch (error) {
      console.error('[❌ MY ACCOUNT] Photo refresh failed:', error);
    }
  };

  // Mapear fotos para o formato do PhotoGrid
  const photoGridData = photos.map(photo => ({
    id: photo.id,
    imageUrl: photo.imageUrl,
    date: photo.date || new Date().toLocaleDateString('pt-BR'),
    likes: photo.likes || 0
  }));

  return (
    <Card className="bg-[#5A6573] text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Minha Conta</span>
          <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
            Online
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-4">
        {/* Avatar and Basic Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={`https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${habboAccount.habbo_name}&direction=2&head_direction=3&size=m&action=std`}
              alt={`Avatar de ${habboAccount.habbo_name}`}
              className="w-12 h-12 rounded-full bg-white/10"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboAccount.habbo_name}&size=m&direction=2&head_direction=3&action=std`;
              }}
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#5A6573] rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white truncate">{habboAccount.habbo_name}</h3>
            <p className="text-white/60 text-sm">
              {myProfile?.motto || completeProfile?.motto || 'Sem motto definido'}
            </p>
          </div>
        </div>

        {/* Social Stats - Fotos, Seguidores, Seguindo */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <Button
            variant="ghost"
            className="flex flex-col p-2 h-auto text-white hover:bg-white/10"
          >
            <div className="text-lg font-bold">{photoCount}</div>
            <div className="text-xs text-white/60">Fotos</div>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col p-2 h-auto text-white hover:bg-white/10"
          >
            <div className="text-lg font-bold">0</div>
            <div className="text-xs text-white/60">Seguidores</div>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col p-2 h-auto text-white hover:bg-white/10"
          >
            <div className="text-lg font-bold">0</div>
            <div className="text-xs text-white/60">Seguindo</div>
          </Button>
        </div>

        {/* Follow Button - Desabilitado para perfil próprio */}
        <Button
          disabled
          className="w-full bg-white/10 hover:bg-white/20 text-white/50 cursor-not-allowed"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Seu perfil
        </Button>

        {/* Complete Stats Grid - DADOS CORRETOS */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="ghost"
            onClick={() => setActiveModal('badges')}
            className="bg-white/10 hover:bg-white/20 rounded-lg p-3 text-center h-auto flex flex-col"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-lg font-bold text-white">{completeProfile?.stats.badgesCount || 0}</div>
            <div className="text-xs text-white/60">Emblemas</div>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setActiveModal('rooms')}
            className="bg-white/10 hover:bg-white/20 rounded-lg p-3 text-center h-auto flex flex-col"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Home className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-lg font-bold text-white">{completeProfile?.stats.roomsCount || 0}</div>
            <div className="text-xs text-white/60">Quartos</div>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setActiveModal('friends')}
            className="bg-white/10 hover:bg-white/20 rounded-lg p-3 text-center h-auto flex flex-col"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-lg font-bold text-white">{completeProfile?.stats.friendsCount || 0}</div>
            <div className="text-xs text-white/60">Amigos</div>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setActiveModal('groups')}
            className="bg-white/10 hover:bg-white/20 rounded-lg p-3 text-center h-auto flex flex-col"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Crown className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-white">{completeProfile?.stats.groupsCount || 0}</div>
            <div className="text-xs text-white/60">Grupos</div>
          </Button>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefreshPhotos}
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
              Suas Fotos ({photos.length})
            </h4>
            <PhotoGrid photos={photoGridData} />
          </div>
        )}

        {/* Loading/Error States */}
        {photosLoading && (
          <div className="text-xs text-white/60 flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Carregando fotos via API oficial...
          </div>
        )}
        
        {photosError && (
          <div className="space-y-2">
            <div className="text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              {errorMessage}
            </div>
            {canRetry && (
              <Button
                size="sm"
                variant="ghost"
                onClick={retryLoadPhotos}
                className="h-6 px-2 text-xs text-white/80 hover:text-white hover:bg-white/10"
              >
                Tentar novamente
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {/* Modals */}
      <BadgesModal 
        isOpen={activeModal === 'badges'} 
        onClose={() => setActiveModal(null)}
        badges={completeProfile?.data.badges || []}
        userName={habboAccount?.habbo_name || ''}
      />
      
      <FriendsModal 
        isOpen={activeModal === 'friends'} 
        onClose={() => setActiveModal(null)}
        friends={completeProfile?.data.friends || []}
        userName={habboAccount?.habbo_name || ''}
      />
      
      <GroupsModal 
        isOpen={activeModal === 'groups'} 
        onClose={() => setActiveModal(null)}
        groups={completeProfile?.data.groups || []}
        userName={habboAccount?.habbo_name || ''}
      />
      
      <RoomsModal 
        isOpen={activeModal === 'rooms'} 
        onClose={() => setActiveModal(null)}
        rooms={completeProfile?.data.rooms || []}
        userName={habboAccount?.habbo_name || ''}
      />
    </Card>
  );
};
