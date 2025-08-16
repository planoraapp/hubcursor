
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, UserPlus, MessageSquare, Send } from 'lucide-react';
import { useConsoleInteractions } from '@/hooks/useConsoleInteractions';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface SocialInteractionButtonsProps {
  targetHabboName: string;
  className?: string;
}

export const SocialInteractionButtons: React.FC<SocialInteractionButtonsProps> = ({
  targetHabboName,
  className = ''
}) => {
  const { isLoggedIn } = useUnifiedAuth();
  const [commentText, setCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);

  const {
    hasLiked,
    isFollowing,
    handleLike,
    handleFollow,
    handleAddComment,
    likesCount,
    followersCount,
    commentsCount,
  } = useConsoleInteractions(targetHabboName);

  const onSubmitComment = () => {
    if (commentText.trim()) {
      handleAddComment(commentText);
      setCommentText('');
      setShowCommentInput(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex gap-2">
        <Button
          variant={hasLiked ? "default" : "outline"}
          size="sm"
          onClick={handleLike}
          className="flex items-center gap-1"
        >
          <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </Button>

        <Button
          variant={isFollowing ? "default" : "outline"}
          size="sm"
          onClick={handleFollow}
          className="flex items-center gap-1"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isFollowing ? 'Seguindo' : 'Seguir'}</span>
          <span>({followersCount})</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="flex items-center gap-1"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{commentsCount}</span>
        </Button>
      </div>

      {showCommentInput && (
        <div className="flex gap-2">
          <Input
            placeholder="Escreva um comentário..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && onSubmitComment()}
          />
          <Button onClick={onSubmitComment} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
