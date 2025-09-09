import { supabase } from '@/integrations/supabase/client';

// Interface para dados da conta
interface AccountData {
  id: string;
  habbo_name: string;
  hotel: string;
  is_admin: boolean;
  created_at: string;
  last_seen_at?: string;
  is_online: boolean;
}

// Função para verificar todas as contas existentes no Supabase
export const checkSupabaseAccounts = async () => {
  try {
    console.log('🔍 [checkSupabaseAccounts] Verificando contas existentes no Supabase...');

    // Buscar todas as contas na tabela habbo_accounts
    const { data: accounts, error } = await supabase
      .from('habbo_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [checkSupabaseAccounts] Erro ao buscar contas:', error);
      return { success: false, accounts: [], error: error.message };
    }

    console.log(`✅ [checkSupabaseAccounts] Encontradas ${accounts?.length || 0} contas:`);
    
    if (accounts && accounts.length > 0) {
      accounts.forEach((account, index) => {
        console.log(`${index + 1}. ${account.habbo_name} (${account.hotel}) - Admin: ${account.is_admin} - Online: ${account.is_online}`);
      });
    } else {
      console.log('ℹ️ [checkSupabaseAccounts] Nenhuma conta encontrada');
    }

    return { 
      success: true, 
      accounts: accounts || [], 
      total: accounts?.length || 0 
    };

  } catch (error) {
    console.error('❌ [checkSupabaseAccounts] Erro geral:', error);
    return { success: false, accounts: [], error: 'Erro interno' };
  }
};

// Função para verificar se uma conta específica existe
export const checkSpecificAccount = async (username: string, hotel: string = 'br') => {
  try {
    console.log(`🔍 [checkSpecificAccount] Verificando conta: ${username} (${hotel})`);

    const { data: account, error } = await supabase
      .from('habbo_accounts')
      .select('*')
      .ilike('habbo_name', username)
      .eq('hotel', hotel)
      .maybeSingle();

    if (error) {
      console.error('❌ [checkSpecificAccount] Erro ao buscar conta:', error);
      return { success: false, account: null, error: error.message };
    }

    if (account) {
      console.log(`✅ [checkSpecificAccount] Conta encontrada:`, account);
      return { success: true, account, found: true };
    } else {
      console.log(`❌ [checkSpecificAccount] Conta não encontrada: ${username}`);
      return { success: true, account: null, found: false };
    }

  } catch (error) {
    console.error('❌ [checkSpecificAccount] Erro geral:', error);
    return { success: false, account: null, error: 'Erro interno' };
  }
};

// Função para criar conta do habbohub se não existir
export const createHabbohubAccountIfNeeded = async () => {
  try {
    console.log('🔧 [createHabbohubAccountIfNeeded] Verificando se conta habbohub existe...');

    // Verificar se a conta já existe
    const checkResult = await checkSpecificAccount('habbohub', 'br');
    
    if (checkResult.success && checkResult.found) {
      console.log('✅ [createHabbohubAccountIfNeeded] Conta habbohub já existe');
      return { success: true, created: false, account: checkResult.account };
    }

    if (!checkResult.success) {
      console.error('❌ [createHabbohubAccountIfNeeded] Erro ao verificar conta:', checkResult.error);
      return { success: false, created: false, error: checkResult.error };
    }

    // Criar conta habbohub
    console.log('🔧 [createHabbohubAccountIfNeeded] Criando conta habbohub...');
    
    const { data: newAccount, error: createError } = await supabase
      .from('habbo_accounts')
      .insert({
        habbo_name: 'habbohub',
        hotel: 'br',
        is_admin: true,
        is_online: false,
        created_at: new Date().toISOString(),
        motto: 'Sistema HabboHub - Administrador',
        figure_string: 'hd-180-1.ch-255-66.lg-285-80.sh-290-62.ha-1012-110.hr-831-49'
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ [createHabbohubAccountIfNeeded] Erro ao criar conta:', createError);
      return { success: false, created: false, error: createError.message };
    }

    console.log('✅ [createHabbohubAccountIfNeeded] Conta habbohub criada com sucesso:', newAccount);
    return { success: true, created: true, account: newAccount };

  } catch (error) {
    console.error('❌ [createHabbohubAccountIfNeeded] Erro geral:', error);
    return { success: false, created: false, error: 'Erro interno' };
  }
};
