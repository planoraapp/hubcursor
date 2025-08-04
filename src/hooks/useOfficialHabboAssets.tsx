
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OfficialHabboAsset {
  id: string;
  figureId: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  colors: string[];
  club: 'FREE' | 'HC';
  name: string;
  thumbnailUrl: string;
  source: 'official-habbo';
}

export interface OfficialHabboAssetsData {
  [category: string]: OfficialHabboAsset[];
}

const fetchOfficialHabboAssets = async (): Promise<OfficialHabboAssetsData> => {
  console.log('🌐 [OfficialHabboAssets] Fetching real Habbo assets...');
  
  try {
    const { data, error } = await supabase.functions.invoke('get-official-habbo-assets');
    
    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }
    
    if (!data?.assets) {
      throw new Error('No assets data received');
    }
    
    console.log('✅ [OfficialHabboAssets] Assets loaded:', {
      categories: Object.keys(data.assets).length,
      totalItems: Object.values(data.assets).reduce((sum: number, items: any) => sum + items.length, 0)
    });
    
    return data.assets;
    
  } catch (error) {
    console.error('❌ [OfficialHabboAssets] Error:', error);
    throw error;
  }
};

export const useOfficialHabboAssets = () => {
  return useQuery({
    queryKey: ['official-habbo-assets'],
    queryFn: fetchOfficialHabboAssets,
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
  });
};

export const useOfficialHabboCategory = (categoryId: string, gender: 'M' | 'F') => {
  const { data: allAssets, ...queryResult } = useOfficialHabboAssets();
  
  const filteredAssets = allAssets?.[categoryId]?.filter(
    asset => asset.gender === gender || asset.gender === 'U'
  ) || [];
  
  return {
    ...queryResult,
    data: filteredAssets
  };
};

// Função para gerar URL de thumbnail focada na peça específica
export const generateFocusedThumbnail = (
  category: string, 
  figureId: string, 
  colorId: string = '1',
  gender: 'M' | 'F' = 'M',
  hotel: string = 'com'
): string => {
  // URL base do sistema oficial Habbo (igual ao ViaJovem)
  return `https://www.habbo.${hotel}/habbo-imaging/avatarimage?figure=${category}-${figureId}-${colorId}&gender=${gender}&direction=2&head_direction=2&size=s`;
};

// Função para gerar URL de preview completo do avatar
export const generateAvatarPreview = (
  figureString: string,
  gender: 'M' | 'F' = 'M',
  hotel: string = 'com',
  direction: string = '2',
  size: string = 'l'
): string => {
  return `https://www.habbo.${hotel}/habbo-imaging/avatarimage?figure=${figureString}&gender=${gender}&direction=${direction}&head_direction=${direction}&size=${size}`;
};
