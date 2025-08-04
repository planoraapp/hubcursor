
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HabboEmotionClothingItem {
  id: number;
  code: string;
  part: string;
  gender: 'M' | 'F' | 'U';
  date: string;
  colors: string[];
  imageUrl: string;
  club: 'HC' | 'FREE';
  source: 'habboemotion';
  name: string;
  category: string;
}

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
  'acc_head': 'ha',
  'acc_chest': 'ca',
  'acc_waist': 'wa',
  'acc_face': 'fa'
};

const fetchHabboEmotionClothing = async (limit: number = 1000): Promise<HabboEmotionClothingItem[]> => {
  console.log(`🌐 [HabboEmotion] Fetching clothing data with limit: ${limit}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-emotion-clothing', {
      body: { limit }
    });

    if (error) {
      console.error('❌ [HabboEmotion] Supabase function error:', error);
      throw error;
    }

    if (!data || !data.items || !Array.isArray(data.items)) {
      console.error('❌ [HabboEmotion] Invalid response format:', data);
      throw new Error('Invalid response format from HabboEmotion API');
    }

    console.log(`✅ [HabboEmotion] Successfully fetched ${data.items.length} items`);
    
    // Mapear e enriquecer os dados
    const mappedItems = data.items.map((item: any) => ({
      id: item.id || Math.random(),
      code: item.code || '',
      part: CATEGORY_MAPPING[item.part] || item.part || 'ch',
      gender: item.gender || 'U',
      date: item.date || '',
      colors: Array.isArray(item.colors) ? item.colors : ['1', '2', '3', '4', '5'],
      imageUrl: generateClothingImageUrl(item.code, item.part),
      club: item.club || 'FREE',
      source: 'habboemotion',
      name: item.code ? `${item.code}` : 'Item Desconhecido',
      category: CATEGORY_MAPPING[item.part] || item.part || 'ch'
    }));
    
    return mappedItems;
    
  } catch (error) {
    console.error('❌ [HabboEmotion] Error:', error);
    throw error;
  }
};

const generateClothingImageUrl = (code: string, part: string): string => {
  // Garantir uso do padrão _2_0.png (front_right/diagonal direita)
  const baseUrl = 'https://habboemotion.com/usables/clothing';
  return `${baseUrl}/${part}_U_${code}_2_0.png`;
};

export const useHabboEmotionClothing = (limit: number = 1000) => {
  return useQuery({
    queryKey: ['habbo-emotion-clothing', limit],
    queryFn: () => fetchHabboEmotionClothing(limit),
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
