
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, MapPin, Users, Trophy, Camera, Activity } from 'lucide-react';
import { habboFeedService } from '@/services/habboFeedService';
import { useQuery } from '@tanstack/react-query';

interface UserProfileDetailViewProps {
  user: any;
  onBack: () => void;
}

export const UserProfileDetailView: React.FC<UserProfileDetailViewProps> = ({ user, onBack }) => {
  // Fetch user activities
  const { data: userActivities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['user-activities', user.name],
    queryFn: () => habboFeedService.getUserFeed('com.br', user.name),
    staleTime: 60 * 1000,
    enabled: !!user.name,
  });

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header with back button */}
      <div className="p-4 border-b border-white/20">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-white hover:bg-white/10 p-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Profile content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* User header */}
        <div className="text-center space-y-4">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarImage 
              src={habboFeedService.getAvatarUrl(user.figureString || user.figure_string || '', 'l')} 
              alt={user.name}
            />
            <AvatarFallback className="bg-white/20 text-white text-2xl">
              {user.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <p className="text-white/70 italic">"{user.motto || 'Sem lema'}"</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant={user.online ? "default" : "secondary"}>
                {user.online ? 'Online' : 'Offline'}
              </Badge>
              {user.memberSince && (
                <Badge variant="outline" className="text-white/70">
                  <Calendar className="w-3 h-3 mr-1" />
                  Membro desde {new Date(user.memberSince).getFullYear()}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-3 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
              <div className="text-lg font-bold text-white">{user.selectedBadges?.length || 0}</div>
              <div className="text-xs text-white/70">Emblemas</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-3 text-center">
              <Camera className="w-6 h-6 mx-auto mb-1 text-pink-400" />
              <div className="text-lg font-bold text-white">{user.photosCount || 0}</div>
              <div className="text-xs text-white/70">Fotos</div>
            </CardContent>
          </Card>
        </div>

        {/* Badges section */}
        {user.selectedBadges && user.selectedBadges.length > 0 && (
          <Card className="bg-white/5 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Emblemas em Destaque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {user.selectedBadges.slice(0, 6).map((badge: any, index: number) => (
                  <div key={index} className="text-center">
                    <img 
                      src={habboFeedService.getBadgeUrl(badge.code)} 
                      alt={badge.name}
                      className="w-12 h-12 mx-auto mb-1"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <p className="text-xs text-white/70 truncate" title={badge.name}>
                      {badge.name}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent activities */}
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                <p className="text-white/60 text-sm mt-2">Carregando atividades...</p>
              </div>
            ) : userActivities.activities && userActivities.activities.length > 0 ? (
              <div className="space-y-3">
                {userActivities.activities.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-2 bg-white/5 rounded">
                    <Activity className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{activity.description}</p>
                      <p className="text-xs text-white/60 mt-1">
                        {formatTimeAgo(activity.lastUpdate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50 text-white" />
                <p className="text-white/60 text-sm">Nenhuma atividade recente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
