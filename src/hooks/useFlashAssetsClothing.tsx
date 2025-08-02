
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
  source: 'official-assets';
}

interface UseFlashAssetsClothingProps {
  limit?: number;
  category?: string;
  search?: string;
  enabled?: boolean;
}

const fetchFlashAssetsClothing = async ({
  limit = 300,
  category = 'all',
  search = ''
}: UseFlashAssetsClothingProps): Promise<FlashAssetItem[]> => {
  console.log(`🌐 [FlashAssetsClothing] Fetching assets with limit: ${limit}, category: ${category}, search: "${search}"`);
  
  try {
    const { data, error } = await supabase.functions.invoke('flash-assets-clothing', {
      body: { limit, category, search }
    });

    if (error) {
      console.error('❌ [FlashAssetsClothing] Supabase function error:', error);
      throw error;
    }

    if (!data || !data.assets || !Array.isArray(data.assets)) {
      console.error('❌ [FlashAssetsClothing] Invalid response format:', data);
      throw new Error('Invalid response format from flash assets');
    }

    console.log(`✅ [FlashAssetsClothing] Successfully fetched ${data.assets.length} assets`);
    console.log(`📊 [FlashAssetsClothing] Metadata:`, data.metadata);
    
    return data.assets;
    
  } catch (error) {
    console.error('❌ [FlashAssetsClothing] Error:', error);
    throw error;
  }
};

export const useFlashAssetsClothing = ({
  limit = 300,
  category = 'all',
  search = '',
  enabled = true
}: UseFlashAssetsClothingProps = {}) => {
  console.log(`🔧 [FlashAssetsClothing] Hook called with limit: ${limit}, category: ${category}, search: "${search}", enabled: ${enabled}`);
  
  return useQuery({
    queryKey: ['flash-assets-clothing', limit, category, search],
    queryFn: () => fetchFlashAssetsClothing({ limit, category, search }),
    enabled,
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
