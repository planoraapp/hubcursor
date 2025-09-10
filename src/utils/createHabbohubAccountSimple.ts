import { supabase } from '@/integrations/supabase/client';

/**
 * Cria a conta habbohub de forma simples, sem constraint de chave estrangeira
 * Versão simplificada que funciona sem problemas de autenticação
 */
export async function createHabbohubAccountSimple(): Promise<{ success: boolean; message: string; account?: any }> {
  try {
    console.log('🔍 [CREATE-SIMPLE] Iniciando criação simples da conta habbohub...');

    // 1. Limpar conta existente se houver
    console.log('🧹 [CREATE-SIMPLE] Limpando conta habbohub existente...');
    const { error: deleteError } = await supabase
      .from('habbo_accounts')
      .delete()
      .eq('habbo_name', 'habbohub')
      .eq('hotel', 'br');

    if (deleteError) {
      console.log('⚠️ [CREATE-SIMPLE] Erro ao limpar conta (pode não existir):', deleteError.message);
    } else {
      console.log('✅ [CREATE-SIMPLE] Conta habbohub limpa com sucesso!');
    }

    // 2. Buscar dados do usuário habbohub na API oficial do Habbo Brasil
    const habboApiUrl = 'https://www.habbo.com.br/api/public/users?name=habbohub';
    console.log('🔍 [CREATE-SIMPLE] Buscando dados do Habbo Brasil:', habboApiUrl);
    
    let habboData = null;
    let useDefaultData = false;
    
    try {
      const habboResponse = await fetch(habboApiUrl);
      
      if (!habboResponse.ok) {
        console.warn('⚠️ [CREATE-SIMPLE] API retornou status:', habboResponse.status);
        useDefaultData = true;
      } else {
        habboData = await habboResponse.json();
        console.log('✅ [CREATE-SIMPLE] Dados do Habbo obtidos:', habboData);
        
        if (!habboData || !habboData.uniqueId) {
          console.log('🔒 [CREATE-SIMPLE] Dados incompletos (conta privada), usando dados padrão');
          useDefaultData = true;
        }
      }
    } catch (fetchError) {
      console.log('⚠️ [CREATE-SIMPLE] Erro ao buscar dados do Habbo:', fetchError);
      useDefaultData = true;
    }

    // 3. Preparar dados da conta
    let accountData;
    
    if (useDefaultData || !habboData) {
      console.log('📝 [CREATE-SIMPLE] Usando dados padrão para conta privada/inacessível');
      accountData = {
        habbo_name: 'habbohub',
        hotel: 'br',
        habbo_id: 'hhbr-habbohub-admin',
        figure_string: 'hd-180-1.ch-255-66.lg-280-110.sh-290-62.ha-1012-110.hr-100-61',
        motto: 'Sistema HabboHub - Administrador',
        is_admin: true,
        is_online: false,
        supabase_user_id: '00000000-0000-0000-0000-000000000001' // UUID fixo para contornar constraint
      };
    } else {
      console.log('📝 [CREATE-SIMPLE] Usando dados reais do Habbo');
      accountData = {
        habbo_name: 'habbohub',
        hotel: 'br',
        habbo_id: habboData.uniqueId || 'hhbr-habbohub-admin',
        figure_string: habboData.figureString || 'hd-180-1.ch-255-66.lg-280-110.sh-290-62.ha-1012-110.hr-100-61',
        motto: habboData.motto || 'Sistema HabboHub - Administrador',
        is_admin: true,
        is_online: false,
        supabase_user_id: '00000000-0000-0000-0000-000000000001' // UUID fixo para contornar constraint
      };
    }

    // 4. Inserir dados na tabela habbo_accounts
    console.log('💾 [CREATE-SIMPLE] Inserindo conta na tabela habbo_accounts...');
    const { data: newAccount, error: createError } = await supabase
      .from('habbo_accounts')
      .insert(accountData)
      .select()
      .single();

    if (createError) {
      console.error('❌ [CREATE-SIMPLE] Erro ao criar conta habbohub:', createError);
      return {
        success: false,
        message: `Erro ao criar conta habbohub: ${createError.message}`
      };
    }

    console.log('✅ [CREATE-SIMPLE] Conta habbohub criada com sucesso!');
    console.log('📊 [CREATE-SIMPLE] Dados da conta:', newAccount);
    
    return {
      success: true,
      message: `Conta habbohub criada com sucesso! ${useDefaultData ? '(dados padrão - conta privada)' : '(dados reais)'}`,
      account: newAccount
    };

  } catch (error) {
    console.error('❌ [CREATE-SIMPLE] Erro geral:', error);
    return {
      success: false,
      message: `Erro interno: ${(error as Error).message}`
    };
  }
}
