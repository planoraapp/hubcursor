
/**
 * Generates focused clothing sprite URLs that show only the clothing piece
 * Similar to Puhekupla's approach but using Habbo's official imaging system
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
  gender: 'M' | 'F' = 'M'
): string => {
  const mapping = CLOTHING_SPRITE_MAPPING[category];
  if (!mapping) {
    console.warn(`[ClothingSpriteGenerator] No mapping found for category: ${category}`);
    return '';
  }

  const actualGender = gender === 'F' ? 'F' : 'M';
  const genderSuffix = actualGender === 'F' ? '_f' : '_m';
  const direction = mapping.baseDirection || 'front_right';
  
  // Try to generate a focused sprite URL (fallback approach)
  const spriteUrl = `https://content.puhekupla.com/img/clothes/${mapping.prefix}_${actualGender}_${figureId}_${direction}.png`;
  
  console.log(`🎨 [ClothingSpriteGenerator] Generated sprite URL: ${spriteUrl} for ${category}-${figureId}-${colorId}`);
  
  return spriteUrl;
};

export const getFallbackThumbnail = (
  category: string,
  figureId: string, 
  colorId: string = '1',
  gender: 'M' | 'F' = 'M'
): string => {
  // Fallback to minimal Habbo Imaging URL showing just the piece
  const actualGender = gender === 'F' ? 'F' : 'M';
  const figure = `${category}-${figureId}-${colorId}`;
  
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&gender=${actualGender}&size=s&direction=2&head_direction=2&action=std&gesture=std`;
};
