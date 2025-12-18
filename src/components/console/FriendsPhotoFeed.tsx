import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFriendsPhotos } from "@/hooks/useFriendsPhotos";
import { EnhancedPhotoCard } from "@/components/console/EnhancedPhotoCard";
import { EnhancedPhoto } from "@/types/habbo";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { usePhotoComments } from "@/hooks/usePhotoComments";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/contexts/I18nContext";

// Componente do Modal de Comentários
interface CommentsModalProps {
  photo: EnhancedPhoto;
  onClose: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ photo, onClose }) => {
  const { habboAccount } = useAuth();
  const { t } = useI18n();
  const { 
    lastTwoComments,
    addComment,
    isAddingComment
  } = usePhotoComments(photo.photo_id);

  const [commentText, setCommentText] = useState('');

  const getAvatarUrl = (userName: string) => {
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(userName)}&size=s&direction=2&head_direction=3&headonly=1`;
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-400 to-yellow-300 border-b-2 border-yellow-500 rounded-t-xl">
        <h3 className="text-sm font-bold text-white" style={{
          textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
        }}>
          Comentários
        </h3>
        <button 
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto p-4">
        {lastTwoComments && lastTwoComments.length > 0 ? (
          <div className="space-y-3">
            {lastTwoComments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <div className="w-8 h-8 flex-shrink-0 overflow-hidden rounded-full">
                  <img
                    src={getAvatarUrl(comment.habbo_name)}
                    alt={comment.habbo_name}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">
                      {comment.habbo_name}
                    </span>
                    <span className="text-xs text-white/60">
                      {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-white/90">{comment.comment_text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/60 text-sm">
            Nenhum comentário ainda
          </div>
        )}
      </div>

      {/* Campo de comentário */}
      {habboAccount && (
        <div className="p-4 border-t border-white/20">
          <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
            <div className="w-8 h-8 flex-shrink-0 overflow-hidden rounded-full">
              <img
                src={habboAccount?.habbo_name
                  ? `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboAccount.habbo_name}&size=m&direction=2&head_direction=2&headonly=1`
                  : `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-&size=m&direction=2&head_direction=2&headonly=1`
                }
                alt={habboAccount.habbo_name}
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-&size=m&direction=2&head_direction=2&headonly=1`;
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
  onNavigateToProfile: (username: string) => void;
}

export const FriendsPhotoFeed: React.FC<FriendsPhotoFeedProps> = ({
  currentUserName,
  hotel,
  onNavigateToProfile
}) => {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { habboAccount, isLoggedIn } = useAuth();
  const {
    data: photos,
    isLoading,
    error,
    refetch
  } = useFriendsPhotos(currentUserName, hotel);

  const [commentsModalPhoto, setCommentsModalPhoto] = useState<EnhancedPhoto | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidar cache e forçar busca completa
      await queryClient.invalidateQueries({ 
        queryKey: ['friends-photos'] 
      });
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

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
        <div className="text-center">
          <div className="text-4xl mb-4">👤</div>
          <p className="text-white/80 mb-2 font-semibold">
            {t('pages.console.loginRequired')}
          </p>
          <p className="text-white/60 text-sm">
            {t('pages.console.loginRequiredDescription')}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white/60 mx-auto mb-4" />
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
          <div className="text-4xl mb-4">📷</div>
          <p className="text-white/60 mb-2">{t('pages.console.noPhotos')}</p>
          <p className="text-white/40 text-sm">{t('pages.console.noPhotosDescription')}</p>
        </div>
      </div>
    );
  }

      return (
        <div className="space-y-4 relative overflow-hidden">
          {/* Header do feed */}
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-white">
              {t('pages.console.feedTitle')}
            </h3>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-white/60 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Atualizar feed"
            >
              {isRefreshing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Lista de fotos */}
          <div className="space-y-4">
            {photos.map((photo, index) => (
              <EnhancedPhotoCard
                key={photo.id}
                photo={{
                  id: photo.id,
                  photo_id: photo.id,
                  userName: photo.userName,
                  imageUrl: photo.imageUrl,
                  date: photo.date,
                  likes: [],
                  likesCount: photo.likes,
                  userLiked: false,
                  type: 'PHOTO' as const,
                  caption: photo.caption || '',
                  roomName: photo.roomName || '',
                  timestamp: photo.timestamp
                } as EnhancedPhoto}
                onUserClick={(userName) => onNavigateToProfile(userName)}
                onLikesClick={() => {}}
                onCommentsClick={() => setCommentsModalPhoto({
                  id: photo.id,
                  photo_id: photo.id,
                  userName: photo.userName,
                  imageUrl: photo.imageUrl,
                  date: photo.date,
                  likes: [],
                  likesCount: photo.likes,
                  userLiked: false,
                  type: 'PHOTO' as const,
                  caption: photo.caption || '',
                  roomName: photo.roomName || '',
                  timestamp: photo.timestamp
                } as EnhancedPhoto)}
                showDivider={index < photos.length - 1}
              />
            ))}
          </div>

          {/* Modal de Comentários - Desliza de baixo para cima */}
          {commentsModalPhoto && (
            <div className="absolute inset-0 z-50 flex items-end justify-center">
              {/* Modal que desliza de baixo para cima */}
              <div className="relative w-full max-w-md mx-4 bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col transform transition-all duration-300 ease-out">
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