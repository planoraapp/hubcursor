import React, { useState } from 'react';
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
}

export const GlobalPhotoFeedColumn: React.FC<GlobalPhotoFeedColumnProps> = ({
  hotel = 'br',
  className = ''
}) => {
  const { t } = useI18n();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    hotel,
    enableCache: true,
    cacheTime: 5
  });

  const handleUserClick = (userName: string) => {
    setSelectedUser(userName);
    setIsModalOpen(true);
  };

  const handleLikesClick = (photoId: string) => {};

  const handleCommentsClick = (photoId: string) => {};

  return (
    <>
      <div className={`bg-transparent text-white h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent ${className}`}>
        <div className="flex-1 min-h-0">
          <div className="space-y-4">
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
                    {photos.map((photo, index) => (
                      <EnhancedPhotoCard
                        key={`${photo.id}-${index}`}
                        photo={photo}
                        onUserClick={handleUserClick}
                        onLikesClick={handleLikesClick}
                        onCommentsClick={handleCommentsClick}
                        showDivider={index < photos.length - 1}
                      />
                    ))}
                  </div>

                  {/* Botão de carregar mais */}
                  {hasMore && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Carregando...
                          </>
                        ) : (
                          'Carregar mais fotos'
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Indicador de fim */}
                  {!hasMore && photos.length > 0 && (
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
