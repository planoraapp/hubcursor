
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Padronizado para usar apenas este cliente
import { useToast } from './use-toast';

interface HabboAccount {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  supabase_user_id: string;
  is_admin?: boolean;
}

export const useUnifiedAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [habboAccount, setHabboAccount] = useState<HabboAccount | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadHabboAccount(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadHabboAccount(session.user.id);
      } else {
        setHabboAccount(null);
      }
      
      setLoading(false);
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

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading Habbo account:', error);
        return;
      }

      setHabboAccount(data || null);
    } catch (error) {
      console.error('Error in loadHabboAccount:', error);
    }
  };

  const loginWithPassword = async (habboName: string, password: string) => {
    try {
      setLoading(true);
      
      // Get auth email for this Habbo account
      const { data: emailResult, error: emailError } = await supabase.rpc(
        'get_auth_email_for_habbo_with_hotel', 
        { 
          habbo_name_param: habboName,
          hotel_param: 'br' // Default to .br, fallback logic is in the function
        }
      );

      if (emailError || !emailResult) {
        throw new Error('Conta não encontrada. Use a aba "Missão" para se cadastrar.');
      }

      const authEmail = emailResult;
      console.log('🔐 Attempting login with email:', authEmail);

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Senha incorreta. Use a aba "Missão" para redefinir.');
        }
        throw error;
      }

      if (data.user) {
        await loadHabboAccount(data.user.id);
        console.log('✅ Login successful for:', habboName);
        return data;
      }

      throw new Error('Erro no login');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setHabboAccount(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    return habboAccount?.is_admin === true;
  };

  return {
    user,
    loading,
    habboAccount,
    isLoggedIn: !!user,
    isAdmin,
    logout,
    loginWithPassword,
    loadHabboAccount
  };
};
