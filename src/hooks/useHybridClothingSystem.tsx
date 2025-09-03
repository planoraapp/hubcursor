import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOfficialFigureData } from './useFigureDataOfficial';

export interface HybridClothingItem {
  id: string;
  category: string;
  figureId: string;
  name: string;
  gender: 'M' | 'F' | 'U';
  club: string;
  colorable: boolean;
  colors: string[];
  rarity: 'NORMAL' | 'HC' | 'VIP' | 'LTD';
  swfName?: string;
  thumbnailUrl: string;
  source: 'OFFICIAL' | 'SUPABASE' | 'HABBOAPI';
}

// Mapping SWF names to official categories and IDs
const SWF_TO_OFFICIAL_MAP: Record<string, { category: string; figureId: string }> = {
  'acc_chest_U_acousticguitar.swf': { category: 'ca', figureId: '1001' },
  'acc_chest_M_fish.swf': { category: 'ca', figureId: '1002' },
  'acc_chest_anubisbackpack.swf': { category: 'ca', figureId: '1003' },
  'hair_F_ponytail.swf': { category: 'hr', figureId: '155' },
  'shirt_M_polo.swf': { category: 'cc', figureId: '180' },
  // Add more mappings as needed
};

const fetchSupabaseAssets = async (): Promise<any[]> => {
  const { data, error } = await supabase.storage
    .from('flash-assets')
    .list('', { limit: 2871 });
  
  if (error) throw error;
  return data || [];
};

const generateThumbnailUrl = (item: HybridClothingItem, colorId?: string): string => {
  const gender = item.gender === 'U' ? 'M' : item.gender;
  const color = colorId || (item.colors[0] || '1');
  const headOnly = ['hr', 'hd', 'fa', 'ey'].includes(item.category) ? '&headonly=1' : '';
  
  // Primary: Official Habbo Imaging
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.category}-${item.figureId}-${color}&gender=${gender}&size=l${headOnly}`;
};

const mapSupabaseToHybrid = (swfFiles: any[]): HybridClothingItem[] => {
  return swfFiles
    .map(file => {
      const mapping = SWF_TO_OFFICIAL_MAP[file.name];
      if (!mapping) return null;
      
      // Extract rarity from filename patterns
      let rarity: 'NORMAL' | 'HC' | 'VIP' | 'LTD' = 'NORMAL';
      if (file.name.includes('_hc_') || file.name.includes('_club_')) rarity = 'HC';
      if (file.name.includes('_vip_')) rarity = 'VIP';
      if (file.name.includes('_ltd_') || file.name.includes('_rare_')) rarity = 'LTD';
      
      const item: HybridClothingItem = {
        id: `${mapping.category}-${mapping.figureId}`,
        category: mapping.category,
        figureId: mapping.figureId,
        name: file.name.replace('.swf', '').replace(/_/g, ' '),
        gender: file.name.includes('_M_') ? 'M' : file.name.includes('_F_') ? 'F' : 'U',
        club: rarity === 'HC' ? '1' : '0',
        colorable: true,
        colors: ['1', '2', '3', '4', '5'],
        rarity,
        swfName: file.name,
        thumbnailUrl: '',
        source: 'SUPABASE'
      };
      
      item.thumbnailUrl = generateThumbnailUrl(item);
      return item;
    })
    .filter(Boolean) as HybridClothingItem[];
};

const fetchHybridClothingData = async (): Promise<Record<string, HybridClothingItem[]>> => {
  console.log('🔄 [HybridSystem] Fetching hybrid clothing data...');
  
  try {
    // Get official data first
    const officialResponse = await supabase.functions.invoke('get-habbo-figuredata');
    let officialData: Record<string, any> = {};
    
    console.log('📡 [HybridSystem] Official response:', {
      error: officialResponse.error,
      dataKeys: officialResponse.data ? Object.keys(officialResponse.data) : 'no data'
    });
    
    if (officialResponse.data?.figureParts) {
      officialData = officialResponse.data.figureParts;
    } else if (officialResponse.data && typeof officialResponse.data === 'object') {
      // Try different response structures
      officialData = officialResponse.data;
    }
    
    // Get Supabase assets
    console.log('📦 [HybridSystem] Fetching Supabase assets...');
    const supabaseAssets = await fetchSupabaseAssets();
    console.log(`📦 [HybridSystem] Found ${supabaseAssets.length} SWF files`);
    
    const supabaseItems = mapSupabaseToHybrid(supabaseAssets);
    console.log(`📦 [HybridSystem] Mapped ${supabaseItems.length} SWF items`);
    
    // Combine and organize by category
    const result: Record<string, HybridClothingItem[]> = {};
    
    // Add official items
    Object.entries(officialData).forEach(([category, items]: [string, any]) => {
      if (!result[category]) result[category] = [];
      
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          const hybridItem: HybridClothingItem = {
            id: `${category}-${item.id || item.figureId || Math.random()}`,
            category,
            figureId: item.id || item.figureId || 'unknown',
            name: `${category.toUpperCase()} ${item.id || item.figureId}`,
            gender: item.gender || 'U',
            club: item.club || '0',
            colorable: item.colorable !== false,
            colors: item.colors || ['1', '2', '3', '4', '5'],
            rarity: item.club === '1' ? 'HC' : 'NORMAL',
            thumbnailUrl: '',
            source: 'OFFICIAL'
          };
          
          hybridItem.thumbnailUrl = generateThumbnailUrl(hybridItem);
          result[category].push(hybridItem);
        });
      }
    });
    
    // Add Supabase items (avoiding duplicates)
    supabaseItems.forEach(item => {
      if (!result[item.category]) result[item.category] = [];
      
      const exists = result[item.category].some(existing => existing.figureId === item.figureId);
      if (!exists) {
        result[item.category].push(item);
      }
    });
    
    console.log('✅ [HybridSystem] Data loaded:', {
      categories: Object.keys(result).length,
      totalItems: Object.values(result).reduce((sum, items) => sum + items.length, 0),
      categoriesBreakdown: Object.fromEntries(Object.entries(result).map(([k, v]) => [k, v.length]))
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ [HybridSystem] Error:', error);
    // Return fallback data structure
    return {
      hr: [],
      hd: [],
      ch: [],
      lg: [],
      sh: [],
      cc: [],
      ca: [],
      wa: [],
      fa: [],
      ey: [],
      ea: [],
      ha: [],
      he: []
    };
  }
};

export const useHybridClothingSystem = () => {
  return useQuery({
    queryKey: ['hybrid-clothing-system'],
    queryFn: fetchHybridClothingData,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
  });
};