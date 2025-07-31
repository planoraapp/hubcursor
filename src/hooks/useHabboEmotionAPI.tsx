
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
  const response = await fetch(`https://api.habboemotion.com/public/clothings/new/${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Habbo clothings');
  }
  return response.json();
};

export const useHabboEmotionAPI = ({ limit = 200, enabled = true }: UseHabboEmotionAPIProps = {}) => {
  return useQuery({
    queryKey: ['habbo-clothings', limit],
    queryFn: () => fetchHabboClothings(limit),
    enabled,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour (renamed from cacheTime in v5)
  });
};
