import React, { useState } from 'react';
import { DirectFriendActivity } from '@/hooks/useFriendsActivitiesDirect';
import { habboProxyService } from '@/services/habboProxyService';
import { cn } from '@/lib/utils';

interface RichActivityRendererProps {
  activity: DirectFriendActivity;
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

const getActivityIcon = (activity: string): string => {
  const activityText = activity.toLowerCase();
  
  if (activityText.includes('emblema') || activityText.includes('badge')) return '🏆';
  if (activityText.includes('visual') || activityText.includes('mudou o visual')) return '👕';
  if (activityText.includes('grupo') || activityText.includes('group')) return '🏷️';
  if (activityText.includes('nível') || activityText.includes('level')) return '⬆️';
  if (activityText.includes('experiência') || activityText.includes('exp')) return '✨';
  if (activityText.includes('amizade') || activityText.includes('amigo') || activityText.includes('friend')) return '👥';
  if (activityText.includes('quarto') || activityText.includes('room')) return '🏠';
  if (activityText.includes('missão') || activityText.includes('motto')) return '💬';
  
  return '🌟';
};

const renderActivityThumbnail = (activity: DirectFriendActivity) => {
  const activityText = activity.activity.toLowerCase();
  
  // For visual changes, show avatar thumbnail
  if (activityText.includes('visual') && activity.figureString) {
    return (
      <div className="mt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">Novo visual:</span>
          <img
            src={habboProxyService.getAvatarUrl(activity.figureString, 'xs', false)}
            alt="Novo visual"
            className="w-6 h-6 rounded border border-white/20 bg-[#4A5568]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>
    );
  }
  
  // For badges, extract badge code and show badge image
  if (activityText.includes('emblema') || activityText.includes('badge')) {
    // Try to extract badge name from activity text
    const badgeMatch = activity.activity.match(/emblema "([^"]+)"/);
    if (badgeMatch) {
      const badgeName = badgeMatch[1];
      return (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Emblema conquistado:</span>
            <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded border border-yellow-500/30">
              <span className="text-xs">🏆</span>
              <span className="text-xs text-yellow-200 font-medium">{badgeName}</span>
            </div>
          </div>
        </div>
      );
    }
  }
  
  // For groups, show group info
  if (activityText.includes('grupo')) {
    const groupMatch = activity.activity.match(/grupo "([^"]+)"/);
    if (groupMatch) {
      const groupName = groupMatch[1];
      return (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Grupo:</span>
            <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded border border-blue-500/30">
              <span className="text-xs">🏷️</span>
              <span className="text-xs text-blue-200 font-medium">{groupName}</span>
            </div>
          </div>
        </div>
      );
    }
  }
  
  // For rooms, show room info
  if (activityText.includes('quarto')) {
    const roomMatch = activity.activity.match(/quarto público "([^"]+)"/);
    if (roomMatch) {
      const roomName = roomMatch[1];
      return (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Quarto criado:</span>
            <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded border border-green-500/30">
              <span className="text-xs">🏠</span>
              <span className="text-xs text-green-200 font-medium">{roomName}</span>
            </div>
          </div>
        </div>
      );
    }
  }
  
  return null;
};

export const RichActivityRenderer: React.FC<RichActivityRendererProps> = ({ 
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
          <div className="w-8 h-8 rounded-lg bg-[#4A5568]/40 border border-white/20 animate-pulse flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white/30"></div>
          </div>
        )}
        <img
          src={avatarUrl}
          alt={`Avatar de ${activity.username}`}
          className={cn(
            "w-8 h-8 rounded-lg bg-[#4A5568] border border-white/20 transition-opacity",
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
              className="font-medium text-white hover:text-blue-300 transition-colors cursor-pointer text-sm truncate max-w-[120px] hover:underline"
            >
              {activity.username}
            </button>
          ) : (
            <span className="font-medium text-white text-sm truncate max-w-[120px]">
              {activity.username}
            </span>
          )}
          <span className="text-xs flex-shrink-0">
            {getActivityIcon(activity.activity)}
          </span>
          <span className="text-xs text-white/60 ml-auto tabular-nums">
            {formatActivityTime(activity.timestamp)}
          </span>
        </div>
        
        <p className="text-sm text-white/80 leading-relaxed">
          {activity.activity}
        </p>

        {/* Rich Activity Thumbnail/Details */}
        {renderActivityThumbnail(activity)}
      </div>
    </div>
  );
};