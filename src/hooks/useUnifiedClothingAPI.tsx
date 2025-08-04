import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedClothingItem {
  item_id: number;
  code: string;
  part: string;
  gender: 'M' | 'F' | 'U';
  colors: string[];
  image_url: string;
  club: 'HC' | 'FREE';
  source: string;
  is_active: boolean;
  name?: string;
  category?: string;
}

interface UseUnifiedClothingAPIProps {
  limit?: number;
  category?: string;
  gender?: 'M' | 'F' | 'U';
  enabled?: boolean;
  forceRefresh?: boolean;
}

const fetchUnifiedClothing = async ({
  limit = 1000,
  category,
  gender,
  forceRefresh = false
}: UseUnifiedClothingAPIProps): Promise<UnifiedClothingItem[]> => {
  console.log(`🎯 [UnifiedClothingAPI] Fetching with params:`, { limit, category, gender, forceRefresh });

  try {
    const { data, error } = await supabase.functions.invoke('unified-clothing-api', {
      body: {
        limit,
        category,
        gender,
        forceRefresh
      }
    });

    if (error) {
      console.error('❌ [UnifiedClothingAPI] Supabase function error:', error);
      throw error;
    }

    if (!data?.success) {
      console.error('❌ [UnifiedClothingAPI] API returned failure:', data);
      throw new Error(data?.error || 'API request failed');
    }

    const items = data.data || [];
    console.log(`✅ [UnifiedClothingAPI] Retrieved ${items.length} items from ${data.source}`);

    // Enrich items with display names and categories
    const enrichedItems: UnifiedClothingItem[] = items.map((item: any) => ({
      ...item,
      name: generateDisplayName(item.code, item.part),
      category: getCategoryName(item.part),
      image_url: item.image_url || generateFallbackImageUrl(item.code, item.part, item.item_id)
    }));

    // Apply client-side filtering if needed
    let filteredItems = enrichedItems;
    
    if (category) {
      filteredItems = filteredItems.filter(item => item.part === category);
    }
    
    if (gender && gender !== 'U') {
      filteredItems = filteredItems.filter(item => item.gender === gender || item.gender === 'U');
    }

    console.log(`🎨 [UnifiedClothingAPI] Final filtered items: ${filteredItems.length}`);
    return filteredItems;

  } catch (error) {
    console.error('💥 [UnifiedClothingAPI] Critical error:', error);
    throw error;
  }
};

const generateDisplayName = (code: string, part: string): string => {
  if (!code) return `${getCategoryName(part)} Item`;
  
  // Remove common prefixes/suffixes for cleaner names
  let cleanCode = code.replace(/^(hair|shirt|pants|shoes|hat|acc)_?/i, '');
  cleanCode = cleanCode.replace(/_?(m|f|u)$/i, '');
  
  // Capitalize and format
  const formatted = cleanCode.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1) || `${getCategoryName(part)} Item`;
};

const getCategoryName = (part: string): string => {
  const categoryMap: Record<string, string> = {
    'hd': 'Rosto',
    'hr': 'Cabelo',
    'ch': 'Camiseta',
    'lg': 'Calça',
    'sh': 'Sapatos',
    'ha': 'Chapéu',
    'ea': 'Óculos',
    'fa': 'Acessório Facial',
    'cc': 'Casaco',
    'ca': 'Acessório Peito',
    'wa': 'Cintura',
    'cp': 'Estampa'
  };
  return categoryMap[part] || 'Item';
};

const generateFallbackImageUrl = (code: string, part: string, itemId: number): string => {
  // Multiple fallback strategies
  const fallbacks = [
    `https://www.habbo.com/habbo-imaging/avatarimage?figure=${part}-${itemId}-1&direction=2&head_direction=2&size=s`,
    `https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-185-1.${part}-${itemId}-1&direction=2&size=s`,
    `https://files.habboemotion.com/habbo-assets/sprites/clothing/${code}/h_std_${part}_${itemId}_2_0.png`
  ];
  
  return fallbacks[0]; // Use first fallback by default
};

export const useUnifiedClothingAPI = ({
  limit = 1000,
  category,
  gender,
  enabled = true,
  forceRefresh = false
}: UseUnifiedClothingAPIProps = {}) => {
  console.log(`🔧 [UnifiedClothingAPI] Hook initialized with:`, { limit, category, gender, enabled, forceRefresh });

  return useQuery({
    queryKey: ['unified-clothing-api', limit, category, gender, forceRefresh],
    queryFn: () => fetchUnifiedClothing({ limit, category, gender, forceRefresh }),
    enabled,
    staleTime: forceRefresh ? 0 : 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Helper hook for category-specific data
export const useUnifiedClothingByCategory = (
  category: string,
  gender?: 'M' | 'F' | 'U',
  limit?: number
) => {
  return useUnifiedClothingAPI({
    category,
    gender,
    limit,
    enabled: !!category
  });
};

// Helper hook to force refresh
export const useRefreshUnifiedClothing = () => {
  return useUnifiedClothingAPI({
    forceRefresh: true,
    limit: 1000
  });
};