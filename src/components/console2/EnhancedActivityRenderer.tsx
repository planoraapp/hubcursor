
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Camera, Award, Users, MessageSquare } from 'lucide-react';
import type { DirectFriendActivity } from '@/hooks/useFriendsActivitiesDirect';

interface EnhancedActivityRendererProps {
  activity: DirectFriendActivity;
}

export const EnhancedActivityRenderer: React.FC<EnhancedActivityRendererProps> = ({ activity }) => {
  const formatActivityTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR });
    } catch (error) {
            return 'há alguns momentos';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'photos':
        return <Camera className="w-3 h-3 text-blue-400" />;
      case 'badge':
        return <Award className="w-3 h-3 text-yellow-400" />;
      case 'friends':
        return <Users className="w-3 h-3 text-green-400" />;
      default:
        return <MessageSquare className="w-3 h-3 text-gray-400" />;
    }
  };

  const getAvatarUrl = (figureString: string) => {
    if (!figureString) return '';
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${figureString}&size=s&direction=2&head_direction=3&action=std`;
  };

  const getBadgeUrl = (badgeCode: string) => {
    if (!badgeCode) return '';
    return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
  };

  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage 
          src={getAvatarUrl(activity.figureString || '')} 
          alt={activity.username}
        />
        <AvatarFallback className="text-xs bg-habbo-blue text-white">
          {activity.username.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-1">
          {getActivityIcon(activity.type || '')}
          <span className="text-xs font-medium text-white/80 truncate">
            {activity.username}
          </span>
          <span className="text-xs text-white/40 flex-shrink-0">
            {formatActivityTime(activity.timestamp)}
          </span>
        </div>
        
        <p className="text-xs text-white/70 leading-relaxed break-words">
          {activity.activity}
        </p>

        {/* Renderizar detalhes específicos da atividade */}
        {activity.type === 'badge' && activity.details?.newBadges?.[0] && (
          <div className="flex items-center gap-2 mt-1 p-1 bg-yellow-500/10 rounded border border-yellow-500/20">
            <img 
              src={getBadgeUrl(activity.details.newBadges[0].code)} 
              alt={activity.details.newBadges[0].name}
              className="w-4 h-4"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="text-xs text-yellow-300 truncate">
              {activity.details.newBadges[0].name || activity.details.newBadges[0].code}
            </span>
          </div>
        )}

        {activity.type === 'photos' && activity.details?.newPhotos?.[0] && (
          <div className="mt-1 text-xs text-blue-300">
            📸 {activity.details.newPhotos[0].roomName && `em "${activity.details.newPhotos[0].roomName}"`}
          </div>
        )}
      </div>
    </div>
  );
};
