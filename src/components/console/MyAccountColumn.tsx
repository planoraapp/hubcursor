
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
import { CountryFlag } from '@/components/shared/CountryFlag';

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
        <CardContent className="p-6 text-center space-y-4">
          <User className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white volter-font">
              🔐 Área Restrita
            </h3>
            <p className="text-white/80 text-sm">
              Faça login para acessar sua conta Habbo e ver seu perfil completo
            </p>
          </div>
          
          <div className="space-y-3 pt-4">
            <a 
              href="/login" 
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors volter-font"
            >
              🚪 Entrar na Conta
            </a>
            
            <div className="text-xs text-white/60 space-y-1">
              <p>✓ Login por senha ou motto</p>
              <p>✓ Acesso seguro via Hotel Habbo</p>
              <p>✓ Perfil completo com fotos e emblemas</p>
            </div>
          </div>
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
        {/* Profile Header with Full Avatar */}
        <div className="relative">
          <div className="flex items-start space-x-4">
            {/* Full Body Avatar with Flag */}
            <div className="relative flex-shrink-0">
              <img 
                src={`https://www.habbo.${(habboAccount as any)?.hotel === 'br' ? 'com.br' : ((habboAccount as any)?.hotel || 'com.br')}/habbo-imaging/avatarimage?figure=${myProfile?.figureString || completeProfile?.figureString}&size=l&direction=2&head_direction=3&action=std`}
                alt={`Avatar de ${habboAccount.habbo_name}`}
                className="w-24 h-32 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboAccount.habbo_name}&size=l&direction=2&head_direction=3&action=std`;
                }}
              />
              {/* Online Status */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#5A6573] rounded-full"></div>
              {/* Country Flag - Bottom Right Corner of Avatar */}
              <CountryFlag hotel={(habboAccount as any)?.hotel || 'br'} className="absolute bottom-1 right-1" />
            </div>
            
            {/* Profile Info - Right Side */}
            <div className="flex-1 min-w-0 pt-2">
              <h3 className="text-xl font-bold text-white truncate">
                {habboAccount.habbo_name}
              </h3>
              <p className="text-sm text-white/60 mt-1 break-words">
                {myProfile?.motto || completeProfile?.motto || 'Sem motto definido'}
              </p>
            </div>
          </div>
        </div>

        {/* Social Stats - Information Only */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-lg p-3 text-center border border-white/20">
            <div className="text-xl font-bold text-white">{photoCount}</div>
            <div className="text-xs text-white/60">Fotos</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center border border-white/20">
            <div className="text-xl font-bold text-white">{0}</div>
            <div className="text-xs text-white/60">Seguidores</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center border border-white/20">
            <div className="text-xl font-bold text-white">{0}</div>
            <div className="text-xs text-white/60">Seguindo</div>
          </div>
        </div>

        {/* Detailed Stats - Centralized Layout */}
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
