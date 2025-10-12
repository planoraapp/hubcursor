import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface MyHomeData {
  background_type?: string;
  background_value?: string;
  figure_string?: string;
  habbo_name?: string;
  hotel?: string;
}

export const useMyHomeData = () => {
  const { habboAccount, isLoggedIn } = useAuth();

  const { data: myHomeData, isLoading } = useQuery({
    queryKey: ['my-home-data', habboAccount?.supabase_user_id],
    queryFn: async (): Promise<MyHomeData | null> => {
      if (!habboAccount?.supabase_user_id) {
        return null;
      }

      // Buscar dados do background da home
      const { data: backgroundData, error: backgroundError } = await supabase
        .from('user_home_backgrounds')
        .select('background_type, background_value')
        .eq('user_id', habboAccount.supabase_user_id)
        .single();

      if (backgroundError && backgroundError.code !== 'PGRST116') {
        console.warn('Erro ao buscar background da home:', backgroundError);
      }

      // Retornar dados combinados
      return {
        background_type: backgroundData?.background_type,
        background_value: backgroundData?.background_value,
        figure_string: habboAccount.figure_string,
        habbo_name: habboAccount.habbo_name,
        hotel: habboAccount.hotel
      };
    },
    enabled: !!habboAccount?.supabase_user_id && isLoggedIn,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    myHomeData,
    isLoading
  };
};
