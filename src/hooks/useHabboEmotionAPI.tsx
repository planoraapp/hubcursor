
import { useQuery } from '@tanstack/react-query';

export interface HabboEmotionClothing {
  id: number;
  name: string;
  category: string;
  type: string;
  gender: 'M' | 'F' | 'U';
  rarity: string;
  thumbnail: string;
  colors: number[];
  swf_name: string;
  release: string;
}

interface UseHabboEmotionAPIProps {
  limit?: number;
  enabled?: boolean;
}

const fetchHabboClothings = async (limit: number = 200): Promise<HabboEmotionClothing[]> => {
  console.log(`🌐 Fetching Habbo Emotion API with limit: ${limit}`);
  
  try {
    const response = await fetch(`https://api.habboemotion.com/public/clothings/new/${limit}`);
    
    console.log(`📡 API Response Status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Habbo clothings: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Data received:`, data);
    console.log(`📊 Total items fetched: ${data?.length || 0}`);
    
    if (!Array.isArray(data)) {
      console.error('❌ API returned invalid data format:', data);
      throw new Error('API returned invalid data format');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching Habbo Emotion API:', error);
    throw error;
  }
};

export const useHabboEmotionAPI = ({ limit = 200, enabled = true }: UseHabboEmotionAPIProps = {}) => {
  return useQuery({
    queryKey: ['habbo-clothings', limit],
    queryFn: () => fetchHabboClothings(limit),
    enabled,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
