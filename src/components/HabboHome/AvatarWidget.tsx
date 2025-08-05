
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Calendar } from 'lucide-react';

interface AvatarWidgetProps {
  habboData: {
    name: string;
    figureString: string;
    motto: string;
    online: boolean;
    memberSince: string;
    selectedBadges: Array<{
      badgeIndex: number;
      code: string;
      name: string;
      description: string;
    }>;
  } | null;
  isOwner?: boolean;
}

export const AvatarWidget: React.FC<AvatarWidgetProps> = ({ habboData, isOwner }) => {
  if (!habboData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const getAvatarUrl = (figureString: string) => {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
  };

  const getBadgeUrl = (code: string) => {
    return `https://images.habbo.com/c_images/album1584/${code}.gif`;
  };

  return (
    <div className="w-full h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={getAvatarUrl(habboData.figureString)}
              alt={`Avatar de ${habboData.name}`}
              className="w-16 h-16 rounded-lg border-2 border-gray-200"
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              habboData.online ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-gray-800 truncate">
              {habboData.name}
            </CardTitle>
            <p className="text-sm text-gray-600 italic truncate">
              "{habboData.motto}"
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={habboData.online ? "default" : "secondary"} className="text-xs">
                {habboData.online ? 'Online' : 'Offline'}
              </Badge>
              {isOwner && (
                <Badge variant="outline" className="text-xs">
                  Sua Home
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações básicas */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Membro desde: {new Date(habboData.memberSince).toLocaleDateString('pt-BR')}</span>
        </div>

        {/* Emblemas selecionados */}
        {habboData.selectedBadges && habboData.selectedBadges.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              Emblemas em Destaque
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {habboData.selectedBadges.slice(0, 6).map((badge, index) => (
                <div 
                  key={index} 
                  className="relative group cursor-help"
                  title={`${badge.name}: ${badge.description}`}
                >
                  <img
                    src={getBadgeUrl(badge.code)}
                    alt={badge.name}
                    className="w-8 h-8 border border-gray-200 rounded bg-white p-1"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botão ver perfil completo */}
        <Button 
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => window.open(`/profile/${habboData.name}`, '_blank')}
        >
          <User className="w-4 h-4 mr-2" />
          Ver Perfil Completo
        </Button>
      </CardContent>
    </div>
  );
};
