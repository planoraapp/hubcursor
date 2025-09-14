import { useEffect } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';
import { useDailyActivitiesTracker } from './useDailyActivitiesTracker';

export const useDailyActivitiesInitializer = () => {
  const { habboAccount, isLoggedIn } = useAuth();
  const { trackUserActivities } = useDailyActivitiesTracker();

  useEffect(() => {
    if (!isLoggedIn || !habboAccount) return;

    const initializeActivities = async () => {
      try {
                // Delay para garantir que o usuário está totalmente carregado
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await trackUserActivities(
          habboAccount.habbo_name,
          habboAccount.habbo_id,
          habboAccount.hotel
        );
        
              } catch (error) {
              }
    };

    // Executar inicialização após o login
    initializeActivities();
  }, [isLoggedIn, habboAccount, trackUserActivities]);
};
