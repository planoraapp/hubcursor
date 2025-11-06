
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Camera, Crown } from 'lucide-react';

interface ProfileStatsProps {
  habboUser: {
    habbo_name: string;
    hotel: string;
    is_online?: boolean;
  };
  stats: {
    badgesCount: number;
    photosCount: number;
    friendsCount?: number;
    groupsCount?: number;
  };
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ habboUser, stats }) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Estatísticas do Usuário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Nome Habbo:</span>
            <span className="text-sm">{habboUser.habbo_name}</span>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Hotel:</span>
            <Badge variant="outline">{habboUser.hotel?.toUpperCase()}</Badge>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            {habboUser.is_online ? (
              <Badge className="bg-green-500">Online</Badge>
            ) : (
              <img 
                src="/assets/offline_icon.png" 
                alt="Offline"
                height="16"
                style={{ imageRendering: 'pixelated' }}
              />
            )}
          </div>
          
          <Separator />

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-lg font-semibold">{stats.badgesCount}</span>
              </div>
              <p className="text-xs text-gray-600">Emblemas</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Camera className="w-4 h-4 text-purple-500" />
                <span className="text-lg font-semibold">{stats.photosCount}</span>
              </div>
              <p className="text-xs text-gray-600">Fotos</p>
            </div>
            
            {stats.friendsCount !== undefined && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-lg font-semibold">{stats.friendsCount}</span>
                </div>
                <p className="text-xs text-gray-600">Amigos</p>
              </div>
            )}
            
            {stats.groupsCount !== undefined && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Crown className="w-4 h-4 text-green-500" />
                  <span className="text-lg font-semibold">{stats.groupsCount}</span>
                </div>
                <p className="text-xs text-gray-600">Grupos</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
