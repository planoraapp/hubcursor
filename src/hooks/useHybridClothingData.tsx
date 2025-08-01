
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HybridClothingItem {
  id: string;
  name: string;
  category: string;
  swfName: string;
  imageUrl: string;
  club: 'HC' | 'FREE';
  gender: 'M' | 'F' | 'U';
  colors: string[];
  source: 'official' | 'habbowidgets' | 'hybrid';
  figureId?: string; // For official data
}

export interface OfficialFigureItem {
  id: string;
  gender: 'M' | 'F' | 'U';
  club: string;
  colorable: boolean;
  colors: string[];
}

const fetchHybridClothingData = async (hotel: string = 'com.br'): Promise<HybridClothingItem[]> => {
  console.log(`🌐 [Hybrid] Starting data fetch for hotel: ${hotel}`);
  
  const hybridItems: HybridClothingItem[] = [];
  
  try {
    // 1. Fetch official Habbo data (primary source)
    console.log('📡 [Hybrid] Fetching official Habbo data...');
    const { data: officialData, error: officialError } = await supabase.functions.invoke('get-habbo-official-data', {
      body: { hotel: hotel === 'com.br' ? 'com' : hotel }
    });

    if (officialData?.figureParts && !officialError) {
      console.log('✅ [Hybrid] Official data loaded:', Object.keys(officialData.figureParts).length, 'categories');
      
      // Convert official data to hybrid format
      Object.entries(officialData.figureParts).forEach(([category, items]) => {
        (items as OfficialFigureItem[]).forEach(item => {
          hybridItems.push({
            id: `official_${category}_${item.id}`,
            name: `${category.toUpperCase()}-${item.id}`,
            category,
            swfName: `${category}_${item.id}`,
            imageUrl: generateOfficialImageUrl(category, item.id, item.colors[0] || '1', hotel),
            club: item.club === '1' ? 'HC' : 'FREE',
            gender: item.gender,
            colors: item.colors,
            source: 'official',
            figureId: item.id
          });
        });
      });
    } else {
      console.warn('⚠️ [Hybrid] Official data failed:', officialError?.message);
    }

    // 2. Fetch HabboWidgets data (secondary source)
    console.log('📡 [Hybrid] Fetching HabboWidgets data...');
    const { data: habboWidgetsData, error: widgetsError } = await supabase.functions.invoke('habbo-widgets-clothing', {
      body: { hotel }
    });

    if (habboWidgetsData && Array.isArray(habboWidgetsData) && !widgetsError) {
      console.log('✅ [Hybrid] HabboWidgets data loaded:', habboWidgetsData.length, 'items');
      
      // Add HabboWidgets items, avoiding duplicates
      const existingIds = new Set(hybridItems.map(item => `${item.category}_${item.figureId || item.swfName.split('_')[1]}`));
      
      habboWidgetsData.forEach((widgetItem: any) => {
        const figureId = extractFigureIdFromSwf(widgetItem.swfName);
        const uniqueKey = `${widgetItem.category}_${figureId}`;
        
        if (!existingIds.has(uniqueKey)) {
          hybridItems.push({
            id: widgetItem.id,
            name: widgetItem.name,
            category: widgetItem.category,
            swfName: widgetItem.swfName,
            imageUrl: widgetItem.imageUrl,
            club: widgetItem.club,
            gender: widgetItem.gender,
            colors: widgetItem.colors,
            source: 'habbowidgets',
            figureId
          });
        }
      });
    } else {
      console.warn('⚠️ [Hybrid] HabboWidgets data failed:', widgetsError?.message);
    }

    // 3. Enhance items with hybrid data (best of both sources)
    const enhancedItems = enhanceWithHybridData(hybridItems);

    console.log('🎯 [Hybrid] Final data summary:', {
      total: enhancedItems.length,
      official: enhancedItems.filter(i => i.source === 'official').length,
      habbowidgets: enhancedItems.filter(i => i.source === 'habbowidgets').length,
      hybrid: enhancedItems.filter(i => i.source === 'hybrid').length,
      categories: [...new Set(enhancedItems.map(i => i.category))].length
    });

    return enhancedItems;

  } catch (error) {
    console.error('❌ [Hybrid] Fatal error:', error);
    
    // Return enhanced fallback data
    return generateHybridFallbackData();
  }
};

function generateOfficialImageUrl(category: string, itemId: string, colorId: string, hotel: string): string {
  // Try multiple official imaging endpoints
  const baseHotel = hotel === 'com.br' ? 'com.br' : 'com';
  
  return `https://www.habbo.${baseHotel}/habbo-imaging/clothing/${category}/${itemId}/${colorId}.png`;
}

function extractFigureIdFromSwf(swfName: string): string {
  // Extract numeric ID from swfName
  const match = swfName.match(/(\d+)/);
  return match ? match[1] : swfName;
}

function enhanceWithHybridData(items: HybridClothingItem[]): HybridClothingItem[] {
  const enhanced: HybridClothingItem[] = [];
  const processed = new Set<string>();
  
  // Group items by category and figure ID
  const grouped = items.reduce((acc, item) => {
    const key = `${item.category}_${item.figureId || extractFigureIdFromSwf(item.swfName)}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, HybridClothingItem[]>);

  // For each group, create the best hybrid item
  Object.entries(grouped).forEach(([key, groupItems]) => {
    if (processed.has(key)) return;
    processed.add(key);

    const officialItem = groupItems.find(i => i.source === 'official');
    const widgetsItem = groupItems.find(i => i.source === 'habbowidgets');

    if (officialItem && widgetsItem) {
      // Create hybrid item with best data from both sources
      enhanced.push({
        ...officialItem, // Use official as base
        name: widgetsItem.name || officialItem.name, // Prefer HabboWidgets name
        imageUrl: widgetsItem.imageUrl, // Prefer HabboWidgets image
        source: 'hybrid'
      });
    } else if (officialItem) {
      enhanced.push(officialItem);
    } else if (widgetsItem) {
      enhanced.push(widgetsItem);
    }
  });

  return enhanced;
}

function generateHybridFallbackData(): HybridClothingItem[] {
  const fallbackItems: HybridClothingItem[] = [];
  
  const categories = [
    { code: 'hd', name: 'Head', count: 15 },
    { code: 'hr', name: 'Hair', count: 35 },
    { code: 'ch', name: 'Shirt', count: 45 },
    { code: 'lg', name: 'Trousers', count: 30 },
    { code: 'sh', name: 'Shoes', count: 25 },
    { code: 'ha', name: 'Hat', count: 20 },
    { code: 'ea', name: 'Eye Accessory', count: 15 },
    { code: 'cc', name: 'Coat', count: 25 },
    { code: 'fa', name: 'Face Accessory', count: 10 },
    { code: 'ca', name: 'Chest Accessory', count: 15 },
    { code: 'wa', name: 'Waist', count: 10 },
    { code: 'cp', name: 'Chest Print', count: 8 }
  ];

  categories.forEach(category => {
    for (let i = 1; i <= category.count; i++) {
      const isHC = i % 5 === 0;
      
      fallbackItems.push({
        id: `hybrid_fallback_${category.code}_${i}`,
        name: `${category.name} ${i}${isHC ? ' (HC)' : ''}`,
        category: category.code,
        swfName: `${category.code}_${i}`,
        imageUrl: `https://www.habbo.com.br/habbo-imaging/clothing/${category.code}/${i}/1.png`,
        club: isHC ? 'HC' : 'FREE',
        gender: 'U',
        colors: ['1', '2', '3', '4', '5', '6'],
        source: 'hybrid',
        figureId: i.toString()
      });
    }
  });
  
  console.log(`🔄 [Fallback] Generated ${fallbackItems.length} hybrid fallback items`);
  return fallbackItems;
}

export const useHybridClothingData = (hotel: string = 'com.br') => {
  return useQuery({
    queryKey: ['hybrid-clothing-data', hotel],
    queryFn: () => fetchHybridClothingData(hotel),
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
  });
};
