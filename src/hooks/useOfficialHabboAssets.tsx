
// Create a proper OfficialHabboAsset interface that's compatible
export interface OfficialHabboAsset {
  id: string;
  name: string;
  type: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  figureId: string;
  thumbnail?: string;
  thumbnailUrl: string;
  colors: string[];
  club: 'FREE' | 'HC';
  swfName?: string;
  source: 'official-habbo';
}

// Generate avatar preview function
export const generateAvatarPreview = (
  figureString: string,
  gender: 'M' | 'F' = 'M',
  hotel: string = 'com'
): string => {
  const baseUrl = hotel.includes('.') 
    ? `https://www.habbo.${hotel}`
    : `https://www.habbo.com`;
  
  return `${baseUrl}/habbo-imaging/avatarimage?figure=${figureString}&gender=${gender}&direction=2&head_direction=3&size=l&img_format=png&gesture=std&action=std`;
};
