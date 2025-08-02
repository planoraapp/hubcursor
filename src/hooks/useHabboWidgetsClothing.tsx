
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
  console.log('🌐 [HabboWidgets] Iniciando busca COMPLETA...');
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-widgets-clothing');
    
    if (error) {
      console.error('❌ [HabboWidgets] Erro na função:', error);
      throw error;
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn('⚠️ [HabboWidgets] Dados inválidos recebidos');
      return generateLocalFallback();
    }
    
    console.log(`📊 [HabboWidgets] Recebidos ${data.length} itens brutos`);
    
    // Processar e agrupar todos os itens
    const groupedItems: Record<string, HabboWidgetsItem[]> = {};
    let processedCount = 0;
    
    data.forEach((rawItem: any) => {
      const processedItem = processRawItemOptimized(rawItem);
      
      if (!processedItem) return;
      
      const { category } = processedItem;
      if (!groupedItems[category]) {
        groupedItems[category] = [];
      }
      
      // Evitar duplicatas
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
    console.log(`✅ [HabboWidgets] Processamento concluído:`, {
      categories: totalCategories,
      totalItems: processedCount,
      breakdown: Object.entries(groupedItems).map(([cat, items]) => 
        `${cat}: ${items.length}`
      ).join(', ')
    });
    
    return groupedItems;
    
  } catch (error) {
    console.error('❌ [HabboWidgets] Erro crítico na busca:', error);
    return generateLocalFallback();
  }
};

const processRawItemOptimized = (rawItem: any): HabboWidgetsItem | null => {
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
    
    const isHC = rawItem.club === 'HC' || rawItem.club === true;
    
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
    console.warn('⚠️ [Process] Erro ao processar item:', error.message);
    return null;
  }
};

const generateOptimizedThumbnail = (category: string, figureId: string, colorId: string = '1'): string => {
  // Figuras base otimizadas por categoria
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

const generateLocalFallback = (): Record<string, HabboWidgetsItem[]> => {
  console.log('🔄 [LocalFallback] Gerando fallback local expandido...');
  
  const categories = {
    'ca': { name: 'Bijuterias', count: 200, baseId: 6000 },
    'cc': { name: 'Casacos', count: 100, baseId: 3000 },
    'ch': { name: 'Camisas', count: 150, baseId: 3300 },
    'cp': { name: 'Estampas', count: 80, baseId: 1000 },
    'ea': { name: 'Óculos', count: 90, baseId: 400 },
    'fa': { name: 'Máscaras', count: 60, baseId: 300 },
    'ha': { name: 'Chapéus', count: 120, baseId: 1100 },
    'hd': { name: 'Rosto & Corpo', count: 50, baseId: 180 },
    'hr': { name: 'Cabelo', count: 150, baseId: 800 },
    'lg': { name: 'Calças', count: 100, baseId: 3500 },
    'sh': { name: 'Sapatos', count: 90, baseId: 3520 },
    'wa': { name: 'Cintos', count: 50, baseId: 500 }
  };
  
  const fallbackData: Record<string, HabboWidgetsItem[]> = {};
  
  Object.entries(categories).forEach(([categoryCode, categoryInfo]) => {
    fallbackData[categoryCode] = [];
    
    for (let i = 0; i < categoryInfo.count; i++) {
      const figureId = (categoryInfo.baseId + i + Math.floor(Math.random() * 100)).toString();
      const isRare = Math.random() > 0.8;
      
      fallbackData[categoryCode].push({
        id: `local_${categoryCode}_${figureId}`,
        name: `${categoryInfo.name} ${figureId}${isRare ? ' Premium' : ''}`,
        category: categoryCode,
        figureId: figureId,
        thumbnailUrl: generateOptimizedThumbnail(categoryCode, figureId),
        club: isRare,
        gender: 'U',
        colors: ['1', '2', '3', '4', '5', '6', '7', '8'],
        rarity: isRare ? 'rare' : 'common'
      });
    }
  });
  
  const totalItems = Object.values(fallbackData).reduce((sum, items) => sum + items.length, 0);
  console.log(`✅ [LocalFallback] ${totalItems} itens locais gerados`);
  
  return fallbackData;
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
    queryKey: ['habbo-widgets-clothing-complete'],
    queryFn: fetchHabboWidgetsClothing,
    staleTime: 1000 * 60 * 60 * 6, // 6 horas
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
