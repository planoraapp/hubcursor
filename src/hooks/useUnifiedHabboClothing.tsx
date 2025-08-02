
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedClothingItem {
  id: string;
  category: string;
  figureId: string;
  name: string;
  gender: 'M' | 'F' | 'U';
  club: boolean;
  colorable: boolean;
  colors: string[];
  thumbnailUrl: string;
  source: 'flash-assets' | 'official';
}

interface UseUnifiedHabboClothingProps {
  category?: string;
  gender?: string;
  limit?: number;
  enabled?: boolean;
}

const fetchUnifiedClothing = async ({
  category = 'all',
  gender = 'U',
  limit = 500
}: UseUnifiedHabboClothingProps): Promise<UnifiedClothingItem[]> => {
  console.log(`🌐 [UnifiedHabboClothing] Fetching category: ${category}, gender: ${gender}, limit: ${limit}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('get-unified-clothing-data', {
      body: { category, gender, limit }
    });

    if (error) {
      console.error('❌ [UnifiedHabboClothing] Supabase function error:', error);
      throw error;
    }

    if (!data || !data.items || !Array.isArray(data.items)) {
      console.error('❌ [UnifiedHabboClothing] Invalid response format:', data);
      
      // Se não temos dados, retornar fallback
      return generateFallbackClothing(category);
    }

    console.log(`✅ [UnifiedHabboClothing] Successfully fetched ${data.items.length} items`);
    console.log(`📊 [UnifiedHabboClothing] Metadata:`, data.metadata);
    
    return data.items;
    
  } catch (error) {
    console.error('❌ [UnifiedHabboClothing] Error:', error);
    
    // Fallback para dados básicos se a API falhar
    return generateFallbackClothing(category);
  }
};

const generateFallbackClothing = (category: string): UnifiedClothingItem[] => {
  const categories = category === 'all' ? ['hd', 'hr', 'ch', 'lg', 'sh'] : [category];
  const fallbackItems: UnifiedClothingItem[] = [];
  
  categories.forEach(cat => {
    for (let i = 1; i <= 30; i++) {
      fallbackItems.push({
        id: `fallback_${cat}_${i}`,
        category: cat,
        figureId: i.toString(),
        name: `${getCategoryName(cat)} ${i}`,
        gender: 'U',
        club: false,
        colorable: true,
        colors: ['1', '2', '3', '4', '5'],
        thumbnailUrl: `https://www.habbo.com/habbo-imaging/avatarimage?figure=${cat}-${i}-1&gender=U&size=l&direction=2&head_direction=3${['hd', 'hr', 'ha', 'ea', 'fa'].includes(cat) ? '&headonly=1' : ''}`,
        source: 'official'
      });
    }
  });
  
  console.log(`🔄 [UnifiedHabboClothing] Generated ${fallbackItems.length} fallback items for category: ${category}`);
  return fallbackItems;
};

const getCategoryName = (category: string): string => {
  const names = {
    'hd': 'Rosto',
    'hr': 'Cabelo', 
    'ch': 'Camiseta',
    'lg': 'Calça',
    'sh': 'Sapato',
    'ha': 'Chapéu',
    'ea': 'Óculos',
    'fa': 'Acessório Facial',
    'cc': 'Casaco',
    'ca': 'Acessório Peito',
    'wa': 'Cintura',
    'cp': 'Estampa'
  };
  return names[category as keyof typeof names] || 'Item';
};

export const useUnifiedHabboClothing = ({
  category = 'hd', // Default to 'hd' instead of 'all' for better loading
  gender = 'U',
  limit = 100, // Reduced limit for better performance
  enabled = true
}: UseUnifiedHabboClothingProps = {}) => {
  console.log(`🔧 [UnifiedHabboClothing] Hook called with category: ${category}, gender: ${gender}, limit: ${limit}, enabled: ${enabled}`);
  
  return useQuery({
    queryKey: ['unified-habbo-clothing', category, gender, limit],
    queryFn: () => fetchUnifiedClothing({ category, gender, limit }),
    enabled,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    refetchOnWindowFocus: false
  });
};
