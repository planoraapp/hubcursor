
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { unifiedHabboService } from '@/services/unifiedHabboService';
interface Badge {
  code: string;
  name: string;
  description?: string;
}

interface ProfileBadgesProps {
  badges: Badge[];
  habboName: string;
}

export const ProfileBadges: React.FC<ProfileBadgesProps> = ({ badges, habboName }) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Emblemas de {habboName} ({badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length > 0 ? (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {badges.map((badge, index) => (
              <div 
                key={`${badge.code}-${index}`}
                className="text-center group cursor-help"
                title={`${badge.name}${badge.description ? `: ${badge.description}` : ''}`}
              >
                <div className="relative">
                  <img
                    src={unifiedHabboService.getBadgeUrl(badge.code)}
                    alt={badge.name}
                    className="w-12 h-12 mx-auto border border-gray-200 rounded bg-white p-1 group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{badge.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Nenhum emblema encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
