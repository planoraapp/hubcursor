
import { useQuery } from '@tanstack/react-query';

export interface HabboWidgetsItem {
  id: string;
  name: string;
  category: string;
  swfName: string;
  imageUrl: string;
  club: 'HC' | 'FREE';
  gender: 'M' | 'F' | 'U';
  colors: string[];
}

const fetchHabboWidgetsClothing = async (hotel: string = 'com.br'): Promise<HabboWidgetsItem[]> => {
  console.log(`🌐 [HabboWidgets] Fetching clothing data for hotel: ${hotel}`);
  
  try {
    // Use Supabase Edge Function to bypass CORS
    const response = await fetch('/api/habbo-widgets-clothing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hotel })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch clothing data: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ [HabboWidgets] Loaded ${data.length} clothing items`);
    
    return data;
    
  } catch (error) {
    console.error('❌ [HabboWidgets] Error fetching clothing:', error);
    
    // Fallback: return mock data structure for development
    return generateMockClothingData();
  }
};

const generateMockClothingData = (): HabboWidgetsItem[] => {
  const mockItems: HabboWidgetsItem[] = [];
  const categories = ['hr', 'ch', 'lg', 'sh', 'ha', 'ea', 'cc'];
  
  categories.forEach(category => {
    for (let i = 1; i <= 20; i++) {
      mockItems.push({
        id: `${category}_${i}`,
        name: `Item ${category.toUpperCase()} ${i}`,
        category,
        swfName: `${category}_${i}`,
        imageUrl: `https://www.habbowidgets.com/images/${category}${i}.gif`,
        club: i % 3 === 0 ? 'HC' : 'FREE',
        gender: 'U',
        colors: ['1', '2', '3', '4']
      });
    }
  });
  
  return mockItems;
};

export const useHabboWidgetsClothing = (hotel: string = 'com.br') => {
  return useQuery({
    queryKey: ['habbo-widgets-clothing', hotel],
    queryFn: () => fetchHabboWidgetsClothing(hotel),
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
  });
};
