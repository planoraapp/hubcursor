
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { habboFeedService } from '@/services/habboFeedService';
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

  const loadHabboAccount = useCallback(async (userId: string) => {
    try {
      console.log('🔍 [useUnifiedAuth] Loading Habbo account for user:', userId);
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('*')
        .eq('supabase_user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [useUnifiedAuth] Error loading Habbo account:', error);
        return;
      }

      console.log('✅ [useUnifiedAuth] Habbo account loaded:', data?.habbo_name || 'none');
      setHabboAccount(data || null);
    } catch (error) {
      console.error('❌ [useUnifiedAuth] Error in loadHabboAccount:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        console.log('🚀 [useUnifiedAuth] Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (!mounted) return;
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer habbo account loading to next tick to avoid state update conflicts
          setTimeout(() => {
            if (mounted) {
              loadHabboAccount(session.user.id);
            }
          }, 0);
        }
      } catch (error) {
        console.error('❌ [useUnifiedAuth] Error getting initial session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('🔄 [useUnifiedAuth] Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Defer habbo account loading to next tick
        setTimeout(() => {
          if (mounted) {
            loadHabboAccount(session.user.id);
          }
        }, 0);
      } else {
        setHabboAccount(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadHabboAccount]);

  const loginWithPassword = async (habboName: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔐 [useUnifiedAuth] Attempting login for:', habboName);
      
      // Get auth email for this Habbo account
      const { data: emailResult, error: emailError } = await supabase.rpc(
        'get_auth_email_for_habbo_with_hotel', 
        { 
          habbo_name_param: habboName,
          hotel_param: 'br'
        }
      );

      if (emailError || !emailResult) {
        throw new Error('Conta não encontrada. Use a aba "Missão" para se cadastrar.');
      }

      const authEmail = emailResult;
      console.log('🔐 [useUnifiedAuth] Attempting login with email:', authEmail);

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
        console.log('✅ [useUnifiedAuth] Login successful for:', habboName);
        return data;
      }

      throw new Error('Erro no login');
    } catch (error: any) {
      console.error('❌ [useUnifiedAuth] Login error:', error);
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
      console.error('❌ [useUnifiedAuth] Logout error:', error);
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

  // Ensure tracked + sync when we have a habboAccount, then refresh feed
  useEffect(() => {
    (async () => {
      try {
        if (user && habboAccount?.habbo_id && habboAccount?.hotel && habboAccount?.habbo_name) {
          console.log('🧭 [useUnifiedAuth] Ensuring tracked and syncing user...');
          await habboFeedService.ensureTrackedAndSynced({
            habbo_name: habboAccount.habbo_name,
            habbo_id: habboAccount.habbo_id,
            hotel: habboAccount.hotel,
          });
          // Notify feed to refresh
          window.dispatchEvent(new CustomEvent('feed:refresh'));
        }
      } catch (e) {
        console.error('❌ [useUnifiedAuth] ensureTracked failed:', e);
      }
    })();
  }, [user?.id, habboAccount?.habbo_id, habboAccount?.hotel]);

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
