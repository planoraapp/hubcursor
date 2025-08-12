
import { useEffect, useRef, useState } from 'react';
import { habboFeedService } from '@/services/habboFeedService';
import { useUnifiedAuth } from './useUnifiedAuth';

export const useInitializeUserFeed = () => {
  const { habboAccount } = useUnifiedAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const initializeWithUserData = async () => {
      if (!habboAccount?.habbo_name || hasInitialized.current) return;
      
      hasInitialized.current = true;
      setIsInitializing(true);

      try {
        console.log(`🚀 [InitializeFeed] Inicializando feed com dados do usuário ${habboAccount.habbo_name}`);
        
        // Garantir que o próprio usuário está sendo rastreado
        await habboFeedService.ensureTrackedAndSynced({
          habbo_name: habboAccount.habbo_name,
          habbo_id: habboAccount.habbo_id,
          hotel: habboAccount.hotel === 'br' ? 'com.br' : habboAccount.hotel
        });

        // Descobrir usuários online baseado no hotel do usuário
        const hotel = habboAccount.hotel === 'br' ? 'com.br' : habboAccount.hotel;
        await habboFeedService.discoverAndSyncOnlineUsers(hotel, 50);

        // Sincronizar dados em lote para ter conteúdo inicial
        await habboFeedService.triggerBatchSync(hotel);

        console.log(`✅ [InitializeFeed] Inicialização concluída para ${habboAccount.habbo_name}`);
      } catch (error) {
        console.error('❌ [InitializeFeed] Erro na inicialização:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeWithUserData();
  }, [habboAccount]);

  return { isInitializing };
};
