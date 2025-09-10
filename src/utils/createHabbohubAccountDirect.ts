import { supabase } from '@/integrations/supabase/client';

/**
 * Cria a conta habbohub com dados padrão para contas privadas e filtragem por país
 * Versão atualizada que lida com contas privadas e aplica filtragem por país
 */
export async function createHabbohubAccountDirect(): Promise<{ success: boolean; message: string; account?: any }> {
  try {
    console.log('🔍 [CREATE-CLEAN] Iniciando criação limpa da conta habbohub...');

    // 1. Limpar conta existente se houver (com filtragem por país)
    console.log('🧹 [CREATE-CLEAN] Limpando conta habbohub existente (BR)...');
    const { error: deleteError } = await supabase
      .from('habbo_accounts')
      .delete()
      .eq('habbo_name', 'habbohub')
      .eq('hotel', 'br'); // Filtragem por país

    if (deleteError) {
      console.log('⚠️ [CREATE-CLEAN] Erro ao limpar conta (pode não existir):', deleteError.message);
    } else {
      console.log('✅ [CREATE-CLEAN] Conta habbohub (BR) limpa com sucesso!');
    }

    console.log('🚀 [CREATE-CLEAN] Criando conta habbohub diretamente...');

    // 2. Buscar dados do usuário habbohub na API oficial do Habbo Brasil
    const habboApiUrl = 'https://www.habbo.com.br/api/public/users?name=habbohub';
    console.log('🔍 [CREATE-CLEAN] Buscando dados do Habbo Brasil:', habboApiUrl);
    
    let habboData = null;
    let useDefaultData = false;
    
    try {
      const habboResponse = await fetch(habboApiUrl);
      
      if (!habboResponse.ok) {
        console.warn('⚠️ [CREATE-CLEAN] API retornou status:', habboResponse.status);
        
        if (habboResponse.status === 403) {
          console.log('🔒 [CREATE-CLEAN] Conta privada detectada (403), usando dados padrão');
          useDefaultData = true;
        } else if (habboResponse.status === 404) {
          console.log('❌ [CREATE-CLEAN] Usuário não encontrado (404), usando dados padrão');
          useDefaultData = true;
        } else {
          useDefaultData = true;
        }
      } else {
        habboData = await habboResponse.json();
        console.log('✅ [CREATE-CLEAN] Dados do Habbo obtidos:', habboData);
        
        // Verificar se os dados são válidos (conta pode ser privada mesmo com status 200)
        if (!habboData || !habboData.uniqueId) {
          console.log('🔒 [CREATE-CLEAN] Dados incompletos (conta privada), usando dados padrão');
          useDefaultData = true;
        }
      }
    } catch (fetchError) {
      console.log('⚠️ [CREATE-CLEAN] Erro ao buscar dados do Habbo:', fetchError);
      useDefaultData = true;
    }

    // 3. Preparar dados da conta (reais ou padrão)
    let accountData;
    
    if (useDefaultData || !habboData) {
      console.log('📝 [CREATE-CLEAN] Usando dados padrão para conta privada/inacessível');
      accountData = {
        habbo_name: 'habbohub',
        hotel: 'br', // Filtragem por país - Brasil
        habbo_id: 'hhbr-habbohub-admin', // ID padrão com prefixo do país
        figure_string: 'hd-180-1.ch-255-66.lg-280-110.sh-290-62.ha-1012-110.hr-100-61', // Visual padrão
        motto: 'Sistema HabboHub - Administrador', // Motto padrão
        is_admin: true,
        is_online: false
      };
    } else {
      console.log('📝 [CREATE-CLEAN] Usando dados reais do Habbo');
      accountData = {
        habbo_name: 'habbohub',
        hotel: 'br', // Filtragem por país - Brasil
        habbo_id: habboData.uniqueId || 'hhbr-habbohub-admin',
        figure_string: habboData.figureString || 'hd-180-1.ch-255-66.lg-280-110.sh-290-62.ha-1012-110.hr-100-61',
        motto: habboData.motto || 'Sistema HabboHub - Administrador',
        is_admin: true,
        is_online: false
      };
    }

    // 4. Criar usuário Supabase para autenticação
    console.log('👤 [CREATE-CLEAN] Criando usuário Supabase para autenticação...');
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: `habbohub-br@habbohub.com`, // Email com identificação do país
      password: '151092',
      options: {
        data: {
          habbo_name: 'habbohub',
          hotel: 'br' // Metadados com país
        }
      }
    });

    let userId;
    if (authError) {
      console.log('⚠️ [CREATE-CLEAN] Erro ao criar usuário Supabase:', authError.message);
      
      // Tentar login com usuário existente
      const { data: existingUser, error: loginError } = await supabase.auth.signInWithPassword({
        email: `habbohub-br@habbohub.com`,
        password: '151092'
      });

      if (loginError) {
        console.log('⚠️ [CREATE-CLEAN] Erro ao fazer login:', loginError.message);
        
        // Usar UUID fixo como último recurso
        userId = '00000000-0000-0000-0000-000000000001';
        console.log('🔧 [CREATE-CLEAN] Usando UUID fixo como fallback');
      } else {
        userId = existingUser.user.id;
        console.log('✅ [CREATE-CLEAN] Usando usuário Supabase existente:', userId);
      }
    } else {
      userId = authUser.user.id;
      console.log('✅ [CREATE-CLEAN] Usuário Supabase criado:', userId);
    }

    // 5. Inserir dados na tabela habbo_accounts
    console.log('💾 [CREATE-CLEAN] Inserindo conta na tabela habbo_accounts...');
    const { data: newAccount, error: createError } = await supabase
      .from('habbo_accounts')
      .insert({
        ...accountData,
        supabase_user_id: userId
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ [CREATE-CLEAN] Erro ao criar conta habbohub:', createError);
      return {
        success: false,
        message: `Erro ao criar conta habbohub: ${createError.message}`
      };
    }

    console.log('✅ [CREATE-CLEAN] Conta habbohub (BR) criada com sucesso!');
    console.log('📊 [CREATE-CLEAN] Dados da conta:', newAccount);
    
    return {
      success: true,
      message: `Conta habbohub criada com sucesso! ${useDefaultData ? '(dados padrão - conta privada)' : '(dados reais)'}`,
      account: newAccount
    };

  } catch (error) {
    console.error('❌ [CREATE-CLEAN] Erro geral:', error);
    return {
      success: false,
      message: `Erro interno: ${(error as Error).message}`
    };
  }
}