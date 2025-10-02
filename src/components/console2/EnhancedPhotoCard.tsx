import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, User, Calendar, MapPin } from 'lucide-react';
import { usePhotoLikes } from '@/hooks/usePhotoLikes';
import { usePhotoComments } from '@/hooks/usePhotoComments';
import { LikeUsersModal } from '@/components/modals/LikeUsersModal';
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
  const [showLikesModal, setShowLikesModal] = useState(false);
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
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 flex-shrink-0">
          <img
            src={getAvatarUrl(photo.userName)}
            alt={`Avatar de ${photo.userName}`}
            className="w-full h-full object-contain bg-transparent"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${encodeURIComponent(photo.userName)}&size=s&direction=2&head_direction=3&headonly=1`;
            }}
          />
        </div>
        <button
          onClick={() => onUserClick(photo.userName)}
          className="text-white font-semibold hover:text-blue-300 transition-colors"
        >
          {photo.userName}
        </button>
        <span className="text-white/60 text-xs ml-auto flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(photo.date)}
        </span>
      </div>

      {/* Photo */}
      <div className="relative">
        <img
          src={photo.imageUrl}
          alt={`Foto de ${photo.userName}`}
          className={cn(
            "w-full h-auto object-contain rounded-lg",
            getPhotoTypeClass(photo.type, photo.contentWidth, photo.contentHeight)
          )}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>

      {/* Caption and Room */}
      {(photo.caption || photo.roomName) && (
        <div className="px-1 space-y-1">
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
      <div className="flex items-center gap-4 px-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleLike}
          disabled={isToggling}
          className={cn(
            "flex items-center gap-2 text-sm",
            userLiked ? "text-red-500 hover:text-red-400" : "text-white/70 hover:text-white"
          )}
        >
          <Heart className={cn("w-4 h-4", userLiked && "fill-current")} />
          <span>{likesCount}</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onCommentsClick(photo.photo_id)}
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{commentsCount}</span>
        </Button>
      </div>

      {/* Recent Likers */}
      {likesCount > 0 && (
        <div className="px-1">
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
              onClick={() => setShowLikesModal(true)}
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              {hasMoreLikes ? `e mais ${likesCount - recentLikers.length}` : `${likesCount} curtida${likesCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* Divider */}
      {showDivider && (
        <div className="border-t border-white/10 pt-3" />
      )}

      {/* Likes Modal */}
      <LikeUsersModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        likes={likes}
        photoId={photo.photo_id}
        onUserClick={onUserClick}
      />
    </div>
  );
};
