import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { UnifiedClothingItem } from '@/hooks/useUnifiedClothingAPI';

interface EnhancedClothingThumbnailProps {
  item: UnifiedClothingItem;
  size?: 's' | 'm' | 'l';
  className?: string;
}

const sizeClasses = {
  s: 'w-8 h-8',
  m: 'w-12 h-12',
  l: 'w-16 h-16',
};

export const EnhancedClothingThumbnail: React.FC<EnhancedClothingThumbnailProps> = ({
  item,
  size = 'm',
  className = ''
}) => {
  const pixelatedStyle = { imageRendering: 'pixelated' } as React.CSSProperties;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {item ? (
        <>
          <img
            src={item.imageUrl}
            alt={item.name}
            className="rounded object-cover w-full h-full"
            style={pixelatedStyle}
            onError={(e) => {
              // Fallback image on error
              e.currentTarget.src = '/assets/habbo-avatar-placeholder.png';
            }}
          />
          {item.club === 'HC' && (
            <Badge
              variant="secondary"
              className="absolute top-1 right-1 text-xs"
            >
              HC
            </Badge>
          )}
        </>
      ) : (
        <Skeleton className={`rounded-md ${sizeClasses[size]}`} />
      )}
    </div>
  );
};

export default EnhancedClothingThumbnail;
