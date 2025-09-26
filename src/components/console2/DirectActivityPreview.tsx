import React from 'react';
import { DirectFriendActivity } from '@/hooks/useFriendsActivitiesDirect';
import { unifiedHabboService } from '@/services/unifiedHabboService';
interface DirectActivityPreviewProps {
  activity: DirectFriendActivity;
}

const formatActivityTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return 'agora';
  } else if (minutes < 60) {
    return `há ${minutes} min`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `há ${hours} hora${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `há ${days} dia${days > 1 ? 's' : ''}`;
  }
};

const getActivityIcon = (activity: string) => {
  if (activity.includes('online')) return '🟢';
  if (activity.includes('perfil')) return '👤';
  if (activity.includes('visual') || activity.includes('aparência')) return '👕';
  if (activity.includes('emblema') || activity.includes('badge')) return '🏆';
  if (activity.includes('motto')) return '💬';
  return '📝';
};

export const DirectActivityPreview: React.FC<DirectActivityPreviewProps> = ({ activity }) => {
  // Generate avatar URL with fallback
  const avatarUrl = React.useMemo(() => {
    if (activity.figureString) {
      return unifiedHabboService.getAvatarUrl(activity.figureString, 'xs', true);
    }
    // Default fallback figure
    return unifiedHabboService.getAvatarUrl('lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62', 'xs', true);
  }, [activity.figureString]);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-habbo-blue/10 border border-habbo-blue/20 hover:bg-habbo-blue/20 transition-colors">
      {/* Avatar */}
      <img
        src={avatarUrl}
        alt={activity.username}
        className="w-8 h-8 rounded-full flex-shrink-0"
        onError={(e) => {
          // Fallback to default avatar if image fails to load
          e.currentTarget.src = unifiedHabboService.getAvatarUrl('lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62', 'xs', true);
        }}
      />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs text-white/90 font-medium truncate">
            {activity.username}
          </p>
          <span className="text-xs">
            {getActivityIcon(activity.activity)}
          </span>
        </div>
        <p className="text-xs text-white/60 truncate">
          {activity.activity}
        </p>
      </div>
      
      {/* Timestamp */}
      <p className="text-xs text-white/40 flex-shrink-0">
        {formatActivityTime(activity.timestamp)}
      </p>
    </div>
  );
};