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
        // Buscar todas as contas na tabela habbo_accounts
    const { data: accounts, error } = await supabase
      .from('habbo_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
            return { success: false, accounts: [], error: error.message };
    }

        // Log das contas encontradas
    accounts?.forEach((account, index) => {
      console.log(`${index + 1}. ${account.habbo_name} (${account.hotel}) - Admin: ${account.is_admin ? 'Sim' : 'Não'}`);
    });

    return { success: true, accounts: accounts || [], error: null };

  } catch (error) {
        return { success: false, accounts: [], error: 'Erro interno' };
  }
};

// Função para verificar conta específica
export const checkSpecificAccount = async (username: string, hotel: string) => {
  try {
    console.log(`🔍 [checkSpecificAccount] Verificando conta: ${username} (${hotel})`);

    // Buscar conta específica na tabela habbo_accounts
    const { data: account, error } = await supabase
      .from('habbo_accounts')
      .select('*')
      .ilike('habbo_name', username)
      .eq('hotel', hotel)
      .maybeSingle();

    if (error) {
            return { success: false, account: null, error: error.message };
    }

    if (account) {
            return { success: true, account, found: true };
    } else {
            return { success: true, account: null, found: false };
    }

  } catch (error) {
        return { success: false, account: null, error: 'Erro interno' };
  }
};