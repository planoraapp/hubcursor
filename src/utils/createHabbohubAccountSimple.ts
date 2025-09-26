import { supabase } from '@/integrations/supabase/client';

/**
 * Cria a conta habbohub de forma simples, sem constraint de chave estrangeira
 * Versão simplificada que funciona sem problemas de autenticação
 */
export async function createHabbohubAccountSimple(): Promise<{ success: boolean; message: string; account?: any }> {
  try {
        // 1. Limpar conta existente se houver
        const { error: deleteError } = await supabase
      .from('habbo_accounts')
      .delete()
      .eq('habbo_name', 'habbohub')
      .eq('hotel', 'br');

    if (deleteError) {
      console.log('⚠️ [CREATE-SIMPLE] Erro ao limpar conta (pode não existir):', deleteError.message);
    } else {
          }

    // 2. Buscar dados do usuário habbohub na API oficial do Habbo Brasil
    const habboApiUrl = 'https://www.habbo.com.br/api/public/users?name=habbohub';
        let habboData = null;
    let useDefaultData = false;
    
    try {
      const habboResponse = await fetch(habboApiUrl);
      
      if (!habboResponse.ok) {
                useDefaultData = true;
      } else {
        habboData = await habboResponse.json();
                if (!habboData || !habboData.uniqueId) {
          console.log('🔒 [CREATE-SIMPLE] Dados incompletos (conta privada), usando dados padrão');
          useDefaultData = true;
        }
      }
    } catch (fetchError) {
            useDefaultData = true;
    }

    // 3. Preparar dados da conta
    let accountData;
    
    if (useDefaultData || !habboData) {
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
        const { data: newAccount, error: createError } = await supabase
      .from('habbo_accounts')
      .insert(accountData)
      .select()
      .single();

    if (createError) {
            return {
        success: false,
        message: `Erro ao criar conta habbohub: ${createError.message}`
      };
    }

            return {
      success: true,
      message: `Conta habbohub criada com sucesso! ${useDefaultData ? '(dados padrão - conta privada)' : '(dados reais)'}`,
      account: newAccount
    };

  } catch (error) {
        return {
      success: false,
      message: `Erro interno: ${(error as Error).message}`
    };
  }
}
