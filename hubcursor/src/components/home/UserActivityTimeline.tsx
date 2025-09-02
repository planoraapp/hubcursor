
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { habboFeedService } from '@/services/habboFeedService';
import { Activity, Trophy, Camera, UserPlus, MessageSquare, Shuffle } from 'lucide-react';

interface UserActivityTimelineProps {
  hotel: string;
  username: string;
}

const getIcon = (type?: string) => {
  switch (type) {
    case 'new_badge':
      return <Trophy className="w-4 h-4 text-yellow-600" />;
    case 'new_photo':
      return <Camera className="w-4 h-4 text-pink-600" />;
    case 'new_friend':
      return <UserPlus className="w-4 h-4 text-green-600" />;
    case 'motto_change':
      return <MessageSquare className="w-4 h-4 text-blue-600" />;
    case 'avatar_update':
      return <Shuffle className="w-4 h-4 text-purple-600" />;
    default:
      return <Activity className="w-4 h-4 text-gray-600" />;
  }
};

const formatTimeAgo = (ts: string) => {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
};

export const UserActivityTimeline: React.FC<UserActivityTimelineProps> = ({ hotel, username }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['user-activity', hotel, username],
    queryFn: async () => habboFeedService.getUserFeed(hotel, username),
    staleTime: 60_000,
    enabled: !!hotel && !!username,
  });

  const userGroup = data?.activities?.find((g: any) => g?.username?.toLowerCase() === username.toLowerCase()) || data?.activities?.[0];
  const items = userGroup?.activities || [];

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Atividades de {username}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !items.length ? (
          <div className="text-center text-gray-600 py-6">Carregando atividades...</div>
        ) : items.length ? (
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {items.map((ev: any, idx: number) => (
              <li key={`${ev.id || idx}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="mt-0.5">{getIcon(ev.activity_type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{ev.description || 'Atividade'}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatTimeAgo(ev.created_at)}</span>
                    {ev.details?.new_badges?.length ? (
                      <Badge variant="outline" className="text-xs">{ev.details.new_badges.length} emblema(s)</Badge>
                    ) : null}
                    {ev.details?.new_friends?.length ? (
                      <Badge variant="outline" className="text-xs">{ev.details.new_friends.length} amizade(s)</Badge>
                    ) : null}
                    {ev.details?.new_photos?.length ? (
                      <Badge variant="outline" className="text-xs">{ev.details.new_photos.length} foto(s)</Badge>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-600 py-6">Nenhuma atividade recente</div>
        )}
      </CardContent>
    </Card>
  );
};
