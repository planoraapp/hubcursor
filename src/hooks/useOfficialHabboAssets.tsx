
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
    try {
    const { data, error } = await supabase.functions.invoke('get-official-habbo-assets');
    
    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }
    
    if (!data?.assets) {
      throw new Error('No assets data received');
    }
    
    console.log('✅ [OfficialHabboAssets] Focused assets loaded:', {
      categories: Object.keys(data.assets).length,
      totalItems: Object.values(data.assets).reduce((sum: number, items: any) => sum + items.length, 0),
      source: data.metadata?.source
    });
    
    return data.assets;
    
  } catch (error) {
        throw error;
  }
};

export const useOfficialHabboAssets = () => {
  return useQuery({
    queryKey: ['official-habbo-assets-focused'],
    queryFn: fetchOfficialHabboAssets,
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
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
  // Avatar base que destaca a categoria específica
  const baseAvatars = {
    'hd': 'hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61',
    'hr': 'hd-180-1.ch-3216-61.lg-3116-61.sh-3297-61', 
    'ch': 'hd-180-1.hr-828-45.lg-3116-61.sh-3297-61',
    'cc': 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61',
    'lg': 'hd-180-1.hr-828-45.ch-3216-61.sh-3297-61',
    'sh': 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61',
    'ha': 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61',
    'ea': 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61',
    'ca': 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61',
    'cp': 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61',
    'wa': 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61'
  };
  
  const baseAvatar = baseAvatars[category as keyof typeof baseAvatars] || 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61';
  const fullFigure = `${baseAvatar}.${category}-${figureId}-${colorId}`;
  
  return `https://www.habbo.${hotel}/habbo-imaging/avatarimage?figure=${fullFigure}&gender=${gender}&direction=2&head_direction=2&size=l`;
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
