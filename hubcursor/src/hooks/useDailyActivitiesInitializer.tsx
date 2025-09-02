import { useEffect } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useDailyActivitiesTracker } from './useDailyActivitiesTracker';

export const useDailyActivitiesInitializer = () => {
  const { habboAccount, isLoggedIn } = useUnifiedAuth();
  const { trackUserActivities } = useDailyActivitiesTracker();

  useEffect(() => {
    if (!isLoggedIn || !habboAccount) return;

    const initializeActivities = async () => {
      try {
        console.log('[🚀 ACTIVITIES INIT] Initializing daily activities tracker...');
        
        // Delay para garantir que o usuário está totalmente carregado
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await trackUserActivities(
          habboAccount.habbo_name,
          habboAccount.habbo_id,
          habboAccount.hotel
        );
        
        console.log('[🚀 ACTIVITIES INIT] ✅ Daily activities initialized successfully');
      } catch (error) {
        console.error('[🚀 ACTIVITIES INIT] ❌ Error initializing activities:', error);
      }
    };

    // Executar inicialização após o login
    initializeActivities();
  }, [isLoggedIn, habboAccount, trackUserActivities]);
};