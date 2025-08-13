
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Users, 
  Camera, 
  Crown, 
  Home, 
  Star,
  Zap,
  Activity,
  TrendingUp,
  Gem
} from 'lucide-react';
import { BadgesModal } from './modals/BadgesModal';
import { FriendsModal } from './modals/FriendsModal';
import { GroupsModal } from './modals/GroupsModal';
import { RoomsModal } from './modals/RoomsModal';
import { PhotosModal } from './modals/PhotosModal';
import { ActivityModal } from './modals/ActivityModal';
import type { CompleteProfile } from '@/hooks/useCompleteProfile';

interface ProfileStatsGridProps {
  profile: CompleteProfile;
  className?: string;
}

type ModalType = 'badges' | 'friends' | 'groups' | 'rooms' | 'photos' | 'activity' | null;

export const ProfileStatsGrid: React.FC<ProfileStatsGridProps> = ({ profile, className = '' }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const stats = [
    {
      id: 'level',
      label: 'Level',
      value: profile.stats.level,
      subValue: `XP: ${profile.stats.experience}`,
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      percent: profile.stats.levelPercent,
      modal: null
    },
    {
      id: 'starGems',
      label: 'Star Gems',
      value: profile.stats.starGems,
      icon: Gem,
      color: 'bg-gradient-to-r from-purple-400 to-purple-600',
      modal: null
    },
    {
      id: 'badges',
      label: 'Emblemas',
      value: profile.stats.badgesCount,
      icon: Trophy,
      color: 'bg-gradient-to-r from-blue-400 to-blue-600',
      modal: 'badges' as const
    },
    {
      id: 'friends',
      label: 'Amigos',
      value: profile.stats.friendsCount,
      icon: Users,
      color: 'bg-gradient-to-r from-green-400 to-green-600',
      modal: 'friends' as const
    },
    {
      id: 'groups',
      label: 'Grupos',
      value: profile.stats.groupsCount,
      icon: Crown,
      color: 'bg-gradient-to-r from-red-400 to-red-600',
      modal: 'groups' as const
    },
    {
      id: 'rooms',
      label: 'Quartos',
      value: profile.stats.roomsCount,
      icon: Home,
      color: 'bg-gradient-to-r from-indigo-400 to-indigo-600',
      modal: 'rooms' as const
    },
    {
      id: 'photos',
      label: 'Fotos',
      value: profile.stats.photosCount,
      icon: Camera,
      color: 'bg-gradient-to-r from-pink-400 to-pink-600',
      modal: 'photos' as const
    },
    {
      id: 'ticker',
      label: 'Habbo Ticker',
      value: profile.stats.habboTickerCount,
      icon: Activity,
      color: 'bg-gradient-to-r from-orange-400 to-orange-600',
      modal: 'activity' as const
    }
  ];

  const handleStatClick = (modal: ModalType) => {
    if (modal) {
      setActiveModal(modal);
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isClickable = !!stat.modal;
          
          return (
            <Card 
              key={stat.id} 
              className={`overflow-hidden transition-all duration-200 ${
                isClickable 
                  ? 'cursor-pointer hover:scale-105 hover:shadow-lg transform' 
                  : 'cursor-default'
              }`}
            >
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className={`w-full h-full p-4 text-white border-0 ${stat.color} ${
                    isClickable ? 'hover:opacity-90' : ''
                  }`}
                  onClick={() => handleStatClick(stat.modal)}
                  disabled={!isClickable}
                >
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <Icon className="w-6 h-6" />
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs opacity-90 font-medium">{stat.label}</div>
                      {stat.subValue && (
                        <div className="text-xs opacity-75">{stat.subValue}</div>
                      )}
                      {stat.percent !== undefined && (
                        <div className="text-xs opacity-75">
                          {stat.percent}% Complete
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modals */}
      <BadgesModal 
        isOpen={activeModal === 'badges'} 
        onClose={() => setActiveModal(null)}
        badges={profile.data.badges}
        userName={profile.name}
      />
      
      <FriendsModal 
        isOpen={activeModal === 'friends'} 
        onClose={() => setActiveModal(null)}
        friends={profile.data.friends}
        userName={profile.name}
      />
      
      <GroupsModal 
        isOpen={activeModal === 'groups'} 
        onClose={() => setActiveModal(null)}
        groups={profile.data.groups}
        userName={profile.name}
      />
      
      <RoomsModal 
        isOpen={activeModal === 'rooms'} 
        onClose={() => setActiveModal(null)}
        rooms={profile.data.rooms}
        userName={profile.name}
      />
      
      <PhotosModal 
        isOpen={activeModal === 'photos'} 
        onClose={() => setActiveModal(null)}
        photos={profile.data.photos}
        userName={profile.name}
      />
      
      <ActivityModal 
        isOpen={activeModal === 'activity'} 
        onClose={() => setActiveModal(null)}
        activityCount={profile.stats.habboTickerCount}
        userName={profile.name}
      />
    </div>
  );
};
