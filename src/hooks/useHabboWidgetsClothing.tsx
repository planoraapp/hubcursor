
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HabboWidgetsItem {
  id: string;
  name: string;
  category: string;
  figureId: string;
  thumbnailUrl: string;
  club: boolean;
  gender: 'M' | 'F' | 'U';
  colors: string[];
  rarity: 'common' | 'rare' | 'super_rare' | 'limited';
}

const fetchHabboWidgetsClothing = async (): Promise<Record<string, HabboWidgetsItem[]>> => {
    try {
    const { data, error } = await supabase.functions.invoke('habbo-widgets-clothing');
    
    if (error) {
            throw error;
    }
    
    if (!data || !Array.isArray(data)) {
            return generateMassiveLocalFallback();
    }
    
        // Processar e agrupar os itens
    const groupedItems: Record<string, HabboWidgetsItem[]> = {};
    let processedCount = 0;
    
    data.forEach((rawItem: any) => {
      const processedItem = processRawItem(rawItem);
      
      if (!processedItem) return;
      
      const { category } = processedItem;
      if (!groupedItems[category]) {
        groupedItems[category] = [];
      }
      
      // Evitar duplicatas por figureId
      const exists = groupedItems[category].some(existing => 
        existing.figureId === processedItem.figureId
      );
      
      if (!exists) {
        groupedItems[category].push(processedItem);
        processedCount++;
      }
    });
    
    // Ordenar itens por figureId dentro de cada categoria
    Object.keys(groupedItems).forEach(category => {
      groupedItems[category].sort((a, b) => {
        const aId = parseInt(a.figureId) || 0;
        const bId = parseInt(b.figureId) || 0;
        return aId - bId;
      });
    });
    
    const totalCategories = Object.keys(groupedItems).length;
    console.log(`✅ [HabboWidgets] Processamento MASSIVO concluído:`, {
      categories: totalCategories,
      totalItems: processedCount,
      breakdown: Object.entries(groupedItems).map(([cat, items]) => 
        `${cat}: ${items.length}`
      ).join(', ')
    });
    
    return groupedItems;
    
  } catch (error) {
        return generateMassiveLocalFallback();
  }
};

const processRawItem = (rawItem: any): HabboWidgetsItem | null => {
  try {
    if (!rawItem?.category || !rawItem?.figureId) {
      return null;
    }
    
    // Validar category e figureId
    const validCategories = ['ca', 'cc', 'ch', 'cp', 'ea', 'fa', 'ha', 'hd', 'hr', 'lg', 'sh', 'wa'];
    if (!validCategories.includes(rawItem.category)) {
      return null;
    }
    
    const figureIdNum = parseInt(rawItem.figureId);
    if (isNaN(figureIdNum) || figureIdNum < 0) {
      return null;
    }
    
    const isHC = rawItem.club === 'HC' || rawItem.club === true || rawItem.club === '2';
    
    return {
      id: rawItem.id || `processed_${rawItem.category}_${rawItem.figureId}`,
      name: rawItem.name || `${getCategoryDisplayName(rawItem.category)} ${rawItem.figureId}`,
      category: rawItem.category,
      figureId: rawItem.figureId,
      thumbnailUrl: rawItem.imageUrl || generateOptimizedThumbnail(rawItem.category, rawItem.figureId),
      club: isHC,
      gender: rawItem.gender || 'U',
      colors: Array.isArray(rawItem.colors) ? rawItem.colors : ['1', '2', '3', '4', '5', '6', '7', '8'],
      rarity: determineItemRarity(rawItem, isHC)
    };
    
  } catch (error) {
        return null;
  }
};

const generateOptimizedThumbnail = (category: string, figureId: string, colorId: string = '1'): string => {
  // Figuras base otimizadas para cada categoria
  const baseFigures = {
    'hd': 'hd-180-1', 
    'hr': 'hd-180-1.hr-828-45', 
    'ha': 'hd-180-1.hr-828-45', 
    'ea': 'hd-180-1.hr-828-45', 
    'fa': 'hd-180-1.hr-828-45', 
    'ch': 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1', 
    'cc': 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1', 
    'lg': 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1', 
    'sh': 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1', 
    'ca': 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1', 
    'wa': 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1', 
    'cp': 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1'  
  };
  
  const baseFigure = baseFigures[category] || baseFigures['ch'];
  
  // Construir figura modificada
  let modifiedFigure: string;
  const categoryRegex = new RegExp(`${category}-\\d+-\\d+`);
  
  if (baseFigure.match(categoryRegex)) {
    modifiedFigure = baseFigure.replace(categoryRegex, `${category}-${figureId}-${colorId}`);
  } else {
    modifiedFigure = `${baseFigure}.${category}-${figureId}-${colorId}`;
  }
  
  // Parâmetros específicos para thumbnails
  const headOnlyCategories = ['hd', 'hr', 'ha', 'ea', 'fa'];
  const headOnly = headOnlyCategories.includes(category) ? '&headonly=1' : '';
  
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${modifiedFigure}&gender=U&size=l&direction=2&head_direction=3${headOnly}`;
};

const determineItemRarity = (item: any, isHC: boolean): 'common' | 'rare' | 'super_rare' | 'limited' => {
  if (isHC) return 'rare';
  if (item.name?.toLowerCase().includes('ltd') || item.name?.toLowerCase().includes('limited')) return 'limited';
  if (parseInt(item.figureId) > 5000) return 'super_rare';
  return 'common';
};

const generateMassiveLocalFallback = (): Record<string, HabboWidgetsItem[]> => {
    // Base MASSIVA expandida com muito mais itens
  const categories = {
    'ca': { name: 'Bijuterias', ranges: [[6000, 6200], [6300, 6500], [6600, 6800]], baseId: 6000 },
    'cc': { name: 'Casacos', ranges: [[3000, 3150], [3200, 3350], [4200, 4350]], baseId: 3000 },
    'ch': { name: 'Camisas', ranges: [[3300, 3500], [3600, 3800], [5000, 5200]], baseId: 3300 },
    'cp': { name: 'Estampas', ranges: [[1000, 1150], [1200, 1350], [1500, 1650]], baseId: 1000 },
    'ea': { name: 'Óculos', ranges: [[400, 500], [600, 700], [800, 900], [1200, 1300]], baseId: 400 },
    'fa': { name: 'Máscaras', ranges: [[300, 400], [500, 600], [700, 800]], baseId: 300 },
    'ha': { name: 'Chapéus', ranges: [[1100, 1250], [1400, 1550], [1800, 1950]], baseId: 1100 },
    'hd': { name: 'Rosto & Corpo', ranges: [[180, 230], [250, 300], [320, 370]], baseId: 180 },
    'hr': { name: 'Cabelo', ranges: [[800, 950], [1000, 1150], [3000, 3150]], baseId: 800 },
    'lg': { name: 'Calças', ranges: [[3100, 3250], [3500, 3650], [4500, 4650]], baseId: 3500 },
    'sh': { name: 'Sapatos', ranges: [[3520, 3650], [4000, 4150], [5500, 5650]], baseId: 3520 },
    'wa': { name: 'Cintos', ranges: [[500, 600], [700, 800], [900, 1000]], baseId: 500 }
  };
  
  const fallbackData: Record<string, HabboWidgetsItem[]> = {};
  
  Object.entries(categories).forEach(([categoryCode, categoryInfo]) => {
    fallbackData[categoryCode] = [];
    
    // Gerar itens de múltiplas faixas
    categoryInfo.ranges.forEach(([start, end]) => {
      for (let id = start; id <= end; id += 2) { // Step de 2 para mais variedade
        const isRare = Math.random() > 0.8;
        
        fallbackData[categoryCode].push({
          id: `massive_${categoryCode}_${id}`,
          name: `${categoryInfo.name} ${id}${isRare ? ' Premium' : ''}`,
          category: categoryCode,
          figureId: id.toString(),
          thumbnailUrl: generateOptimizedThumbnail(categoryCode, id.toString()),
          club: isRare,
          gender: 'U',
          colors: generateColorPalette(categoryCode),
          rarity: isRare ? 'rare' : 'common'
        });
      }
    });
  });
  
  const totalItems = Object.values(fallbackData).reduce((sum, items) => sum + items.length, 0);
    return fallbackData;
};

const generateColorPalette = (category: string): string[] => {
  // Paletas de cores específicas por categoria
  const colorPalettes: Record<string, string[]> = {
    'hd': ['1', '2', '3', '4'], // Tons de pele limitados
    'hr': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], // Cabelos variados
    'ch': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], // Roupas muito variadas
    'lg': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    'sh': ['1', '2', '3', '4', '5', '6', '7', '8'],
    'default': ['1', '2', '3', '4', '5', '6', '7', '8']
  };
  
  return colorPalettes[category] || colorPalettes.default;
};

const getCategoryDisplayName = (category: string): string => {
  const names = {
    'ca': 'Bijuteria',
    'cc': 'Casaco', 
    'ch': 'Camisa',
    'cp': 'Estampa',
    'ea': 'Óculos',
    'fa': 'Máscara',
    'ha': 'Chapéu',
    'hd': 'Rosto',
    'hr': 'Cabelo',
    'lg': 'Calça',
    'sh': 'Sapato',
    'wa': 'Cinto'
  };
  return names[category as keyof typeof names] || 'Item';
};

export const useHabboWidgetsClothing = () => {
  return useQuery({
    queryKey: ['habbo-widgets-clothing-massive'],
    queryFn: fetchHabboWidgetsClothing,
    staleTime: 1000 * 60 * 60 * 8, // 8 horas
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
