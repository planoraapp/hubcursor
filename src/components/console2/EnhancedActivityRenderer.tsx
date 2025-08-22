import React, { useState } from 'react';
import { HotelFeedActivity } from '@/hooks/useHotelGeneralFeed';
import { DirectFriendActivity } from '@/hooks/useFriendsActivitiesDirect';
import { habboProxyService } from '@/services/habboProxyService';
import { cn } from '@/lib/utils';

interface EnhancedActivityRendererProps {
  activity: HotelFeedActivity | DirectFriendActivity;
  className?: string;
  onUserClick?: (username: string) => void;
}

const formatActivityTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return 'agora mesmo';
  } else if (minutes < 60) {
    return `${minutes}m atrás`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `${days}d atrás`;
  }
};

const getActivityIcon = (activity: HotelFeedActivity | DirectFriendActivity): string => {
  if ('type' in activity) {
    // HotelFeedActivity
    switch (activity.type) {
      case 'look_change': return '👕';
      case 'motto_change': return '💬';
      case 'badge': return '🏆';
      case 'friends': return '👥';
      case 'photos': return '📸';
      case 'groups': return '🏷️';
      case 'online': return '🟢';
      default: return '✨';
    }
  } else {
    // DirectFriendActivity - use text matching
    const activityText = activity.activity.toLowerCase();
    if (activityText.includes('visual')) return '👕';
    if (activityText.includes('missão') || activityText.includes('motto')) return '💬';
    if (activityText.includes('emblema') || activityText.includes('badge')) return '🏆';
    if (activityText.includes('amigo') || activityText.includes('friend')) return '👥';
    if (activityText.includes('foto') || activityText.includes('photo')) return '📸';
    if (activityText.includes('grupo') || activityText.includes('group')) return '🏷️';
    if (activityText.includes('online')) return '🟢';
    return '✨';
  }
};

const renderActivityDetails = (activity: HotelFeedActivity | DirectFriendActivity) => {
  if (!('type' in activity) || !activity.details) {
    return null;
  }

  const details = activity.details;

  return (
    <div className="mt-2 space-y-2">
      {/* New Friends */}
      {details.newFriends && details.newFriends.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/70">Novos amigos:</span>
          <div className="flex gap-1">
            {details.newFriends.slice(0, 3).map((friend, idx) => (
              <span key={idx} className="text-xs text-foreground/80 bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">
                {friend.name}
              </span>
            ))}
            {details.newFriends.length > 3 && (
              <span className="text-xs text-muted-foreground/60">+{details.newFriends.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* New Badges */}
      {details.newBadges && details.newBadges.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/70">Emblemas:</span>
          <div className="flex gap-1">
            {details.newBadges.slice(0, 2).map((badge, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md border border-secondary/30">
                <img 
                  src={`https://images.habbo.com/c_images/album1584/${badge.code}.png`}
                  alt={badge.name || badge.code}
                  className="w-3 h-3 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = `https://www.habbo.com.br/habbo-imaging/badge/${badge.code}.gif`;
                  }}
                />
                <span className="text-xs text-foreground/80">{badge.name || badge.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Groups */}
      {details.newGroups && details.newGroups.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/70">Grupos:</span>
          <div className="flex gap-1">
            {details.newGroups.slice(0, 2).map((group, idx) => (
              <span key={idx} className="text-xs text-foreground/80 bg-accent/40 px-1.5 py-0.5 rounded-md border border-accent/30">
                {group.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* New Photos */}
      {details.newPhotos && details.newPhotos.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/70">Fotos:</span>
          <div className="flex gap-1">
            {details.newPhotos.slice(0, 2).map((photo, idx) => (
              <div key={idx} className="w-8 h-8 bg-muted/50 rounded border border-border/30 flex items-center justify-center">
                <span className="text-xs">📸</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Motto */}
      {details.newMotto && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/70">Nova missão:</span>
          <span className="text-xs text-foreground/80 italic bg-muted/30 px-2 py-1 rounded-md">"{details.newMotto}"</span>
        </div>
      )}
    </div>
  );
};

export const EnhancedActivityRenderer: React.FC<EnhancedActivityRendererProps> = ({ 
  activity, 
  className = "",
  onUserClick
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Generate avatar URL with fallback
  const avatarUrl = React.useMemo(() => {
    if (avatarError) {
      return habboProxyService.getAvatarUrl('lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62', 'xs', true);
    }
    if (activity.figureString) {
      return habboProxyService.getAvatarUrl(activity.figureString, 'xs', true);
    }
    return habboProxyService.getAvatarUrl('lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62', 'xs', true);
  }, [activity.figureString, avatarError]);

  return (
    <div className={cn("flex items-start gap-3 transition-all duration-200", className)}>
      {/* Avatar */}
      <div className="flex-shrink-0 relative">
        {isImageLoading && (
          <div className="w-8 h-8 rounded-lg bg-muted/30 border border-border/20 animate-pulse flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-muted/50"></div>
          </div>
        )}
        <img
          src={avatarUrl}
          alt={`Avatar de ${activity.username}`}
          className={cn(
            "w-8 h-8 rounded-lg bg-card border border-border/30 transition-opacity",
            isImageLoading ? "opacity-0 absolute inset-0" : "opacity-100"
          )}
          onError={() => setAvatarError(true)}
          onLoad={() => setIsImageLoading(false)}
          loading="lazy"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          {onUserClick ? (
            <button
              onClick={() => onUserClick(activity.username)}
              className="font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer text-sm truncate max-w-[120px] hover:underline"
            >
              {activity.username}
            </button>
          ) : (
            <span className="font-medium text-primary text-sm truncate max-w-[120px]">
              {activity.username}
            </span>
          )}
          <span className="text-xs flex-shrink-0">
            {getActivityIcon(activity)}
          </span>
          <span className="text-xs text-muted-foreground/70 ml-auto tabular-nums">
            {formatActivityTime(activity.timestamp)}
          </span>
        </div>
        
        <p className="text-sm text-foreground/80 leading-relaxed">
          {activity.activity}
        </p>

        {/* Enhanced Details */}
        {renderActivityDetails(activity)}
      </div>
    </div>
  );
};