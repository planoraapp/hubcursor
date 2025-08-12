
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedClothingItem {
  id: string;
  name: string;
  part: string;
  item_id: number;
  code: string;
  gender: 'M' | 'F' | 'U';
  club: 'HC' | 'FREE';
  colors: string[];
  image_url?: string;
  source: string;
  figureId: string;
  category: string;
}

interface UseUnifiedClothingOptions {
  limit?: number;
  category?: string;
  search?: string;
  gender?: 'M' | 'F' | 'U';
}

export const useUnifiedClothing = (options: UseUnifiedClothingOptions = {}) => {
  const { limit = 100, category = 'all', search = '', gender = 'U' } = options;

  return useQuery<UnifiedClothingItem[], Error>({
    queryKey: ['unified-clothing', { limit, category, search, gender }],
    queryFn: async (): Promise<UnifiedClothingItem[]> => {
      console.log('🔄 [useUnifiedClothing] Fetching clothing data...');
      
      try {
        // Try flash-assets function first
        const { data: flashData, error: flashError } = await supabase.functions.invoke('flash-assets-clothing', {
          body: { limit, category, search, gender }
        });

        if (!flashError && flashData?.assets?.length > 0) {
          console.log(`✅ [useUnifiedClothing] Got ${flashData.assets.length} items from flash-assets`);
          return flashData.assets.map((item: any) => ({
            id: item.id,
            name: item.name,
            part: item.category,
            item_id: parseInt(item.figureId),
            code: item.swfName || item.name,
            gender: item.gender,
            club: item.club,
            colors: Array.isArray(item.colors) ? item.colors.map(String) : ['1'],
            image_url: item.imageUrl,
            source: 'flash-assets',
            figureId: item.figureId,
            category: item.category
          }));
        }

        // Fallback to direct database query
        console.log('⚙️ [useUnifiedClothing] Fallback to database query...');
        
        let query = supabase
          .from('habbo_clothing_cache')
          .select('*')
          .limit(limit);

        if (category !== 'all') {
          query = query.eq('part', category);
        }

        if (gender !== 'U') {
          query = query.or(`gender.eq.${gender},gender.eq.U`);
        }

        if (search) {
          query = query.or(`code.ilike.%${search}%,item_id.eq.${parseInt(search) || 0}`);
        }

        const { data: dbData, error: dbError } = await query;

        if (dbError) {
          throw dbError;
        }

        const unifiedItems: UnifiedClothingItem[] = (dbData || []).map(item => ({
          id: `db_${item.part}_${item.item_id}`,
          name: `${getCategoryName(item.part)} ${item.code || item.item_id}`,
          part: item.part,
          item_id: item.item_id,
          code: item.code,
          gender: item.gender as 'M' | 'F' | 'U',
          club: item.club === 'HC' ? 'HC' : 'FREE',
          colors: Array.isArray(item.colors) ? item.colors.map(String) : ['1'],
          image_url: item.image_url,
          source: 'database',
          figureId: item.item_id.toString(),
          category: item.part
        }));

        console.log(`✅ [useUnifiedClothing] Got ${unifiedItems.length} items from database`);
        return unifiedItems;

      } catch (error) {
        console.error('❌ [useUnifiedClothing] Error:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

function getCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    'hd': 'Rosto',
    'hr': 'Cabelo',
    'ch': 'Camiseta',
    'lg': 'Calça',
    'sh': 'Sapato',
    'ha': 'Chapéu',
    'ea': 'Óculos',
    'cc': 'Casaco',
    'ca': 'Acessório',
    'cp': 'Estampa',
    'wa': 'Cintura',
    'fa': 'Rosto Acessório'
  };
  
  return categoryNames[category] || 'Item';
}
