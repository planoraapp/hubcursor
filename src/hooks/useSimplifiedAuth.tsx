
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HabboAccount {
  id: string;
  habbo_id: string;
  habbo_name: string;
  supabase_user_id: string;
  is_admin: boolean;
  created_at: string;
}

export const useSimplifiedAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [habboAccount, setHabboAccount] = useState<HabboAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadHabboAccount(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadHabboAccount(session.user.id);
      } else {
        setHabboAccount(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadHabboAccount = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('*')
        .eq('supabase_user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar conta habbo:', error);
        setHabboAccount(null);
      } else {
        setHabboAccount(data);
      }
    } catch (error) {
      console.error('Erro geral ao carregar conta habbo:', error);
      setHabboAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const createBeebopAccount = async () => {
    try {
      console.log('🔧 Criando conta Beebop...');
      
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'beebop@habbohub.com',
        password: '290684',
        options: {
          data: { habbo_name: 'Beebop' }
        }
      });

      if (authError) {
        console.error('❌ Erro na criação do auth:', authError);
        throw authError;
      }

      if (authData.user) {
        // Criar registro na tabela habbo_accounts
        const { data: accountData, error: accountError } = await supabase
          .from('habbo_accounts')
          .insert({
            habbo_id: 'beebop',
            habbo_name: 'Beebop',
            supabase_user_id: authData.user.id,
            is_admin: true
          })
          .select()
          .single();

        if (accountError) {
          console.error('❌ Erro na criação da conta:', accountError);
          throw accountError;
        }

        console.log('✅ Conta Beebop criada:', accountData);
        return accountData;
      }
    } catch (error) {
      console.error('❌ Erro geral na criação:', error);
      throw error;
    }
  };

  const simpleLogin = async (habboName: string, password: string) => {
    try {
      console.log(`🔐 Tentativa de login: ${habboName}`);
      
      // Primeiro, tentar encontrar a conta pelo nome
      let { data: accounts, error: searchError } = await supabase
        .from('habbo_accounts')
        .select('*')
        .ilike('habbo_name', habboName);

      if (searchError) {
        console.error('❌ Erro na busca:', searchError);
        throw new Error('Erro ao buscar conta');
      }

      // Se não encontrou e é "Beebop", criar a conta
      if ((!accounts || accounts.length === 0) && habboName.toLowerCase() === 'beebop') {
        console.log('🔧 Criando conta Beebop automaticamente...');
        const newAccount = await createBeebopAccount();
        accounts = [newAccount];
      }

      if (!accounts || accounts.length === 0) {
        throw new Error(`Conta "${habboName}" não encontrada`);
      }

      const account = accounts[0];
      
      // Tentar fazer login com o email associado
      const email = `${account.habbo_id}@habbohub.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        throw new Error('Senha incorreta');
      }

      console.log('✅ Login realizado com sucesso');
      return data;
      
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao sair:', error);
      toast({
        title: "Erro",
        description: "Erro ao sair. Tente novamente.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Logout realizado com sucesso!"
      });
    }
  };

  return {
    user,
    habboAccount,
    loading,
    isLoggedIn: !!user && !!habboAccount,
    isAdmin: () => habboAccount?.is_admin || false,
    simpleLogin,
    logout
  };
};
