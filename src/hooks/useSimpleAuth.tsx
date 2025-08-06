
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSimpleAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [habboAccount, setHabboAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const simpleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
