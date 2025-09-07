
import React, { useState } from 'react';
import { Star } from 'lucide-react';

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
    if (currentValue >= starIndex) return 1;
    if (currentValue >= starIndex - 0.5) return 0.5; // Meia estrela
    return 0.2; // Estrela vazia
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
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const opacity = getStarOpacity(starIndex);
          const isHalfStar = opacity === 0.5;
          
          return (
            <div
              key={starIndex}
              className={`relative ${!readonly ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
              onClick={() => !readonly && handleStarClick(starIndex)}
              onMouseEnter={() => !readonly && handleStarHover(starIndex)}
            >
              {/* Estrela de fundo (sempre cinza) */}
              <Star
                size={getStarSize()}
                className="select-none fill-transparent text-gray-300 absolute"
              />
              
              {/* Estrela preenchida (amarela) */}
              <Star
                size={getStarSize()}
                className={`select-none transition-opacity duration-200 ${
                  opacity >= 0.5 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'fill-transparent text-transparent'
                }`}
                style={{
                  clipPath: isHalfStar ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'none'
                }}
              />
              
              {/* Meia estrela (se necessário) */}
              {isHalfStar && (
                <Star
                  size={getStarSize()}
                  className="select-none fill-yellow-400 text-yellow-400 absolute"
                  style={{
                    clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {!readonly && (
        <span className="text-xs text-muted-foreground font-volter">
          {rating > 0 ? `${rating}/5` : 'Avalie'}
        </span>
      )}
    </div>
  );
};
