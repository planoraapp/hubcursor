import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  AlertCircle, 
  Camera
} from 'lucide-react';
import { useGlobalPhotoFeed } from '@/hooks/useGlobalPhotoFeed';
import { EnhancedPhotoCard } from '@/components/console/EnhancedPhotoCard';
import { ProfileModal } from '@/components/ProfileModal';
import { useI18n } from '@/contexts/I18nContext';

interface GlobalPhotoFeedColumnProps {
  hotel?: string;
  className?: string;
  // Ao clicar no usuário, também passamos a própria foto,
  // para que o chamador possa inferir o hotel correto
  onUserClick?: (userName: string, photo?: any) => void;
}

const GlobalPhotoFeedColumn: React.FC<GlobalPhotoFeedColumnProps> = ({
  hotel = 'br',
  className = '',
  onUserClick
}) => {
  const { t } = useI18n();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Converter hotel para formato correto (br -> com.br para o hook)
  const hotelCode = hotel === 'br' ? 'com.br' : hotel;

  const {
    photos,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refreshFeed,
    stats
  } = useGlobalPhotoFeed({
    limit: 20,
    hotel: hotelCode,
    enableCache: false, // Desabilitado temporariamente para garantir dados frescos
    cacheTime: 1
  });

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoadingMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, loadMore]);

  const handleUserClick = (userName: string, photo?: any) => {
    if (onUserClick) {
      // Passar também a foto para que o chamador possa inferir o hotel, se necessário
      onUserClick(userName, photo);
      return;
    }

    setSelectedUser(userName);
    setIsModalOpen(true);
  };

  const handleLikesClick = (photoId: string) => {};

  const handleCommentsClick = (photoId: string) => {};

  return (
    <>
      <div className={`bg-transparent text-white h-full w-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent ${className}`}>
        <div className="space-y-4 w-full py-2">
              {isLoading && photos.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-8 h-8 animate-spin text-white/60" />
                </div>
              ) : error ? (
                <div className="text-center py-8 space-y-3">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                  <div className="text-white/80">
                    <p className="font-medium">Erro ao carregar feed</p>
                    <p className="text-sm text-white/60">{error.message}</p>
                  </div>
                  <Button variant="outline" onClick={refreshFeed}>
                    Tentar novamente
                  </Button>
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <Camera className="w-12 h-12 text-white/40 mx-auto" />
                  <div className="text-white/60">
                    <p className="font-medium">{t('pages.console.noPhotos')}</p>
                    <p className="text-sm">O feed global está vazio no momento</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Lista de fotos */}
                  <div className="space-y-4">
                    {photos.map((photo) => {
                      const key = photo.photo_id || photo.id;
                      return (
                        <EnhancedPhotoCard
                          key={key}
                          photo={photo}
                          onUserClick={handleUserClick}
                          onLikesClick={handleLikesClick}
                          onCommentsClick={handleCommentsClick}
                          showDivider={true}
                        />
                      );
                    })}
                  </div>

                  {/* Sentinel para infinite scroll */}
                  <div ref={sentinelRef} className="h-4" />

                  {/* Loading mais fotos */}
                  {isLoadingMore && (
                    <div className="flex flex-col items-center justify-center py-4 text-white/60 text-sm gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                      <span>Carregando mais fotos...</span>
                    </div>
                  )}

                  {/* Indicador de fim */}
                  {!hasMore && photos.length > 0 && !isLoadingMore && (
                    <div className="text-center py-4 text-white/60 text-sm">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-8 h-px bg-white/20"></div>
                          <span>Você chegou ao fim do feed global.</span>
                          <div className="w-8 h-px bg-white/20"></div>
                        </div>
                        <span className="text-xs text-white/40">
                          Novas fotos aparecerão assim que forem publicadas no hotel.
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
        </div>
      </div>

      {/* Modal de perfil */}
      <ProfileModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        habboName={selectedUser}
      />
    </>
  );
};

export default GlobalPhotoFeedColumn;
export { GlobalPhotoFeedColumn };
