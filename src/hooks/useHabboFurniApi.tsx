
import { useState, useCallback } from 'react';
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

      const { data, error: functionError } = await supabase.functions.invoke('habbo-furni-api', {
        body: searchParams
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data?.furnis && Array.isArray(data.furnis)) {
        setFurniData(data.furnis);
        console.log(`✅ [HabboFurniApi] Loaded ${data.furnis.length} furniture items`);
        
        // Cache successful results
        if (data.furnis.length > 0) {
          localStorage.setItem(`habbo-furni-cache-${JSON.stringify(searchParams)}`, JSON.stringify(data.furnis));
        }
      }
    } catch (err) {
      console.error('❌ [HabboFurniApi] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch furniture data');
      
      // Try cache as fallback
      const cacheKey = `habbo-furni-cache-${JSON.stringify({
        searchTerm: searchTerm || '',
        className: className || '',
        limit
      })}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          setFurniData(cachedData);
          console.log('📦 [HabboFurniApi] Using cached data');
        } catch (cacheError) {
          console.error('❌ [HabboFurniApi] Cache error:', cacheError);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, className, limit]);

  const findItemByClassName = useCallback(async (targetClassName: string): Promise<HabboFurniItem | null> => {
    try {
      console.log(`🔍 [HabboFurniApi] Finding item by className: ${targetClassName}`);
      
      const { data, error: functionError } = await supabase.functions.invoke('habbo-furni-api', {
        body: {
          className: targetClassName,
          limit: 1
        }
      });

      if (functionError || !data?.furnis || data.furnis.length === 0) {
        return null;
      }

      const item = data.furnis[0];
      console.log(`✅ [HabboFurniApi] Found item:`, item);
      return item;
    } catch (error) {
      console.error(`❌ [HabboFurniApi] Error finding ${targetClassName}:`, error);
      return null;
    }
  }, []);

  return {
    furniData,
    loading,
    error,
    refetch: fetchFurniData,
    findItemByClassName
  };
};
