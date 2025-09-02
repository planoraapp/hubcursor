
import { HybridClothingItem } from '@/hooks/useHybridClothingData';

export interface FigurePart {
  category: string;
  id: string;
  colors: string[];
}

export interface CurrentFigure {
  hd?: FigurePart;
  hr?: FigurePart;
  ch?: FigurePart;
  lg?: FigurePart;
  sh?: FigurePart;
  ha?: FigurePart;
  ea?: FigurePart;
  fa?: FigurePart;
  cc?: FigurePart;
  ca?: FigurePart;
  wa?: FigurePart;
  cp?: FigurePart;
}

/**
 * Converts a HybridClothingItem to a FigurePart for use in figure strings
 */
export const hybridItemToFigurePart = (item: HybridClothingItem): FigurePart => {
  let figureId = item.figureId;
  
  // Extract figure ID from swfName if not available
  if (!figureId) {
    const match = item.swfName.match(/(\d+)/);
    figureId = match ? match[1] : '1';
  }
  
  return {
    category: item.category,
    id: figureId,
    colors: [item.colors[0] || '1']
  };
};

/**
 * Converts a CurrentFigure object to a figure string
 */
export const currentFigureToString = (figure: CurrentFigure): string => {
  const parts = Object.entries(figure)
    .filter(([_, part]) => part && part.id !== '0' && part.id !== '')
    .map(([category, part]) => {
      if (!part) return '';
      return `${category}-${part.id}-${part.colors.join('.')}`;
    })
    .filter(part => part.length > 0)
    .join('.');
  
  console.log('🎨 [FigureMapper] Generated figure string:', parts);
  return parts;
};

/**
 * Parses a figure string into a CurrentFigure object
 */
export const parseFigureString = (figureString: string): CurrentFigure => {
  const figure: CurrentFigure = {};
  
  try {
    const parts = figureString.split('.');
    
    for (const part of parts) {
      const match = part.match(/^([a-z]{2})-(\d+)-(.+)$/);
      if (match) {
        const [_, category, id, colorsStr] = match;
        const colors = colorsStr.split('.');
        
        figure[category as keyof CurrentFigure] = {
          category,
          id,
          colors
        };
      }
    }
  } catch (error) {
    console.error('❌ [FigureMapper] Error parsing figure string:', error);
  }
  
  return figure;
};

/**
 * Validates if a figure string is properly formatted
 */
export const validateFigureString = (figureString: string): boolean => {
  if (!figureString || figureString.trim() === '') return false;
  
  const parts = figureString.split('.');
  
  for (const part of parts) {
    // Each part should match pattern: category-id-color(s)
    if (!part.match(/^[a-z]{2}-\d+-[\d\.]+$/)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Updates a CurrentFigure with a new item, replacing the existing part of that category
 */
export const updateFigureWithItem = (
  currentFigure: CurrentFigure, 
  item: HybridClothingItem,
  colorId?: string
): CurrentFigure => {
  const newPart = hybridItemToFigurePart(item);
  
  // Use provided color or default to first available color
  if (colorId) {
    newPart.colors = [colorId];
  }
  
  const updatedFigure = {
    ...currentFigure,
    [item.category]: newPart
  };
  
  console.log('🔄 [FigureMapper] Updated figure with item:', {
    category: item.category,
    id: newPart.id,
    colors: newPart.colors,
    itemName: item.name
  });
  
  return updatedFigure;
};

/**
 * Removes a category from the current figure
 */
export const removeCategoryFromFigure = (
  currentFigure: CurrentFigure,
  category: string
): CurrentFigure => {
  const updatedFigure = { ...currentFigure };
  delete updatedFigure[category as keyof CurrentFigure];
  
  console.log('🗑️ [FigureMapper] Removed category from figure:', category);
  return updatedFigure;
};

/**
 * Gets the current part for a specific category
 */
export const getCurrentPartForCategory = (
  figure: CurrentFigure,
  category: string
): FigurePart | undefined => {
  return figure[category as keyof CurrentFigure];
};

/**
 * Generates a random figure using provided items
 */
export const generateRandomFigure = (items: HybridClothingItem[]): CurrentFigure => {
  const figure: CurrentFigure = {};
  const requiredCategories = ['hd', 'hr', 'ch', 'lg', 'sh'];
  const optionalCategories = ['ha', 'ea', 'fa', 'cc', 'ca', 'wa', 'cp'];
  
  // Add required categories
  for (const category of requiredCategories) {
    const categoryItems = items.filter(item => item.category === category);
    if (categoryItems.length > 0) {
      const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
      figure[category as keyof CurrentFigure] = hybridItemToFigurePart(randomItem);
    }
  }
  
  // Randomly add some optional categories (30% chance each)
  for (const category of optionalCategories) {
    if (Math.random() < 0.3) {
      const categoryItems = items.filter(item => item.category === category);
      if (categoryItems.length > 0) {
        const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
        figure[category as keyof CurrentFigure] = hybridItemToFigurePart(randomItem);
      }
    }
  }
  
  console.log('🎲 [FigureMapper] Generated random figure:', figure);
  return figure;
};

/**
 * Default figure for fallback
 */
export const DEFAULT_FIGURE: CurrentFigure = {
  hd: { category: 'hd', id: '180', colors: ['1'] },
  hr: { category: 'hr', id: '828', colors: ['45'] },
  ch: { category: 'ch', id: '665', colors: ['92'] },
  lg: { category: 'lg', id: '700', colors: ['1'] },
  sh: { category: 'sh', id: '705', colors: ['1'] }
};
