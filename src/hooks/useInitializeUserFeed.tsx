
import { useEffect, useRef, useState } from 'react';
import { habboProxyService } from '@/services/habboProxyService';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useInitializeUserFeed = () => {
  const { habboAccount } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const initializeWithUserData = async () => {
      if (!habboAccount?.habbo_name || hasInitialized.current) return;
      
      hasInitialized.current = true;
      setIsInitializing(true);

      try {
                // Garantir que o próprio usuário está sendo rastreado
        await habboProxyService.ensureTrackedAndSynced({
          habbo_name: habboAccount.habbo_name,
          habbo_id: habboAccount.habbo_id,
          hotel: habboAccount.hotel === 'br' ? 'com.br' : habboAccount.hotel
        });

        // EMERGENCIAL: Disparar processamento em lote de todos os amigos
                const { data, error } = await supabase.rpc('trigger_emergency_processing', {
          p_user_habbo_name: habboAccount.habbo_name,
          p_user_habbo_id: habboAccount.habbo_id,
          p_hotel: habboAccount.hotel === 'br' ? 'com.br' : habboAccount.hotel
        });

        if (error) {
                  } else {
                  }

        // COMENTADO: Funções não existem mais no habboFeedService
        // const hotel = habboAccount.hotel === 'br' ? 'com.br' : habboAccount.hotel;
        // await habboProxyService.discoverAndSyncOnlineUsers(hotel, 50);
        // await habboProxyService.triggerBatchSync(hotel);

              } catch (error) {
              } finally {
        setIsInitializing(false);
      }
    };

    initializeWithUserData();
  }, [habboAccount]);

  return { isInitializing };
};

