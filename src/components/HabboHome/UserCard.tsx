
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserCardProps {
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

export const UserCard: React.FC<UserCardProps> = ({ habboData, isOwner }) => {
  if (!habboData) {
    return (
      <Card className="w-full h-24 flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </Card>
    );
  }

  const getAvatarUrl = (figureString: string) => {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
  };

  const getBadgeUrl = (code: string) => {
    return `https://images.habbo.com/c_images/album1584/${code}.gif`;
  };

  return (
    <Card className="w-full bg-white/95 backdrop-blur-sm p-4">
      <div className="flex items-center gap-4">
        {/* Avatar - ocupa espaço fixo à esquerda */}
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20">
            <img
              src={getAvatarUrl(habboData.figureString)}
              alt={`Avatar de ${habboData.name}`}
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              habboData.online ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
        </div>

        {/* Informações do usuário - ocupa o centro */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-800 truncate volter-font">
              {habboData.name}
            </h2>
            <Badge variant={habboData.online ? "default" : "secondary"} className="text-xs">
              {habboData.online ? 'Online' : 'Offline'}
            </Badge>
            {isOwner && (
              <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                👑 Sua Home
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 italic truncate mb-2">
            "{habboData.motto}"
          </p>
          <p className="text-xs text-gray-500">
            Membro desde: {new Date(habboData.memberSince).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Emblemas - ocupa espaço fixo à direita */}
        {habboData.selectedBadges && habboData.selectedBadges.length > 0 && (
          <div className="flex-shrink-0">
            <div className="flex gap-1">
              {habboData.selectedBadges.slice(0, 6).map((badge, index) => (
                <div 
                  key={index} 
                  className="relative group cursor-help"
                  title={`${badge.name}: ${badge.description}`}
                >
                  <img
                    src={getBadgeUrl(badge.code)}
                    alt={badge.name}
                    className="w-6 h-6 border border-gray-200 rounded bg-white p-0.5"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
