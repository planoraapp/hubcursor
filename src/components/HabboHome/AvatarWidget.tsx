
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
  const hotel = habboData.hotel;
  const baseUrl = `https://www.${hotel === 'com' ? 'habbo.com' : hotel === 'br' ? 'habbo.com.br' : hotel}.`;
  const apiUrl = `https://www.${hotel === 'br' ? 'habbo.com.br' : hotel === 'com' ? 'habbo.com' : `${hotel}`}`;
  const imageBase = `https://www.${hotel === 'br' ? 'habbo.com.br' : hotel === 'com' ? 'habbo.com' : `${hotel}`}`;
  const avatarUrl = habboData.figureString
    ? `${imageBase}/habbo-imaging/avatarimage?figure=${encodeURIComponent(habboData.figureString)}&direction=4&head_direction=4&size=l`
    : `${imageBase}/habbo-imaging/avatarimage?user=${encodeURIComponent(habboData.name)}&direction=4&head_direction=4&size=l`;

  return (
    <Card className="bg-white shadow-xl border rounded-xl overflow-hidden">
      <div className="flex items-stretch">
        {/* Avatar à esquerda, virado para a esquerda */}
        <div className="w-28 bg-slate-100 border-r flex items-center justify-center">
          <img 
            src={avatarUrl} 
            alt={`Avatar de ${habboData.name}`}
            className="w-24 h-28 object-contain"
            style={{ imageRendering: 'pixelated' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/assets/frank.png';
            }}
          />
        </div>

        {/* Conteúdo do card */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg volter-font text-slate-800">{habboData.name}</h3>
            <Badge 
              className={`volter-font ${habboData.online ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
            >
              {habboData.online ? 'Online' : 'Offline'}
            </Badge>
          </div>

          <p className="text-sm volter-font text-slate-700 italic truncate">
            “{habboData.motto || 'Sem missão definida'}”
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 volter-font">
            {habboData.memberSince && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Membro desde {new Date(habboData.memberSince).getFullYear()}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Hotel {hotel.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
