import { supabase } from '@/integrations/supabase/client';

// Função para inicializar home de um usuário específico
export const initializeUserHome = async (username: string) => {
  try {
    console.log(`🏠 [initializeUserHome] Inicializando home para: ${username}`);

    // Buscar dados do usuário na tabela habbo_accounts
    const { data: userData, error: userError } = await supabase
      .from('habbo_accounts')
      .select('*')
      .ilike('habbo_name', username)
      .maybeSingle();

    if (userError) {
      console.error('❌ [initializeUserHome] Erro ao buscar usuário:', userError);
      return false;
    }

    if (!userData) {
      console.log(`❌ [initializeUserHome] Usuário ${username} não encontrado na tabela habbo_accounts`);
      
      // Para usuários especiais como habbohub que não existem no banco, apenas loggar e retornar
      if (username.toLowerCase() === 'habbohub') {
        console.log(`ℹ️ [initializeUserHome] ${username} é um usuário especial (simulação), pulando inicialização`);
        return true;
      }
      
      return false;
    }

    console.log(`✅ [initializeUserHome] Usuário encontrado:`, userData);

    // Verificar se já tem home inicializada
    const { data: existingHome, error: homeError } = await supabase
      .from('user_home_backgrounds')
      .select('*')
      .eq('user_id', userData.supabase_user_id)
      .maybeSingle();

    if (homeError) {
      console.error('❌ [initializeUserHome] Erro ao verificar home existente:', homeError);
      return false;
    }

    if (existingHome) {
      console.log(`✅ [initializeUserHome] Home já existe para ${username}`);
      return true;
    }

    // Inicializar home usando a função do Supabase
    console.log(`🔧 [initializeUserHome] Chamando initialize_user_home_complete...`);
    const { error: initError } = await supabase.rpc('initialize_user_home_complete', {
      user_uuid: userData.supabase_user_id,
      user_habbo_name: userData.habbo_name
    });

    if (initError) {
      console.error('❌ [initializeUserHome] Erro ao inicializar home:', initError);
      return false;
    }

    console.log(`✅ [initializeUserHome] Home inicializada com sucesso para ${username}`);
    return true;

  } catch (error) {
    console.error('❌ [initializeUserHome] Erro geral:', error);
    return false;
  }
};

// Função para inicializar homes de todos os usuários que não têm
export const initializeAllMissingHomes = async () => {
  try {
    console.log('🏠 [initializeAllMissingHomes] Inicializando homes em falta...');

    // Buscar todos os usuários
    const { data: allUsers, error: usersError } = await supabase
      .from('habbo_accounts')
      .select('supabase_user_id, habbo_name');

    if (usersError) {
      console.error('❌ [initializeAllMissingHomes] Erro ao buscar usuários:', usersError);
      return false;
    }

    if (!allUsers || allUsers.length === 0) {
      console.log('❌ [initializeAllMissingHomes] Nenhum usuário encontrado');
      return false;
    }

    console.log(`📊 [initializeAllMissingHomes] Encontrados ${allUsers.length} usuários`);

    // Para cada usuário, verificar se tem home e inicializar se necessário
    for (const user of allUsers) {
      const { data: existingHome } = await supabase
        .from('user_home_backgrounds')
        .select('user_id')
        .eq('user_id', user.supabase_user_id)
        .maybeSingle();

      if (!existingHome) {
        console.log(`🔧 [initializeAllMissingHomes] Inicializando home para ${user.habbo_name}...`);
        
        const { error: initError } = await supabase.rpc('initialize_user_home_complete', {
          user_uuid: user.supabase_user_id,
          user_habbo_name: user.habbo_name
        });

        if (initError) {
          console.error(`❌ [initializeAllMissingHomes] Erro ao inicializar home de ${user.habbo_name}:`, initError);
        } else {
          console.log(`✅ [initializeAllMissingHomes] Home inicializada para ${user.habbo_name}`);
        }
      } else {
        console.log(`✅ [initializeAllMissingHomes] ${user.habbo_name} já tem home`);
      }
    }

    console.log('✅ [initializeAllMissingHomes] Processo concluído');
    return true;

  } catch (error) {
    console.error('❌ [initializeAllMissingHomes] Erro geral:', error);
    return false;
  }
};
