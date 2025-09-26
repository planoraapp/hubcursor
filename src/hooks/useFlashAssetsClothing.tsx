
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FlashAssetItem {
  id: string;
  name: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  type: string;
  imageUrl: string;
  swfName: string;
  figureId: string;
  club: 'HC' | 'FREE';
  colors: string[];
  source: string;
}

interface FlashAssetsResponse {
  assets: FlashAssetItem[];
  metadata: {
    totalCount: number;
    source: string;
    fetchedAt: string;
    filters: {
      category: string;
      search: string;
      gender: string;
      limit: number;
    };
  };
}

interface UseFlashAssetsClothingOptions {
  limit?: number;
  category?: string;
  search?: string;
  gender?: 'M' | 'F' | 'U';
}

export const useFlashAssetsClothing = (options: UseFlashAssetsClothingOptions = {}) => {
  const { limit = 300, category = 'all', search = '', gender = 'U' } = options;

  return useQuery<FlashAssetItem[], Error>({
    queryKey: ['flash-assets-clothing', { limit, category, search, gender }],
    queryFn: async (): Promise<FlashAssetItem[]> => {
            const { data, error } = await supabase.functions.invoke('flash-assets-clothing', {
        body: {
          limit,
          category,
          search,
          gender
        }
      });

      if (error) {
                throw error;
      }

      const response = data as FlashAssetsResponse;
      
      if (!response || !response.assets) {
                return [];
      }

            return response.assets;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
