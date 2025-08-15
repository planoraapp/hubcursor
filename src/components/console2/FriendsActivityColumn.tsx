
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Activity, Heart, MessageCircle, UserPlus } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'photo';
  user: {
    name: string;
    avatar: string;
  };
  timestamp: string;
  content?: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'like',
    user: { name: 'Alice', avatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=Alice&direction=2&head_direction=3&size=m' },
    timestamp: '2 min atrás',
  },
  {
    id: '2',
    type: 'comment',
    user: { name: 'Bob', avatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=Bob&direction=2&head_direction=3&size=m' },
    timestamp: '5 min atrás',
    content: 'Foto incrível!'
  },
  {
    id: '3',
    type: 'follow',
    user: { name: 'Carol', avatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=Carol&direction=2&head_direction=3&size=m' },
    timestamp: '10 min atrás',
  },
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'like':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'comment':
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'follow':
      return <UserPlus className="w-4 h-4 text-green-500" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

const getActivityText = (activity: ActivityItem) => {
  switch (activity.type) {
    case 'like':
      return 'curtiu sua foto';
    case 'comment':
      return 'comentou na sua foto';
    case 'follow':
      return 'começou a te seguir';
    default:
      return 'atividade';
  }
};

export const FriendsActivityColumn = () => {
  return (
    <Card className="h-full bg-white border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Atividades dos Amigos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-8rem)] px-4">
          <div className="space-y-4 pb-4">
            {mockActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Avatar className="w-10 h-10 border-2 border-gray-200">
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                    {activity.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getActivityIcon(activity.type)}
                    <span className="text-sm font-medium text-gray-900">
                      {activity.user.name}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1">
                    {getActivityText(activity)}
                  </p>
                  
                  {activity.content && (
                    <p className="text-sm text-gray-500 italic">
                      "{activity.content}"
                    </p>
                  )}
                  
                  <span className="text-xs text-gray-400 mt-1 block">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
