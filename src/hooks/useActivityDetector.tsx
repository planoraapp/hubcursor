
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
    enabled = false // DESABILITADO: Edge function não existe mais
  } = options;

  return useQuery({
    queryKey: ['activity-detector', hotel, limit, user],
    queryFn: async () => {
            // COMENTADO: Edge function habbo-activity-detector não existe mais
      /*
      const params = new URLSearchParams({
        hotel,
        limit: limit.toString(),
        ...(user && { user })
      });

      const { data, error } = await supabase.functions.invoke('habbo-activity-detector', {
        body: Object.fromEntries(params)
      });

      if (error) {
                throw new Error(`Activity detection failed: ${error.message}`);
      }

            return data;
      */
      
      // Retorna dados vazios para manter compatibilidade
      return { activities: [], meta: { count: 0, timestamp: new Date().toISOString() } };
    },
    enabled: false, // Força desabilitado
    staleTime: 5 * 60 * 1000,
    retry: 0, // Não retry para evitar spam de erros
    retryDelay: () => 0,
  });
};
