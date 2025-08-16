
import React, { useState } from 'react';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  MapPin, 
  Calendar, 
  Star,
  Trophy,
  Users,
  Crown,
  Home,
  Activity
} from 'lucide-react';
import { ProfileStatsGrid } from '../profile/ProfileStatsGrid';
import { SocialInteractionButtons } from './SocialInteractionButtons';

export const MyAccountColumn = () => {
  const { myProfile, photos, isLoading, habboAccount } = useMyConsoleProfile();

  if (isLoading) {
    return (
      <div className="w-full max-w-sm mx-auto bg-background p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!myProfile || !habboAccount) {
    return (
      <div className="w-full max-w-sm mx-auto bg-background p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Faça login para ver seu perfil
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avatarUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${myProfile.figureString}&size=l&direction=2&head_direction=3&action=std`;

  return (
    <div className="w-full max-w-sm mx-auto bg-background space-y-4 h-screen overflow-y-auto p-4">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={myProfile.name}
                className="w-24 h-24 pixelated"
                style={{ imageRendering: 'pixelated' }}
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                myProfile.online ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">{myProfile.name}</h2>
              <p className="text-sm text-muted-foreground italic">
                "{myProfile.motto || 'Sem motto'}"
              </p>
              
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>Habbo Hotel BR</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Membro desde {new Date(myProfile.memberSince).getFullYear()}</span>
              </div>

              <Badge variant={myProfile.online ? "default" : "secondary"}>
                {myProfile.online ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <Button className="w-full" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 text-center">Estatísticas</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg">
              <Trophy className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xl font-bold">{myProfile.selectedBadges?.length || 0}</div>
              <div className="text-xs opacity-90">Emblemas</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-lg">
              <Star className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xl font-bold">{photos.length}</div>
              <div className="text-xs opacity-90">Fotos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Interactions */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 text-center">Interações</h3>
          <SocialInteractionButtons 
            targetHabboName={myProfile.name}
            className="justify-center"
          />
        </CardContent>
      </Card>

      {/* Recent Photos */}
      {photos.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 text-center">Fotos Recentes</h3>
            <div className="grid grid-cols-2 gap-2">
              {photos.slice(0, 4).map((photo) => (
                <div key={photo.id} className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={photo.url}
                    alt="Foto do Habbo"
                    className="w-full h-full object-cover pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Badges */}
      {myProfile.selectedBadges && myProfile.selectedBadges.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 text-center">Emblemas em Destaque</h3>
            <div className="grid grid-cols-3 gap-3">
              {myProfile.selectedBadges.slice(0, 6).map((badge, index) => (
                <div key={index} className="text-center">
                  <img
                    src={`https://images.habbo.com/c_images/album1584/${badge.code}.png`}
                    alt={badge.name}
                    className="w-8 h-8 mx-auto pixelated"
                    style={{ imageRendering: 'pixelated' }}
                    title={badge.name}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
