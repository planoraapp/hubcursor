import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  AlertCircle, 
  Camera
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { useGlobalPhotoFeed } from '@/hooks/useGlobalPhotoFeed';
import { EnhancedPhotoCard } from '@/components/console/EnhancedPhotoCard';
import { useI18n } from '@/contexts/I18nContext';

interface GlobalPhotoFeedColumnProps {
  hotel?: string;
  className?: string;
  // Ao clicar no usuário, também passamos a própria foto,
  // para que o chamador possa inferir o hotel correto
  onUserClick?: (userName: string, photo?: any) => void;
  // Trigger para refresh e scroll ao topo (incrementa para forçar refresh)
  refreshTrigger?: number;
}

const GlobalPhotoFeedColumn: React.FC<GlobalPhotoFeedColumnProps> = ({
  hotel = 'br',
  className = '',
  onUserClick,
  refreshTrigger = 0
}) => {
  const { t } = useI18n();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollRestoredRef = useRef(false);
  const [newPhotoIds, setNewPhotoIds] = useState<Set<string>>(new Set());
  const [openRoomModalId, setOpenRoomModalId] = useState<string | null>(null);

  // Handler para quando um modal de quarto é aberto
  const handleRoomModalOpen = (photoId: string) => {
    // Fechar modal anterior se houver
    if (openRoomModalId && openRoomModalId !== photoId) {
      setOpenRoomModalId(null);
    }
    // Marcar o novo modal como aberto
    setOpenRoomModalId(photoId);
  };
  
  // Chave única para salvar posição de scroll por hotel
  const scrollPositionKey = `feed-scroll-global-${hotel}`;
  const scrollRestoreFlagKey = `feed-scroll-restore-flag-${hotel}`;

  // Converter hotel para formato correto (br -> com.br, tr -> com.tr para o hook)
  let hotelCode = hotel;
  if (hotel === 'br') hotelCode = 'com.br';
  if (hotel === 'tr') hotelCode = 'com.tr';

  const {
    photos,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refreshFeed,
    checkForNewPhotos,
    stats
  } = useGlobalPhotoFeed({
    limit: 20,
    hotel: hotelCode,
    enableCache: false, // Desabilitado temporariamente para garantir dados frescos
    cacheTime: 1
  });

  // Limpar posição de scroll salva quando hotel mudar (mudança de filtro = começar do topo)
  useEffect(() => {
    sessionStorage.removeItem(scrollPositionKey);
    sessionStorage.removeItem(scrollRestoreFlagKey);
    scrollRestoredRef.current = false;
    // Garantir que o scroll está no topo ao mudar o hotel
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [hotel, scrollPositionKey, scrollRestoreFlagKey]);

  // Verificar novas fotos e scroll ao topo quando refreshTrigger mudar
  const lastRefreshTriggerRef = useRef(refreshTrigger);
  useEffect(() => {
    if (refreshTrigger > lastRefreshTriggerRef.current) {
      console.log('[📸 GLOBAL FEED] Refresh trigger detected:', refreshTrigger);
      lastRefreshTriggerRef.current = refreshTrigger;
      
      // Limpar flags de scroll para começar do topo
      sessionStorage.removeItem(scrollPositionKey);
      sessionStorage.removeItem(scrollRestoreFlagKey);
      scrollRestoredRef.current = false;
      
      // Scroll para o topo primeiro (imediato)
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
        console.log('[📸 GLOBAL FEED] Scrolled to top');
      }
      
      // Fazer refresh completo do feed
      if (refreshFeed) {
        console.log('[📸 GLOBAL FEED] Refreshing feed...');
        refreshFeed();
      }
      
      // Verificar e adicionar apenas novas fotos (sem resetar o feed)
      if (checkForNewPhotos) {
        console.log('[📸 GLOBAL FEED] Checking for new photos...');
        
        checkForNewPhotos().then(({ count, newPhotoIds: newIds }) => {
          if (count > 0) {
            console.log(`[📸 GLOBAL FEED] Added ${count} new photos to top`);
            
            // Marcar as novas fotos para animação
            setNewPhotoIds(new Set(newIds));
            
            // Remover a animação após a animação completar
            setTimeout(() => {
              setNewPhotoIds(new Set());
            }, 600);
            
            // Garantir scroll no topo após adicionar novas fotos
            setTimeout(() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = 0;
              }
            }, 100);
          }
        });
      }
    }
  }, [refreshTrigger, checkForNewPhotos, refreshFeed, scrollPositionKey, scrollRestoreFlagKey]);

  // Restaurar posição de scroll apenas quando voltar de um perfil
  // A flag scrollRestoreFlagKey é setada quando o usuário clica em um perfil
  useEffect(() => {
    if (scrollContainerRef.current && photos.length > 0 && !isLoading && !scrollRestoredRef.current) {
      const shouldRestore = sessionStorage.getItem(scrollRestoreFlagKey) === 'true';
      const savedScrollPosition = sessionStorage.getItem(scrollPositionKey);
      
      if (shouldRestore && savedScrollPosition !== null) {
        // Restaurar posição quando voltar de um perfil
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = parseInt(savedScrollPosition, 10);
            scrollRestoredRef.current = true;
            // Limpar a flag após restaurar (para próxima vez começar do topo se mudar aba/país)
            sessionStorage.removeItem(scrollRestoreFlagKey);
          }
        });
      } else {
        // Se não há flag de restauração, começar do topo (primeira vez ou mudança de aba/país)
        if (scrollContainerRef.current.scrollTop !== 0) {
          scrollContainerRef.current.scrollTop = 0;
        }
        scrollRestoredRef.current = true;
      }
    }
  }, [photos.length, isLoading, scrollPositionKey, scrollRestoreFlagKey]);

  // Salvar posição de scroll durante o scroll (debounced)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (container) {
          sessionStorage.setItem(scrollPositionKey, container.scrollTop.toString());
        }
      }, 300); // Salvar após 300ms sem scroll
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [scrollPositionKey]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    // Só configurar observer se tiver fotos e ainda houver mais para carregar
    if (!hasMore || photos.length === 0) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let timeoutId: NodeJS.Timeout;

    // Aguardar um frame para garantir que o DOM está totalmente renderizado
    timeoutId = setTimeout(() => {
      const sentinel = sentinelRef.current;
      const scrollContainer = scrollContainerRef.current;
      
      if (!sentinel || !scrollContainer) {
        console.log('[📜 GLOBAL FEED] IntersectionObserver setup skipped: missing sentinel or container');
        return;
      }

      // Verificar se o container tem altura definida
      const containerHeight = scrollContainer.clientHeight;
      const containerScrollHeight = scrollContainer.scrollHeight;
      console.log('[📜 GLOBAL FEED] Setting up IntersectionObserver', {
        hasMore,
        isLoadingMore,
        isLoading,
        photosCount: photos.length,
        containerHeight,
        containerScrollHeight,
        hasScroll: containerScrollHeight > containerHeight
      });

      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          console.log('[📜 GLOBAL FEED] IntersectionObserver callback', {
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            hasMore,
            isLoadingMore,
            isLoading,
            boundingClientRect: entry.boundingClientRect,
            rootBounds: entry.rootBounds
          });
          
          // Verificar condições dentro do callback para permitir mudanças dinâmicas
          if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
            console.log('[📜 GLOBAL FEED] ✅ Conditions met, calling loadMore()');
            loadMore();
          } else {
            console.log('[📜 GLOBAL FEED] ❌ Conditions not met for loadMore', {
              isIntersecting: entry.isIntersecting,
              hasMore,
              isLoadingMore,
              isLoading
            });
          }
        },
        { 
          threshold: [0, 0.1, 0.5, 1], // Múltiplos thresholds para melhor detecção
          rootMargin: '300px', // Aumentado para carregar bem antes
          root: scrollContainer // Usar o container scrollável como root
        }
      );

      observer.observe(sentinel);
      console.log('[📜 GLOBAL FEED] ✅ Sentinel observed, waiting for intersection...');
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (observer) {
        console.log('[📜 GLOBAL FEED] Cleaning up IntersectionObserver');
        observer.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, isLoading, loadMore, photos.length]);

  const handleUserClick = (userName: string, photo?: any) => {
    // Salvar posição de scroll antes de navegar E marcar flag para restaurar ao voltar
    if (scrollContainerRef.current) {
      const scrollPosition = scrollContainerRef.current.scrollTop;
      sessionStorage.setItem(scrollPositionKey, scrollPosition.toString());
      sessionStorage.setItem(scrollRestoreFlagKey, 'true'); // Flag para indicar que deve restaurar
    }
    
    if (onUserClick) {
      // Passar também a foto para que o chamador possa inferir o hotel, se necessário
      onUserClick(userName, photo);
      return;
    }
  };

  const handleLikesClick = (photoId: string) => {};

  const handleCommentsClick = (photoId: string) => {};

  // Função para centralizar suavemente uma foto no feed
  const handleRoomClick = (cardRef: React.RefObject<HTMLElement>, photoId: string) => {
    if (!cardRef.current || !scrollContainerRef.current) return;

    // Calcular posição para centralizar a foto
    const cardRect = cardRef.current.getBoundingClientRect();
    const parentRect = scrollContainerRef.current.getBoundingClientRect();
    
    // Posição atual do scroll
    const currentScrollTop = scrollContainerRef.current.scrollTop;
    
    // Posição do card relativa ao container scrollável
    const cardTopRelativeToParent = cardRect.top - parentRect.top + currentScrollTop;
    
    // Altura visível do container
    const visibleHeight = parentRect.height;
    
    // Calcular scroll para centralizar (metade da altura visível menos metade da altura do card)
    const cardHeight = cardRect.height;
    const targetScrollTop = cardTopRelativeToParent - (visibleHeight / 2) + (cardHeight / 2);

    // Scroll suave
    scrollContainerRef.current.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <div 
        ref={scrollContainerRef}
        className={`bg-transparent text-white h-full w-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent ${className}`}
      >
        <div className="space-y-4 w-full py-2">
              {isLoading && photos.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  <LoadingSpinner />
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
                      // Usar photo_id como fonte de verdade para keys
                      const key = photo.photo_id || photo.id;
                      const isNewPhoto = newPhotoIds.has(key || '');
                      return (
                        <div
                          key={key}
                          className={isNewPhoto ? 'animate-new-photo' : ''}
                        >
                          <EnhancedPhotoCard
                            photo={photo}
                            onUserClick={handleUserClick}
                            onLikesClick={handleLikesClick}
                            onCommentsClick={handleCommentsClick}
                            onRoomClick={(cardRef, photoId) => handleRoomClick(cardRef, photoId)}
                            onRoomModalOpen={handleRoomModalOpen}
                            isRoomModalOpen={openRoomModalId === (photo.id || photo.photo_id)}
                            showDivider={true}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Sentinel para infinite scroll */}
                  <div 
                    ref={sentinelRef} 
                    className="h-20 w-full flex items-center justify-center"
                    style={{ minHeight: '80px' }}
                  >
                    {/* Elemento visível para debug - pode ser removido depois */}
                    <div className="h-1 w-full bg-transparent" />
                  </div>

                  {/* Loading mais fotos */}
                  {isLoadingMore && (
                    <div className="flex flex-col items-center justify-center py-4 text-white/60 text-sm gap-2">
                      <LoadingSpinner />
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
    </>
  );
};

export default GlobalPhotoFeedColumn;
export { GlobalPhotoFeedColumn };
