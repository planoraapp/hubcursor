
import React from 'react';

interface HabboRendererProps {
  figure: string;
  zoom: number;
  hotel: string;
  gender: 'M' | 'F';
  direction?: string;
  headDirection?: string;
}

export const HabboRenderer: React.FC<HabboRendererProps> = ({
  figure,
  zoom,
  hotel,
  gender,
  direction = '2',
  headDirection = '3'
}) => {
  const getAvatarUrl = () => {
    const baseUrl = hotel.includes('.') 
      ? `https://www.habbo.${hotel}`
      : `https://www.habbo.com`;
    
    return `${baseUrl}/habbo-imaging/avatarimage?figure=${figure}&gender=${gender}&direction=${direction}&head_direction=${headDirection}&size=l&img_format=png`;
  };

  return (
    <div 
      className="flex items-center justify-center bg-gradient-to-b from-blue-100 to-white rounded-lg p-4"
      style={{ transform: `scale(${zoom / 100})` }}
    >
      <img
        src={getAvatarUrl()}
        alt="Avatar Preview"
        className="max-w-none"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default HabboRenderer;
