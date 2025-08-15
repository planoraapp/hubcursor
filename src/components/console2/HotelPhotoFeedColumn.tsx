
import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, RefreshCw, Heart, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { useHotelPhotoFeed } from '@/hooks/useHotelPhotoFeed';
import { PhotoModal } from '../console/PhotoModal';

export const HotelPhotoFeedColumn: React.FC = () => {
  const { habboAccount } = useMyConsoleProfile();
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  
  const { 
    data: hotelPhotos = [], 
    isLoading, 
    error, 
    refetch 
  } = useHotelPhotoFeed(
    habboAccount?.habbo_name || 'Beebop', // Use logged user or default to Beebop for testing
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

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-green-500" />
              Feed do Hotel
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 min-h-0 p-0">
          <ScrollArea className="h-full px-4">
            {isLoading && (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-muted rounded w-24" />
                        <div className="h-2 bg-muted rounded w-16" />
                      </div>
                    </div>
                    <div className="aspect-square bg-muted rounded-lg" />
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

            {!isLoading && !error && hotelPhotos.length === 0 && (
              <div className="text-center py-8 space-y-3">
                <Globe className="w-12 h-12 text-muted-foreground mx-auto" />
                <div className="text-muted-foreground">
                  <p className="font-medium">Nenhuma foto encontrada</p>
                  <p className="text-sm">Aguarde novos posts dos usuários</p>
                </div>
              </div>
            )}

            {hotelPhotos.length > 0 && (
              <div className="space-y-6 pb-4">
                {hotelPhotos.map((photo) => (
                  <div key={`${photo.userName}-${photo.id}`} className="space-y-3">
                    {/* Header do post */}
                    <div className="flex items-center gap-3">
                      <img
                        src={photo.userAvatar}
                        alt={photo.userName}
                        className="w-10 h-10 rounded-full border border-border"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/40x40/4B5563/FFFFFF?text=${photo.userName[0]}`;
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{photo.userName}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeAgo(photo.date)}
                        </div>
                      </div>
                    </div>

                    {/* Foto - largura total da coluna */}
                    <div 
                      className="relative w-full bg-muted rounded-lg overflow-hidden cursor-pointer group"
                      style={{ aspectRatio: '1/1' }}
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <img
                        src={photo.imageUrl}
                        alt={`Foto de ${photo.userName}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/400x400/4B5563/FFFFFF?text=Foto+Não+Disponível`;
                        }}
                      />
                      
                      {/* Overlay com likes */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="flex items-center gap-1 text-white text-sm font-medium">
                          <Heart className="w-5 h-5 fill-white" />
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
