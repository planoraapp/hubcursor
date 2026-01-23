import React from 'react';
import { Crown, Star, Gem } from 'lucide-react';

interface RarityBadgeProps {
  rarity: 'NORMAL' | 'HC' | 'VIP' | 'LTD' | 'CLUB';
  className?: string;
}

export const RarityBadge: React.FC<RarityBadgeProps> = ({ rarity, className = "" }) => {
  if (rarity === 'NORMAL') return null;

  const badges = {
    HC: (
      <div className={`absolute bottom-1 left-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center ${className}`}>
        <Crown className="w-2.5 h-2.5 text-black" />
      </div>
    ),
    CLUB: (
      <div className={`absolute bottom-1 left-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center ${className}`}>
        <Crown className="w-2.5 h-2.5 text-black" />
      </div>
    ),
    VIP: (
      <div className={`absolute bottom-1 left-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center ${className}`}>
        <Star className="w-2.5 h-2.5 text-white" />
      </div>
    ),
    LTD: (
      <div className={`absolute bottom-1 left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center ${className}`}>
        <Gem className="w-2.5 h-2.5 text-white" />
      </div>
    )
  };

  return badges[rarity] || null;
};