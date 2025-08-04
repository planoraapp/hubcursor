
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HabboFurniItem {
  id: string;
  name: string;
  class_name: string;
  category: string;
  image_url: string;
  icon_url: string;
  description: string;
  rarity: string;
  type: string;
}

interface UseHabboFurniApiProps {
  searchTerm?: string;
  className?: string;
  limit?: number;
}

export const useHabboFurniApi = ({ searchTerm, className, limit = 50 }: UseHabboFurniApiProps = {}) => {
  const [furniData, setFurniData] = useState<HabboFurniItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFurniData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('habbo-furni-api', {
        body: {
          searchTerm: searchTerm || '',
          className: className || '',
          limit,
          category: 'all'
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data?.furnis) {
        setFurniData(data.furnis);
        console.log(`🎯 [HabboFurni] Loaded ${data.furnis.length} furniture items`);
      }
    } catch (err) {
      console.error('❌ [HabboFurni] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch furniture data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm || className) {
      fetchFurniData();
    }
  }, [searchTerm, className, limit]);

  return {
    furniData,
    loading,
    error,
    refetch: fetchFurniData
  };
};
