
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HabboFurniItem {
  id: string;
  name: string;
  className: string;
  category: string;
  imageUrl: string;
  description: string;
  rarity: string;
  type: string;
}

interface UseHabboFurniApiProps {
  searchTerm?: string;
  className?: string;
  limit?: number;
  autoFetch?: boolean;
}

export const useHabboFurniApi = ({ 
  searchTerm, 
  className, 
  limit = 500, // Aumentado de 200 para 500
  autoFetch = true 
}: UseHabboFurniApiProps = {}) => {
  const [furniData, setFurniData] = useState<HabboFurniItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchFurniData = useCallback(async (params?: { searchTerm?: string; className?: string; loadAll?: boolean }) => {
    try {
      setLoading(true);
      setError(null);

      const effectiveLimit = params?.loadAll ? 2000 : limit;
      const searchParams = {
        searchTerm: params?.searchTerm || searchTerm || '',
        className: params?.className || className || '',
        limit: effectiveLimit,
        category: 'all'
      };

      console.log('🔍 [useHabboFurniApi] Fetching with params:', searchParams);

      const startTime = Date.now();
      
      // Prioridade 1: API unificada (nova)
      let data, error: any;
      try {
        console.log('🌐 [useHabboFurniApi] Trying habbo-unified-api (primary source)');
        ({ data, error } = await supabase.functions.invoke('habbo-unified-api', {
          body: {
            endpoint: 'furni',
            action: 'search',
            params: searchParams
          }
        }));
        
        // Ajustar formato da resposta da API unificada
        if (data && data.furni) {
          data.furnis = data.furni;
        }
      } catch (unifiedError) {
        console.warn('⚠️ [useHabboFurniApi] Unified API failed, trying habbo-emotion-furnis');
        try {
          ({ data, error } = await supabase.functions.invoke('habbo-emotion-furnis', {
            body: searchParams
          }));
        } catch (emotionError) {
          console.warn('⚠️ [useHabboFurniApi] Emotion API failed, falling back to habbo-furni-api');
          ({ data, error } = await supabase.functions.invoke('habbo-furni-api', {
            body: searchParams
          }));
        }
      }

      const duration = Date.now() - startTime;
      console.log(`⏱️ [useHabboFurniApi] Request took ${duration}ms`);

      if (error) {
        console.error('❌ [useHabboFurniApi] Function error:', error);
        throw new Error(error.message);
      }

      console.log('📊 [useHabboFurniApi] Response:', {
        hasFurnis: !!data?.furnis,
        furniCount: data?.furnis?.length || 0,
        metadata: data?.metadata,
        source: data?.source
      });

      if (data?.furnis && Array.isArray(data.furnis)) {
        const validatedFurnis = data.furnis.map((furni: any) => ({
          id: furni.id || furni.item_id || 'unknown',
          name: furni.name || furni.publicName || 'Unknown Item',
          className: furni.className || furni.class_name || furni.classname || 'unknown_class',
          category: furni.category || 'furniture',
          imageUrl: furni.imageUrl || furni.icon_url || generateFallbackImageUrl(furni),
          description: furni.description || 'Habbo furniture item',
          rarity: furni.rarity || 'common',
          type: furni.type || 'roomitem'
        }));

        setFurniData(validatedFurnis);
        setHasMore(validatedFurnis.length >= effectiveLimit);
        console.log(`✅ [useHabboFurniApi] Loaded ${validatedFurnis.length} furniture items from ${data?.source || 'unknown'}`);
        
        // Cache resultados bem-sucedidos
        if (validatedFurnis.length > 0) {
          const cacheKey = `habbo-furni-cache-${JSON.stringify(searchParams)}`;
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              data: validatedFurnis,
              timestamp: Date.now(),
              ttl: 10 * 60 * 1000
            }));
          } catch (cacheError) {
            console.warn('⚠️ [useHabboFurniApi] Cache write failed:', cacheError);
          }
        }
      } else {
        console.warn('⚠️ [useHabboFurniApi] No furnis array in response');
        setFurniData([]);
        setHasMore(false);
        setError('Nenhum móvel retornado pela API');
      }
    } catch (err) {
      console.error('❌ [useHabboFurniApi] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch furniture data';
      setError(`Erro ao buscar móveis: ${errorMessage}`);
      
      // Fallback para cache
      const cacheKey = `habbo-furni-cache-${JSON.stringify({
        searchTerm: searchTerm || '',
        className: className || '',
        limit
      })}`;
      
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          if (cachedData.timestamp && Date.now() - cachedData.timestamp < cachedData.ttl) {
            setFurniData(cachedData.data);
            setError('Usando dados salvos (sem conexão)');
            console.log('📦 [useHabboFurniApi] Using cached data as fallback');
          }
        }
      } catch (cacheError) {
        console.error('❌ [useHabboFurniApi] Cache fallback error:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, className, limit]);

  const loadAll = useCallback(() => {
    fetchFurniData({ loadAll: true });
  }, [fetchFurniData]);

  const findItemByClassName = useCallback(async (targetClassName: string): Promise<HabboFurniItem | null> => {
    try {
      console.log(`🔍 [useHabboFurniApi] Finding item by className: ${targetClassName}`);
      
      // Tentar API unificada primeiro
      let data, error: any;
      try {
        ({ data, error } = await supabase.functions.invoke('habbo-unified-api', {
          body: {
            endpoint: 'furni',
            action: 'search',
            params: {
              className: targetClassName,
              limit: 1,
              searchTerm: '',
              category: 'all'
            }
          }
        }));
        
        // Ajustar formato da resposta
        if (data && data.furni) {
          data.furnis = data.furni;
        }
      } catch (unifiedError) {
        // Fallback para API original
        ({ data, error } = await supabase.functions.invoke('habbo-emotion-furnis', {
          body: {
            className: targetClassName,
            limit: 1,
            searchTerm: '',
            category: 'all'
          }
        }));
      }

      if (error || !data?.furnis?.[0]) {
        console.log(`❌ [useHabboFurniApi] No item found for className: ${targetClassName}`);
        return null;
      }

      const item = data.furnis[0];
      return {
        id: item.id,
        name: item.name,
        className: item.className,
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description,
        rarity: item.rarity,
        type: item.type
      };
    } catch (error) {
      console.error(`❌ [useHabboFurniApi] Error finding ${targetClassName}:`, error);
      return null;
    }
  }, []);

  // Auto-fetch na inicialização
  useEffect(() => {
    if (autoFetch) {
      fetchFurniData();
    }
  }, [autoFetch, fetchFurniData]);

  return {
    furniData,
    loading,
    error,
    hasMore,
    refetch: fetchFurniData,
    loadAll,
    findItemByClassName
  };
};

// Helper para gerar URLs de fallback
const generateFallbackImageUrl = (furni: any): string => {
  const className = furni.className || furni.class_name || furni.classname;
  const id = furni.id || furni.item_id;
  
  // Prioridade 1: HabboAssets.com
  if (className) {
    return `https://www.habboassets.com/furniture/${className}_icon.png`;
  }
  
  // Prioridade 2: Habbo oficial
  if (id) {
    return `https://images.habbo.com/dcr/hof_furni/${id}/${id}_icon.png`;
  }
  
  // Fallback final
  return '/assets/gcreate_icon_credit.png';
};
