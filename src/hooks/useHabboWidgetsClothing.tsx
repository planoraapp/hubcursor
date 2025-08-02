
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
  console.log('🌐 [HabboWidgets] Buscando dados das roupas...');
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-widgets-clothing');
    
    if (error) {
      console.error('❌ [HabboWidgets] Erro na função:', error);
      throw error;
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn('⚠️ [HabboWidgets] Dados inválidos recebidos:', data);
      return generateFallbackData();
    }
    
    // Agrupar por categoria
    const groupedItems: Record<string, HabboWidgetsItem[]> = {};
    
    data.forEach((item: any) => {
      if (!groupedItems[item.category]) {
        groupedItems[item.category] = [];
      }
      
      groupedItems[item.category].push({
        id: item.id,
        name: item.name || `Item ${item.figureId}`,
        category: item.category,
        figureId: item.figureId || item.swfName,
        thumbnailUrl: generateThumbnailUrl(item.category, item.figureId || item.swfName),
        club: item.club === 'HC',
        gender: item.gender || 'U',
        colors: item.colors || ['1', '2', '3', '4', '5'],
        rarity: determineRarity(item)
      });
    });
    
    console.log('✅ [HabboWidgets] Dados agrupados por categoria:', Object.keys(groupedItems));
    return groupedItems;
    
  } catch (error) {
    console.error('❌ [HabboWidgets] Erro ao buscar dados:', error);
    return generateFallbackData();
  }
};

const generateThumbnailUrl = (category: string, figureId: string): string => {
  const headOnlyCategories = ['hd', 'hr', 'ha', 'ea', 'fa'];
  const headOnly = headOnlyCategories.includes(category) ? '&headonly=1' : '';
  
  // Usar figura base consistente para preview
  const baseFigure = 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1';
  
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${baseFigure.replace(`${category}-\\d+-\\d+`, `${category}-${figureId}-1`)}&gender=U&size=l&direction=2&head_direction=3${headOnly}`;
};

const determineRarity = (item: any): 'common' | 'rare' | 'super_rare' | 'limited' => {
  if (item.club === 'HC') return 'rare';
  if (item.name?.toLowerCase().includes('ltd') || item.name?.toLowerCase().includes('limited')) return 'limited';
  if (item.name?.toLowerCase().includes('rare') || parseInt(item.figureId) > 5000) return 'super_rare';
  return 'common';
};

const generateFallbackData = (): Record<string, HabboWidgetsItem[]> => {
  const categories = {
    'ca': { name: 'Bijuterias', count: 50 },
    'cc': { name: 'Casacos', count: 40 },
    'ch': { name: 'Camisas', count: 60 },
    'cp': { name: 'Estampas', count: 30 },
    'ea': { name: 'Óculos', count: 25 },
    'fa': { name: 'Máscaras', count: 20 },
    'ha': { name: 'Chapéus', count: 45 },
    'hd': { name: 'Rosto & Corpo', count: 35 },
    'hr': { name: 'Cabelo', count: 55 },
    'lg': { name: 'Calças', count: 40 },
    'sh': { name: 'Sapatos', count: 35 },
    'wa': { name: 'Cintos', count: 15 }
  };
  
  const fallbackData: Record<string, HabboWidgetsItem[]> = {};
  
  Object.entries(categories).forEach(([categoryCode, categoryInfo]) => {
    fallbackData[categoryCode] = [];
    
    for (let i = 1; i <= categoryInfo.count; i++) {
      const figureId = (i * 100 + Math.floor(Math.random() * 99)).toString();
      
      fallbackData[categoryCode].push({
        id: `fallback_${categoryCode}_${i}`,
        name: `${categoryInfo.name} ${i}`,
        category: categoryCode,
        figureId,
        thumbnailUrl: generateThumbnailUrl(categoryCode, figureId),
        club: Math.random() > 0.8,
        gender: 'U',
        colors: ['1', '2', '3', '4', '5'],
        rarity: Math.random() > 0.9 ? 'rare' : 'common'
      });
    }
  });
  
  console.log('🔄 [HabboWidgets] Dados de fallback gerados');
  return fallbackData;
};

export const useHabboWidgetsClothing = () => {
  return useQuery({
    queryKey: ['habbo-widgets-clothing'],
    queryFn: fetchHabboWidgetsClothing,
    staleTime: 1000 * 60 * 60 * 2, // 2 horas
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
    retry: 2,
  });
};
