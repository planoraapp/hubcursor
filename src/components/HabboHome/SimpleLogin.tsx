
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const SimpleLogin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const createSimpleAccount = async () => {
      // Verificar se já existe conta para beebop
      const { data: existingAccount } = await supabase
        .from('habbo_accounts')
        .select('*')
        .ilike('habbo_name', 'beebop')
        .single();

      if (existingAccount) {
        console.log('Conta beebop já existe:', existingAccount);
        return;
      }

      try {
        // Criar conta de usuário simples no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: 'beebop@habbohub.com',
          password: '290684',
          options: {
            data: {
              habbo_name: 'Beebop'
            }
          }
        });

        if (authError) {
          console.error('Erro ao criar conta auth:', authError);
          return;
        }

        console.log('Conta auth criada:', authData);

        if (authData.user) {
          // Criar registro na tabela habbo_accounts
          const { error: accountError } = await supabase
            .from('habbo_accounts')
            .insert({
              supabase_user_id: authData.user.id,
              habbo_name: 'Beebop',
              habbo_id: 'admin_beebop_' + Date.now(),
              is_admin: true
            });

          if (accountError) {
            console.error('Erro ao criar conta habbo:', accountError);
          } else {
            console.log('Conta beebop criada com sucesso');
          }
        }
      } catch (error) {
        console.error('Erro geral ao criar conta:', error);
      }
    };

    // Só criar se não estiver logado
    if (!user) {
      createSimpleAccount();
    }
  }, [user]);

  return null;
};
