
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Globe } from 'lucide-react';

interface HabboData {
  name: string;
  hotel?: string;
  figureString?: string;
  motto?: string;
  online?: boolean;
  memberSince?: string;
  selectedBadges?: any[];
}

interface AvatarWidgetProps {
  habboData: HabboData;
}

const hotelNames: Record<string, string> = {
  'br': 'Brasil',
  'com': 'Global',
  'es': 'España', 
  'fr': 'France',
  'de': 'Deutschland',
  'it': 'Italia',
  'nl': 'Nederland',
  'fi': 'Suomi',
  'tr': 'Türkiye'
};

export const AvatarWidget: React.FC<AvatarWidgetProps> = ({ habboData }) => {
  const getAvatarUrl = (figureString: string) => {
    if (!figureString) {
      return `https://www.habbo.com/habbo-imaging/avatarimage?user=${habboData.name}&direction=4&head_direction=4&gesture=sml&size=m&action=std`;
    }
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&size=m&direction=4&head_direction=4&gesture=sml&action=std`;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black max-w-xs">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3">
        <CardTitle className="volter-font text-center flex items-center justify-center gap-2 text-lg">
          <User className="w-4 h-4" />
          {habboData.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col items-center space-y-3">
          {/* Avatar */}
          <div className="relative">
            <img 
              src={getAvatarUrl(habboData.figureString || '')}
              alt={`Avatar de ${habboData.name}`}
              className="w-20 h-20 object-contain"
              onError={(e) => {
                e.currentTarget.src = `https://www.habbo.com/habbo-imaging/avatarimage?user=${habboData.name}&direction=4&head_direction=4&gesture=sml&size=m&action=std`;
              }}
            />
            {habboData.online && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge variant={habboData.online ? "default" : "secondary"} className="text-xs">
              {habboData.online ? "Online" : "Offline"}
            </Badge>
            {habboData.hotel && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Globe className="w-3 h-3" />
                {hotelNames[habboData.hotel] || habboData.hotel.toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Motto */}
          {habboData.motto && (
            <div className="text-center">
              <p className="text-xs text-gray-600 italic">"{habboData.motto}"</p>
            </div>
          )}

          {/* Member Since */}
          {habboData.memberSince && (
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              Membro desde {new Date(habboData.memberSince).getFullYear()}
            </div>
          )}

          {/* Selected Badges */}
          {habboData.selectedBadges && habboData.selectedBadges.length > 0 && (
            <div className="w-full">
              <h4 className="text-xs font-semibold mb-2 text-center volter-font">Emblemas</h4>
              <div className="flex flex-wrap justify-center gap-1">
                {habboData.selectedBadges.slice(0, 5).map((badge, index) => (
                  <img
                    key={index}
                    src={`https://images.habbo.com/c_images/album1584/${badge.code}.gif`}
                    alt={badge.name}
                    className="w-5 h-5"
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
