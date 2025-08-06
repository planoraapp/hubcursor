
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Star } from 'lucide-react';

interface HabboData {
  name: string;
  figureString?: string;
  motto?: string;
  online?: boolean;
  memberSince?: string;
  selectedBadges?: any[];
}

interface AvatarWidgetProps {
  habboData: HabboData;
}

export const AvatarWidget: React.FC<AvatarWidgetProps> = ({ habboData }) => {
  const getAvatarUrl = (figureString: string) => {
    if (!figureString) {
      return `https://www.habbo.com/habbo-imaging/avatarimage?user=${habboData.name}&direction=2&head_direction=2&gesture=sml&size=m&action=std`;
    }
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&size=m&direction=2&head_direction=3&gesture=sml&action=std`;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <CardTitle className="volter-font text-center flex items-center justify-center gap-2">
          <User className="w-5 h-5" />
          {habboData.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar */}
          <div className="relative">
            <img 
              src={getAvatarUrl(habboData.figureString || '')}
              alt={`Avatar de ${habboData.name}`}
              className="w-24 h-24 object-contain"
              onError={(e) => {
                // Fallback para avatar padrão se houver erro
                e.currentTarget.src = `https://www.habbo.com/habbo-imaging/avatarimage?user=${habboData.name}&direction=2&head_direction=2&gesture=sml&size=m&action=std`;
              }}
            />
            {habboData.online && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          {/* Status */}
          <div className="text-center">
            <Badge variant={habboData.online ? "default" : "secondary"}>
              {habboData.online ? "Online" : "Offline"}
            </Badge>
          </div>

          {/* Motto */}
          {habboData.motto && (
            <div className="text-center">
              <p className="text-sm text-gray-600 italic">"{habboData.motto}"</p>
            </div>
          )}

          {/* Member Since */}
          {habboData.memberSince && (
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              Membro desde {new Date(habboData.memberSince).getFullYear()}
            </div>
          )}

          {/* Selected Badges */}
          {habboData.selectedBadges && habboData.selectedBadges.length > 0 && (
            <div className="w-full">
              <h4 className="text-sm font-semibold mb-2 text-center">Emblemas</h4>
              <div className="flex flex-wrap justify-center gap-1">
                {habboData.selectedBadges.slice(0, 5).map((badge, index) => (
                  <img
                    key={index}
                    src={`https://images.habbo.com/c_images/album1584/${badge.code}.gif`}
                    alt={badge.name}
                    className="w-6 h-6"
                    title={badge.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
