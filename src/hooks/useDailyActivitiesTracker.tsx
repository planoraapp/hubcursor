import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDailyActivitiesTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackUserActivities = useCallback(async (habboName: string, habboId: string, hotel: string = 'br') => {
    if (!habboName || !habboId) {
      setError('Nome e ID do Habbo são obrigatórios');
      return false;
    }

    setIsTracking(true);
    setError(null);

    try {
            const { data, error: functionError } = await supabase.functions.invoke('habbo-daily-activities-tracker', {
        body: {
          user_habbo_name: habboName,
          user_habbo_id: habboId,
          hotel: hotel
        }
      });

      if (functionError) {
                setError(`Erro no rastreamento: ${functionError.message}`);
        return false;
      }

            if (data?.success) {
                return true;
      } else {
        setError(data?.error || 'Erro desconhecido no rastreamento');
        return false;
      }
    } catch (error: any) {
            setError(error.message);
      return false;
    } finally {
      setIsTracking(false);
    }
  }, []);

  return {
    trackUserActivities,
    isTracking,
    error,
    clearError: () => setError(null)
  };
};