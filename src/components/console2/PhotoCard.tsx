import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import { usePhotoLikes } from '@/hooks/usePhotoLikes';
import { usePhotoComments } from '@/hooks/usePhotoComments';

interface Photo {
  id: string;
  userName: string;
  imageUrl: string;
  date: string;
  likes: number;
}

interface PhotoCardProps {
  photo: Photo;
  onUserClick: (userName: string) => void;
  onLikesClick: (photoId: string) => void;
  onCommentsClick: (photoId: string) => void;
  showDivider?: boolean;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onUserClick,
  onLikesClick,
  onCommentsClick,
  showDivider = false
}) => {
  const { 
    likesCount, 
    userLiked, 
    toggleLike, 
    isToggling 
  } = usePhotoLikes(photo.id);

  const { 
    commentsCount, 
    lastTwoComments 
  } = usePhotoComments(photo.id);

  return (
    <div className="space-y-3">
      {/* User Info */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 flex-shrink-0">
          <img
            src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${photo.userName}&size=s&direction=2&head_direction=3&headonly=1`}
            alt={`Avatar de ${photo.userName}`}
            className="w-full h-full object-contain bg-transparent"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${photo.userName}&size=s&direction=2&head_direction=3&headonly=1`;
            }}
          />
        </div>
        <button
          onClick={() => onUserClick(photo.userName)}
          className="text-white font-semibold hover:text-blue-300 transition-colors"
        >
          {photo.userName}
        </button>
        <span className="text-white/60 text-xs ml-auto">
          {photo.date === "Invalid Date" ? "Há alguns dias" : photo.date}
        </span>
      </div>

      {/* Photo */}
      <div className="relative">
        <img
          src={photo.imageUrl}
          alt={`Foto de ${photo.userName}`}
          className="w-full h-auto object-contain rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 px-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleLike}
          disabled={isToggling}
          className={`p-2 transition-colors ${
            userLiked 
              ? 'text-red-400 hover:text-red-300' 
              : 'text-white/80 hover:text-red-400'
          } hover:bg-white/10`}
        >
          <Heart 
            className={`w-4 h-4 mr-1 ${userLiked ? 'fill-current' : ''}`} 
          />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onLikesClick(photo.id);
            }}
            className="hover:underline"
          >
            {likesCount}
          </button>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onCommentsClick(photo.id)}
          className="text-white/80 hover:text-white hover:bg-white/10 p-2"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          {commentsCount}
        </Button>
      </div>

      {/* Last 2 Comments Preview */}
      {lastTwoComments.length > 0 && (
        <div className="px-1 space-y-1">
          {lastTwoComments.map((comment) => (
            <div key={comment.id} className="text-xs text-white/80">
              <span className="font-semibold text-white">{comment.habbo_name}</span>{' '}
              <span>{comment.comment_text}</span>
            </div>
          ))}
          {commentsCount > 2 && (
            <button
              onClick={() => onCommentsClick(photo.id)}
              className="text-xs text-white/60 hover:text-white/80"
            >
              Ver todos os {commentsCount} comentários
            </button>
          )}
        </div>
      )}

      {/* Subtle divider between posts */}
      {showDivider && (
        <div className="w-full h-px bg-white/10 my-4" />
      )}
    </div>
  );
};