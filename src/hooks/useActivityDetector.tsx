
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ActivityDetectionOptions {
  hotel?: string;
  limit?: number;
  user?: string;
  enabled?: boolean;
}

export const useActivityDetector = (options: ActivityDetectionOptions = {}) => {
  const {
    hotel = 'com.br',
    limit = 50,
    user,
    enabled = true
  } = options;

  return useQuery({
    queryKey: ['activity-detector', hotel, limit, user],
    queryFn: async () => {
      console.log('🔍 [useActivityDetector] Triggering activity detection...');
      
      const params = new URLSearchParams({
        hotel,
        limit: limit.toString(),
        ...(user && { user })
      });

      const { data, error } = await supabase.functions.invoke('habbo-activity-detector', {
        body: Object.fromEntries(params)
      });

      if (error) {
        console.error('❌ [useActivityDetector] Error:', error);
        throw new Error(`Activity detection failed: ${error.message}`);
      }

      console.log('✅ [useActivityDetector] Detection completed:', data);
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};
