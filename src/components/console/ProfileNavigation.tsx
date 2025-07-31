
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge, Users, Home, Crown } from 'lucide-react';

interface ProfileNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  badgeCount: number;
  friendsCount: number;
  roomsCount: number;
  groupsCount: number;
}

export const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
  activeSection,
  setActiveSection,
  badgeCount,
  friendsCount,
  roomsCount,
  groupsCount
}) => {
  const sections = [
    { id: 'badges', icon: Badge, label: 'Emblemas', count: badgeCount },
    { id: 'friends', icon: Users, label: 'Amigos', count: friendsCount },
    { id: 'rooms', icon: Home, label: 'Quartos', count: roomsCount },
    { id: 'groups', icon: Crown, label: 'Grupos', count: groupsCount }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {sections.map(({ id, icon: Icon, label, count }) => (
        <Button
          key={id}
          variant={activeSection === id ? "default" : "outline"}
          onClick={() => setActiveSection(id)}
          className="flex items-center gap-2"
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
            {count}
          </span>
        </Button>
      ))}
    </div>
  );
};
