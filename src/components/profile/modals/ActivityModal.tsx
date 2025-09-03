
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock } from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityCount: number;
  userName: string;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({ 
  isOpen, 
  onClose, 
  activityCount, 
  userName 
}) => {
  // Mock activity data for now - could be enhanced with real data
  const mockActivities = Array.from({ length: activityCount }, (_, index) => ({
    id: index,
    type: ['badge_earned', 'friend_made', 'room_visited', 'achievement_unlocked'][index % 4],
    description: [
      'Conquistou o emblema "Primeira semana!"',
      'Fez amizade com um novo usuário',
      'Visitou um quarto público',
      'Desbloqueou uma nova conquista'
    ][index % 4],
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'badge_earned':
        return '🏆';
      case 'friend_made':
        return '👥';
      case 'room_visited':
        return '🏠';
      case 'achievement_unlocked':
        return '⭐';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'badge_earned':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'friend_made':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'room_visited':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'achievement_unlocked':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Atividades do Habbo Ticker de {userName} ({activityCount})
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3 p-4">
            {mockActivities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <div className="text-2xl flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`text-xs ${getActivityColor(activity.type)}`}>
                      {activity.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(activity.timestamp).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {activityCount === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhuma atividade encontrada</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
