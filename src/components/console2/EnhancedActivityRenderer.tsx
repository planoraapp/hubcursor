import React from 'react';
import { HotelFeedActivity } from '@/hooks/useHotelGeneralFeed';
import { DirectFriendActivity } from '@/hooks/useFriendsActivitiesDirect';
import { habboProxyService } from '@/services/habboProxyService';

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
          <span className="text-xs text-white/50">Novos amigos:</span>
          <div className="flex gap-1">
            {details.newFriends.slice(0, 3).map((friend, idx) => (
              <span key={idx} className="text-xs text-white/70 bg-white/10 px-1.5 py-0.5 rounded">
                {friend.name}
              </span>
            ))}
            {details.newFriends.length > 3 && (
              <span className="text-xs text-white/50">+{details.newFriends.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* New Badges */}
      {details.newBadges && details.newBadges.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">Emblemas:</span>
          <div className="flex gap-1">
            {details.newBadges.slice(0, 2).map((badge, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <img 
                  src={`https://images.habbo.com/c_images/album1584/${badge.code}.png`}
                  alt={badge.name || badge.code}
                  className="w-3 h-3 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = `https://www.habbo.com.br/habbo-imaging/badge/${badge.code}.gif`;
                  }}
                />
                <span className="text-xs text-white/70">{badge.name || badge.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Groups */}
      {details.newGroups && details.newGroups.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">Grupos:</span>
          <div className="flex gap-1">
            {details.newGroups.slice(0, 2).map((group, idx) => (
              <span key={idx} className="text-xs text-white/70 bg-white/10 px-1.5 py-0.5 rounded">
                {group.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* New Photos */}
      {details.newPhotos && details.newPhotos.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">Fotos:</span>
          <div className="flex gap-1">
            {details.newPhotos.slice(0, 2).map((photo, idx) => (
              <div key={idx} className="w-8 h-8 bg-white/10 rounded border border-white/20 flex items-center justify-center">
                <span className="text-xs">📸</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Motto */}
      {details.newMotto && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">Nova missão:</span>
          <span className="text-xs text-white/70 italic">"{details.newMotto}"</span>
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
  // Generate avatar URL with fallback
  const avatarUrl = React.useMemo(() => {
    if (activity.figureString) {
      return habboProxyService.getAvatarUrl(activity.figureString, 'xs', true);
    }
    // Default fallback figure
    return habboProxyService.getAvatarUrl('lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62', 'xs', true);
  }, [activity.figureString]);

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 ${className}`}>
      {/* Avatar */}
      <img
        src={avatarUrl}
        alt={activity.username}
        className="w-8 h-8 rounded-full flex-shrink-0"
        onError={(e) => {
          e.currentTarget.src = habboProxyService.getAvatarUrl('lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62', 'xs', true);
        }}
      />
      
      {/* Content */}
        <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {onUserClick ? (
            <button
              onClick={() => onUserClick(activity.username)}
              className="text-sm text-white/90 font-medium truncate hover:text-blue-300 transition-colors"
            >
              {activity.username}
            </button>
          ) : (
            <p className="text-sm text-white/90 font-medium truncate">
              {activity.username}
            </p>
          )}
          <span className="text-sm flex-shrink-0">
            {getActivityIcon(activity)}
          </span>
          <p className="text-xs text-white/40 flex-shrink-0">
            {formatActivityTime(activity.timestamp)}
          </p>
        </div>
        
        <p className="text-sm text-white/70 mb-1">
          {activity.activity}
        </p>

        {/* Enhanced Details */}
        {renderActivityDetails(activity)}
      </div>
    </div>
  );
};