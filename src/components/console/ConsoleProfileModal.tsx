import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Camera, RefreshCw, Loader2, AlertCircle, Trophy, Users, Home, Crown, UserPlus } from 'lucide-react';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { useOptimizedPhotos } from '@/hooks/useOptimizedPhotos';
import { PhotoGrid } from './PhotoGrid';

interface ConsoleProfileModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  habboName: string;
}

export const ConsoleProfileModal: React.FC<ConsoleProfileModalProps> = ({ 
  open, 
  setOpen, 
  habboName 
}) => {
  const { data: completeProfile, isLoading: profileLoading } = useCompleteProfile(
    habboName,
    'com.br' // Default to .br for now
  );

  const { 
    photos, 
    photoCount, 
    isLoading: photosLoading, 
    hasError: photosError,
    errorMessage,
    refreshPhotos,
    canRetry,
    retryLoadPhotos
  } = useOptimizedPhotos(habboName, 'br');

  const handleRefreshPhotos = async () => {
        try {
      await refreshPhotos();
    } catch (error) {
          }
  };

  // Map photos for PhotoGrid
  const photoGridData = photos.map(photo => ({
    id: photo.id,
    imageUrl: photo.imageUrl,
    date: photo.date || new Date().toLocaleDateString('pt-BR'),
    likes: photo.likes || 0
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <div className="bg-[#5A6573] text-white rounded-lg h-full flex flex-col overflow-hidden">
          <DialogHeader className="p-4 pb-2 flex-shrink-0">
            <DialogTitle className="flex items-center justify-between text-lg">
              <span>Perfil de {habboName}</span>
              <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                {completeProfile?.online ? 'Online' : 'Offline'}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-4">
            {profileLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 animate-spin text-white/60" />
              </div>
            ) : completeProfile ? (
              <>
                {/* Avatar and Basic Info */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={`https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${habboName}&direction=2&head_direction=3&size=m&action=std`}
                      alt={`Avatar de ${habboName}`}
                      className="w-12 h-12 rounded-full bg-white/10"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboName}&size=m&direction=2&head_direction=3&action=std`;
                      }}
                    />
                    <div className={`absolute -top-1 -right-1 w-4 h-4 border-2 border-[#5A6573] rounded-full ${
                      completeProfile.online ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{habboName}</h3>
                    <p className="text-white/60 text-sm">
                      {completeProfile.motto || 'Sem motto definido'}
                    </p>
                  </div>
                </div>

                {/* Social Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col p-2 h-auto text-white">
                    <div className="text-lg font-bold">{photoCount}</div>
                    <div className="text-xs text-white/60">Fotos</div>
                  </div>
                  <div className="flex flex-col p-2 h-auto text-white">
                    <div className="text-lg font-bold">0</div>
                    <div className="text-xs text-white/60">Seguidores</div>
                  </div>
                  <div className="flex flex-col p-2 h-auto text-white">
                    <div className="text-lg font-bold">0</div>
                    <div className="text-xs text-white/60">Seguindo</div>
                  </div>
                </div>

                {/* Follow Button */}
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Seguir
                </Button>

                {/* Complete Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="text-lg font-bold text-white">{completeProfile.stats.badgesCount || 0}</div>
                    <div className="text-xs text-white/60">Emblemas</div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Home className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-lg font-bold text-white">{completeProfile.stats.roomsCount || 0}</div>
                    <div className="text-xs text-white/60">Quartos</div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-4 h-4 text-pink-400" />
                    </div>
                    <div className="text-lg font-bold text-white">{completeProfile.stats.friendsCount || 0}</div>
                    <div className="text-xs text-white/60">Amigos</div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Crown className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-lg font-bold text-white">{completeProfile.stats.groupsCount || 0}</div>
                    <div className="text-xs text-white/60">Grupos</div>
                  </div>
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
                      Fotos de {habboName} ({photos.length})
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
              </>
            ) : (
              <div className="text-center py-8">
                <User className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <p className="text-white/60">Usuário não encontrado</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};