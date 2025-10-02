
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, RefreshCw, Users, Heart, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFriendsPhotosInfinite } from '@/hooks/useFriendsPhotosInfinite';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { PhotoModal } from '../console/PhotoModal';
import { EnhancedPhotoCard } from './EnhancedPhotoCard';
import { EnhancedPhoto } from '@/types/habbo';

export const FriendsPhotoFeedColumn: React.FC = () => {
  const { habboAccount } = useMyConsoleProfile();
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  const { 
    photos: friendsPhotos = [], 
    isLoading, 
    error, 
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    clearCache
  } = useFriendsPhotosInfinite(
    habboAccount?.habbo_name || '',
    (habboAccount as any)?.hotel || 'br'
  );

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    clearCache();
  }, [clearCache]);

  const handlePhotoClick = (photo: any) => {
    setSelectedPhoto({
      id: photo.id,
      imageUrl: photo.imageUrl,
      date: photo.date,
      likes: photo.likes,
      caption: photo.caption,
      roomName: photo.roomName
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
      <Card className="bg-[#4A5568] text-white border-none h-full flex flex-col">
        <CardHeader className="border-b border-dashed border-white/20 pb-3">
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
                onClick={handleRefresh}
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
                <Button variant="outline" onClick={handleRefresh}>
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
                {friendsPhotos.map((photo, index) => {
                  // Convert to EnhancedPhoto format
                  const enhancedPhoto: EnhancedPhoto = {
                    id: photo.id || `photo-${index}`,
                    photo_id: photo.photo_id || photo.id || `photo-${index}`,
                    userName: photo.userName,
                    imageUrl: photo.imageUrl,
                    date: photo.date, // Already formatted by the hook
                    likes: [],
                    likesCount: photo.likes || 0,
                    userLiked: false,
                    type: 'PHOTO', // Default type, could be enhanced based on photo data
                    caption: photo.caption,
                    roomName: photo.roomName
                  };

                  return (
                    <div key={`${photo.userName}-${photo.id}`} className="p-3 border-t border-dashed border-white/20 first:border-t-0">
                      <EnhancedPhotoCard
                        photo={enhancedPhoto}
                        onUserClick={(userName) => {
                          // Handle user click - could open profile modal
                          console.log('User clicked:', userName);
                        }}
                        onLikesClick={(photoId) => {
                          // Handle likes click - could open likes modal
                          console.log('Likes clicked for photo:', photoId);
                        }}
                        onCommentsClick={(photoId) => {
                          // Handle comments click - could open comments modal
                          console.log('Comments clicked for photo:', photoId);
                        }}
                        showDivider={index < friendsPhotos.length - 1}
                      />
                    </div>
                  );
                })}

                {/* Infinite scroll sentinel */}
                {hasNextPage && (
                  <div ref={sentinelRef} className="flex justify-center py-4">
                    {isFetchingNextPage ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Carregando mais fotos...</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm">
                        Role para baixo para carregar mais
                      </div>
                    )}
                  </div>
                )}

                {/* End of feed indicator */}
                {!hasNextPage && friendsPhotos.length > 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <div className="border-t border-dashed border-white/20 pt-4">
                      Você viu todas as fotos dos amigos!
                    </div>
                  </div>
                )}
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
