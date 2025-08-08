
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { getAvatarUrl } from '../../services/habboApiMultiHotel';

interface HabboData {
  name: string;
  figureString?: string;
  motto?: string;
  online?: boolean;
  memberSince?: string;
  selectedBadges?: any[];
  hotel: string;
}

interface AvatarWidgetProps {
  habboData: HabboData;
}

export const AvatarWidget: React.FC<AvatarWidgetProps> = ({ habboData }) => {
  // Usar a função getAvatarUrl com o hotel correto
  const avatarUrl = getAvatarUrl(habboData.name, habboData.figureString, habboData.hotel);

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-b-2 border-black">
        <CardTitle className="text-lg volter-font habbo-outline-lg flex items-center gap-2">
          👤 Perfil do Habbo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar */}
          <div className="w-24 h-32 bg-gray-200 rounded-lg overflow-hidden">
            <img 
              src={avatarUrl} 
              alt={`Avatar de ${habboData.name}`}
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/assets/frank.png';
              }}
            />
          </div>
          
          {/* Name and Status */}
          <div className="text-center">
            <h3 className="text-xl volter-font font-bold text-blue-600">{habboData.name}</h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge 
                className={`volter-font ${
                  habboData.online 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-400 text-white'
                }`}
              >
                {habboData.online ? '🟢 Online' : '🔴 Offline'}
              </Badge>
            </div>
          </div>
          
          {/* Motto */}
          <div className="text-center bg-gray-50 p-3 rounded-lg w-full">
            <p className="text-sm volter-font text-gray-700 italic">
              "{habboData.motto || 'Sem missão definida'}"
            </p>
          </div>
          
          {/* Info */}
          <div className="w-full space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="volter-font">Hotel {habboData.hotel.toUpperCase()}</span>
            </div>
            {habboData.memberSince && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="volter-font">Membro desde {new Date(habboData.memberSince).getFullYear()}</span>
              </div>
            )}
          </div>
          
          {/* Badges */}
          {habboData.selectedBadges && habboData.selectedBadges.length > 0 && (
            <div className="w-full">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 rounded-full mb-2">
                <h4 className="text-sm volter-font text-white habbo-outline-sm font-bold text-center">
                  Emblemas
                </h4>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {habboData.selectedBadges.slice(0, 6).map((badge: any, index: number) => (
                  <div key={index} className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                    <img 
                      src={`https://images.habbo.com/c_images/album1584/${badge.code}.gif`}
                      alt={badge.name}
                      className="w-8 h-8"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
