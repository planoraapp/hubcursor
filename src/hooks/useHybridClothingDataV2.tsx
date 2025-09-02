
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useHabboEmotionClothing, HabboEmotionClothingItem } from './useHabboEmotionClothing';

export interface HybridClothingItemV2 {
  id: string;
  name: string;
  category: string;
  figureId: string;
  colors: string[];
  imageUrl: string;
  club: 'HC' | 'FREE';
  gender: 'M' | 'F' | 'U';
  source: 'habboemotion' | 'habbowidgets' | 'official';
  metadata?: {
    code?: string;
    date?: string;
    originalId?: number;
  };
}

const fetchHybridClothingDataV2 = async (hotel: string = 'com.br'): Promise<HybridClothingItemV2[]> => {
  console.log(`🌐 [Hybrid V2] Starting hybrid data fetch for hotel: ${hotel}`);
  
  const hybridItems: HybridClothingItemV2[] = [];
  const processedIds = new Set<string>();

  try {
    // 1. Fetch HabboEmotion data (primary source - most structured)
    console.log('📡 [Hybrid V2] Fetching HabboEmotion data...');
    const { data: emotionData, error: emotionError } = await supabase.functions.invoke('habbo-emotion-clothing', {
      body: { limit: 400 }
    });

    if (emotionData?.items && Array.isArray(emotionData.items) && !emotionError) {
      console.log(`✅ [Hybrid V2] HabboEmotion loaded: ${emotionData.items.length} items`);
      
      emotionData.items.forEach((item: any) => {
        const hybridItem = convertEmotionToHybrid(item);
        if (hybridItem && !processedIds.has(hybridItem.id)) {
          hybridItems.push(hybridItem);
          processedIds.add(hybridItem.id);
        }
      });
    } else {
      console.warn('⚠️ [Hybrid V2] HabboEmotion data failed:', emotionError?.message);
    }

    // 2. Fetch HabboWidgets data (secondary source for additional items)
    console.log('📡 [Hybrid V2] Fetching HabboWidgets data...');
    const { data: widgetsData, error: widgetsError } = await supabase.functions.invoke('habbo-widgets-clothing', {
      body: { hotel }
    });

    if (widgetsData && Array.isArray(widgetsData) && !widgetsError) {
      console.log(`✅ [Hybrid V2] HabboWidgets loaded: ${widgetsData.length} items`);
      
      widgetsData.forEach((item: any) => {
        const hybridItem = convertWidgetsToHybrid(item);
        if (hybridItem && !processedIds.has(hybridItem.id)) {
          hybridItems.push(hybridItem);
          processedIds.add(hybridItem.id);
        }
      });
    } else {
      console.warn('⚠️ [Hybrid V2] HabboWidgets data failed:', widgetsError?.message);
    }

    // 3. Fetch Official Habbo data (validation and fallback)
    console.log('📡 [Hybrid V2] Fetching Official Habbo data...');
    const { data: officialData, error: officialError } = await supabase.functions.invoke('get-habbo-official-data', {
      body: { hotel: hotel === 'com.br' ? 'com' : hotel }
    });

    if (officialData?.figureParts && !officialError) {
      console.log(`✅ [Hybrid V2] Official data loaded: ${Object.keys(officialData.figureParts).length} categories`);
      
      Object.entries(officialData.figureParts).forEach(([category, items]) => {
        (items as any[]).forEach(item => {
          const hybridItem = convertOfficialToHybrid(item, category, hotel);
          if (hybridItem && !processedIds.has(hybridItem.id)) {
            hybridItems.push(hybridItem);
            processedIds.add(hybridItem.id);
          }
        });
      });
    } else {
      console.warn('⚠️ [Hybrid V2] Official data failed:', officialError?.message);
    }

    // 4. Sort items by priority (HabboEmotion > HabboWidgets > Official)
    const sortedItems = hybridItems.sort((a, b) => {
      const sourcePriority = { habboemotion: 3, habbowidgets: 2, official: 1 };
      return sourcePriority[b.source] - sourcePriority[a.source];
    });

    console.log('🎯 [Hybrid V2] Final hybrid data summary:', {
      total: sortedItems.length,
      habboemotion: sortedItems.filter(i => i.source === 'habboemotion').length,
      habbowidgets: sortedItems.filter(i => i.source === 'habbowidgets').length,
      official: sortedItems.filter(i => i.source === 'official').length,
      categories: [...new Set(sortedItems.map(i => i.category))].length
    });

    return sortedItems;

  } catch (error) {
    console.error('❌ [Hybrid V2] Fatal error:', error);
    return generateHybridFallbackDataV2();
  }
};

function convertEmotionToHybrid(item: any): HybridClothingItemV2 | null {
  try {
    return {
      id: `emotion_${item.part}_${item.id}`,
      name: `${item.code}`,
      category: item.part,
      figureId: extractFigureId(item.code),
      colors: item.colors || ['1', '2', '3'],
      imageUrl: generateOptimizedImageUrl(item.code, item.part, 'habboemotion'),
      club: item.club || 'FREE',
      gender: item.gender || 'U',
      source: 'habboemotion',
      metadata: {
        code: item.code,
        date: item.date,
        originalId: item.id
      }
    };
  } catch (error) {
    console.warn('⚠️ [Hybrid V2] Error converting emotion item:', error);
    return null;
  }
}

function convertWidgetsToHybrid(item: any): HybridClothingItemV2 | null {
  try {
    return {
      id: `widgets_${item.category}_${item.id}`,
      name: item.name || 'Unknown Item',
      category: item.category,
      figureId: item.figureId || extractFigureId(item.swfName),
      colors: item.colors || ['1', '2', '3'],
      imageUrl: item.imageUrl || generateOptimizedImageUrl(item.swfName, item.category, 'habbowidgets'),
      club: item.club || 'FREE',
      gender: item.gender || 'U',
      source: 'habbowidgets'
    };
  } catch (error) {
    console.warn('⚠️ [Hybrid V2] Error converting widgets item:', error);
    return null;
  }
}

function convertOfficialToHybrid(item: any, category: string, hotel: string): HybridClothingItemV2 | null {
  try {
    return {
      id: `official_${category}_${item.id}`,
      name: `${category.toUpperCase()}-${item.id}`,
      category,
      figureId: item.id,
      colors: item.colors || ['1'],
      imageUrl: generateOfficialImageUrl(category, item.id, item.colors[0] || '1', hotel),
      club: item.club === '1' ? 'HC' : 'FREE',
      gender: item.gender || 'U',
      source: 'official'
    };
  } catch (error) {
    console.warn('⚠️ [Hybrid V2] Error converting official item:', error);
    return null;
  }
}

function extractFigureId(code: string): string {
  if (!code) return '1';
  
  // Try different patterns to extract figure ID
  const patterns = [
    /[a-z]+_(\d+)/i, // category_123
    /(\d+)$/, // ending digits
    /(\d+)/ // first digits found
  ];
  
  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return '1';
}

function generateOptimizedImageUrl(code: string, category: string, source: string): string {
  const figureId = extractFigureId(code);
  
  switch (source) {
    case 'habboemotion':
      return `https://habboemotion.com/images/clothing/${category}/${code}.png`;
    case 'habbowidgets':
      return `https://www.habbowidgets.com/images/${code}.gif`;
    default:
      return `https://www.habbo.com.br/habbo-imaging/clothing/${category}/${figureId}/1.png`;
  }
}

function generateOfficialImageUrl(category: string, itemId: string, colorId: string, hotel: string): string {
  const baseHotel = hotel === 'com.br' ? 'com.br' : 'com';
  return `https://www.habbo.${baseHotel}/habbo-imaging/clothing/${category}/${itemId}/${colorId}.png`;
}

function generateHybridFallbackDataV2(): HybridClothingItemV2[] {
  const fallbackItems: HybridClothingItemV2[] = [];
  
  const categories = [
    { code: 'hr', name: 'Hair', count: 40 },
    { code: 'hd', name: 'Head', count: 15 },
    { code: 'ch', name: 'Shirt', count: 60 },
    { code: 'lg', name: 'Trousers', count: 45 },
    { code: 'sh', name: 'Shoes', count: 35 },
    { code: 'ha', name: 'Hat', count: 25 },
    { code: 'ea', name: 'Eye Accessory', count: 20 },
    { code: 'fa', name: 'Face Accessory', count: 15 },
    { code: 'cc', name: 'Coat', count: 30 },
    { code: 'ca', name: 'Chest Accessory', count: 20 },
    { code: 'wa', name: 'Waist', count: 12 },
    { code: 'cp', name: 'Chest Print', count: 10 }
  ];

  categories.forEach(category => {
    for (let i = 1; i <= category.count; i++) {
      const isHC = i % 6 === 0;
      
      fallbackItems.push({
        id: `fallback_${category.code}_${i}`,
        name: `${category.name} ${i}${isHC ? ' (HC)' : ''}`,
        category: category.code,
        figureId: i.toString(),
        colors: ['1', '2', '3', '4', '5'],
        imageUrl: `https://www.habbo.com.br/habbo-imaging/clothing/${category.code}/${i}/1.png`,
        club: isHC ? 'HC' : 'FREE',
        gender: 'U',
        source: 'official'
      });
    }
  });
  
  console.log(`🔄 [Fallback V2] Generated ${fallbackItems.length} hybrid fallback items`);
  return fallbackItems;
}

export const useHybridClothingDataV2 = (hotel: string = 'com.br') => {
  return useQuery({
    queryKey: ['hybrid-clothing-data-v2', hotel],
    queryFn: () => fetchHybridClothingDataV2(hotel),
    staleTime: 1000 * 60 * 60 * 1, // 1 hour
    gcTime: 1000 * 60 * 60 * 8, // 8 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};
