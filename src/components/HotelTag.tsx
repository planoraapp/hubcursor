import React from 'react';
import { Badge } from '@/components/ui/badge';
import { HOTELS_CONFIG } from '@/config/hotels';

interface HotelTagProps {
  hotelId: string;
  size?: 'sm' | 'md' | 'lg';
  showFlag?: boolean;
  className?: string;
}

export const HotelTag: React.FC<HotelTagProps> = ({ 
  hotelId, 
  size = 'sm', 
  showFlag = true,
  className = ''
}) => {
  const hotel = HOTELS_CONFIG[hotelId];
  
  if (!hotel) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const flagSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Badge 
      variant="secondary" 
      className={`${sizeClasses[size]} ${className} flex items-center gap-1`}
    >
      {showFlag && (
        <img 
          src={hotel.flag} 
          alt={hotel.name}
          className={`${flagSize[size]} object-contain`}
          style={{ imageRendering: 'pixelated' }}
        />
      )}
      <span className="font-medium">{hotel.id.toUpperCase()}</span>
    </Badge>
  );
};

export default HotelTag;
