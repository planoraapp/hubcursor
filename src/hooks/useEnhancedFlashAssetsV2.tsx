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
  console.log('🌐 [EnhancedFlashAssetsV2] Buscando assets com sistema COMPLETO', params);
  
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

    console.log(`✅ [EnhancedFlashAssetsV2] Successfully fetched ${assets.length} enhanced assets`);
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
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
  const official = useOfficialFigureData();

  const normalizedItems = useMemo<EnhancedFlashAssetV2[]>(() => {
    const assets: any[] = (query.data as any[]) || [];
    const officialData: Record<string, any[]> = (official.data as any) || {};

    // Mapa de id -> categoria a partir da fonte oficial
    const idToCategory = new Map<string, string>();
    Object.entries(officialData).forEach(([cat, items]) => {
      (items as any[]).forEach((it: any) => {
        const id = String(it.id);
        if (!idToCategory.has(id)) idToCategory.set(id, cat);
      });
    });

    const mapped = assets.map((a: any) => {
      const swf = String(a?.swfName ?? a?.name ?? a?.id ?? '');
      const parsedFigureId = (() => {
        try {
          return typeof parseAssetFigureId === 'function' ? String(parseAssetFigureId(swf)) : String(a?.figureId ?? '');
        } catch {
          return String(a?.figureId ?? '');
        }
      })();
      const figureId = parsedFigureId && parsedFigureId !== 'undefined' && parsedFigureId !== ''
        ? parsedFigureId
        : String(a?.figureId ?? a?.id ?? '');

      let category = idToCategory.get(figureId)
        || (typeof parseAssetCategory === 'function' ? parseAssetCategory(swf) : String(a?.category || 'ch'));

      // Correção heurística: evitar cair em 'fx' (ou outros) quando parecer peça de roupa
      const heuristicCategory = getCategoryFromSwfName(swf);
      const validCategories = new Set(['hd','hr','ha','ea','fa','ch','cc','cp','ca','lg','sh','wa']);
      if (!validCategories.has(category)) {
        console.log(`🔄 [Normalize] Categoria inválida '${category}' para ${swf} -> usando heurística '${heuristicCategory}'`);
        category = heuristicCategory;
      }
      if ((category === 'fx' || category === 'pets' || category === 'vehicles') && validCategories.has(heuristicCategory)) {
        console.log(`🔄 [Normalize] Recategorizando ${swf}: ${category} -> ${heuristicCategory}`);
        category = heuristicCategory;
      }

      let gender: 'M' | 'F' | 'U' = (typeof parseAssetGender === 'function' 
        ? parseAssetGender(swf)
        : (a?.gender)) as any;
      if (gender !== 'M' && gender !== 'F') gender = 'U';

      // Cores – priorizar oficiais
      const officialItems = (officialData as any)[category] as any[] | undefined;
      const officialMatch = officialItems?.find((it: any) => String(it.id) === figureId);
      let colors: string[] = [];
      if (officialMatch?.colors?.length) {
        colors = officialMatch.colors.map((c: any) => String(c));
      } else if (Array.isArray(a?.colors) && a.colors.length) {
        colors = a.colors.map((c: any) => String(c));
      }
      const colorId = colors[0] || '1';
      const finalColorId = isValidColorForCategory(colorId, category) ? colorId : getDefaultColorForCategory(category);

      const name = (typeof formatAssetName === 'function' ? formatAssetName(String(a?.name ?? swf)) : String(a?.name ?? swf));
      const rarity = (typeof parseAssetRarity === 'function' ? parseAssetRarity(swf) : a?.rarity) || 'common';
      const club: 'hc' | 'normal' = (a?.club === 'hc' || a?.club === 'HC' || a?.club === 1 || a?.club === '1') ? 'hc' : 'normal';
      const swfName = a?.swfName || `${category}_${figureId}`;
      const thumbnailUrl = typeof generateIsolatedThumbnail === 'function'
        ? generateIsolatedThumbnail(category, figureId, finalColorId, gender)
        : (a?.thumbnailUrl || '');

      const normalized: EnhancedFlashAssetV2 = {
        id: String(a?.id ?? `${category}_${figureId}_${gender}`),
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

      return normalized;
    });

    // Se houver categoria no filtro, garantir consistência
    const finalList = params?.category ? mapped.filter(it => it.category === params.category) : mapped;
    return finalList;
  }, [query.data, official.data, params?.category]);

  useEffect(() => {
    if (normalizedItems.length) {
      // Calcular estatísticas COMPLETAS com itens normalizados
      const catStats = normalizedItems.reduce((acc, asset) => {
        acc[asset.category] = (acc[asset.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const rarStats = getRarityStats(normalizedItems);
      
      // Calcular estatísticas por seção
      const secStats = Object.entries(CATEGORY_SECTIONS).reduce((acc, [sectionId, section]) => {
        acc[sectionId] = section.categories.reduce((sum, cat) => sum + (catStats[cat] || 0), 0);
        return acc;
      }, {} as Record<string, number>);

      setCategoryStats(catStats);
      setRarityStats(rarStats);
      setSectionStats(secStats);

      console.log('📊 [EnhancedFlashAssetsV2] Estatísticas NORMALIZADAS:', {
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
    // Métodos auxiliares
    getCategoryMetadata: (category: string) => CATEGORY_METADATA[category as keyof typeof CATEGORY_METADATA],
    getSectionMetadata: (sectionId: string) => CATEGORY_SECTIONS[sectionId as keyof typeof CATEGORY_SECTIONS],
    getAllSections: () => CATEGORY_SECTIONS
  };
};

// Hook específico por categoria
export const useEnhancedFlashCategoryV2 = (categoryId: string, gender: 'M' | 'F') => {
  return useEnhancedFlashAssetsV2({
    category: categoryId,
    gender,
  });
};

// Hook específico por seção
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
