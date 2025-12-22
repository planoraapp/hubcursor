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
        if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
          console.log('[KEEP ONLINE] No valid userId available, skipping update');
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
            userId: userId.trim(),
            isOnline: true // Sempre true quando o hook atualiza (pois só roda se preferência for true)
          }
        });

        if (error) {
          // Se for erro 400, pode ser problema de validação na Edge Function
          // Não fazer log de erro repetitivo para não poluir o console
          if (error.message?.includes('400') || error.status === 400) {
            console.debug('[KEEP ONLINE] Edge Function returned 400 (possível problema de validação):', error.message);
          } else {
            console.error('[KEEP ONLINE] Error updating online status:', error);
          }
        } else {
          console.log('[KEEP ONLINE] Online status updated');
        }
      } catch (error: any) {
        // Tratar erros de forma silenciosa para não poluir o console
        if (error?.message?.includes('400') || error?.status === 400) {
          console.debug('[KEEP ONLINE] Error 400 (silenciado):', error.message);
        } else {
          console.error('[KEEP ONLINE] Error:', error);
        }
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

