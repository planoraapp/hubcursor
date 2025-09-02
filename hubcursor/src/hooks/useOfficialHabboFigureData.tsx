import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OfficialHabboItem {
  id: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  club: 'FREE' | 'HC';
  colorable: boolean;
  colors: string[];
  imageUrl: string;
}

export interface OfficialHabboData {
  [category: string]: OfficialHabboItem[];
}

const fetchOfficialHabboData = async (): Promise<OfficialHabboData> => {
  console.log('🌐 [OfficialHabbo] Fetching official Habbo figuredata...');
  
  try {
    const { data, error } = await supabase.functions.invoke('get-habbo-official-data', {
      body: { hotel: 'com' }
    });
    
    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }
    
    if (!data?.figureParts) {
      throw new Error('No figure parts data received');
    }
    
    // Transform the data to include proper image URLs
    const transformedData: OfficialHabboData = {};
    
    for (const [category, items] of Object.entries(data.figureParts)) {
      transformedData[category] = (items as any[]).map(item => ({
        id: item.id,
        category,
        gender: item.gender,
        club: item.club === '1' ? 'HC' : 'FREE',
        colorable: item.colorable,
        colors: item.colors,
        // Generate official Habbo imaging URL for individual items
        imageUrl: `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${item.id}-${item.colors[0] || '1'}&direction=2&head_direction=2&size=s&img_format=png&gesture=std&action=std`
      }));
    }
    
    console.log('✅ [OfficialHabbo] Data transformed:', {
      categories: Object.keys(transformedData).length,
      totalItems: Object.values(transformedData).reduce((sum, items) => sum + items.length, 0),
      source: data.metadata?.source
    });
    
    return transformedData;
    
  } catch (error) {
    console.error('❌ [OfficialHabbo] Error loading official data:', error);
    throw error;
  }
};

export const useOfficialHabboFigureData = () => {
  return useQuery({
    queryKey: ['official-habbo-figuredata'],
    queryFn: fetchOfficialHabboData,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: 2,
  });
};