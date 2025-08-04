
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedHabboClothingItem {
  id: string;
  figureId: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  colors: string[];
  club: 'FREE' | 'HC';
  name: string;
  source: 'viajovem' | 'habbowidgets' | 'official-habbo' | 'flash-assets';
  thumbnailUrl: string;
  isValidated?: boolean;
}

export interface UnifiedClothingData {
  [category: string]: UnifiedHabboClothingItem[];
}

const HABBO_DOMAINS = ['com', 'fr', 'com.br', 'es'] as const;

// Cache global para URLs validadas
const validatedUrlCache = new Map<string, string>();

const generateHabboImagingUrl = (
  category: string,
  figureId: string,
  colorId: string = '1',
  gender: 'M' | 'F' = 'M',
  domain: string = 'com',
  size: 's' | 'l' = 's'
): string => {
  const baseAvatar = getBaseAvatarForCategory(category);
  const fullFigure = `${baseAvatar}.${category}-${figureId}-${colorId}`;
  
  return `https://www.habbo.${domain}/habbo-imaging/avatarimage?figure=${fullFigure}&gender=${gender}&direction=2&head_direction=2&size=${size}`;
};

const getBaseAvatarForCategory = (category: string): string => {
  const baseAvatars = {
    'hd': 'hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
    'hr': 'hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92',
    'ch': 'hd-180-1.hr-828-45.lg-3116-92.sh-3297-92',
    'cc': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
    'lg': 'hd-180-1.hr-828-45.ch-3216-92.sh-3297-92',
    'sh': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92',
    'ha': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
    'ea': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
    'ca': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
    'cp': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
    'wa': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92'
  };
  
  return baseAvatars[category as keyof typeof baseAvatars] || 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92';
};

const fetchUnifiedClothingData = async (): Promise<UnifiedClothingData> => {
  console.log('🌐 [UnifiedHabboClothing] Fetching unified clothing data...');
  
  try {
    const { data, error } = await supabase.functions.invoke('get-unified-habbo-clothing');
    
    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }
    
    if (!data?.items) {
      throw new Error('No clothing data received');
    }
    
    console.log('✅ [UnifiedHabboClothing] Unified data loaded:', {
      totalItems: data.items.length,
      sources: data.metadata?.sources || {},
      categories: Object.keys(data.categories || {}).length
    });
    
    // Processar e padronizar os dados
    const processedData: UnifiedClothingData = {};
    
    data.items.forEach((item: any) => {
      const category = item.category;
      if (!processedData[category]) {
        processedData[category] = [];
      }
      
      // Gerar URL padronizada com habbo-imaging
      const thumbnailUrl = generateHabboImagingUrl(
        item.category,
        item.figureId,
        item.colors?.[0] || '1',
        item.gender || 'M'
      );
      
      const unifiedItem: UnifiedHabboClothingItem = {
        id: item.id || `${item.source}_${item.category}_${item.figureId}`,
        figureId: item.figureId,
        category: item.category,
        gender: item.gender || 'U',
        colors: item.colors || ['1'],
        club: item.club || 'FREE',
        name: item.name || `${item.category.toUpperCase()}-${item.figureId}`,
        source: item.source || 'unknown',
        thumbnailUrl,
        isValidated: false
      };
      
      processedData[category].push(unifiedItem);
    });
    
    return processedData;
    
  } catch (error) {
    console.error('❌ [UnifiedHabboClothing] Error:', error);
    throw error;
  }
};

export const useUnifiedHabboClothing = () => {
  return useQuery({
    queryKey: ['unified-habbo-clothing'],
    queryFn: fetchUnifiedClothingData,
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
  });
};

export const useUnifiedHabboCategory = (categoryId: string, gender: 'M' | 'F') => {
  const { data: allData, ...queryResult } = useUnifiedHabboClothing();
  
  const filteredItems = allData?.[categoryId]?.filter(
    item => item.gender === gender || item.gender === 'U'
  ) || [];
  
  console.log(`🎯 [UnifiedCategory] Filtered items for ${categoryId}:`, filteredItems.length);
  
  return {
    ...queryResult,
    data: filteredItems
  };
};

// Hook para validar URLs de imagem com fallback
export const useImageValidation = (url: string) => {
  return useQuery({
    queryKey: ['image-validation', url],
    queryFn: async () => {
      const cached = validatedUrlCache.get(url);
      if (cached) return cached;
      
      // Tentar carregar imagem para validar
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          validatedUrlCache.set(url, url);
          resolve(url);
        };
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = url;
      });
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: false
  });
};

// Função para gerar URLs com fallback inteligente
export const generateImageUrlWithFallback = (
  category: string,
  figureId: string,
  colorId: string = '1',
  gender: 'M' | 'F' = 'M'
): string[] => {
  return HABBO_DOMAINS.map(domain => 
    generateHabboImagingUrl(category, figureId, colorId, gender, domain)
  );
};
