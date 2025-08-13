
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Calendar, Clock, Star } from 'lucide-react';

interface ProfileHeaderProps {
  habboUser: {
    habbo_name: string;
    habbo_id: string;
    hotel: string;
    figure_string?: string;
    motto?: string;
    is_online?: boolean;
    created_at?: string;
    last_updated?: string;
  };
  avatarUrl: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ habboUser, avatarUrl }) => {
  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-black">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={habboUser.habbo_name}
                className="h-32 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboUser.habbo_name}&size=l&direction=2&head_direction=3&action=std`;
                }}
              />
              <Badge 
                className={`absolute -bottom-2 -right-2 ${habboUser.is_online ? 'bg-green-500' : 'bg-red-500'} text-white`}
              >
                {habboUser.is_online ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold volter-font mb-2">{habboUser.habbo_name}</h1>
            
            {habboUser.motto && (
              <p className="text-lg text-gray-600 italic mb-4">"{habboUser.motto}"</p>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Hotel: {habboUser.hotel?.toUpperCase()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-500" />
                <span>Desde: {habboUser.created_at ? new Date(habboUser.created_at).getFullYear() : 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>Atualizado: {habboUser.last_updated ? new Date(habboUser.last_updated).toLocaleDateString('pt-BR') : 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>ID: {habboUser.habbo_id}</span>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`https://www.habbo.${habboUser.hotel}/profile/${habboUser.habbo_name}`, '_blank')}
              >
                Ver Perfil Oficial
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
