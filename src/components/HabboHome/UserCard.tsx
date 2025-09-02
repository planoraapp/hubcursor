
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAvatarUrl } from '../../services/habboApiMultiHotel';

// Mapeamento de hotéis para bandeiras
const HOTEL_FLAGS: Record<string, string> = {
  'br': '/assets/flagbrazil.png',
  'com': '/assets/flagcom.png',
  'de': '/assets/flagdeus.png',
  'es': '/assets/flagspain.png',
  'fr': '/assets/flagfrance.png',
  'it': '/assets/flagitaly.png',
  'nl': '/assets/flagnetl.png',
  'fi': '/assets/flafinland.png',
  'tr': '/assets/flagtrky.png'
};

interface UserCardProps {
  habboData: {
    name: string;
    habbo_id: string;
    figureString?: string;
    hotel?: string;
  };
  isOwner?: boolean;
}

export const UserCard = ({ habboData, isOwner }: UserCardProps) => {
  // Usar a função getAvatarUrl com o hotel correto (se disponível)
  const hotel = habboData.hotel || 'com';
  const avatarUrl = getAvatarUrl(habboData.name, habboData.figureString, hotel);
  const flagUrl = HOTEL_FLAGS[hotel] || HOTEL_FLAGS['com'];

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200 shadow-lg">
      <div className="flex items-center gap-4 h-full">
        {/* Avatar com corpo completo e sem fundo */}
        <div className="flex-shrink-0">
          <div className="w-32 h-40 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
            <img 
              src={avatarUrl} 
              alt={habboData.name}
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/assets/frank.png';
              }}
            />
          </div>
        </div>
        
        {/* Informações do usuário */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-800 volter-font truncate">
              {habboData.name}
            </h2>
            {isOwner && (
              <Badge className="bg-green-500 text-white text-xs volter-font">
                Sua Home
              </Badge>
            )}
          </div>
          
          {/* Informações adicionais */}
          <div className="space-y-1">
            <p className="text-sm text-gray-600 volter-font">
              📅 Membro desde: Janeiro 2024
            </p>
            <p className="text-sm text-gray-600 volter-font">
              🏆 Nível: Veterano
            </p>
            <p className="text-sm text-gray-600 volter-font">
              ⭐ Reputação: Excelente
            </p>
            {habboData.hotel && (
              <div className="flex items-center gap-2 text-sm text-gray-600 volter-font">
                <span>🏨 Hotel:</span>
                <img
                  src={flagUrl}
                  alt={`Hotel ${habboData.hotel.toUpperCase()}`}
                  className="w-5 h-4"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = HOTEL_FLAGS['com'];
                  }}
                />
                <span>{habboData.hotel.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Status online */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
            <span className="text-xs text-green-600 volter-font font-medium">
              Online agora
            </span>
          </div>
        </div>
        
        {/* Decoração lateral */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-lg flex items-center justify-center border-2 border-white shadow-md">
            <span className="text-2xl">🏠</span>
          </div>
        </div>
      </div>
    </div>
  );
};
