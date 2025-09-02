
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAvatarUrl } from '@/services/habboApiMultiHotel';

interface UserCardProps {
  habboData: {
    id: string;
    habbo_name: string;
    hotel: string;
    figureString?: string;
    motto?: string;
    online?: boolean;
    memberSince?: string;
    selectedBadges?: any[];
  };
  isEditMode?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ habboData, isEditMode }) => {
  const avatarUrl = getAvatarUrl(habboData.habbo_name, habboData.figureString, habboData.hotel);

  return (
    <Card className={`w-full h-full ${isEditMode ? 'border-dashed border-blue-400' : 'border-gray-300'}`}>
      <CardContent className="p-4 h-full flex items-center gap-4">
        <div className="flex-shrink-0">
          <img
            src={avatarUrl}
            alt={`Avatar de ${habboData.habbo_name}`}
            className="w-16 h-16 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/habbo-avatar-placeholder.png';
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg truncate volter-font">
              {habboData.habbo_name}
            </h3>
            <Badge variant={habboData.online ? "default" : "secondary"} className="text-xs">
              {habboData.online ? 'Online' : 'Offline'}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {habboData.motto || 'Sem missão definida'}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Hotel: {habboData.hotel.toUpperCase()}</span>
            {habboData.memberSince && (
              <span>• Membro desde {new Date(habboData.memberSince).getFullYear()}</span>
            )}
          </div>
          
          {habboData.selectedBadges && habboData.selectedBadges.length > 0 && (
            <div className="flex gap-1 mt-2">
              {habboData.selectedBadges.slice(0, 5).map((badge, index) => (
                <img
                  key={index}
                  src={`https://images.habbo.com/c_images/album1584/${badge.code}.gif`}
                  alt={badge.name}
                  className="w-4 h-4"
                  title={badge.name}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
