
import React, { useState } from 'react';

interface StarRatingProps {
  rating?: number; // Current rating (0-5, supports decimals)
  onRate?: (rating: number) => void; // Callback when user rates
  readonly?: boolean; // If true, shows rating but doesn't allow interaction
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

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const getStarOpacity = (starIndex: number): number => {
    const currentRating = readonly ? rating : (hoverRating || rating);
    
    if (currentRating >= starIndex) {
      return 1; // Full star
    } else if (currentRating > starIndex - 1) {
      // Partial star - calculate opacity based on decimal part
      return currentRating - (starIndex - 1);
    }
    return 0.3; // Empty star (low opacity)
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
    <div 
      className={`flex items-center justify-center gap-1 ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <div
          key={starIndex}
          className={`relative ${!readonly ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
          onClick={() => handleStarClick(starIndex)}
          onMouseEnter={() => handleStarHover(starIndex)}
        >
          {/* Base star (sempre visível em opacidade baixa) */}
          <img
            src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/site_images/starrating.png"
            alt={`Estrela ${starIndex}`}
            className={`${sizeClasses[size]} transition-all duration-200`}
            style={{ 
              opacity: 0.3,
              imageRendering: 'pixelated'
            }}
          />
          
          {/* Filled star (sobreposta com opacity baseada no rating) */}
          <img
            src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/site_images/starrating.png"
            alt={`Estrela preenchida ${starIndex}`}
            className={`${sizeClasses[size]} absolute top-0 left-0 transition-all duration-200`}
            style={{ 
              opacity: getStarOpacity(starIndex),
              imageRendering: 'pixelated',
              filter: getStarOpacity(starIndex) > 0.5 ? 'brightness(1.2) saturate(1.3)' : 'none'
            }}
          />
        </div>
      ))}
      {!readonly && (
        <span className="ml-2 text-sm text-gray-600 font-volter">
          {hoverRating || rating}/5
        </span>
      )}
    </div>
  );
};
