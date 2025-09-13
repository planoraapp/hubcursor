
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProfileActionsProps {
  username: string;
  onLike?: () => void;
  onComment?: () => void;
  onFollow?: () => void;
  hasLiked?: boolean;
  isFollowing?: boolean;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  username,
  onLike,
  onComment,
  onFollow,
  hasLiked = false,
  isFollowing = false
}) => {
  const navigate = useNavigate();
  const { habboAccount } = useAuth();
  
  const isOwnProfile = habboAccount?.habbo_name?.toLowerCase() === username.toLowerCase();

  const handleViewHome = () => {
    navigate(`/enhanced-home/${username}`);
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleViewHome}
        variant="outline"
        size="sm"
        className="flex-1"
      >
        <Home className="w-4 h-4 mr-1" />
        {isOwnProfile ? 'Ver Minha Home' : 'Ver Home'}
      </Button>
      
      {!isOwnProfile && (
        <>
          <Button
            onClick={onLike}
            variant={hasLiked ? "default" : "outline"}
            size="sm"
            className="flex-1"
          >
            <Heart className={`w-4 h-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
            {hasLiked ? 'Curtido' : 'Curtir'}
          </Button>
          
          <Button
            onClick={onComment}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Comentar
          </Button>
          
          <Button
            onClick={onFollow}
            variant={isFollowing ? "default" : "outline"}
            size="sm"
            className="flex-1"
          >
            <UserPlus className={`w-4 h-4 mr-1 ${isFollowing ? 'fill-current' : ''}`} />
            {isFollowing ? 'Seguindo' : 'Seguir'}
          </Button>
        </>
      )}
    </div>
  );
};

