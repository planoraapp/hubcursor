import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  parseAssetCategory, 
  parseAssetGender, 
  parseAssetFigureId,
  generateCategoryColors,
  generateIsolatedThumbnail,
  formatAssetName,
  parseAssetRarity,
  getRarityStats,
  CATEGORY_METADATA,
  CATEGORY_SECTIONS,
  isValidColorForCategory,
  getDefaultColorForCategory
} from '@/lib/enhancedCategoryMapperV2';
import { getCategoryFromSwfName } from '@/lib/improvedCategoryMapper';
import { useOfficialFigureData } from '@/hooks/useFigureDataOfficial';
import { getClothingSpriteUrl, getFallbackThumbnail } from '@/utils/clothingSpriteGenerator';

export interface EnhancedFlashAssetV2 {
  id: string;
  name: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  figureId: string;
  colors: string[];
  thumbnailUrl: string;
  club: 'hc' | 'normal';
  rarity: 'nft' | 'hc' | 'ltd' | 'rare' | 'common';
  swfName: string;
  source: 'flash-assets-enhanced-v2';
}

interface FetchParams {
  category?: string;
  gender?: 'M' | 'F';
  search?: string;
  rarity?: 'nft' | 'hc' | 'ltd' | 'rare' | 'common';
  limit?: number;
}

const fetchEnhancedFlashAssetsV2 = async (params: FetchParams): Promise<EnhancedFlashAssetV2[]> => {
  console.log('🌐 [EnhancedFlashAssetsV2] Fetching with enhanced categorization', params);
  
  try {
    const { data, error } = await supabase.functions.invoke('flash-assets-clothing', {
      body: { 
        limit: params.limit || 3000, 
        category: params.category || 'all', 
        search: params.search || '',
        gender: params.gender || 'M',
        rarity: params.rarity || 'all'
      }
    });

    if (error) {
      console.error('❌ [EnhancedFlashAssetsV2] Supabase function error:', error);
      throw error;
    }

    // Tolerate multiple response shapes
    let assets: any[] | undefined;
    if (data) {
      if (Array.isArray(data)) {
        assets = data as any[];
      } else if (Array.isArray((data as any).assets)) {
        assets = (data as any).assets as any[];
      } else if (Array.isArray((data as any).items)) {
        assets = (data as any).items as any[];
      }
    }

    if (!assets) {
      console.error('❌ [EnhancedFlashAssetsV2] Invalid response format:', data);
      throw new Error('Invalid response format from enhanced flash assets V2');
    }

    console.log(`✅ [EnhancedFlashAssetsV2] Successfully fetched ${assets.length} raw assets`);
    if ((data as any)?.metadata) {
      console.log(`📊 [EnhancedFlashAssetsV2] Metadata:`, (data as any).metadata);
    }
    
    return assets;
    
  } catch (error) {
    console.error('❌ [EnhancedFlashAssetsV2] Error:', error);
    throw error;
  }
};

interface UseEnhancedFlashAssetsV2Params {
  category?: string;
  gender?: 'M' | 'F';
  search?: string;
  rarity?: 'nft' | 'hc' | 'ltd' | 'rare' | 'common';
}

export const useEnhancedFlashAssetsV2 = (params: UseEnhancedFlashAssetsV2Params) => {
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [rarityStats, setRarityStats] = useState<Record<string, number>>({});
  const [sectionStats, setSectionStats] = useState<Record<string, number>>({});

  const query = useQuery({
    queryKey: ['enhanced-flash-assets-v2', params],
    queryFn: () => fetchEnhancedFlashAssetsV2(params),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 2,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
  
  const official = useOfficialFigureData();

  const normalizedItems = useMemo<EnhancedFlashAssetV2[]>(() => {
    const assets: any[] = (query.data as any[]) || [];
    const officialData: Record<string, any[]> = (official.data as any) || {};

    // Valid clothing categories ONLY - no fx/pets/vehicles
    const VALID_CLOTHING_CATEGORIES = new Set([
      'hd', 'hr', 'ha', 'ea', 'fa', // Head section
      'ch', 'cc', 'cp', 'ca',       // Body section  
      'lg', 'sh', 'wa'              // Legs section
    ]);

    console.log('🔧 [Normalization] Starting enhanced normalization process');
    console.log('📊 [Normalization] Official data structure:', Object.keys(officialData));
    
    // Build enhanced ID-to-category mapping from official data
    const idToCategory = new Map<string, string>();
    const categoryStats = new Map<string, number>();
    
    Object.entries(officialData).forEach(([cat, items]) => {
      if (VALID_CLOTHING_CATEGORIES.has(cat) && Array.isArray(items)) {
        categoryStats.set(cat, items.length);
        items.forEach((item: any) => {
          const id = String(item.id);
          if (/^\d+$/.test(id) && !idToCategory.has(id)) {
            idToCategory.set(id, cat);
          }
        });
      }
    });
    
    console.log('📈 [Normalization] Official mapping built:', {
      totalMappings: idToCategory.size,
      categoryStats: Object.fromEntries(categoryStats),
      sampleMappings: Array.from(idToCategory.entries()).slice(0, 5)
    });

    const normalized = assets.map((asset: any, index: number) => {
      const swf = String(asset?.swfName ?? asset?.name ?? asset?.id ?? '');
      
      // Enhanced figure ID parsing
      const parsedFigureId = (() => {
        try {
          const parsed = typeof parseAssetFigureId === 'function' ? String(parseAssetFigureId(swf)) : '';
          return parsed && parsed !== 'undefined' ? parsed : '';
        } catch {
          return '';
        }
      })();
      
      const figureId = parsedFigureId || String(asset?.figureId ?? asset?.id ?? '');

      // Enhanced category detection with official data priority
      let category = '';
      let categorySource = '';
      
      // Strategy 1: Official data mapping (highest priority)
      if (figureId && /^\d+$/.test(figureId)) {
        const officialCategory = idToCategory.get(figureId);
        if (officialCategory) {
          category = officialCategory;
          categorySource = 'official';
        }
      }
      
      // Strategy 2: Fallback to parsing (lower priority)
      if (!category) {
        try {
          category = typeof parseAssetCategory === 'function' ? parseAssetCategory(swf) : (asset?.category || '');
          categorySource = 'parsed';
        } catch {
          category = String(asset?.category || 'ch');
          categorySource = 'default';
        }
      }

      // STRICT VALIDATION: Only valid clothing categories
      if (!VALID_CLOTHING_CATEGORIES.has(category)) {
        console.log(`🚫 [Normalization] Rejecting invalid category '${category}' for ${swf} (source: ${categorySource})`);
        return null;
      }

      // STRICT VALIDATION: Only numeric figureId, not '0'
      if (!/^\d+$/.test(String(figureId)) || String(figureId) === '0') {
        console.log(`🚫 [Normalization] Rejecting invalid figureId '${figureId}' for ${swf}`);
        return null;
      }

      // Enhanced gender parsing
      let gender: 'M' | 'F' | 'U' = (typeof parseAssetGender === 'function' 
        ? parseAssetGender(swf)
        : (asset?.gender)) as any;
      if (gender !== 'M' && gender !== 'F') gender = 'U';

      // Enhanced color handling
      const officialItems = (officialData as any)[category] as any[] | undefined;
      const officialMatch = officialItems?.find((it: any) => String(it.id) === figureId);
      let colors: string[] = [];
      if (officialMatch?.colors?.length) {
        colors = officialMatch.colors.map((c: any) => String(c));
      } else if (Array.isArray(asset?.colors) && asset.colors.length) {
        colors = asset.colors.map((c: any) => String(c));
      } else {
        colors = ['1']; // Default
      }
      
      const colorId = colors[0] || '1';
      const finalColorId = isValidColorForCategory(colorId, category) ? colorId : getDefaultColorForCategory(category);

      // Enhanced metadata
      const name = (typeof formatAssetName === 'function' ? formatAssetName(String(asset?.name ?? swf)) : String(asset?.name ?? swf));
      const rarity = (typeof parseAssetRarity === 'function' ? parseAssetRarity(swf) : asset?.rarity) || 'common';
      const club: 'hc' | 'normal' = (asset?.club === 'hc' || asset?.club === 'HC' || asset?.club === 1 || asset?.club === '1') ? 'hc' : 'normal';
      const swfName = asset?.swfName || swf || `${category}_${figureId}`;
      
      // Enhanced thumbnail generation with sprite priority
      const thumbnailUrl = getClothingSpriteUrl(
        category, 
        figureId, 
        finalColorId, 
        gender === 'U' ? 'M' : gender,
        swfName
      );

      const normalizedItem: EnhancedFlashAssetV2 = {
        id: String(asset?.id ?? `${category}_${figureId}_${gender}`),
        name,
        category,
        gender,
        figureId,
        colors,
        thumbnailUrl,
        club,
        rarity,
        swfName,
        source: 'flash-assets-enhanced-v2'
      };

      // Log successful normalization details
      if (index < 5) { // Log first 5 for debugging
        console.log(`✅ [Normalization] Asset ${index + 1}:`, {
          swf: swfName,
          category: `${category} (${categorySource})`,
          figureId,
          gender,
          thumbnailUrl: thumbnailUrl.substring(0, 80) + '...'
        });
      }

      return normalizedItem;
    }).filter(Boolean); // Remove null items

    // Apply category filter if specified
    const finalList = params?.category ? normalized.filter(it => it.category === params.category) : normalized;
    
    console.log(`🎯 [Normalization] Final results:`, {
      totalNormalized: normalized.length,
      afterCategoryFilter: finalList.length,
      rejectedCount: assets.length - normalized.length,
      categories: [...new Set(normalized.map(it => it.category))].sort()
    });
    
    return finalList;
  }, [query.data, official.data, params?.category]);

  useEffect(() => {
    if (normalizedItems.length) {
      // Calculate COMPLETE statistics with normalized items
      const catStats = normalizedItems.reduce((acc, asset) => {
        acc[asset.category] = (acc[asset.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const rarStats = getRarityStats(normalizedItems);
      
      // Calculate section statistics
      const secStats = Object.entries(CATEGORY_SECTIONS).reduce((acc, [sectionId, section]) => {
        acc[sectionId] = section.categories.reduce((sum, cat) => sum + (catStats[cat] || 0), 0);
        return acc;
      }, {} as Record<string, number>);

      setCategoryStats(catStats);
      setRarityStats(rarStats);
      setSectionStats(secStats);

      console.log('📊 [EnhancedFlashAssetsV2] Enhanced statistics:', {
        totalAssets: normalizedItems.length,
        categorias: Object.keys(catStats).length,
        categoryStats: catStats,
        rarityStats: rarStats,
        sectionStats: secStats
      });
    }
  }, [normalizedItems]);

  return {
    items: normalizedItems,
    categoryStats,
    rarityStats,
    sectionStats,
    totalItems: normalizedItems.length,
    isLoading: query.isLoading || official.isLoading,
    error: (query.error as any) || (official.error as any),
    isSuccess: query.isSuccess && official.isSuccess,
    // Helper methods
    getCategoryMetadata: (category: string) => CATEGORY_METADATA[category as keyof typeof CATEGORY_METADATA],
    getSectionMetadata: (sectionId: string) => CATEGORY_SECTIONS[sectionId as keyof typeof CATEGORY_SECTIONS],
    getAllSections: () => CATEGORY_SECTIONS
  };
};

export const useEnhancedFlashCategoryV2 = (categoryId: string, gender: 'M' | 'F') => {
  return useEnhancedFlashAssetsV2({
    category: categoryId,
    gender,
  });
};

export const useEnhancedFlashSectionV2 = (sectionId: string, gender: 'M' | 'F') => {
  const section = CATEGORY_SECTIONS[sectionId as keyof typeof CATEGORY_SECTIONS];
  const [allItems, setAllItems] = useState<EnhancedFlashAssetV2[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!section) return;
    
    const fetchSectionData = async () => {
      setIsLoading(true);
      const promises = section.categories.map(category => 
        fetchEnhancedFlashAssetsV2({ category, gender })
      );
      
      const results = await Promise.all(promises);
      const combined = results.flat();
      setAllItems(combined);
      setIsLoading(false);
    };
    
    fetchSectionData();
  }, [sectionId, gender]);
  
  return {
    items: allItems,
    isLoading,
    section
  };
};
