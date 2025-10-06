import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, User, Calendar, MapPin, MoreHorizontal } from 'lucide-react';
import { usePhotoLikes } from '@/hooks/usePhotoLikes';
import { usePhotoComments } from '@/hooks/usePhotoComments';
import { PhotoCardProps, PhotoType } from '@/types/habbo';
import { cn } from '@/lib/utils';

export const EnhancedPhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onUserClick,
  onLikesClick,
  onCommentsClick,
  showDivider = false,
  className = ''
}) => {
  const [showLikesPopover, setShowLikesPopover] = useState(false);
  const [showCommentsPopover, setShowCommentsPopover] = useState(false);
  
  const handleLikesClick = () => {
    setShowLikesPopover(!showLikesPopover);
    setShowCommentsPopover(false);
  };
  
  const handleCommentsClick = () => {
    setShowCommentsPopover(!showCommentsPopover);
    setShowLikesPopover(false);
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
    lastTwoComments 
  } = usePhotoComments(photo.photo_id);

  const getAvatarUrl = (userName: string) => {
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(userName)}&size=s&direction=2&head_direction=3&headonly=1`;
  };

  const formatDate = (dateString: string) => {
    if (dateString === "Invalid Date") return "Há alguns dias";
    return dateString;
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

  const getRecentLikers = () => {
    const currentUserLike = likes.find(like => like.user_id === photo.userLiked);
    const otherLikes = likes.filter(like => like.user_id !== photo.userLiked);
    
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
              src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${photo.userName}&size=l&direction=2&head_direction=3&headonly=1`}
              alt={photo.userName}
              className="w-full h-full cursor-pointer transition-opacity object-cover"
              style={{ imageRendering: 'pixelated' }}
              onClick={() => onUserClick(photo.userName)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${encodeURIComponent(photo.userName)}&size=l&direction=2&head_direction=3&headonly=1`;
              }}
            />
          </div>
          <div className="flex-1">
            <button
              onClick={() => onUserClick(photo.userName)}
              className="font-semibold text-white hover:text-yellow-400 transition-colors"
            >
              {photo.userName}
            </button>
            <div className="text-xs text-white/60">
              {formatDate(photo.date)}
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
          className="w-full h-auto object-cover"
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
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black/90 border border-white/20 rounded-lg shadow-xl max-w-xs w-full max-h-64">
            <div className="p-3 border-b border-white/10">
              <h3 className="text-white font-semibold text-sm">Curtidas</h3>
            </div>
            <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              <div className="p-4 text-center text-white/60 text-sm">
                Sistema de curtidas em desenvolvimento
              </div>
            </div>
          </div>
        )}
        
        {/* Popover de Comentários */}
        {showCommentsPopover && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black/90 border border-white/20 rounded-lg shadow-xl max-w-xs w-full max-h-64">
            <div className="p-3 border-b border-white/10">
              <h3 className="text-white font-semibold text-sm">Comentários</h3>
            </div>
            <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              <div className="p-4 text-center text-white/60 text-sm">
                Sistema de comentários em desenvolvimento
              </div>
            </div>
          </div>
        )}
      </div>

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
                  className="w-6 h-6 rounded-full border-2 border-background overflow-hidden"
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
              {hasMoreLikes ? `e mais ${likesCount - recentLikers.length}` : `${likesCount} curtida${likesCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* Campo para novo comentário - sempre visível */}
      <div className="px-1 py-2 bg-transparent">
        <form className="flex items-center gap-2">
          {/* Avatar do usuário logado */}
          <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
            <img
              src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=Beebop&size=m&direction=4&head_direction=2&headonly=1`}
              alt="Beebop"
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=Beebop&size=m&direction=4&head_direction=2&headonly=1`;
              }}
            />
          </div>
          
          {/* Campo de texto */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Adicione um comentário..."
              className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 text-sm"
            />
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
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setShowLikesPopover(false);
            setShowCommentsPopover(false);
          }}
        />
      )}
    </div>
  );
};
