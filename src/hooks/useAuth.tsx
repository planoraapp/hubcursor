
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  figure_string?: string;
  motto?: string;
  is_online?: boolean;
  last_seen?: string;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔍 [useAuth] Loading user profile for user:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [useAuth] Error loading user profile:', error);
        return;
      }

      console.log('✅ [useAuth] User profile loaded:', data?.habbo_name || 'none');
      setUserProfile(data || null);
    } catch (error) {
      console.error('❌ [useAuth] Error in loadUserProfile:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        console.log('🚀 [useAuth] Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (!mounted) return;
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            if (mounted) {
              loadUserProfile(session.user.id);
            }
          }, 0);
        }
      } catch (error) {
        console.error('❌ [useAuth] Error getting initial session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('🔄 [useAuth] Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          if (mounted) {
            loadUserProfile(session.user.id);
          }
        }, 0);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error: any) {
      console.error('❌ [useAuth] Logout error:', error);
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
    return userProfile?.habbo_name?.toLowerCase() === 'beebop';
  };

  return {
    user,
    loading,
    userProfile,
    habboAccount: userProfile, // For compatibility with existing code
    isLoggedIn: !!user,
    isAdmin,
    logout,
    loadUserProfile
  };
};
