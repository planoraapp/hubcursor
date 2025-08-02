
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
  console.log('🌐 [HabboWidgets] Iniciando busca completa...');
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-widgets-clothing');
    
    if (error) {
      console.error('❌ [HabboWidgets] Erro na função:', error);
      throw error;
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn('⚠️ [HabboWidgets] Dados inválidos:', data);
      return generateEnhancedFallbackData();
    }
    
    // Agrupar itens por categoria e processar
    const groupedItems: Record<string, HabboWidgetsItem[]> = {};
    
    data.forEach((rawItem: any) => {
      const processedItem = processRawItem(rawItem);
      
      if (!processedItem) return;
      
      const { category } = processedItem;
      if (!groupedItems[category]) {
        groupedItems[category] = [];
      }
      
      groupedItems[category].push(processedItem);
    });
    
    // Ordenar itens por figureId dentro de cada categoria
    Object.keys(groupedItems).forEach(category => {
      groupedItems[category].sort((a, b) => parseInt(a.figureId) - parseInt(b.figureId));
    });
    
    console.log('✅ [HabboWidgets] Dados processados:', {
      categories: Object.keys(groupedItems).length,
      totalItems: Object.values(groupedItems).reduce((sum, items) => sum + items.length, 0),
      breakdown: Object.entries(groupedItems).map(([cat, items]) => `${cat}: ${items.length}`).join(', ')
    });
    
    return groupedItems;
    
  } catch (error) {
    console.error('❌ [HabboWidgets] Erro crítico:', error);
    return generateEnhancedFallbackData();
  }
};

const processRawItem = (rawItem: any): HabboWidgetsItem | null => {
  try {
    if (!rawItem?.category || !rawItem?.figureId) {
      console.warn('⚠️ [Process] Item inválido:', rawItem);
      return null;
    }
    
    const club = rawItem.club === 'HC' || rawItem.club === true;
    
    return {
      id: rawItem.id || `processed_${rawItem.category}_${rawItem.figureId}`,
      name: rawItem.name || `${getCategoryName(rawItem.category)} ${rawItem.figureId}`,
      category: rawItem.category,
      figureId: rawItem.figureId,
      thumbnailUrl: rawItem.imageUrl || generateEnhancedThumbnail(rawItem.category, rawItem.figureId),
      club: club,
      gender: rawItem.gender || 'U',
      colors: rawItem.colors || ['1', '2', '3', '4', '5'],
      rarity: determineItemRarity(rawItem)
    };
    
  } catch (error) {
    console.error('❌ [Process] Erro ao processar item:', rawItem, error);
    return null;
  }
};

const generateEnhancedThumbnail = (category: string, figureId: string, colorId: string = '1'): string => {
  // Usar figura base otimizada para cada tipo de categoria
  const baseFigures = {
    default: 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1',
    headOnly: 'hd-180-1.hr-828-45', // Para categorias que só mostram cabeça
    fullBody: 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1' // Para corpo inteiro
  };
  
  const headOnlyCategories = ['hd', 'hr', 'ha', 'ea', 'fa'];
  const isHeadOnly = headOnlyCategories.includes(category);
  
  const baseFigure = isHeadOnly ? baseFigures.headOnly : baseFigures.fullBody;
  
  // Criar figura modificada
  let modifiedFigure: string;
  const categoryRegex = new RegExp(`${category}-\\d+-\\d+`);
  
  if (baseFigure.match(categoryRegex)) {
    // Substituir categoria existente
    modifiedFigure = baseFigure.replace(categoryRegex, `${category}-${figureId}-${colorId}`);
  } else {
    // Adicionar nova categoria
    modifiedFigure = `${baseFigure}.${category}-${figureId}-${colorId}`;
  }
  
  const headOnlyParam = isHeadOnly ? '&headonly=1' : '';
  
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${modifiedFigure}&gender=U&size=l&direction=2&head_direction=3${headOnlyParam}`;
};

const determineItemRarity = (item: any): 'common' | 'rare' | 'super_rare' | 'limited' => {
  if (item.club === 'HC' || item.club === true) return 'rare';
  if (item.name?.toLowerCase().includes('ltd') || item.name?.toLowerCase().includes('limited')) return 'limited';
  if (item.name?.toLowerCase().includes('rare') || parseInt(item.figureId) > 5000) return 'super_rare';
  return 'common';
};

const generateEnhancedFallbackData = (): Record<string, HabboWidgetsItem[]> => {
  console.log('🔄 [Fallback] Gerando dados aprimorados...');
  
  const categories = {
    'ca': { name: 'Bijuterias', items: 60, baseId: 6000 },
    'cc': { name: 'Casacos', items: 40, baseId: 3000 },
    'ch': { name: 'Camisas', items: 50, baseId: 3300 },
    'cp': { name: 'Estampas', items: 30, baseId: 1000 },
    'ea': { name: 'Óculos', items: 35, baseId: 400 },
    'fa': { name: 'Máscaras', items: 25, baseId: 300 },
    'ha': { name: 'Chapéus', items: 45, baseId: 1100 },
    'hd': { name: 'Rosto & Corpo', items: 30, baseId: 180 },
    'hr': { name: 'Cabelo', items: 55, baseId: 800 },
    'lg': { name: 'Calças', items: 40, baseId: 3500 },
    'sh': { name: 'Sapatos', items: 35, baseId: 3520 },
    'wa': { name: 'Cintos', items: 20, baseId: 500 }
  };
  
  const fallbackData: Record<string, HabboWidgetsItem[]> = {};
  
  Object.entries(categories).forEach(([categoryCode, categoryInfo]) => {
    fallbackData[categoryCode] = [];
    
    for (let i = 0; i < categoryInfo.items; i++) {
      const figureId = (categoryInfo.baseId + i + Math.floor(Math.random() * 50)).toString();
      const isRare = Math.random() > 0.75; // 25% chance de ser raro
      
      fallbackData[categoryCode].push({
        id: `fallback_${categoryCode}_${figureId}`,
        name: `${categoryInfo.name} ${figureId}${isRare ? ' Premium' : ''}`,
        category: categoryCode,
        figureId: figureId,
        thumbnailUrl: generateEnhancedThumbnail(categoryCode, figureId),
        club: isRare,
        gender: 'U',
        colors: ['1', '2', '3', '4', '5', '6', '7', '8'],
        rarity: isRare ? 'rare' : 'common'
      });
    }
  });
  
  console.log('✅ [Fallback] Dados aprimorados gerados:', Object.keys(fallbackData).map(k => `${k}: ${fallbackData[k].length}`).join(', '));
  return fallbackData;
};

const getCategoryName = (category: string): string => {
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
    queryKey: ['habbo-widgets-clothing-enhanced'],
    queryFn: fetchHabboWidgetsClothing,
    staleTime: 1000 * 60 * 60 * 4, // 4 horas
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
    retry: 2,
  });
};
