import { supabase } from '@/integrations/supabase/client';

// Função para inicializar home de um usuário específico
export const initializeUserHome = async (username: string) => {
  try {
        // Buscar dados do usuário na tabela habbo_accounts
    const { data: userData, error: userError } = await supabase
      .from('habbo_accounts')
      .select('*')
      .ilike('habbo_name', username)
      .maybeSingle();

    if (userError) {
            return false;
    }

    if (!userData) {
            // Para usuários especiais como habbohub que não existem no banco, apenas loggar e retornar
      if (username.toLowerCase() === 'habbohub') {
        console.log(`ℹ️ [initializeUserHome] ${username} é um usuário especial (simulação), pulando inicialização`);
        return true;
      }
      
      return false;
    }

        // Verificar se já tem home inicializada
    const { data: existingHome, error: homeError } = await supabase
      .from('user_home_backgrounds')
      .select('*')
      .eq('user_id', userData.supabase_user_id)
      .maybeSingle();

    if (homeError) {
            return false;
    }

    if (existingHome) {
            return true;
    }

    // Inicializar home usando a função do Supabase
        const { error: initError } = await supabase.rpc('initialize_user_home_complete', {
      user_uuid: userData.supabase_user_id,
      user_habbo_name: userData.habbo_name
    });

    if (initError) {
            return false;
    }

        return true;

  } catch (error) {
        return false;
  }
};

// Função para inicializar homes de todos os usuários que não têm
export const initializeAllMissingHomes = async () => {
  try {
        // Buscar todos os usuários
    const { data: allUsers, error: usersError } = await supabase
      .from('habbo_accounts')
      .select('supabase_user_id, habbo_name');

    if (usersError) {
            return false;
    }

    if (!allUsers || allUsers.length === 0) {
            return false;
    }

        // Para cada usuário, verificar se tem home e inicializar se necessário
    for (const user of allUsers) {
      const { data: existingHome } = await supabase
        .from('user_home_backgrounds')
        .select('user_id')
        .eq('user_id', user.supabase_user_id)
        .maybeSingle();

      if (!existingHome) {
                const { error: initError } = await supabase.rpc('initialize_user_home_complete', {
          user_uuid: user.supabase_user_id,
          user_habbo_name: user.habbo_name
        });

        if (initError) {
                  } else {
                  }
      } else {
              }
    }

        return true;

  } catch (error) {
        return false;
  }
};
