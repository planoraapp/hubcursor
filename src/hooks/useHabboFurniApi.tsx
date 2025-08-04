
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
  limit = 200, 
  autoFetch = true 
}: UseHabboFurniApiProps = {}) => {
  const [furniData, setFurniData] = useState<HabboFurniItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFurniData = useCallback(async (params?: { searchTerm?: string; className?: string }) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = {
        searchTerm: params?.searchTerm || searchTerm || '',
        className: params?.className || className || '',
        limit,
        category: 'all'
      };

      console.log('🔍 [useHabboFurniApi] Fetching with params:', searchParams);

      const startTime = Date.now();
      const { data, error: functionError } = await supabase.functions.invoke('habbo-furni-api', {
        body: searchParams
      });

      const duration = Date.now() - startTime;
      console.log(`⏱️ [useHabboFurniApi] Request took ${duration}ms`);

      if (functionError) {
        console.error('❌ [useHabboFurniApi] Function error:', functionError);
        throw new Error(functionError.message);
      }

      console.log('📊 [useHabboFurniApi] Full response:', data);
      console.log('📊 [useHabboFurniApi] Response structure:', {
        hasFurnis: !!data?.furnis,
        furniCount: data?.furnis?.length || 0,
        metadata: data?.metadata,
        apiStatus: data?.metadata?.apiStatus,
        firstFurni: data?.furnis?.[0]
      });

      if (data?.furnis && Array.isArray(data.furnis)) {
        const validatedFurnis = data.furnis.map((furni: any) => ({
          id: furni.id || 'unknown',
          name: furni.name || 'Unknown Item',
          className: furni.className || furni.class_name || 'unknown_class',
          category: furni.category || 'furniture',
          imageUrl: furni.imageUrl || '/assets/gcreate_icon_credit.png',
          description: furni.description || 'Habbo furniture item',
          rarity: furni.rarity || 'common',
          type: furni.type || 'roomitem'
        }));

        setFurniData(validatedFurnis);
        console.log(`✅ [useHabboFurniApi] Loaded ${validatedFurnis.length} furniture items successfully`);
        
        // Cache apenas resultados bem-sucedidos da API real
        if (validatedFurnis.length > 0 && data.metadata?.apiStatus === 'success') {
          const cacheKey = `habbo-furni-cache-${JSON.stringify(searchParams)}`;
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              data: validatedFurnis,
              timestamp: Date.now(),
              ttl: 10 * 60 * 1000 // 10 minutos
            }));
            console.log('💾 [useHabboFurniApi] Results cached successfully');
          } catch (cacheError) {
            console.warn('⚠️ [useHabboFurniApi] Cache write failed:', cacheError);
          }
        }
      } else {
        console.warn('⚠️ [useHabboFurniApi] No furnis array in response or invalid data');
        setFurniData([]);
        setError('Nenhum móvel retornado pela API');
      }
    } catch (err) {
      console.error('❌ [useHabboFurniApi] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch furniture data';
      setError(`Erro ao buscar móveis: ${errorMessage}`);
      
      // Tentar cache como fallback apenas em caso de erro
      const cacheKey = `habbo-furni-cache-${JSON.stringify({
        searchTerm: searchTerm || '',
        className: className || '',
        limit
      })}`;
      
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          
          // Verificar se o cache não expirou (TTL de 10 minutos)
          if (cachedData.timestamp && Date.now() - cachedData.timestamp < cachedData.ttl) {
            setFurniData(cachedData.data);
            setError('Usando dados salvos (sem conexão com HabboFurni)');
            console.log('📦 [useHabboFurniApi] Using valid cached data as fallback');
          } else {
            console.log('⏰ [useHabboFurniApi] Cache expired, removing');
            localStorage.removeItem(cacheKey);
          }
        }
      } catch (cacheError) {
        console.error('❌ [useHabboFurniApi] Cache fallback error:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, className, limit]);

  const findItemByClassName = useCallback(async (targetClassName: string): Promise<HabboFurniItem | null> => {
    try {
      console.log(`🔍 [useHabboFurniApi] Finding item by className: ${targetClassName}`);
      
      const startTime = Date.now();
      const { data, error: functionError } = await supabase.functions.invoke('habbo-furni-api', {
        body: {
          className: targetClassName,
          limit: 1,
          searchTerm: '',
          category: 'all'
        }
      });

      const duration = Date.now() - startTime;
      console.log(`⏱️ [useHabboFurniApi] findItemByClassName took ${duration}ms`);

      if (functionError) {
        console.error('❌ [useHabboFurniApi] Function error in findItemByClassName:', functionError);
        return null;
      }

      if (data?.furnis && data.furnis.length > 0) {
        const item = data.furnis[0];
        console.log(`✅ [useHabboFurniApi] Found item:`, {
          name: item.name,
          className: item.className,
          imageUrl: item.imageUrl,
          source: item.source
        });
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
      }

      console.log(`❌ [useHabboFurniApi] No item found for className: ${targetClassName}`);
      return null;
    } catch (error) {
      console.error(`❌ [useHabboFurniApi] Error finding ${targetClassName}:`, error);
      return null;
    }
  }, []);

  // Auto-fetch na inicialização se habilitado
  useEffect(() => {
    if (autoFetch) {
      console.log('🚀 [useHabboFurniApi] Auto-fetch triggered');
      fetchFurniData();
    }
  }, [autoFetch, fetchFurniData]);

  return {
    furniData,
    loading,
    error,
    refetch: fetchFurniData,
    findItemByClassName
  };
};
