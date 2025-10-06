import { useEffect } from 'react';
import { useAuth } from './useAuth';

export const useDailyActivitiesInitializer = () => {
  const { habboAccount, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || !habboAccount) return;

    const initializeActivities = async () => {
      try {
        // Delay para garantir que o usuário está totalmente carregado
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // TODO: Implementar tracking de atividades quando necessário
        console.log('Daily activities initializer ready for:', habboAccount.habbo_name);
        
      } catch (error) {
        console.error('Error initializing daily activities:', error);
      }
    };

    // Executar inicialização após o login
    initializeActivities();
  }, [isLoggedIn, habboAccount]);
};
