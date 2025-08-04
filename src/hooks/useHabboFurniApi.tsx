
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
  limit = 50, 
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

      console.log('🔍 [HabboFurniApi] Fetching with params:', searchParams);

      const startTime = Date.now();
      const { data, error: functionError } = await supabase.functions.invoke('habbo-furni-api', {
        body: searchParams
      });

      const duration = Date.now() - startTime;
      console.log(`⏱️ [HabboFurniApi] Request took ${duration}ms`);

      if (functionError) {
        console.error('❌ [HabboFurniApi] Function error:', functionError);
        throw new Error(functionError.message);
      }

      console.log('📊 [HabboFurniApi] Response structure:', {
        hasFurnis: !!data?.furnis,
        furniCount: data?.furnis?.length || 0,
        metadata: data?.metadata,
        apiStatus: data?.metadata?.apiStatus
      });

      if (data?.furnis && Array.isArray(data.furnis)) {
        setFurniData(data.furnis);
        console.log(`✅ [HabboFurniApi] Loaded ${data.furnis.length} furniture items`);
        
        // Cache de resultados bem-sucedidos (apenas se não for fallback)
        if (data.furnis.length > 0 && data.metadata?.apiStatus !== 'fallback') {
          const cacheKey = `habbo-furni-cache-${JSON.stringify(searchParams)}`;
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              data: data.furnis,
              timestamp: Date.now(),
              ttl: 5 * 60 * 1000 // 5 minutos
            }));
            console.log('💾 [HabboFurniApi] Results cached successfully');
          } catch (cacheError) {
            console.warn('⚠️ [HabboFurniApi] Cache write failed:', cacheError);
          }
        }
      } else {
        console.warn('⚠️ [HabboFurniApi] No furnis array in response');
        setFurniData([]);
      }
    } catch (err) {
      console.error('❌ [HabboFurniApi] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch furniture data');
      
      // Tentar cache como fallback
      const cacheKey = `habbo-furni-cache-${JSON.stringify({
        searchTerm: searchTerm || '',
        className: className || '',
        limit
      })}`;
      
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          
          // Verificar se o cache não expirou
          if (cachedData.timestamp && Date.now() - cachedData.timestamp < cachedData.ttl) {
            setFurniData(cachedData.data);
            console.log('📦 [HabboFurniApi] Using valid cached data');
          } else {
            console.log('⏰ [HabboFurniApi] Cache expired, removing');
            localStorage.removeItem(cacheKey);
          }
        }
      } catch (cacheError) {
        console.error('❌ [HabboFurniApi] Cache fallback error:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, className, limit]);

  const findItemByClassName = useCallback(async (targetClassName: string): Promise<HabboFurniItem | null> => {
    try {
      console.log(`🔍 [HabboFurniApi] Finding item by className: ${targetClassName}`);
      
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
      console.log(`⏱️ [HabboFurniApi] findItemByClassName took ${duration}ms`);

      if (functionError) {
        console.error('❌ [HabboFurniApi] Function error in findItemByClassName:', functionError);
        return null;
      }

      if (data?.furnis && data.furnis.length > 0) {
        const item = data.furnis[0];
        console.log(`✅ [HabboFurniApi] Found item:`, {
          name: item.name,
          className: item.className,
          imageUrl: item.imageUrl,
          source: item.source
        });
        return item;
      }

      console.log(`❌ [HabboFurniApi] No item found for className: ${targetClassName}`);
      return null;
    } catch (error) {
      console.error(`❌ [HabboFurniApi] Error finding ${targetClassName}:`, error);
      return null;
    }
  }, []);

  // Auto-fetch na inicialização se habilitado
  useEffect(() => {
    if (autoFetch) {
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
