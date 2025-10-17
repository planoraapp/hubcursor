
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Calendar, Clock, Star } from 'lucide-react';
import { ProfileStatsGrid } from './ProfileStatsGrid';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { Skeleton } from '@/components/ui/skeleton';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  habboName: string;
  hotel?: string;
}

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
  isOpen,
  onClose,
  habboName,
  hotel = 'com.br'
}) => {
  const { data: profile, isLoading, error } = useCompleteProfile(habboName, hotel);

  const getAvatarUrl = (username: string) => {
    return `https://www.habbo.${hotel}/habbo-imaging/avatarimage?user=${username}&size=l&direction=2&head_direction=2&action=std`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">Perfil Completo</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Skeleton className="h-32 w-24" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😞</div>
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar perfil</h3>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Tentar novamente
            </Button>
          </div>
        )}

        {profile && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={getAvatarUrl(profile.name)}
                      alt={profile.name}
                      className="h-32 w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${profile.name}&size=l&direction=2&head_direction=3&action=std`;
                      }}
                    />
                    <Badge 
                      className={`absolute -bottom-2 -right-2 ${profile.online ? 'bg-green-500' : 'bg-red-500'} text-white`}
                    >
                      {profile.online ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                  
                  {profile.motto && (
                    <p className="text-lg text-muted-foreground italic mb-4">"{profile.motto}"</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span>Hotel: {hotel.toUpperCase()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span>Desde: {new Date(profile.memberSince).getFullYear()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span>Último acesso: {new Date(profile.lastAccessTime).toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>ID: {profile.uniqueId.split('-').pop()}</span>
                    </div>
                  </div>

                  <div className="flex justify-center md:justify-start">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`https://www.habbo.${hotel}/profile/${profile.name}`, '_blank')}
                    >
                      Ver Perfil Oficial
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Estatísticas Completas</h2>
              <ProfileStatsGrid profile={profile} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
