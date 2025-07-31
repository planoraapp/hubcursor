
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Home, Crown, ExternalLink } from 'lucide-react';
import { getBadgeUrl, getAvatarUrl } from '../../../services/habboApi';

interface BadgeData {
  code: string;
  name: string;
  description: string;
}

interface FriendData {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
}

interface RoomData {
  id: string;
  name: string;
  description: string;
  ownerName: string;
  userCount: number;
  maxUserCount: number;
  rating: number;
}

interface GroupData {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  badgeCode: string;
  type: string;
}

interface ProfileSectionsProps {
  activeSection: string;
  badges: BadgeData[];
  friends: FriendData[];
  rooms: RoomData[];
  groups: GroupData[];
  onUserClick: (username: string) => void;
}

export const ProfileSections: React.FC<ProfileSectionsProps> = ({
  activeSection,
  badges,
  friends,
  rooms,
  groups,
  onUserClick
}) => {
  const renderBadgesSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Todos os Emblemas ({badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {badges.map((badge) => (
            <div 
              key={badge.code} 
              className="text-center group cursor-help"
              title={`${badge.name}: ${badge.description}`}
            >
              <div className="relative">
                <img
                  src={getBadgeUrl(badge.code)}
                  alt={badge.name}
                  className="w-12 h-12 mx-auto border border-gray-200 rounded bg-white p-1 group-hover:scale-110 transition-transform"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{badge.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderFriendsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Amigos ({friends.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <div 
              key={friend.uniqueId} 
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onUserClick(friend.name)}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={getAvatarUrl(friend.figureString, 's')} />
                  <AvatarFallback>{friend.name[0]}</AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white ${friend.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{friend.name}</p>
                <p className="text-xs text-muted-foreground truncate italic">"{friend.motto}"</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderRoomsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          Quartos ({rooms.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-sm truncate flex-1 mr-2">{room.name}</h3>
                <Button variant="ghost" size="sm" className="p-1">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{room.description}</p>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {room.userCount}/{room.maxUserCount}
                  </span>
                  <span>⭐ {room.rating || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderGroupsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Grupos ({groups.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div key={group.id} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <img
                  src={getBadgeUrl(group.badgeCode)}
                  alt={group.name}
                  className="w-10 h-10 border border-gray-200 rounded bg-white p-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-sm truncate flex-1 mr-2">{group.name}</h3>
                    <Button variant="ghost" size="sm" className="p-1">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{group.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {group.type}
                      </Badge>
                      <span className="text-muted-foreground">
                        {group.memberCount} membros
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  switch (activeSection) {
    case 'badges':
      return renderBadgesSection();
    case 'friends':
      return renderFriendsSection();
    case 'rooms':
      return renderRoomsSection();
    case 'groups':
      return renderGroupsSection();
    default:
      return null;
  }
};
