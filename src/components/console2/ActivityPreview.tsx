import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RealFriendActivity } from '@/hooks/useRealFriendsActivities';

interface ActivityPreviewProps {
  activity: RealFriendActivity;
}

export const ActivityPreview: React.FC<ActivityPreviewProps> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'badge':
        return '🏆';
      case 'look_change':
        return '👕';
      case 'motto_change':
        return '💬';
      case 'status_change':
        return '🟢';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'badge':
        return 'bg-yellow-500/30 text-yellow-200 border-yellow-500/50';
      case 'look_change':
        return 'bg-blue-500/30 text-blue-200 border-blue-500/50';
      case 'motto_change':
        return 'bg-purple-500/30 text-purple-200 border-purple-500/50';
      case 'status_change':
        return 'bg-green-500/30 text-green-200 border-green-500/50';
      default:
        return 'bg-white/20 text-white/70 border-white/30';
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-white/5 rounded-lg transition-colors">
      {/* Avatar com preview maior para mudanças visuais */}
      <div className="relative flex-shrink-0">
        <Avatar className={activity.activity_type === 'look_change' ? 'w-12 h-12' : 'w-8 h-8'}>
          <AvatarImage 
            src={activity.avatarPreviewUrl || `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=lg-3023-1335.sh-3068-110.hd-180-1.hr-828-61&size=s&direction=2&head_direction=3&action=std`}
            alt={`${activity.habbo_name} avatar`}
          />
          <AvatarFallback className="bg-white/20 text-white">
            {activity.habbo_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Badge preview para conquistas */}
        {activity.activity_type === 'badge' && activity.badgeImageUrl && (
          <div className="absolute -bottom-1 -right-1">
            <img 
              src={activity.badgeImageUrl} 
              alt="Badge"
              className="w-6 h-6 rounded border-2 border-white/20"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        {/* Nome do usuário e tipo de atividade */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate text-white">
            {activity.habbo_name}
          </span>
          <Badge 
            variant="secondary" 
            className={`text-xs px-2 py-0.5 ${getActivityColor(activity.activity_type)}`}
          >
            {getActivityIcon(activity.activity_type)} {activity.activity_type}
          </Badge>
        </div>
        
        {/* Descrição da atividade */}
        <p className="text-sm text-white/70 leading-relaxed">
          {activity.activity_description}
        </p>
        
        {/* Preview maior para mudanças visuais */}
        {activity.activity_type === 'look_change' && activity.avatarPreviewUrl && (
          <div className="mt-2 p-2 bg-white/5 rounded-md">
            <div className="flex items-center gap-3">
              <img 
                src={activity.avatarPreviewUrl.replace('size=s', 'size=l')} 
                alt="Nova aparência"
                className="w-16 h-20 object-contain bg-white/10 rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="text-xs text-white/50">
                Nova aparência no hotel
              </div>
            </div>
          </div>
        )}
        
        {/* Timestamp */}
        <div className="text-xs text-white/50 mt-1">
          {new Date(activity.created_at).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit', 
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};