import { supabase } from '@/integrations/supabase/client';

/**
 * Cria a conta Beebop na tabela habbo_accounts para que apareça nas últimas homes modificadas
 */
export async function createBeebopAccount(): Promise<{ success: boolean; message: string; account?: any }> {
  try {
    // 1. Limpar conta existente se houver
    const { error: deleteError } = await supabase
      .from('habbo_accounts')
      .delete()
      .eq('habbo_name', 'Beebop')
      .eq('hotel', 'br');

    if (deleteError) {
      console.log('⚠️ [CREATE-BEEBOP] Erro ao limpar conta (pode não existir):', deleteError.message);
    } else {}

    // 2. Buscar dados do usuário Beebop na API oficial do Habbo Brasil
    const habboApiUrl = 'https://www.habbo.com.br/api/public/users?name=Beebop';
    let habboData = null;
    let useDefaultData = false;
    
    try {
      const habboResponse = await fetch(habboApiUrl);
      
      if (!habboResponse.ok) {
        if (habboResponse.status === 403) {
          console.log('🔒 [CREATE-BEEBOP] Conta privada detectada (403), usando dados padrão');
          useDefaultData = true;
        } else if (habboResponse.status === 404) {
          console.log('❌ [CREATE-BEEBOP] Usuário não encontrado (404), usando dados padrão');
          useDefaultData = true;
        } else {
          useDefaultData = true;
        }
      } else {
        habboData = await habboResponse.json();
        // Verificar se os dados são válidos
        if (!habboData || !habboData.uniqueId) {
          console.log('🔒 [CREATE-BEEBOP] Dados incompletos (conta privada), usando dados padrão');
          useDefaultData = true;
        }
      }
    } catch (fetchError) {useDefaultData = true;
    }

    // 3. Preparar dados da conta
    let accountData;
    
    if (useDefaultData || !habboData) {
      accountData = {
        id: '9f4ff5bd-f57f-4b52-93c8-3fc4e6382e28', // ID fixo para Beebop
        habbo_name: 'Beebop',
        hotel: 'br',
        habbo_id: 'hhbr-00e6988dddeb5a1838658c854d62fe49', // ID do useRealHabboData
        figure_string: 'hr-155-45.hd-208-10.ch-4165-91-1408.lg-4167-91.sh-3068-1408-90.ea-3169-92.fa-1206-90.ca-1804-1326',
        motto: 'HUB-ACTI1',
        is_admin: false,
        is_online: false,
        supabase_user_id: '9f4ff5bd-f57f-4b52-93c8-3fc4e6382e28' // Mesmo que o ID para compatibilidade
      };
    } else {
      accountData = {
        id: '9f4ff5bd-f57f-4b52-93c8-3fc4e6382e28', // ID fixo para Beebop
        habbo_name: 'Beebop',
        hotel: 'br',
        habbo_id: habboData.uniqueId || 'hhbr-00e6988dddeb5a1838658c854d62fe49',
        figure_string: habboData.figureString || 'hr-155-45.hd-208-10.ch-4165-91-1408.lg-4167-91.sh-3068-1408-90.ea-3169-92.fa-1206-90.ca-1804-1326',
        motto: habboData.motto || 'HUB-ACTI1',
        is_admin: false,
        is_online: false,
        supabase_user_id: '9f4ff5bd-f57f-4b52-93c8-3fc4e6382e28' // Mesmo que o ID para compatibilidade
      };
    }

    // 4. Inserir dados na tabela habbo_accounts
    const { data: newAccount, error: createError } = await supabase
      .from('habbo_accounts')
      .insert(accountData)
      .select()
      .single();

    if (createError) {
      return {
        success: false,
        message: `Erro ao criar conta Beebop: ${createError.message}`
      };
    }return {
      success: true,
      message: `Conta Beebop criada com sucesso! ${useDefaultData ? '(dados padrão - conta privada)' : '(dados reais)'}`,
      account: newAccount
    };

  } catch (error) {
    return {
      success: false,
      message: `Erro interno: ${(error as Error).message}`
    };
  }
}

