
import { useState, useEffect, useMemo } from 'react';
import { setsJSON, palettesJSON, HabboFigureSet, HabboPalette } from '@/data/habboTemplariosData';

export interface TemplariosItem {
  id: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  club: number;
  colorable: number;
  selectable: number;
}

export const useTemplariosData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Process sets data
  const processedItems = useMemo(() => {
    const items: TemplariosItem[] = [];
    
    setsJSON.forEach(categorySet => {
      Object.entries(categorySet.sets).forEach(([setId, setData]) => {
        items.push({
          id: setId,
          category: categorySet.type,
          gender: setData.gender,
          club: setData.club,
          colorable: setData.colorable,
          selectable: setData.selectable
        });
      });
    });
    
    return items;
  }, []);

  // Get items by category and gender
  const getItemsByCategory = (category: string, gender: 'M' | 'F') => {
    return processedItems.filter(item => 
      item.category === category && 
      item.selectable === 1 &&
      (item.gender === gender || item.gender === 'U')
    );
  };

  // Get palette for category
  const getPaletteForCategory = (category: string): HabboPalette | null => {
    const categorySet = setsJSON.find(set => set.type === category);
    if (!categorySet) return null;
    
    const paletteId = categorySet.paletteid.toString();
    return palettesJSON[paletteId] || null;
  };

  return {
    items: processedItems,
    palettes: palettesJSON,
    sets: setsJSON,
    getItemsByCategory,
    getPaletteForCategory,
    isLoading,
    error
  };
};
