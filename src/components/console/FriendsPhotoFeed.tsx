import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFriendsPhotos } from "@/hooks/useFriendsPhotos";
import { EnhancedPhotoCard } from "@/components/console/EnhancedPhotoCard";
import { EnhancedPhoto } from "@/types/habbo";
import { Loader2, AlertCircle, RefreshCw, MessageCircle } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";
import { usePhotoComments } from "@/hooks/usePhotoComments";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/contexts/I18nContext";
import { getAvatarHeadUrl, getAvatarFallbackUrl } from '@/utils/avatarHelpers';
import { CompactLoginForm } from "@/components/console/CompactLoginForm";

// Componente do Modal de Comentários
interface CommentsModalProps {
  photo: EnhancedPhoto;
  onClose: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ photo, onClose }) => {
  const { habboAccount } = useAuth();
  const { t } = useI18n();
  const { 
    comments,
    commentsCount,
    addComment,
    deleteComment,
    canDeleteComment,
    isAddingComment,
    isDeletingComment
  } = usePhotoComments(photo.photo_id || photo.id, photo.user || photo.userName);

  const [commentText, setCommentText] = useState('');

  // Usar helper centralizado para URLs de avatar (não usado mais, mantido para compatibilidade)
  const getPhotoUserAvatarUrl = (userName: string, hotel?: string) => {
    return getAvatarHeadUrl(userName, hotel || 'br', undefined, 's');
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && !isAddingComment) {
      await addComment(commentText.trim());
      setCommentText('');
    }
  };

  return (
    <>
      {/* Header - mesmo design do RoomDetailsModal */}
      <div className="bg-yellow-400 border-2 border-black border-b-0 rounded-t-lg relative overflow-hidden flex-shrink-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '8px 8px'
      }}>
        <div className="pixel-pattern absolute inset-0 opacity-20"></div>
        <div className="p-2 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xs" style={{
            textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
          }}>
            <MessageCircle className="w-4 h-4 text-white flex-shrink-0" />
            <span>Comentários ({commentsCount || 0})</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Conteúdo com scroll - altura fixa para mostrar 5 comentários */}
      <div className="bg-gray-900 relative overflow-y-auto flex-1" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
        backgroundSize: '100% 2px',
        height: '320px' // Altura fixa para mostrar exatamente 5 comentários (~64px cada)
      }}>
        <div className="relative z-10 p-3 space-y-2">
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3 p-2 hover:bg-white/5 rounded transition-colors">
                <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
                  <img
                    src={getAvatarHeadUrl(comment.habbo_name, comment.hotel || 'br', undefined, 's')}
                    alt={comment.habbo_name}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getAvatarFallbackUrl(comment.habbo_name, 's');
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {comment.habbo_name}
                      </span>
                      <span className="text-xs text-white/60">
                        {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        disabled={isDeletingComment}
                        className="group relative w-5 h-5 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity disabled:opacity-50"
                        title="Excluir comentário"
                      >
                        <img 
                          src="/assets/deletetrash.gif" 
                          alt="Excluir"
                          className="max-w-full max-h-full object-contain"
                          style={{ imageRendering: 'pixelated' }}
                          onMouseOver={(e) => {
                            if (!isDeletingComment) {
                              e.currentTarget.src = '/assets/deletetrash1.gif';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isDeletingComment) {
                              e.currentTarget.src = '/assets/deletetrash.gif';
                            }
                          }}
                        />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-white/90 break-words">{comment.comment_text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-white/60 text-sm py-6">
              Nenhum comentário ainda
            </div>
          )}
        </div>
      </div>

      {/* Campo de comentário */}
      {habboAccount && (
        <div className="p-3 border-t border-white/10 bg-gray-900 flex-shrink-0">
          <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
            <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
              <img
                src={habboAccount?.habbo_name
                  ? getAvatarHeadUrl(habboAccount.habbo_name, habboAccount.hotel || 'br', undefined, 'm')
                  : getAvatarHeadUrl('', 'br', 'hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-', 'm')
                }
                alt={habboAccount.habbo_name}
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getAvatarHeadUrl('', 'br', 'hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-', 'm');
                }}
              />
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={t('pages.console.addComment')}
                maxLength={500}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 text-sm disabled:opacity-50"
                disabled={isAddingComment}
              />
              {commentText.trim() && (
                <button
                  type="submit"
                  disabled={isAddingComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t('pages.console.sendComment')}
                >
                  <img 
                    src="/assets/console/write.png" 
                    alt={t('pages.console.sendComment')} 
                    className="w-4 h-4" 
                  />
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
};

interface FriendsPhotoFeedProps {
  currentUserName: string;
  hotel: string;
  onNavigateToProfile: (username: string, hotelDomain?: string, uniqueId?: string) => void;
  refreshTrigger?: number;
  isHeaderVisible?: boolean;
}

export const FriendsPhotoFeed: React.FC<FriendsPhotoFeedProps> = ({
  currentUserName,
  hotel,
  onNavigateToProfile,
  refreshTrigger = 0,
  isHeaderVisible = true
}) => {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { habboAccount, isLoggedIn } = useAuth();
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const scrollRestoredRef = useRef(false);
  const [modalPhotoWidth, setModalPhotoWidth] = useState<number | null>(null);
  
  // Chave única para salvar posição de scroll do feed de amigos
  const scrollPositionKey = `feed-scroll-friends-${hotel}`;

  // Usar habboAccount para obter uniqueId se disponível
  const habboUniqueId = habboAccount?.habbo_id || undefined;
  
  // Debug: verificar parâmetros
  React.useEffect(() => {
    if (currentUserName) {
      console.log('[FriendsPhotoFeed] Configuração:', {
        currentUserName,
        hotel,
        habboUniqueId,
        habboAccount: habboAccount ? {
          habbo_name: habboAccount.habbo_name,
          hotel: habboAccount.hotel
        } : null,
        isValid: currentUserName && currentUserName.trim()
      });
    }
  }, [currentUserName, hotel, habboUniqueId, habboAccount]);
  
  const {
    data: photos,
    isLoading,
    error,
    refetch
  } = useFriendsPhotos(currentUserName, hotel, habboUniqueId);

  const [commentsModalPhoto, setCommentsModalPhoto] = useState<EnhancedPhoto | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calcular largura da foto quando o modal abrir
  useEffect(() => {
    if (!commentsModalPhoto) {
      setModalPhotoWidth(null);
      return;
    }

    const findPhotoWidth = () => {
      // Procurar pela imagem usando o imageUrl
      const images = document.querySelectorAll('img');
      const targetImg = Array.from(images).find(img => 
        img.src === commentsModalPhoto.imageUrl || 
        img.src.includes(commentsModalPhoto.imageUrl.split('/').pop() || '')
      );
      
      if (targetImg) {
        const width = targetImg.offsetWidth || targetImg.clientWidth || targetImg.getBoundingClientRect().width;
        if (width > 0) {
          setModalPhotoWidth(width);
        }
      }
    };

    // Tentar encontrar imediatamente e também após um pequeno delay
    findPhotoWidth();
    const timeout = setTimeout(findPhotoWidth, 100);
    return () => clearTimeout(timeout);
  }, [commentsModalPhoto]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidar cache e forçar busca completa
      await queryClient.invalidateQueries({ 
        queryKey: ['friends-photos'] 
      });
      await refetch();
      
      // Scroll para o topo após refresh
      const scrollableParent = findScrollableParent(feedContainerRef.current);
      if (scrollableParent) {
        scrollableParent.scrollTop = 0;
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Responder ao refreshTrigger externo
  const lastRefreshTriggerRef = useRef(refreshTrigger);
  useEffect(() => {
    if (refreshTrigger > lastRefreshTriggerRef.current) {
      lastRefreshTriggerRef.current = refreshTrigger;
      handleRefresh();
    }
  }, [refreshTrigger]);

  // Função para encontrar o elemento scrollável pai
  const findScrollableParent = (element: HTMLElement | null): HTMLElement | null => {
    if (!element) return null;
    
    let parent = element.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll' || 
          style.overflow === 'auto' || style.overflow === 'scroll') {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  };

  // Salvar posição de scroll quando navegar para perfil
  const handleNavigateToProfile = (username: string, photo?: any) => {
    const scrollableParent = findScrollableParent(feedContainerRef.current);
    if (scrollableParent) {
      const scrollPosition = scrollableParent.scrollTop;
      sessionStorage.setItem(scrollPositionKey, scrollPosition.toString());
    }
    
    // Extrair hotelDomain e uniqueId do objeto photo se disponível
    let hotelDomain: string | undefined = undefined;
    let userUniqueId: string | undefined = undefined;
    
    if (photo) {
      // Debug: verificar o que está no objeto photo
      console.log('[FriendsPhotoFeed] handleNavigateToProfile - photo object:', {
        userName: photo.userName,
        userUniqueId: photo.userUniqueId,
        hotelDomain: photo.hotelDomain,
        hotel: photo.hotel,
        hasUserUniqueId: 'userUniqueId' in photo
      });
      
      // Priorizar hotelDomain, depois hotel (código), depois o hotel padrão do feed
      if (photo.hotelDomain) {
        hotelDomain = photo.hotelDomain;
      } else if (photo.hotel) {
        // Converter código do hotel para domínio
        const hotelCode = photo.hotel;
        if (hotelCode === 'br') hotelDomain = 'com.br';
        else if (hotelCode === 'tr') hotelDomain = 'com.tr';
        else if (hotelCode === 'us' || hotelCode === 'com') hotelDomain = 'com';
        else hotelDomain = hotelCode; // es, fr, de, it, nl, fi
      }
      
      // Extrair uniqueId do usuário se disponível
      if (photo.userUniqueId) {
        userUniqueId = photo.userUniqueId;
        console.log('[FriendsPhotoFeed] ✅ userUniqueId encontrado:', userUniqueId);
      } else {
        console.warn('[FriendsPhotoFeed] ⚠️ userUniqueId não encontrado no photo');
      }
    }
    
    // Se não encontrou hotelDomain no photo, usar o hotel padrão do feed
    if (!hotelDomain) {
      hotelDomain = hotel === 'br' ? 'com.br' : hotel === 'tr' ? 'com.tr' : hotel;
    }
    
    console.log('[FriendsPhotoFeed] Navegando para perfil:', {
      username,
      hotelDomain,
      userUniqueId
    });
    
    onNavigateToProfile(username, hotelDomain, userUniqueId);
  };

  // Restaurar posição de scroll quando voltar ao feed
  useEffect(() => {
    if (feedContainerRef.current && photos && photos.length > 0 && !isLoading && !scrollRestoredRef.current) {
      const scrollableParent = findScrollableParent(feedContainerRef.current);
      if (scrollableParent) {
        const savedScrollPosition = sessionStorage.getItem(scrollPositionKey);
        if (savedScrollPosition !== null) {
          requestAnimationFrame(() => {
            if (scrollableParent) {
              scrollableParent.scrollTop = parseInt(savedScrollPosition, 10);
              scrollRestoredRef.current = true;
            }
          });
        } else {
          scrollRestoredRef.current = true;
        }
      }
    }
  }, [photos, isLoading, scrollPositionKey]);

  // Salvar posição de scroll durante o scroll (debounced)
  useEffect(() => {
    const container = feedContainerRef.current;
    if (!container) return;

    const scrollableParent = findScrollableParent(container);
    if (!scrollableParent) return;

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (scrollableParent) {
          sessionStorage.setItem(scrollPositionKey, scrollableParent.scrollTop.toString());
        }
      }, 300);
    };

    scrollableParent.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollableParent.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [scrollPositionKey, hotel]);

  // Resetar flag quando hotel mudar
  useEffect(() => {
    scrollRestoredRef.current = false;
  }, [hotel]);

  // Debug: log quando photos mudar
  useEffect(() => {
    if (photos && photos.length > 0) {
      console.log(`[📊 FRIENDS FEED] Displaying ${photos.length} photos`);
      console.log(`[📊 FRIENDS FEED] First photo:`, {
        user: photos[0].userName,
        date: photos[0].date,
        timestamp: photos[0].timestamp
      });
    }
  }, [photos]);

  const handleRetry = () => {
    refetch();
  };

  // Verificar se está logado
  if (!isLoggedIn || !habboAccount) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center w-full max-w-md">
          <div className="mb-6">
            <img 
              src="/assets/pwrup_qm.gif" 
              alt="" 
              className="mx-auto mb-4"
              style={{ imageRendering: 'pixelated' }}
            />
            <p className="text-white/80 mb-2 font-semibold">
              {t('pages.console.loginRequired')}
            </p>
            <p className="text-white/60 text-sm">
              {t('pages.console.loginRequiredDescription')}
            </p>
          </div>
          <CompactLoginForm />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-white/60">{t('pages.console.loadingPhotos')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-white/60 mb-4">{t('pages.console.errorLoadingPhotos')}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            {t('pages.console.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <img 
            src="/assets/console/hotelfilter.png" 
            alt="Filtro" 
            className="h-5 w-auto object-contain mx-auto mb-4"
            style={{ imageRendering: 'pixelated' }}
          />
          <p className="text-white/60 mb-2">{t('pages.console.noPhotos')}</p>
          <p className="text-white/40 text-sm">{t('pages.console.noPhotosDescription')}</p>
        </div>
      </div>
    );
  }

      return (
        <div ref={feedContainerRef} className="space-y-4 relative overflow-hidden">
          {/* Título do feed - Fixo */}
          <div 
            className="flex items-center justify-between px-2 py-2 flex-shrink-0"
            style={{ 
              position: 'sticky', 
              top: 0,
              zIndex: 99
            }}
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {t('pages.console.feedTitle')}
            </h3>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-white/60 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Atualizar feed"
            >
              {isRefreshing ? (
                <LoadingSpinner />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Linha tracejada abaixo do título */}
          <div className="border-t border-dashed border-white/20 my-2"></div>

          {/* Lista de fotos */}
          <div className="space-y-4">
            {photos.map((photo, index) => {
              // Converter código do hotel para domínio (ex: 'br' -> 'com.br', 'tr' -> 'com.tr')
              const hotelDomain = hotel === 'br' ? 'com.br' : hotel === 'tr' ? 'com.tr' : hotel;
              
              return (
              <EnhancedPhotoCard
                key={photo.id}
                photo={{
                  id: photo.id,
                  photo_id: photo.id,
                  userName: photo.userName,
                  imageUrl: photo.imageUrl,
                  s3_url: photo.imageUrl, // Incluir também como s3_url para facilitar detecção do hotel
                  date: photo.date,
                  likes: [],
                  likesCount: photo.likes,
                  userLiked: false,
                  type: 'PHOTO' as const,
                  caption: photo.caption || '',
                  roomName: photo.roomName || '',
                  roomId: photo.roomId ? String(photo.roomId) : undefined, // Garantir que seja string
                  timestamp: photo.timestamp,
                  hotelDomain: hotelDomain, // Passar hotelDomain para facilitar detecção
                  hotel: hotel, // Passar código do hotel como fallback
                  userUniqueId: photo.userUniqueId // Passar uniqueId do usuário para navegação
                } as EnhancedPhoto}
                onUserClick={handleNavigateToProfile}
                onLikesClick={() => {}}
                onCommentsClick={() => setCommentsModalPhoto({
                  id: photo.id,
                  photo_id: photo.id,
                  userName: photo.userName,
                  imageUrl: photo.imageUrl,
                  s3_url: photo.imageUrl,
                  date: photo.date,
                  likes: [],
                  likesCount: photo.likes,
                  userLiked: false,
                  type: 'PHOTO' as const,
                  caption: photo.caption || '',
                  roomName: photo.roomName || '',
                  roomId: photo.roomId ? String(photo.roomId) : undefined, // Garantir que seja string
                  timestamp: photo.timestamp,
                  hotelDomain: hotelDomain,
                  hotel: hotel
                } as EnhancedPhoto)}
                showDivider={index < photos.length - 1}
              />
              );
            })}
          </div>

          {/* Modal de Comentários - mesmo design do RoomDetailsModal */}
          {commentsModalPhoto && (
            <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ pointerEvents: 'auto' }}>
              {/* Overlay para fechar ao clicar fora */}
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setCommentsModalPhoto(null)}
              />
              
              {/* Modal */}
              <div
                className="relative p-0 bg-transparent border-0 overflow-hidden rounded-lg animate-slide-up-fade z-50"
                style={{
                  width: modalPhotoWidth ? `${modalPhotoWidth}px` : '100%',
                  maxWidth: '100%',
                  backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
                  backgroundSize: '100% 2px',
                  pointerEvents: 'auto',
                  height: 'auto',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <CommentsModal
                  photo={commentsModalPhoto}
                  onClose={() => setCommentsModalPhoto(null)}
                />
              </div>
            </div>
          )}
        </div>
      );
};