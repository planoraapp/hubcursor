import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para manter o usuário marcado como online enquanto estiver usando o site
 * Atualiza o estado online a cada 30 segundos
 */
export const useKeepOnline = () => {
  const { habboAccount } = useAuth();
  const userId = habboAccount?.supabase_user_id;

  useEffect(() => {
    if (!userId) return;

    // Verificar se o usuário quer estar online (preferência do localStorage)
    const getOnlinePreference = (): boolean => {
      if (typeof window === 'undefined') return true;
      const saved = localStorage.getItem('habbo-hub-online-status-enabled');
      return saved !== null ? saved === 'true' : true; // Padrão é true (online)
    };

    // Atualizar imediatamente ao montar
    const updateOnlineStatus = async () => {
      try {
        // Verificar se userId existe antes de tentar atualizar
        if (!userId) {
          console.log('[KEEP ONLINE] No userId available, skipping update');
          return;
        }

        const shouldBeOnline = getOnlinePreference();
        
        // Se o usuário não quer estar online, não atualizar
        if (!shouldBeOnline) {
          console.log('[KEEP ONLINE] User prefers to be offline, skipping update');
          return;
        }
        
        // Usar Edge Function para atualizar estado online (bypass de RLS)
        const { error } = await supabase.functions.invoke('keep-online', {
          body: {
            userId: userId,
            isOnline: true // Sempre true quando o hook atualiza (pois só roda se preferência for true)
          }
        });

        if (error) {
          console.error('[KEEP ONLINE] Error updating online status:', error);
        } else {
          console.log('[KEEP ONLINE] Online status updated');
        }
      } catch (error) {
        console.error('[KEEP ONLINE] Error:', error);
      }
    };

    // Atualizar imediatamente
    updateOnlineStatus();

    // Atualizar a cada 30 segundos (somente se o usuário preferir estar online)
    const interval = setInterval(() => {
      if (getOnlinePreference()) {
        updateOnlineStatus();
      }
    }, 30000); // 30 segundos

    return () => {
      clearInterval(interval);
    };
  }, [userId]);
};

