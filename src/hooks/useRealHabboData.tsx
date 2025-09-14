
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RealHabboItem {
  id: string;
  figureId: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  colors: string[];
  club: 'FREE' | 'HC' | 'LTD';
  name: string;
  type: string;
  selectable: boolean;
}

export interface RealHabboData {
  [category: string]: RealHabboItem[];
}

const fetchRealHabboData = async (): Promise<RealHabboData> => {
    try {
    const { data, error } = await supabase.functions.invoke('habbo-unified-api', {
      body: {
        endpoint: 'clothing',
        action: 'search',
        params: { limit: 1000, category: 'all' }
      }
    });
    
    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }
    
    if (!data?.clothing) {
      throw new Error('No data received from edge function');
    }
    
    console.log('✅ [RealHabboData] Data loaded:', {
      categories: Object.keys(data.clothing).length,
      totalItems: Object.values(data.clothing).reduce((sum: number, items: any) => sum + items.length, 0),
      source: data.source
    });
    
    return data.clothing;
    
  } catch (error) {
        throw error;
  }
};

export const useRealHabboData = () => {
  return useQuery({
    queryKey: ['real-habbo-data'],
    queryFn: fetchRealHabboData,
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
  });
};

export const useRealHabboCategory = (categoryId: string, gender: 'M' | 'F') => {
  const { data: allData, ...queryResult } = useRealHabboData();
  
  const filteredItems = allData?.[categoryId]?.filter(
    item => item.gender === gender || item.gender === 'U'
  ) || [];
  
  console.log(`🎯 [RealHabboCategory] Category ${categoryId} (${gender}):`, filteredItems.length, 'items');
  
  return {
    ...queryResult,
    data: filteredItems
  };
};

// Função para gerar URL de thumbnail isolada (igual ViaJovem)
export const generateIsolatedThumbnail = (
  category: string, 
  figureId: string, 
  colorId: string = '1',
  gender: 'M' | 'F' = 'M',
  hotel: string = 'com'
): string => {
  // Gerar URL isolada igual ViaJovem: figure=ch-5239-66--&gender=M
  const figureString = `${category}-${figureId}-${colorId}--`;
  
  return `https://www.habbo.${hotel}/habbo-imaging/avatarimage?figure=${figureString}&gender=${gender}&size=l&direction=2&head_direction=2`;
};
