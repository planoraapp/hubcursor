
import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, RefreshCw, Users, Heart, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFriendsPhotos } from '@/hooks/useFriendsPhotos';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { PhotoModal } from '../console/PhotoModal';

export const FriendsPhotoFeedColumn: React.FC = () => {
  const { habboAccount } = useMyConsoleProfile();
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { 
    data: friendsPhotos = [], 
    isLoading, 
    error, 
    refetch 
  } = useFriendsPhotos(
    habboAccount?.habbo_name || '',
    (habboAccount as any)?.hotel || 'br'
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString.split('/').reverse().join('-'));
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h atrás`;
    return `${Math.floor(minutes / 1440)}d atrás`;
  };

  const handlePhotoClick = (photo: any) => {
    setSelectedPhoto({
      id: photo.id,
      imageUrl: photo.imageUrl,
      date: photo.date,
      likes: photo.likes
    });
  };

  if (!habboAccount) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-blue-500" />
            Feed dos Amigos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Faça login para ver o feed dos amigos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-blue-500" />
              Feed dos Amigos
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-blue-500/10 text-blue-700 border-blue-200">
                {friendsPhotos.length} fotos
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 min-h-0">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            {isLoading && (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-muted rounded-full" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-muted rounded w-24" />
                        <div className="h-2 bg-muted rounded w-16" />
                      </div>
                    </div>
                    <div className="aspect-square bg-muted rounded-lg mb-4" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-8 space-y-3">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                <div className="text-muted-foreground">
                  <p className="font-medium">Erro ao carregar feed</p>
                  <p className="text-sm">{error.message}</p>
                </div>
                <Button variant="outline" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}

            {!isLoading && !error && friendsPhotos.length === 0 && (
              <div className="text-center py-8 space-y-3">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto" />
                <div className="text-muted-foreground">
                  <p className="font-medium">Nenhuma foto encontrada</p>
                  <p className="text-sm">Seus amigos ainda não compartilharam fotos</p>
                </div>
              </div>
            )}

            {friendsPhotos.length > 0 && (
              <div className="space-y-6">
                {friendsPhotos.map((photo) => (
                  <div key={`${photo.userName}-${photo.id}`} className="space-y-3">
                    {/* Header do post */}
                    <div className="flex items-center gap-3">
                      <img
                        src={photo.userAvatar}
                        alt={photo.userName}
                        className="w-8 h-8 rounded-full border border-border"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/32x32/4B5563/FFFFFF?text=${photo.userName[0]}`;
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{photo.userName}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeAgo(photo.date)}
                        </div>
                      </div>
                    </div>

                    {/* Foto */}
                    <div 
                      className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <img
                        src={photo.imageUrl}
                        alt={`Foto de ${photo.userName}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/300x300/4B5563/FFFFFF?text=Foto+Não+Disponível`;
                        }}
                      />
                      
                      {/* Overlay com likes */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="flex items-center gap-1 text-white text-sm font-medium">
                          <Heart className="w-4 h-4 fill-white" />
                          <span>{photo.likes}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer com likes */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{photo.likes} curtidas</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedPhoto && (
        <PhotoModal
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photo={selectedPhoto}
        />
      )}
    </>
  );
};
