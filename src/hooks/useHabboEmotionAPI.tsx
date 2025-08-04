
import { useQuery } from '@tanstack/react-query';

export interface HabboEmotionClothing {
  id: number;
  name: string;
  category: string;
  type: string;
  gender: 'M' | 'F' | 'U';
  rarity: string;
  thumbnail: string;
  colors: string[];
  swf_name: string;
  release: string;
  code: string;
  date: string;
  part: string;
  // Adicionar propriedades para compatibilidade
  imageUrl: string;
  club: 'HC' | 'FREE';
  source: 'habboemotion-api' | 'habboemotion-scraping' | 'enhanced-generation' | 'error-fallback';
}

interface UseHabboEmotionAPIProps {
  limit?: number;
  enabled?: boolean;
}

const fetchHabboClothings = async (limit: number = 200): Promise<HabboEmotionClothing[]> => {
  console.log(`🌐 [HabboEmotionAPI] Starting fetch with limit: ${limit}`);
  
  try {
    const apiUrl = `https://api.habboemotion.com/public/clothings/new/${limit}`;
    console.log(`📡 [HabboEmotionAPI] Making request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    console.log(`📊 [HabboEmotionAPI] Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Habbo clothings: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ [HabboEmotionAPI] Raw API response structure:`, {
      hasResult: !!data.result,
      hasData: !!data.data,
      hasClothings: !!data.data?.clothings,
      clothingsLength: data.data?.clothings?.length,
      sampleItem: data.data?.clothings?.[0]
    });
    
    // The API returns data in this format: { result: 200, data: { count: 200, total: "2601", clothings: [...] } }
    if (data && data.data && data.data.clothings && Array.isArray(data.data.clothings)) {
      const clothings = data.data.clothings;
      console.log(`🎯 [HabboEmotionAPI] Extracted ${clothings.length} clothings from response`);
      
      // Map the clothing items to our expected format
      const mappedClothings = clothings.map((item: any, index: number) => {
        console.log(`🔄 [HabboEmotionAPI] Processing item ${index + 1}:`, {
          id: item.id,
          code: item.code,
          part: item.part,
          gender: item.gender,
          date: item.date
        });
        
        return {
          id: item.id || index + 1,
          name: item.code || `Item ${index + 1}`,
          category: item.part || 'ch',
          type: item.part || 'clothing',
          gender: item.gender || 'U',
          rarity: determineRarity(item.code || ''),
          thumbnail: '',
          colors: ['1', '2', '3', '4', '5'], // Default colors
          swf_name: item.code || '',
          release: item.date || '',
          code: item.code || '',
          date: item.date || '',
          part: item.part || 'ch',
          // Propriedades de compatibilidade
          imageUrl: generateImageUrl(item.code, item.part, item.id || index + 1),
          club: determineClub(item.code || ''),
          source: 'habboemotion-api'
        };
      }).filter(Boolean);
      
      console.log(`✅ [HabboEmotionAPI] Successfully mapped ${mappedClothings.length} items`);
      console.log(`🎨 [HabboEmotionAPI] Sample mapped items:`, mappedClothings.slice(0, 3));
      return mappedClothings;
    } else {
      console.error('❌ [HabboEmotionAPI] Invalid response format:', data);
      throw new Error('API returned invalid data format');
    }
  } catch (error) {
    console.error('❌ [HabboEmotionAPI] Error fetching data:', error);
    throw error;
  }
};

const generateImageUrl = (code: string, part: string, id: number): string => {
  return `https://www.habbo.com/habbo-imaging/clothing/${part}/${id}/1.png`;
};

const determineClub = (code: string): 'HC' | 'FREE' => {
  if (!code) return 'FREE';
  const lowerCode = code.toLowerCase();
  return (lowerCode.includes('hc') || lowerCode.includes('club')) ? 'HC' : 'FREE';
};

const determineRarity = (code: string): string => {
  if (!code) return 'normal';
  
  const lowerCode = code.toLowerCase();
  if (lowerCode.includes('nft')) return 'nft';
  if (lowerCode.includes('ltd')) return 'ltd';
  if (lowerCode.includes('hc')) return 'hc';
  if (lowerCode.includes('rare')) return 'rare';
  
  return 'sellable';
};

export const useHabboEmotionAPI = ({ limit = 200, enabled = true }: UseHabboEmotionAPIProps = {}) => {
  console.log(`🔧 [HabboEmotionAPI] Hook called with limit: ${limit}, enabled: ${enabled}`);
  
  const query = useQuery({
    queryKey: ['habbo-clothings', limit],
    queryFn: () => fetchHabboClothings(limit),
    enabled,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Log success and error states using useEffect pattern instead of deprecated callbacks
  if (query.isSuccess && query.data) {
    console.log(`🎉 [HabboEmotionAPI] Query success! Received ${query.data?.length || 0} items`);
  }

  if (query.isError) {
    console.error('💥 [HabboEmotionAPI] Query error:', query.error);
  }

  return query;
};
