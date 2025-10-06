import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BackgroundSyncData {
  habbohub: {
    background_type: string;
    background_value: string;
  };
  beebop: {
    background_type: string;
    background_value: string;
  };
}

/**
 * Hook para sincronizar automaticamente os backgrounds dos usuários
 * entre o banco de dados e os dados hardcoded
 */
export const useBackgroundSync = () => {
  const [syncData, setSyncData] = useState<BackgroundSyncData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncBackgrounds = async () => {
      try {// Buscar backgrounds dos usuários principais
        const { data: backgrounds, error } = await supabase
          .from('user_home_backgrounds')
          .select(`
            user_id,
            background_type,
            background_value,
            habbo_accounts!inner(habbo_name)
          `)
          .in('habbo_accounts.habbo_name', ['habbohub', 'beebop']);

        if (error) {
          console.warn('⚠️ Erro ao sincronizar backgrounds:', error);
          return;
        }

        if (backgrounds && backgrounds.length > 0) {
          const syncData: BackgroundSyncData = {
            habbohub: {
              background_type: 'image',
              background_value: '/assets/bghabbohub.png' // fallback
            },
            beebop: {
              background_type: 'image', 
              background_value: '/assets/bghabbohub.png' // fallback
            }
          };

          // Atualizar com dados reais do banco
          backgrounds.forEach(bg => {
            const habboName = bg.habbo_accounts?.habbo_name?.toLowerCase();
            if (habboName === 'habbohub') {
              syncData.habbohub = {
                background_type: bg.background_type,
                background_value: bg.background_value
              };
            } else if (habboName === 'beebop') {
              syncData.beebop = {
                background_type: bg.background_type,
                background_value: bg.background_value
              };
            }
          });

          setSyncData(syncData);}
      } catch (error) {
        console.error('❌ Erro ao sincronizar backgrounds:', error);
      } finally {
        setIsLoading(false);
      }
    };

    syncBackgrounds();

    // Sincronizar a cada 30 segundos
    const interval = setInterval(syncBackgrounds, 30000);

    return () => clearInterval(interval);
  }, []);

  return { syncData, isLoading };
};

