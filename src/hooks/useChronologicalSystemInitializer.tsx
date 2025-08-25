
import { useEffect } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useDailyActivitiesTracker } from './useDailyActivitiesTracker';

export const useChronologicalSystemInitializer = () => {
  const { habboAccount, isLoggedIn } = useUnifiedAuth();
  const { trackUserActivities } = useDailyActivitiesTracker();

  useEffect(() => {
    if (!isLoggedIn || !habboAccount) return;

    const initializeSystem = async () => {
      try {
        console.log('[🔄 CHRONOLOGICAL INIT] Inicializando sistema cronológico...');
        
        // Pequeno delay para garantir que tudo está carregado
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Executar o rastreamento inicial
        const success = await trackUserActivities(
          habboAccount.habbo_name,
          habboAccount.habbo_id,
          habboAccount.hotel
        );
        
        if (success) {
          console.log('[🔄 CHRONOLOGICAL INIT] ✅ Sistema cronológico ativo');
        } else {
          console.log('[🔄 CHRONOLOGICAL INIT] ❌ Falha na inicialização');
        }
      } catch (error) {
        console.error('[🔄 CHRONOLOGICAL INIT] Erro:', error);
      }
    };

    // Executar imediatamente
    initializeSystem();

    // Executar periodicamente (a cada 5 minutos)
    const interval = setInterval(initializeSystem, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, habboAccount, trackUserActivities]);
};
