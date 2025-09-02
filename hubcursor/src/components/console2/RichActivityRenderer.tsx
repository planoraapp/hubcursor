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
          <span className="text-xs text-white/70">Novo visual:</span>
          <img
            src={habboProxyService.getAvatarUrl(activity.figureString, 'xs', false)}
            alt="Novo visual"
            className="w-8 h-8 rounded-lg"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>
    );
  }
  
  // For badges, extract badge code and show real badge image
  if (activityText.includes('emblema') || activityText.includes('badge')) {
    const badgeMatch = activity.activity.match(/emblema "([^"]+)"/);
    if (badgeMatch) {
      const badgeName = badgeMatch[1];
      // Try to extract badge code for real image
      const codeMatch = activity.activity.match(/([A-Z0-9]{3,})/);
      const badgeCode = codeMatch ? codeMatch[1] : 'ADM';
      
      return (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70">Emblema:</span>
            <div className="flex items-center gap-2">
              <img
                src={`https://images.habbo.com/c_images/album1584/${badgeCode}.png`}
                alt={badgeName}
                className="w-6 h-6"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="gold" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9 8.91 8.26 12 2"/></svg>';
                }}
              />
              <span className="text-xs text-yellow-200 font-medium">{badgeName}</span>
            </div>
          </div>
        </div>
      );
    }
  }
  
  // For groups, show group info with badge
  if (activityText.includes('grupo')) {
    const groupMatch = activity.activity.match(/grupo "([^"]+)"/);
    if (groupMatch) {
      const groupName = groupMatch[1];
      return (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70">Grupo:</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500/20 border border-blue-500/30 rounded flex items-center justify-center">
                <span className="text-xs">🏷️</span>
              </div>
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
            <span className="text-xs text-white/70">Quarto:</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500/20 border border-green-500/30 rounded flex items-center justify-center">
                <span className="text-xs">🏠</span>
              </div>
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
    <div className={cn("flex items-start gap-3", className)}>
      {/* Avatar - larger and no border */}
      <div className="flex-shrink-0">
        <img
          src={avatarUrl}
          alt={`Avatar de ${activity.username}`}
          className="w-12 h-12 habbo-avatar-no-border"
          onError={() => setAvatarError(true)}
          onLoad={() => setIsImageLoading(false)}
          loading="lazy"
        />
      </div>
      
      {/* Content aligned to the left */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          {onUserClick ? (
            <button
              onClick={() => onUserClick(activity.username)}
              className="font-bold text-white hover:text-yellow-300 transition-colors text-xs habbo-text-shadow"
            >
              {activity.username}
            </button>
          ) : (
            <span className="font-bold text-white text-xs habbo-text-shadow">
              {activity.username}
            </span>
          )}
          <span className="text-sm flex-shrink-0">
            {getActivityIcon(activity.activity)}
          </span>
          <span className="text-[10px] text-white/40 ml-auto">
            {formatActivityTime(activity.timestamp)}
          </span>
        </div>
        
        <p className="text-xs text-white/80 leading-tight">
          {activity.activity}
        </p>

        {/* Rich Activity Thumbnail/Details */}
        {renderActivityThumbnail(activity)}
      </div>
    </div>
  );
};