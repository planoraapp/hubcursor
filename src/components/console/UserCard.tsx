
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Eye, Camera, Users, Heart, UserPlus, UserCheck } from 'lucide-react';
import { habboProxyService } from '@/services/habboProxyService';
import { useHabboPhotos } from '@/hooks/useHabboPhotos';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface UserCardProps {
  user: any;
  onSelect: (user: any) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onSelect }) => {
  const { habboAccount } = useUnifiedAuth();
  
  // Get photos count for this user
  const hotel = user.hotel === 'br' ? 'com.br' : (user.hotel || 'com.br');
  const { habboPhotos = [] } = useHabboPhotos(user.habbo_name, hotel);

  // Get follow system data
  const { 
    isFollowing, 
    followersCount, 
    handleFollow, 
    handleUnfollow,
    isFollowLoading,
    isUnfollowLoading
  } = useFollowSystem({ 
    targetHabboId: user.habbo_id, 
    targetHabboName: user.habbo_name 
  });

  const avatarUrl = user.figure_string 
    ? habboProxyService.getAvatarUrl(user.figure_string, 'm')
    : `https://www.habbo.${hotel}/habbo-imaging/avatarimage?user=${user.habbo_name}&size=m&direction=2&head_direction=3&action=std`;

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!habboAccount) return;
    
    if (isFollowing) {
      await handleUnfollow();
    } else {
      await handleFollow(habboAccount.habbo_name);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer group">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden flex items-center justify-center">
              {user.figure_string ? (
                <img 
                  src={avatarUrl}
                  alt={user.habbo_name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://www.habbo.${hotel}/habbo-imaging/avatarimage?user=${user.habbo_name}&size=m`;
                  }}
                />
              ) : (
                <User className="w-6 h-6 text-white/60" />
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-white text-sm truncate">
                {user.habbo_name}
              </h3>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                user.online ? 'bg-green-400' : 'bg-gray-400'
              }`} />
            </div>
            
            {user.motto && (
              <p className="text-white/60 text-xs italic truncate mb-1">
                "{user.motto}"
              </p>
            )}

            {/* Social Stats */}
            <div className="flex items-center gap-3 text-xs text-white/50 mb-1">
              <div className="flex items-center gap-1">
                <Camera className="w-3 h-3" />
                <span>{habboPhotos.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{followersCount}</span>
              </div>
              <span className="text-white/30">•</span>
              <span>Hotel: {user.hotel?.toUpperCase()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {/* Follow/Unfollow Button */}
            {habboAccount && user.habbo_name !== habboAccount.habbo_name && (
              <Button
                size="sm"
                variant={isFollowing ? "secondary" : "default"}
                onClick={handleFollowClick}
                disabled={isFollowLoading || isUnfollowLoading}
                className="text-xs px-2 py-1 h-6"
              >
                {isFollowLoading || isUnfollowLoading ? (
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserCheck className="w-3 h-3 mr-1" />
                    Seguindo
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3 mr-1" />
                    Seguir
                  </>
                )}
              </Button>
            )}
            
            {/* View Profile Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(user);
              }}
              className="text-white/70 hover:text-white hover:bg-white/10 text-xs px-2 py-1 h-6"
            >
              <Eye className="w-3 h-3 mr-1" />
              Ver
            </Button>
          </div>
        </div>

        {/* Photos Preview */}
        {habboPhotos.length > 0 && (
          <div className="mt-3 pt-2 border-t border-white/10">
            <div className="flex gap-1 overflow-hidden">
              {habboPhotos.slice(0, 3).map((photo, index) => (
                <div key={index} className="w-8 h-8 bg-white/5 rounded flex-shrink-0 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ))}
              {habboPhotos.length > 3 && (
                <div className="w-8 h-8 bg-white/5 rounded flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-white/60">+{habboPhotos.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
