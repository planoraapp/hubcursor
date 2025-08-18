
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HabboAccount {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  supabase_user_id: string;
  is_admin?: boolean;
  motto?: string;
  figure_string?: string;
  is_online?: boolean;
}

export const useSimpleAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [habboAccount, setHabboAccount] = useState<HabboAccount | null>(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadHabboAccount(session.user.id);
      }
      
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadHabboAccount(session.user.id);
      } else {
        setHabboAccount(null);
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

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading Habbo account:', error);
        return;
      }

      setHabboAccount(data || null);
    } catch (error) {
      console.error('Error in loadHabboAccount:', error);
    }
  };

  return {
    user,
    loading,
    habboAccount
  };
};
