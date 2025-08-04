
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getColorById } from '@/data/habboColors';

export interface HabboEmotionClothingItem {
  id: number;
  code: string;
  part: string;
  gender: 'M' | 'F' | 'U';
  date: string;
  colors: string[];
  colorDetails?: Array<{
    id: string;
    hex: string;
    name?: string;
    isHC: boolean;
    isDefault: boolean;
  }>;
  imageUrl: string;
  club: 'HC' | 'FREE';
  source: 'habboemotion' | 'supabase-comprehensive' | 'comprehensive-fallback';
  name: string;
  category: string;
}

const fetchHabboEmotionClothing = async (
  limit: number = 2000, 
  category?: string, 
  gender: 'M' | 'F' | 'U' = 'U'
): Promise<HabboEmotionClothingItem[]> => {
  console.log(`🌐 [HabboEmotion] Fetching expanded clothing data - limit: ${limit}, category: ${category}, gender: ${gender}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-emotion-clothing', {
      body: { limit, category, gender }
    });

    if (error) {
      console.error('❌ [HabboEmotion] Supabase function error:', error);
      throw error;
    }

    if (!data || !data.items || !Array.isArray(data.items)) {
      console.error('❌ [HabboEmotion] Invalid response format:', data);
      throw new Error('Invalid response format from expanded HabboEmotion system');
    }

    console.log(`✅ [HabboEmotion] Successfully fetched ${data.items.length} expanded items from ${data.metadata?.source}`);
    
    // Enriquecer dados com informações de cores e URLs corrigidas
    const enrichedItems = data.items.map((item: any) => {
      const colorDetails = item.colors?.map((colorId: string) => {
        const colorInfo = getColorById(colorId);
        return {
          id: colorId,
          hex: colorInfo?.hex || '#DDDDDD',
          name: colorInfo?.name || `Cor ${colorId}`,
          isHC: colorInfo?.isHC || false,
          isDefault: colorId === (item.colors[0] || '1')
        };
      }) || [];

      return {
        id: item.id || Math.random(),
        code: item.code || '',
        part: mapCategoryToStandard(item.part || 'ch'),
        gender: item.gender || 'U',
        date: item.date || '',
        colors: Array.isArray(item.colors) ? item.colors : ['1', '2', '3', '4', '5'],
        colorDetails,
        imageUrl: item.imageUrl || generateExpandedImageUrl(item.code, item.part, item.id),
        club: item.club || 'FREE',
        source: item.source || 'comprehensive-fallback',
        name: item.name || `${item.code}`,
        category: item.category || mapCategoryToStandard(item.part || 'ch')
      };
    });
    
    return enrichedItems;
    
  } catch (error) {
    console.error('❌ [HabboEmotion] Error:', error);
    throw error;
  }
};

const CATEGORY_MAPPING: Record<string, string> = {
  'hair': 'hr',
  'hat': 'ha', 
  'head': 'hd',
  'shirt': 'ch',
  'top': 'ch',
  'chest': 'ch',
  'trousers': 'lg',
  'pants': 'lg',
  'legs': 'lg',
  'shoes': 'sh',
  'footwear': 'sh',
  'jacket': 'cc',
  'coat': 'cc',
  'acc_eye': 'ea',
  'eye_accessories': 'ea',
  'glasses': 'ea',
  'acc_head': 'ha',
  'acc_chest': 'ca',
  'acc_waist': 'wa',
  'acc_face': 'fa',
  'face_accessory': 'fa',
  'chest_accessory': 'ca',
  'waist': 'wa',
  'chest_print': 'cp',
  'print': 'cp'
};

const mapCategoryToStandard = (category: string): string => {
  return CATEGORY_MAPPING[category.toLowerCase()] || category;
};

const generateExpandedImageUrl = (code: string, part: string, itemId: number): string => {
  // Usar o formato correto do HabboEmotion expandido
  const categoryNames: Record<string, string> = {
    'hr': 'hair',
    'ch': 'shirt', 
    'lg': 'trousers',
    'sh': 'shoes',
    'ha': 'hat',
    'ea': 'glasses',
    'cc': 'jacket',
    'ca': 'chest_accessory',
    'wa': 'belt',
    'fa': 'face_accessory',
    'cp': 'chest_print',
    'hd': 'head'
  };
  
  const categoryName = categoryNames[part] || 'shirt';
  const spriteName = code.includes('_U_') ? code : `${categoryName}_U_${code}`;
  
  return `https://files.habboemotion.com/habbo-assets/sprites/clothing/${spriteName}/h_std_${part}_${itemId}_2_0.png`;
};

export const useHabboEmotionClothing = (
  limit: number = 2000, 
  category?: string, 
  gender: 'M' | 'F' | 'U' = 'U'
) => {
  return useQuery({
    queryKey: ['habbo-emotion-clothing-expanded', limit, category, gender],
    queryFn: () => fetchHabboEmotionClothing(limit, category, gender),
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Hook especializado para buscar por categoria específica com sistema expandido
export const useHabboEmotionClothingByCategory = (
  category: string,
  gender: 'M' | 'F' | 'U' = 'U',
  limit: number = 1000
) => {
  return useQuery({
    queryKey: ['habbo-emotion-clothing-category-expanded', category, gender, limit],
    queryFn: () => fetchHabboEmotionClothing(limit, category, gender),
    staleTime: 1000 * 60 * 60 * 1, // 1 hour
    gcTime: 1000 * 60 * 60 * 12, // 12 hours
    retry: 2,
    enabled: !!category && category !== 'all'
  });
};

// Função para sincronização manual do sistema expandido
export const triggerHabboEmotionSync = async () => {
  try {
    console.log('🔄 [HabboEmotion] Triggering comprehensive synchronization...');
    
    const { data, error } = await supabase.functions.invoke('sync-habbo-emotion-data');
    
    if (error) {
      console.error('❌ [HabboEmotion] Comprehensive sync error:', error);
      throw error;
    }
    
    console.log('✅ [HabboEmotion] Comprehensive sync completed:', data);
    return data;
  } catch (error) {
    console.error('❌ [HabboEmotion] Comprehensive sync failed:', error);
    throw error;
  }
};
