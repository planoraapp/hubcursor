
/**
 * Enhanced clothing sprite generator that prioritizes swfName slugs for Puhekupla
 * Falls back gracefully to figureId and then Habbo Imaging
 */

const CLOTHING_SPRITE_MAPPING: Record<string, { prefix: string; baseDirection?: string }> = {
  // Head items
  'hd': { prefix: 'head', baseDirection: 'front_right' },
  'hr': { prefix: 'hair', baseDirection: 'front_right' },
  'ha': { prefix: 'hat', baseDirection: 'front_right' },
  'ea': { prefix: 'eyeacc', baseDirection: 'front_right' },
  'fa': { prefix: 'faceacc', baseDirection: 'front_right' },
  
  // Body items
  'ch': { prefix: 'shirt', baseDirection: 'front_right' },
  'cc': { prefix: 'coat', baseDirection: 'front_right' },
  'cp': { prefix: 'chest_print', baseDirection: 'front_right' },
  'ca': { prefix: 'chest_accessory', baseDirection: 'front_right' },
  
  // Leg items
  'lg': { prefix: 'trousers', baseDirection: 'front_right' },
  'sh': { prefix: 'shoes', baseDirection: 'front_right' },
  'wa': { prefix: 'waist', baseDirection: 'front_right' }
};

export const getClothingSpriteUrl = (
  category: string, 
  figureId: string, 
  colorId: string = '1',
  gender: 'M' | 'F' = 'M',
  swfName?: string
): string => {
  const mapping = CLOTHING_SPRITE_MAPPING[category];
  if (!mapping) {
        return getFallbackThumbnail(category, figureId, colorId, gender);
  }

  const actualGender = gender === 'F' ? 'F' : 'M';
  const direction = mapping.baseDirection || 'front_right';
  
  // Strategy 1: Try swfName slug (preferred for Puhekupla)
  if (swfName && swfName !== figureId) {
    const slugUrl = `https://content.puhekupla.com/img/clothes/${mapping.prefix}_${actualGender}_${swfName}_${direction}.png`;
        return slugUrl;
  }
  
  // Strategy 2: Try figureId (fallback)
  const figureUrl = `https://content.puhekupla.com/img/clothes/${mapping.prefix}_${actualGender}_${figureId}_${direction}.png`;
    return figureUrl;
};

export const getFallbackThumbnail = (
  category: string,
  figureId: string, 
  colorId: string = '1',
  gender: 'M' | 'F' = 'M'
): string => {
  // Generate isolated Habbo Imaging URL
  const actualGender = gender === 'F' ? 'F' : 'M';
  const figure = `${category}-${figureId}-${colorId}`;
  
  const fallbackUrl = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&gender=${actualGender}&size=s&direction=2&head_direction=2&action=std&gesture=std`;
    return fallbackUrl;
};

// Enhanced function that tries multiple strategies
export const getOptimalSpriteUrl = (item: {
  category: string;
  figureId: string;
  swfName?: string;
}, colorId: string = '1', gender: 'M' | 'F' = 'M'): string[] => {
  const urls: string[] = [];
  
  // Primary: swfName slug
  if (item.swfName && item.swfName !== item.figureId) {
    urls.push(getClothingSpriteUrl(item.category, item.figureId, colorId, gender, item.swfName));
  }
  
  // Secondary: figureId
  urls.push(getClothingSpriteUrl(item.category, item.figureId, colorId, gender));
  
  // Tertiary: Habbo Imaging fallback
  urls.push(getFallbackThumbnail(item.category, item.figureId, colorId, gender));
  
  return urls;
};
