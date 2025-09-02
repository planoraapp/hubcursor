
import { OFFICIAL_HABBO_PALETTES, getCategoryPalette, isValidColorForCategory as validateColorForCategory, getDefaultColorForCategory as getDefaultColor } from '@/lib/enhancedCategoryMapperV2';

/**
 * Valida se uma cor é válida para uma categoria específica
 */
export const isValidColorForCategory = validateColorForCategory;

/**
 * Obtém a primeira cor válida para uma categoria
 */
export const getDefaultColorForCategory = getDefaultColor;

/**
 * Obtém todas as cores disponíveis para uma categoria
 */
export const getAvailableColorsForCategory = (category: string): string[] => {
  const palette = getCategoryPalette(category);
  return palette.colors.map(color => color.id);
};

/**
 * Verifica se uma cor é premium (HC)
 */
export const isHCColor = (colorId: string, category: string): boolean => {
  const palette = getCategoryPalette(category);
  const color = palette.colors.find(c => c.id === colorId);
  return color?.isHC || false;
};

/**
 * Obtém informações completas de uma cor
 */
export const getColorInfo = (colorId: string, category: string) => {
  const palette = getCategoryPalette(category);
  return palette.colors.find(c => c.id === colorId);
};

/**
 * Valida um figure string completo
 */
export const validateFigureString = (figureString: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const parts = figureString.split('.');
  
  parts.forEach(part => {
    const [category, figureId, colorId] = part.split('-');
    
    if (!category || !figureId || !colorId) {
      errors.push(`Parte inválida: ${part}`);
      return;
    }
    
    if (!isValidColorForCategory(colorId, category)) {
      errors.push(`Cor ${colorId} inválida para categoria ${category}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Corrige cores inválidas em um figure string
 */
export const fixInvalidColors = (figureString: string): string => {
  const parts = figureString.split('.');
  
  const fixedParts = parts.map(part => {
    const [category, figureId, colorId] = part.split('-');
    
    if (!category || !figureId || !colorId) {
      return part;
    }
    
    if (!isValidColorForCategory(colorId, category)) {
      const defaultColor = getDefaultColorForCategory(category);
      console.log(`🔧 [ColorValidator] Corrigindo cor inválida: ${category}-${figureId}-${colorId} → ${category}-${figureId}-${defaultColor}`);
      return `${category}-${figureId}-${defaultColor}`;
    }
    
    return part;
  });
  
  return fixedParts.join('.');
};
