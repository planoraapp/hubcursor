import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, User, Calendar, MapPin, MoreHorizontal, Send } from 'lucide-react';
import { usePhotoLikes } from '@/hooks/usePhotoLikes';
import { usePhotoComments } from '@/hooks/usePhotoComments';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/I18nContext';
import { useCommentRateLimit } from '@/hooks/useCommentRateLimit';
import { validateComment, sanitizeComment, COMMENT_CONFIG } from '@/utils/commentValidation';
import { PhotoCardProps, PhotoType } from '@/types/habbo';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const EnhancedPhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onUserClick,
  onLikesClick,
  onCommentsClick,
  showDivider = false,
  className = ''
}) => {
  const { t, language } = useI18n();
  const { habboAccount } = useAuth();
  const [showLikesPopover, setShowLikesPopover] = useState(false);
  const [showCommentsPopover, setShowCommentsPopover] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Rate limiting
  const { checkCanComment, recordComment } = useCommentRateLimit();
  
  const handleLikesClick = () => {
    setShowLikesPopover(!showLikesPopover);
  };
  
  const handleCommentsClick = () => {
    const photoId = photo.photo_id || photo.id;
    onCommentsClick(photoId);
    setShowLikesPopover(false);
  };
  
  /**
   * Enviar comentário com validação e rate limiting
   */
  const handleSubmitComment = async () => {
    if (!habboAccount) {
      toast.error(t('toast.loginRequired'));
      return;
    }

    const photoId = photo.photo_id || photo.id;
    
    // Verificar rate limit
    const rateLimitStatus = checkCanComment(photoId);
    if (!rateLimitStatus.canComment) {
      toast.error(rateLimitStatus.error || t('toast.commentingTooFast'));
      return;
    }

    // Validar comentário
    const validation = validateComment(commentText);
    if (!validation.isValid) {
      toast.error(validation.error || t('toast.invalidComment'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const sanitized = sanitizeComment(commentText);
      
      // TODO: Implementar envio ao banco de dados via usePhotoComments
      await addComment(sanitized);
      
      // Registrar ação para rate limiting
      recordComment(photoId);
      
      // Limpar campo
      setCommentText('');
      toast.success(t('toast.commentSent'));
      
    } catch (error: any) {
      console.error('Erro ao enviar comentário:', error);
      toast.error(t('toast.commentError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const { 
    likes, 
    likesCount, 
    userLiked, 
    toggleLike, 
    isToggling 
  } = usePhotoLikes(photo.photo_id);

  const { 
    commentsCount, 
    lastTwoComments,
    addComment,
    isAddingComment
  } = usePhotoComments(photo.photo_id);

  const getPhotoOwnerAvatarUrl = (userName: string) => {
    // Priorizar informações de hotel vindas da própria foto
    let domain =
      (photo.hotelDomain as string | undefined) ||
      (photo.hotel as string | undefined) ||
      'com.br';

    if (domain === 'br') {
      domain = 'com.br';
    }

    return `https://www.habbo.${domain}/habbo-imaging/avatarimage?user=${encodeURIComponent(
      userName,
    )}&size=l&direction=2&head_direction=3&headonly=1`;
  };

  const getRelativeTime = (dateString: string, timestamp?: number | string) => {
    // Se não houver nenhuma informação de data, assume "agora"
    if ((!dateString || dateString === 'Invalid Date') && !timestamp) {
      return t('time.now');
    }

    let photoDate: Date | null = null;

    // 1) Priorizar timestamp bruto (mais confiável)
    if (timestamp) {
      if (typeof timestamp === 'number') {
        // Habbo normalmente usa milissegundos; se vier em segundos, converte
        const ts =
          timestamp < 10_000_000_000
            ? timestamp * 1000
            : timestamp;
        photoDate = new Date(ts);
      } else if (typeof timestamp === 'string') {
        const parsed = Date.parse(timestamp);
        if (!Number.isNaN(parsed)) {
          photoDate = new Date(parsed);
        }
      }
    }

    // 2) Fallback: tentar usar a string de data (ex: "20/12/2025")
    if (!photoDate || Number.isNaN(photoDate.getTime())) {
      if (dateString) {
        if (dateString.includes('/')) {
          // Formato DD/MM/YYYY
          const parts = dateString.split('/');
          if (parts.length === 3) {
            const [dd, mm, yyyy] = parts.map(Number);
            photoDate = new Date(yyyy, mm - 1, dd);
          } else {
            photoDate = new Date(dateString);
          }
        } else {
          photoDate = new Date(dateString);
        }
      }
    }

    // Se ainda estiver inválida, devolve a string bruta para não ficar "Agora" sempre
    if (!photoDate || Number.isNaN(photoDate.getTime())) {
      return dateString || t('time.now');
    }

    const now = new Date();
    const diffMs = now.getTime() - photoDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    // Menos de 1 minuto: "agora"
    if (diffMinutes < 1) {
      return t('time.now');
    }

    // Menos de 1 hora: "há X min"
    if (diffMinutes < 60) {
      return `há ${diffMinutes} min`;
    }

    // Menos de 24 horas: "há Xh"
    if (diffHours < 24) {
      return `há ${diffHours}h`;
    }

    // A partir de 24h: exibir data absoluta, com formato por idioma
    const lang = (language || 'pt').toLowerCase();
    const isEnglish = lang.startsWith('en');
    const isSpanish = lang.startsWith('es');

    const locale = isEnglish ? 'en-US' : isSpanish ? 'es-ES' : 'pt-BR';

    return photoDate.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  const formatDate = (dateString: string, timestamp?: number | string) => {
    return getRelativeTime(dateString, timestamp);
  };

  const getPhotoTypeClass = (type: PhotoType, contentWidth?: number, contentHeight?: number) => {
    const baseClass = "card__image";
    
    switch (type) {
      case 'SELFIE':
        return `${baseClass} card__image--selfie`;
      case 'PHOTO':
        return `${baseClass} card__image--photo`;
      case 'USER_CREATION':
        if (contentWidth && contentHeight) {
          return contentHeight < contentWidth 
            ? `${baseClass} card__image--wide`
            : `${baseClass} card__image--tall`;
        }
        return `${baseClass} card__image--photo`;
      default:
        return `${baseClass} card__image--photo`;
    }
  };

  const getAvatarUrl = (userName: string) => {
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(
      userName,
    )}&size=s&direction=2&head_direction=3&headonly=1`;
  };

  const getRecentLikers = () => {
    const currentUserId = habboAccount?.id;
    const currentUserLike = currentUserId
      ? likes.find(like => like.user_id === currentUserId)
      : undefined;
    const otherLikes = currentUserId
      ? likes.filter(like => like.user_id !== currentUserId)
      : likes;
    
    if (currentUserLike) {
      return [currentUserLike, ...otherLikes.slice(0, 4)];
    }
    return otherLikes.slice(0, 5);
  };

  const recentLikers = getRecentLikers();
  const hasMoreLikes = likesCount > recentLikers.length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* User Info */}
      <div className="px-1 py-2 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex-shrink-0 overflow-hidden">
            <img
              src={getPhotoOwnerAvatarUrl(photo.userName)}
              alt={photo.userName}
              className="w-full h-full cursor-pointer object-cover"
              loading="lazy"
              style={{ imageRendering: 'pixelated' }}
              onClick={() => onUserClick(photo.userName, photo)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getPhotoOwnerAvatarUrl(photo.userName);
              }}
            />
          </div>
          <div className="flex-1">
            <button
              onClick={() => onUserClick(photo.userName, photo)}
              className="font-semibold text-white hover:text-yellow-400 transition-colors"
            >
              {photo.userName}
            </button>
            <div className="text-xs text-white/60">
              {formatDate(
                photo.date,
                typeof photo.timestamp === 'number'
                  ? photo.timestamp
                  : photo.timestamp
                  ? Date.parse(photo.timestamp as string)
                  : undefined
              )}
            </div>
          </div>
          <button className="text-white/60 hover:text-white transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Photo */}
      <div className="relative">
        <img
          src={photo.imageUrl}
          alt={`Foto de ${photo.userName}`}
          className="w-full h-auto object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        
        {/* Hub.gif logo - canto inferior esquerdo */}
        <div className="absolute bottom-2 left-2">
          <img
            src="/hub.gif"
            alt="Hub"
            className="w-6 h-6 opacity-80"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        
        {/* Popover de Likes */}
        {showLikesPopover && (
          <div className="absolute inset-0 z-50 flex items-end justify-center">
            {/* Overlay escuro */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowLikesPopover(false)}
            ></div>
            
            {/* Modal que desliza de baixo para cima */}
            <div className="relative w-full max-w-md mx-4 bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-t-2xl shadow-2xl max-h-[50vh] flex flex-col transform transition-all duration-300 ease-out">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-400 to-yellow-300 border-b-2 border-yellow-500 rounded-t-xl">
                <h3 className="text-sm font-bold text-white" style={{
                  textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
                }}>
                  Curtidas
                </h3>
                <button 
                  onClick={() => setShowLikesPopover(false)}
                  className="text-white hover:bg-white/20 rounded-full p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-center text-white/60 text-sm">
                  Sistema de curtidas em desenvolvimento
                </div>
              </div>
            </div>
          </div>
        )}
        

      {/* Caption and Room */}
      {(photo.caption || photo.roomName) && (
        <div className="space-y-1">
          {photo.caption && (
            <p className="text-sm text-white/90">{photo.caption}</p>
          )}
          {photo.roomName && (
            <div className="flex items-center gap-1 text-xs text-white/60">
              <MapPin className="w-3 h-3" />
              <span>{photo.roomName}</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-1 py-2 bg-transparent">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLike}
              disabled={isToggling}
              className={`flex items-center gap-2 transition-colors ${
                userLiked ? 'text-red-500' : 'text-white/60 hover:text-red-500'
              }`}
            >
              <Heart className={`w-6 h-6 ${userLiked ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={handleLikesClick}
              className="text-sm font-medium hover:underline text-white/60 hover:text-white"
            >
              {likesCount}
            </button>
          </div>
          
          <button
            onClick={handleCommentsClick}
            className="flex items-center gap-2 text-white/60 transition-colors hover:text-white"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm font-medium">{commentsCount}</span>
          </button>
        </div>
      </div>

      {/* Recent Likers */}
      {likesCount > 0 && (
        <div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {recentLikers.slice(0, 5).map((like, index) => (
                <div
                  key={like.id}
                  className="w-6 h-6 overflow-hidden"
                  style={{ zIndex: 5 - index }}
                >
                  <img
                    src={getAvatarUrl(like.habbo_name)}
                    alt={`Avatar de ${like.habbo_name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${encodeURIComponent(like.habbo_name)}&size=s&direction=2&head_direction=3&headonly=1`;
                    }}
                  />
                </div>
              ))}
            </div>
            
            <button
              onClick={handleLikesClick}
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              {hasMoreLikes ? `e mais ${likesCount - recentLikers.length}` : `${likesCount} ${likesCount === 1 ? t('pages.console.likes') : t('pages.console.likesPlural')}`}
            </button>
          </div>
        </div>
      )}

      {/* Campo para novo comentário - sempre visível */}
      <div className="px-1 py-2 bg-transparent">
        <form className="flex items-center gap-2" onSubmit={(e) => {
          e.preventDefault();
          handleSubmitComment();
        }}>
          {/* Avatar do usuário logado */}
          <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
            <img
              src={habboAccount?.habbo_name
                ? `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboAccount.habbo_name}&size=m&direction=2&head_direction=2&headonly=1`
                : `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-&size=m&direction=2&head_direction=2&headonly=1`
              }
              alt={habboAccount?.habbo_name || 'Guest'}
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-&size=m&direction=2&head_direction=2&headonly=1`;
              }}
            />
          </div>
          
          {/* Campo de texto */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={t('pages.console.addComment')}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={COMMENT_CONFIG.MAX_LENGTH}
              disabled={isSubmitting}
              className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 text-sm disabled:opacity-50"
            />
            
            {/* Botão de enviar - só aparece quando há texto */}
            {commentText.trim() && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('pages.console.sendComment')}
              >
                <img 
                  src="/assets/write.png" 
                  alt={t('pages.console.sendComment')} 
                  className="w-4 h-4" 
                />
              </button>
            )}
            
            {/* Contador de caracteres */}
            {commentText.length > COMMENT_CONFIG.MAX_LENGTH * 0.8 && (
              <div className="absolute -bottom-5 right-0 text-xs text-white/60">
                {commentText.length}/{COMMENT_CONFIG.MAX_LENGTH}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Divider */}
      {showDivider && (
        <div className="border-t border-white/10 pt-3" />
      )}

      {/* Overlay para fechar popovers */}
      {(showLikesPopover || showCommentsPopover) && (
        <div 
          className="absolute inset-0 z-40 bg-transparent"
          onClick={() => {
            setShowLikesPopover(false);
            setShowCommentsPopover(false);
          }}
        />
      )}
      </div>
    </div>
  );
};

