import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, RefreshCw, Users, Heart, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFriendsPhotosInfinite } from '@/hooks/useFriendsPhotosInfinite';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { PhotoModal } from '../console/PhotoModal';
import { EnhancedPhotoCard } from '@/components/console/EnhancedPhotoCard';
import { EnhancedPhoto } from '@/types/habbo';

// Componente de loading otimizado
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-white/60 mx-auto mb-4" />
      <p className="text-white/60">Carregando feed de fotos...</p>
    </div>
  </div>
);

// Componente principal otimizado
const FriendsPhotoFeedContent: React.FC = () => {
  const { habboAccount } = useMyConsoleProfile();
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  // Só carrega fotos se há conta habbo válida
  const shouldLoadPhotos = !!habboAccount?.habbo_name && !!habboAccount?.hotel;
  
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
    (habboAccount as any)?.hotel || 'br',
    shouldLoadPhotos // Parâmetro para controlar se deve carregar
  );

  // IntersectionObserver for infinite scroll - OTIMIZADO
  useEffect(() => {
    if (!shouldLoadPhotos) return; // Só ativa se deve carregar fotos
    
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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, shouldLoadPhotos]);

  const handleRefresh = useCallback(() => {
    clearCache();
    refetch();
  }, [clearCache, refetch]);

  const handlePhotoClick = useCallback((photo: any) => {
    setSelectedPhoto(photo);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  // Se não há conta habbo, mostra mensagem informativa
  if (!shouldLoadPhotos) {
    return (
      <Card className="bg-[#4A5568] text-white border-0 h-full flex flex-col overflow-hidden backdrop-blur-sm">
        <CardHeader className="border-b border-dashed border-white/20 pb-3 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="w-5 h-5" />
            Feed de Amigos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-hidden p-4">
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/80 mb-2">
              Faça login para ver fotos dos seus amigos
            </h3>
            <p className="text-white/60">
              Conecte sua conta do Habbo para acessar o feed de fotos dos seus amigos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-[#4A5568] text-white border-0 h-full flex flex-col overflow-hidden backdrop-blur-sm">
        <CardHeader className="border-b border-dashed border-white/20 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="w-5 h-5" />
              Feed de Amigos
              <Badge variant="secondary" className="ml-2">
                {friendsPhotos.length}
              </Badge>
            </CardTitle>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="p-4 space-y-4">
              {isLoading && friendsPhotos.length === 0 ? (
                <LoadingSpinner />
              ) : error ? (
                <div className="text-center py-8 space-y-3">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                  <div className="text-white/80">
                    <p className="font-medium">Erro ao carregar feed</p>
                    <p className="text-sm text-white/60">{error.message}</p>
                  </div>
                  <Button variant="outline" onClick={handleRefresh}>
                    Tentar novamente
                  </Button>
                </div>
              ) : friendsPhotos.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <Camera className="w-12 h-12 text-white/40 mx-auto" />
                  <div className="text-white/60">
                    <p className="font-medium">Nenhuma foto encontrada</p>
                    <p className="text-sm">Seus amigos ainda não postaram fotos</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Lista de fotos */}
                  <div className="space-y-4">
                    {friendsPhotos.map((photo, index) => (
                      <div 
                        key={`${photo.id}-${index}`} 
                        className="bg-white/5 p-4 border border-dashed border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                      >
                        <EnhancedPhotoCard
                          photo={photo as EnhancedPhoto}
                          onUserClick={() => {}}
                          onLikesClick={() => {}}
                          onCommentsClick={() => {}}
                          showDivider={index < friendsPhotos.length - 1}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Sentinel para infinite scroll */}
                  <div ref={sentinelRef} className="h-4" />

                  {/* Loading mais fotos */}
                  {isFetchingNextPage && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                    </div>
                  )}

                  {/* Fim do feed */}
                  {!hasNextPage && friendsPhotos.length > 0 && (
                    <div className="text-center py-4 text-white/40 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-8 h-px bg-white/20"></div>
                        <span>Fim do feed</span>
                        <div className="w-8 h-px bg-white/20"></div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Modal de foto */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

// Componente principal com Suspense
export const FriendsPhotoFeedColumn: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <FriendsPhotoFeedContent />
    </Suspense>
  );
};