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
      console.log(`[📊 TRACKER] Iniciando rastreamento de atividades para ${habboName}`);

      const { data, error: functionError } = await supabase.functions.invoke('habbo-daily-activities-tracker', {
        body: {
          user_habbo_name: habboName,
          user_habbo_id: habboId,
          hotel: hotel
        }
      });

      if (functionError) {
        console.error('[📊 TRACKER] Erro na função:', functionError);
        setError(`Erro no rastreamento: ${functionError.message}`);
        return false;
      }

      console.log('[📊 TRACKER] Resultado:', data);
      
      if (data?.success) {
        console.log(`[📊 TRACKER] ✅ Sucesso! ${data.processed} amigos processados, ${data.activities_detected} atividades detectadas`);
        return true;
      } else {
        setError(data?.error || 'Erro desconhecido no rastreamento');
        return false;
      }
    } catch (error: any) {
      console.error('[📊 TRACKER] Erro geral:', error);
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