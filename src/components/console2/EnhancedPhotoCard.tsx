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
        
        {/* Popover de Comentários */}
      {showCommentsPopover && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Overlay escuro */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCommentsPopover(false)}
          ></div>

          {/* Modal que desliza de baixo para cima do viewport do console */}
          <div className="relative w-full max-w-md mx-4 bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-t-2xl shadow-2xl max-h-[50vh] flex flex-col transform transition-all duration-300 ease-out mb-20">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-400 to-yellow-300 border-b-2 border-yellow-500 rounded-t-xl">
                <h3 className="text-sm font-bold text-white" style={{
                  textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
                }}>
                  Comentários
                </h3>
                <button 
                  onClick={() => setShowCommentsPopover(false)}
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
                  Sistema de comentários em desenvolvimento
                </div>
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
          className="absolute inset-0 z-40 bg-transparent"
          onClick={() => {
            setShowLikesPopover(false);
            setShowCommentsPopover(false);
          }}
        />
      )}
    </div>
  );
};
