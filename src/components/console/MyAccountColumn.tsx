
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Camera, RefreshCw, Loader2, AlertCircle, Trophy, Users, Home, Crown, Star, Activity } from 'lucide-react';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { useOptimizedPhotos } from '@/hooks/useOptimizedPhotos';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { PhotoGrid } from './PhotoGrid';

export const MyAccountColumn: React.FC = () => {
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
    <div className="space-y-4 h-full overflow-y-auto">
      {/* Profile Card */}
      <Card className="bg-[#5A6573] text-white border-0 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Minha Conta</span>
            <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
              Online
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {/* Stats Grid - 2 colunas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Camera className="w-4 h-4 text-blue-400" />
                <Trophy className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-lg font-bold text-white">{photoCount}</div>
              <div className="text-xs text-white/60">Fotos</div>
              <div className="text-lg font-bold text-white">{completeProfile?.stats.badgesCount || 0}</div>
              <div className="text-xs text-white/60">Emblemas</div>
            </div>

            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Home className="w-4 h-4 text-green-400" />
                <Crown className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-lg font-bold text-white">{completeProfile?.stats.roomsCount || 0}</div>
              <div className="text-xs text-white/60">Quartos</div>
              <div className="text-lg font-bold text-white">{completeProfile?.stats.groupsCount || 0}</div>
              <div className="text-xs text-white/60">Grupos</div>
            </div>

            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-4 h-4 text-pink-400" />
                <Star className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-lg font-bold text-white">{completeProfile?.stats.friendsCount || 0}</div>
              <div className="text-xs text-white/60">Amigos</div>
              <div className="text-lg font-bold text-white">{completeProfile?.stats.level || 0}</div>
              <div className="text-xs text-white/60">Nível</div>
            </div>

            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="w-4 h-4 text-red-400" />
                <RefreshCw className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-white">{completeProfile?.stats.habboTickerCount || 0}</div>
              <div className="text-xs text-white/60">Atividades</div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRefreshPhotos}
                disabled={photosLoading}
                className="h-7 px-2 text-white/80 hover:text-white hover:bg-white/10 mt-1"
              >
                {photosLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Loading/Error States */}
          {photosLoading && (
            <div className="text-xs text-white/60 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Carregando fotos via API...
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
      </Card>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <Card className="bg-[#5A6573] text-white border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/80">
              Suas Fotos ({photos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoGrid photos={photoGridData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
