
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, UserPlus, Camera, RefreshCw, Loader2, Clock, ArrowLeft } from 'lucide-react';
import { HabboUser } from '@/services/habboProxyService';
import { usePhotosScraped } from '@/hooks/usePhotosScraped';
import { PhotosDebugPanel } from './PhotosDebugPanel';

interface UserProfileDetailViewProps {
  user: HabboUser;
  hotel?: string;
  onLike?: () => void;
  onComment?: () => void;
  onFollow?: () => void;
  hasLiked?: boolean;
  isFollowing?: boolean;
  onClose?: () => void;
  onBack?: () => void;
}

export const UserProfileDetailView: React.FC<UserProfileDetailViewProps> = ({
  user,
  hotel = 'br',
  onLike,
  onComment,
  onFollow,
  hasLiked = false,
  isFollowing = false,
  onClose,
  onBack
}) => {
  const { scrapedPhotos, isLoading: photosLoading, refreshPhotos, photoCount } = usePhotosScraped(
    user.name,
    hotel
  );

  const handleRefreshPhotos = async () => {
        try {
      await refreshPhotos();
          } catch (error) {
          }
  };

  const avatarUrl = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${user.name}&direction=2&head_direction=3&size=l&action=std`;

  return (
    <div className="space-y-4 max-h-full overflow-y-auto">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
              <CardTitle className="text-xl">Perfil do Usuário</CardTitle>
            </div>
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
        <CardContent className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-4 border-white/20">
              <AvatarImage src={avatarUrl} alt={`Avatar de ${user.name}`} />
              <AvatarFallback className="bg-white/20 text-white text-lg">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-white/80 italic">"{user.motto || 'Sem motto'}"</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${user.online ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                  {user.online ? 'Online' : 'Offline'}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  {hotel.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{photoCount}</div>
              <div className="text-white/60 text-sm">Fotos</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{user.selectedBadges?.length || 0}</div>
              <div className="text-white/60 text-sm">Emblemas</div>
            </div>
            <div>
              <div className="text-2xl font-bold">?</div>
              <div className="text-white/60 text-sm">Amigos</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onLike}
              variant={hasLiked ? "default" : "outline"}
              size="sm"
              className="flex-1 text-white border-white/30 hover:bg-white/10"
            >
              <Heart className={`w-4 h-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
              {hasLiked ? 'Curtido' : 'Curtir'}
            </Button>
            <Button
              onClick={onComment}
              variant="outline"
              size="sm"
              className="flex-1 text-white border-white/30 hover:bg-white/10"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Comentar
            </Button>
            <Button
              onClick={onFollow}
              variant={isFollowing ? "default" : "outline"}
              size="sm"
              className="flex-1 text-white border-white/30 hover:bg-white/10"
            >
              <UserPlus className={`w-4 h-4 mr-1 ${isFollowing ? 'fill-current' : ''}`} />
              {isFollowing ? 'Seguindo' : 'Seguir'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Photos Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Fotos ({photoCount})
            </CardTitle>
            <div className="flex items-center gap-2">
              {photosLoading && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Carregando...</span>
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefreshPhotos}
                disabled={photosLoading}
              >
                {photosLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {photosLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Buscando fotos...</p>
            </div>
          ) : scrapedPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {scrapedPhotos.slice(0, 6).map((photo, index) => (
                <div key={photo.id || index} className="aspect-square relative group">
                  <img
                    src={photo.imageUrl}
                    alt={`Foto ${index + 1} de ${user.name}`}
                    className="w-full h-full object-cover rounded-lg border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end p-2">
                    <div className="text-white text-xs">
                      {photo.likes > 0 && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {photo.likes}
                        </div>
                      )}
                      {photo.roomName && (
                        <div className="mt-1 truncate">{photo.roomName}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhuma foto encontrada</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tente atualizar para buscar novamente
              </p>
            </div>
          )}
          
          {scrapedPhotos.length > 6 && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                +{scrapedPhotos.length - 6} fotos adicionais
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges Section */}
      {user.selectedBadges && user.selectedBadges.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Emblemas Selecionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {user.selectedBadges.slice(0, 8).map((badge, index) => (
                <div key={index} className="text-center">
                  <img
                    src={`https://images.habbo.com/c_images/album1584/${badge.code}.gif`}
                    alt={badge.name}
                    className="w-12 h-12 mx-auto mb-1"
                    title={`${badge.name}: ${badge.description}`}
                  />
                  <p className="text-xs text-muted-foreground truncate">
                    {badge.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Panel */}
      <PhotosDebugPanel username={user.name} hotel={hotel} />
    </div>
  );
};
