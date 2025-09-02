
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
  // Função para formatar data no formato DD/MM/YYYY
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-black">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {/* Avatar à esquerda */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={habboUser.habbo_name}
                className="h-32 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboUser.habbo_name}&size=m&direction=2&head_direction=3&action=std`;
                }}
              />
              
              {/* Indicador de status online/offline - bolinha pixel art */}
              <div className="absolute bottom-2 right-2">
                <div 
                  className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                    habboUser.is_online ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.8)'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Nome e lema à direita do avatar */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold volter-font mb-2 truncate">{habboUser.habbo_name}</h1>
            
            {habboUser.motto && (
              <p className="text-lg text-gray-600 italic mb-4 truncate">"{habboUser.motto}"</p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="truncate">Hotel: {habboUser.hotel?.toUpperCase()}</span>
              </div>
              
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="truncate">Desde: {habboUser.created_at ? formatDate(habboUser.created_at) : 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span className="truncate">Atualizado: {habboUser.last_updated ? formatDate(habboUser.last_updated) : 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-2 min-w-0">
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span className="truncate">ID: {habboUser.habbo_id}</span>
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
