
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
      className={`flex items-center gap-1 ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <div
          key={starIndex}
          className={`relative ${!readonly ? 'cursor-pointer' : ''}`}
          onClick={() => handleStarClick(starIndex)}
          onMouseEnter={() => handleStarHover(starIndex)}
        >
          <img
            src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/site_images/starrating.png"
            alt={`Estrela ${starIndex}`}
            className={`${sizeClasses[size]} transition-opacity duration-200`}
            style={{ 
              opacity: getStarOpacity(starIndex),
              imageRendering: 'pixelated'
            }}
          />
        </div>
      ))}
      {!readonly && (
        <span className="ml-2 text-sm text-gray-600">
          {hoverRating || rating}/5
        </span>
      )}
    </div>
  );
};
