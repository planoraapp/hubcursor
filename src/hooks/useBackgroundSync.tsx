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
      try {
        // Primeiro, buscar os IDs dos usuários habbohub e Beebop (CASE-SENSITIVE!)
        const { data: accounts, error: accountsError } = await supabase
          .from('habbo_accounts')
          .select('supabase_user_id, habbo_name')
          .in('habbo_name', ['habbohub', 'Beebop']);  // Exatamente como está no Habbo

        if (accountsError) {
          console.warn('⚠️ Erro ao buscar contas:', accountsError);
          return;
        }

        if (!accounts || accounts.length === 0) {
          console.log('ℹ️ Usuários habbohub/beebop não encontrados');
          setIsLoading(false);
          return;
        }

        const userIds = accounts.map(acc => acc.supabase_user_id);

        // Buscar backgrounds dos usuários
        const { data: backgrounds, error } = await supabase
          .from('user_home_backgrounds')
          .select('user_id, background_type, background_value')
          .in('user_id', userIds);

        if (error) {
          console.warn('⚠️ Erro ao sincronizar backgrounds:', error);
          return;
        }

        if (backgrounds && backgrounds.length > 0) {
          const syncData: BackgroundSyncData = {
            habbohub: {
              background_type: 'image',
              background_value: '/assets/site/bghabbohub.png' // fallback
            },
            beebop: {
              background_type: 'image', 
              background_value: '/assets/site/bghabbohub.png' // fallback
            }
          };

          // Criar mapa de user_id para habbo_name (PRESERVAR CAPITALIZAÇÃO ORIGINAL)
          const userIdToName = new Map(
            accounts.map(acc => [acc.supabase_user_id, acc.habbo_name])
          );

          // Atualizar com dados reais do banco (CASE-SENSITIVE!)
          backgrounds.forEach(bg => {
            const habboName = userIdToName.get(bg.user_id);
            // Comparar exatamente como está no banco
            if (habboName === 'habbohub') {  // habbohub é minúsculo no Habbo real
              syncData.habbohub = {
                background_type: bg.background_type,
                background_value: bg.background_value
              };
              console.log('✅ Background do habbohub sincronizado:', bg.background_value);
            } else if (habboName === 'Beebop') {  // Beebop pode ter maiúscula
              syncData.beebop = {
                background_type: bg.background_type,
                background_value: bg.background_value
              };
              console.log('✅ Background do Beebop sincronizado:', bg.background_value);
            }
          });

          setSyncData(syncData);
        } else {
          console.log('ℹ️ Nenhum background customizado encontrado, usando padrão');
        }
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

