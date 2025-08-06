
import { supabase } from '@/integrations/supabase/client';
import { getUserByName } from '../services/habboApi';

// Função para criar a conta Beebop automaticamente
export const createBeebopAccount = async () => {
  try {
    // Verificar se a conta já existe
    const { data: existingAccount } = await supabase
      .from('habbo_accounts')
      .select('*')
      .ilike('habbo_name', 'Beebop')
      .single();

    if (existingAccount) {
      console.log('Conta Beebop já existe');
      return;
    }

    // Buscar dados do Habbo
    const habboUser = await getUserByName('Beebop');
    if (!habboUser) {
      console.error('Usuário Beebop não encontrado no Habbo');
      return;
    }

    // Criar usuário no Supabase Auth
    const authEmail = `${habboUser.uniqueId || 'beebop-id'}@habbohub.com`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: authEmail,
      password: '290684',
      options: {
        data: { habbo_name: 'Beebop' }
      }
    });

    if (authError) {
      console.error('Erro na criação do auth:', authError);
      return;
    }

    if (authData.user) {
      // Criar registro na tabela habbo_accounts
      const { data: accountData, error: accountError } = await supabase
        .from('habbo_accounts')
        .insert({
          habbo_id: habboUser.uniqueId || 'beebop-id',
          habbo_name: 'Beebop',
          supabase_user_id: authData.user.id,
          is_admin: true
        })
        .select()
        .single();

      if (accountError) {
        console.error('Erro na criação da conta:', accountError);
        return;
      }

      console.log('Conta Beebop criada com sucesso:', accountData);
    }
  } catch (error) {
    console.error('Erro geral na criação da conta Beebop:', error);
  }
};
