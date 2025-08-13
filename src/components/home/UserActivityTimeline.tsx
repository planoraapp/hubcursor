
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Award, UserPlus, Image as ImageIcon, Shirt } from 'lucide-react';
import type { FeedActivity } from '@/services/habboFeedService';

interface Props {
  activities: FeedActivity[];
  isLoading?: boolean;
}

export const UserActivityTimeline: React.FC<Props> = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-2/3 bg-muted rounded" />
            <div className="h-5 w-1/2 bg-muted rounded" />
            <div className="h-5 w-1/3 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6 text-muted-foreground">
          Nenhuma atividade recente encontrada.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {activities.map((a, idx) => (
        <Card key={`${a.username}-${a.lastUpdate}-${idx}`} className="border">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CalendarClock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">{new Date(a.lastUpdate).toLocaleString()}</div>
                <div className="font-medium">{a.username}</div>
                <div className="text-sm mt-1">{a.description}</div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {a.counts?.badges ? (
                    <Badge variant="secondary" className="gap-1">
                      <Award className="h-3 w-3" /> {a.counts.badges} emblema(s)
                    </Badge>
                  ) : null}
                  {a.counts?.friends ? (
                    <Badge variant="secondary" className="gap-1">
                      <UserPlus className="h-3 w-3" /> {a.counts.friends} amigo(s)
                    </Badge>
                  ) : null}
                  {a.counts?.photos ? (
                    <Badge variant="secondary" className="gap-1">
                      <ImageIcon className="h-3 w-3" /> {a.counts.photos} foto(s)
                    </Badge>
                  ) : null}
                  {a.counts?.avatarChanged ? (
                    <Badge variant="secondary" className="gap-1">
                      <Shirt className="h-3 w-3" /> Mudou visual
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserActivityTimeline;
