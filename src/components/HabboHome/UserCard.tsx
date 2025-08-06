
import React from 'react';

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
      <div className="w-full h-full flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
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
    <div className="w-full h-full bg-white/95 backdrop-blur-sm rounded-lg p-4 border-2 border-gray-200">
      <div className="flex items-center gap-4 h-full">
        {/* Avatar - tamanho maior e fixo à esquerda */}
        <div className="flex-shrink-0">
          <div className="relative w-32 h-32">
            <img
              src={getAvatarUrl(habboData.figureString)}
              alt={`Avatar de ${habboData.name}`}
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white ${
              habboData.online ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
        </div>

        {/* Informações do usuário - ocupa o centro */}
        <div className="flex-1 min-w-0 h-full flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-800 truncate volter-font">
              {habboData.name}
            </h2>
            <div className={`px-2 py-1 rounded text-xs font-semibold ${
              habboData.online 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {habboData.online ? 'Online' : 'Offline'}
            </div>
            {isOwner && (
              <div className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800 border border-yellow-200 volter-font">
                👑 Sua Home
              </div>
            )}
          </div>
          <p className="text-gray-600 italic truncate mb-3 volter-font">
            "{habboData.motto}"
          </p>
          <p className="text-sm text-gray-500 volter-font">
            Membro desde: {new Date(habboData.memberSince).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Emblemas - grid à direita */}
        {habboData.selectedBadges && habboData.selectedBadges.length > 0 && (
          <div className="flex-shrink-0">
            <div className="grid grid-cols-3 gap-2 max-w-[120px]">
              {habboData.selectedBadges.slice(0, 9).map((badge, index) => (
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
      </div>
    </div>
  );
};
