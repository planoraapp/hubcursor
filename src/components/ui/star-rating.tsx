
import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  onRate,
  readonly = false,
  size = 'md',
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const getStarOpacity = (starIndex: number): number => {
    const currentValue = hoverRating || rating;
    return currentValue >= starIndex ? 1 : 0.2;
  };
  
  const getStarSize = () => {
    switch(size) {
      case 'sm': return 16;
      case 'lg': return 32;
      default: return 24;
    }
  };

  const handleStarClick = (starIndex: number) => {
    if (!readonly && onRate) {
      onRate(starIndex);
    }
  };

  const handleStarHover = (starIndex: number) => {
    if (!readonly) {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div 
        className="flex items-center gap-1 relative justify-center"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <div
            key={starIndex}
            className={`relative ${!readonly ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
            onClick={() => !readonly && handleStarClick(starIndex)}
            onMouseEnter={() => !readonly && handleStarHover(starIndex)}
          >
            {/* Base star (empty) */}
            <img
              src="/assets/star_empty.png"
              alt={`Star ${starIndex} empty`}
              className="select-none"
              style={{ 
                imageRendering: 'pixelated',
                width: getStarSize(),
                height: getStarSize()
              }}
              draggable={false}
            />
            
            {/* Filled star overlay */}
            <img
              src="/assets/star_filled.png"
              alt={`Star ${starIndex} filled`}
              className="absolute top-0 left-0 select-none transition-opacity duration-200"
              style={{ 
                imageRendering: 'pixelated',
                opacity: getStarOpacity(starIndex),
                width: getStarSize(),
                height: getStarSize()
              }}
              draggable={false}
            />
          </div>
        ))}
      </div>
      
      {!readonly && (
        <span className="text-xs text-muted-foreground font-volter">
          {rating > 0 ? `${rating}/5` : 'Avalie'}
        </span>
      )}
    </div>
  );
};
