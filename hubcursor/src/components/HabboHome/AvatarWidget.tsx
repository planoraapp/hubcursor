
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, ChevronDown } from 'lucide-react';
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
    ? `${imageBase}/habbo-imaging/avatarimage?figure=${encodeURIComponent(habboData.figureString)}&direction=2&head_direction=2&size=l`
    : `${imageBase}/habbo-imaging/avatarimage?user=${encodeURIComponent(habboData.name)}&direction=2&head_direction=2&size=l`;
  const [expanded, setExpanded] = useState(false);

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

      {/* Seção expansível de emblemas em uso */}
      <div className="border-t bg-slate-50">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2 flex items-center justify-between text-sm volter-font hover:bg-slate-100 transition-colors"
          aria-expanded={expanded}
        >
          <span>Emblemas em uso</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <div className={`${expanded ? 'max-h-44 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden transition-all duration-300`}>
          <div className="p-3 grid grid-cols-6 gap-2">
            {(habboData.selectedBadges && habboData.selectedBadges.length > 0) ? (
              habboData.selectedBadges.map((b: any, idx: number) => {
                const code = b?.code || b?.badgeCode || b?.badge_code || b?.badge_id;
                const label = b?.name || b?.description || code || 'Emblema';
                const src = code ? `https://images.habbo.com/c_images/album1584/${code}.gif` : '/assets/frank.png';
                return (
                  <div key={`${code || idx}-${idx}`} className="flex flex-col items-center gap-1">
                    <img
                      src={src}
                      alt={`Emblema ${label}`}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://habboassets.com/c_images/album1584/${code}.gif`;
                      }}
                    />
                    <span className="text-[10px] text-slate-600 text-center line-clamp-1">{label}</span>
                  </div>
                );
              })
            ) : (
              <div className="col-span-6 text-center text-xs text-slate-500">Nenhum emblema equipado</div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
