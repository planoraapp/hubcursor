
import { useMemo } from 'react';

export const useTemplariosPreview = () => {
  // Generate single part preview URL
  const getSinglePartPreviewUrl = (
    category: string,
    figureId: string,
    colorId: string = '1',
    gender: 'M' | 'F' = 'M',
    hotel: string = 'com'
  ): string => {
    const baseUrl = hotel.includes('.') 
      ? `https://www.habbo.${hotel}`
      : `https://www.habbo.com`;
    
    const figureString = `${category}-${figureId}-${colorId}`;
    
    return `${baseUrl}/habbo-imaging/avatarimage?figure=${figureString}&gender=${gender}&direction=2&head_direction=2&size=s&img_format=png&gesture=std&action=std`;
  };

  // Generate full avatar preview URL
  const getFullAvatarUrl = (
    figureString: string,
    gender: 'M' | 'F' = 'M',
    hotel: string = 'com',
    size: string = 'l',
    direction: string = '2',
    headDirection: string = '3'
  ): string => {
    const baseUrl = hotel.includes('.') 
      ? `https://www.habbo.${hotel}`
      : `https://www.habbo.com`;
    
    return `${baseUrl}/habbo-imaging/avatarimage?figure=${figureString}&gender=${gender}&direction=${direction}&head_direction=${headDirection}&size=${size}&img_format=png&gesture=std&action=std`;
  };

  return {
    getSinglePartPreviewUrl,
    getFullAvatarUrl
  };
};
