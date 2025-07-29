
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './use-toast';
import { getUserByName } from '../services/habboApi';
import type { User, Session } from '@supabase/supabase-js';

interface HabboAccount {
  id: string;
  habbo_id: string;
  habbo_name: string;
  supabase_user_id: string;
  is_admin: boolean;
  created_at: string;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [habboAccount, setHabboAccount] = useState<HabboAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const fetchHabboAccount = async (userId: string) => {
      try {
        console.log(`🔍 [Auth] Looking for linked account for user: ${userId}`);
        
        const { data: habboData, error } = await supabase
          .from('habbo_accounts')
          .select('*')
          .eq('supabase_user_id', userId)
          .maybeSingle();

        if (!mounted) return;

        if (error) {
          console.error('❌ [Auth] Error fetching linked account:', error);
          setHabboAccount(null);
          return;
        }

        if (habboData) {
          console.log('✅ [Auth] Linked account found:', habboData);
          // Log admin status discretely
          if (habboData.is_admin) {
            console.log(`🔑 [Admin] User ${habboData.habbo_name} has admin privileges`);
          }
          setHabboAccount(habboData);
        } else {
          console.log('ℹ️ [Auth] No linked account found for user');
          setHabboAccount(null);
        }
      } catch (error) {
        console.error('❌ [Auth] General error fetching linked account:', error);
        if (mounted) {
          setHabboAccount(null);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log(`🔄 [Auth] State changed: ${event}`, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchHabboAccount(session.user.id);
        } else {
          setHabboAccount(null);
        }
        
        setLoading(false);
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        console.log('🔍 [Auth] Initial session check:', currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchHabboAccount(currentSession.user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ [Auth] Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const getLinkedAccount = async (habboId: string) => {
    const { data, error } = await supabase
      .from('habbo_accounts')
      .select('*')
      .eq('habbo_id', habboId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching linked account:', error);
      return null;
    }
    return data;
  };

  const createLinkedAccount = async (habboId: string, habboName: string, supabaseUserId: string) => {
    console.log(`🔗 [Auth] Creating link: habboId=${habboId}, habboName=${habboName}, supabaseUserId=${supabaseUserId}`);
    
    // Detect admin user discretely
    const isAdmin = habboName.toLowerCase() === 'habbohub';
    
    const maxRetries = 5;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📝 [Auth] Attempt ${attempt}/${maxRetries} to create link...`);
        
        const { data, error } = await supabase
          .from('habbo_accounts')
          .insert({ 
            habbo_id: habboId, 
            habbo_name: habboName, 
            supabase_user_id: supabaseUserId,
            is_admin: isAdmin
          })
          .select()
          .single();

        if (error) {
          lastError = error;
          console.error(`❌ [Auth] Error on attempt ${attempt}: ${error.message}`);
          
          if (error.message.includes('violates row-level security policy') || 
              error.message.includes('duplicate key value violates unique constraint')) {
            console.log('🔄 [Auth] RLS/Duplicate error detected, retrying...');
            
            await supabase.auth.refreshSession();
            
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          } else {
            break;
          }
        } else {
          console.log('✅ [Auth] Link created successfully:', data);
          if (isAdmin) {
            console.log(`🔑 [Admin] User ${habboName} marked as administrator`);
          }
          return data;
        }
      } catch (generalError) {
        lastError = generalError;
        console.error(`❌ [Auth] General error on attempt ${attempt}:`, generalError);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    console.error(`❌ [Auth] Failed after ${maxRetries} attempts. Last error:`, lastError);
    throw lastError || new Error('Failed to create link after multiple attempts');
  };

  const signUpWithHabbo = async (habboId: string, habboName: string, password: string) => {
    console.log(`🔐 [Auth] Starting signUp for: habboId=${habboId}, habboName=${habboName}`);
    
    const authEmail = `${habboId}@habbohub.com`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: authEmail,
      password: password,
      options: {
        data: { habbo_name: habboName }
      }
    });

    if (authError) {
      console.error('❌ [Auth] Authentication error:', authError);
      throw authError;
    }
    
    const authUser = authData.user;
    console.log('✅ [Auth] User authenticated in Supabase Auth:', authUser?.id);

    if (authUser) {
      try {
        const linkedAccount = await createLinkedAccount(habboId, habboName, authUser.id);
        console.log('✅ [Auth] Link created:', linkedAccount);
        return { user: authUser };
      } catch (linkError) {
        console.error('❌ [Auth] Error creating link:', linkError);
        await supabase.auth.signOut();
        throw new Error('Failed to link Habbo account. Please try again.');
      }
    }

    throw new Error('Authentication failed');
  };

  const signInWithHabbo = async (habboId: string, password: string) => {
    console.log(`🔐 [Auth] Attempting login for: habboId=${habboId}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${habboId}@habbohub.com`,
      password: password
    });

    if (error) {
      console.error('❌ [Auth] Login error:', error);
      throw error;
    }

    console.log('✅ [Auth] Login successful');
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
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

  const verifyHabboMotto = async (habboName: string, verificationCode: string) => {
    try {
      console.log(`🔍 [MOTTO] Verifying motto for ${habboName} with code: ${verificationCode}`);
      
      // Special handling for habbohub admin user - skip API verification
      if (habboName.toLowerCase() === 'habbohub') {
        console.log(`👑 [Admin] Skipping API verification for admin user: ${habboName}`);
        // Return a mock user object for admin
        return {
          id: `habbohub-admin-${Date.now()}`,
          name: habboName,
          uniqueId: `habbohub-admin-${habboName}-${Date.now()}`,
          motto: verificationCode,
          online: true,
          memberSince: new Date().toISOString(),
          selectedBadges: [],
          badges: []
        };
      }
      
      const habboUser = await getUserByName(habboName);
      
      if (!habboUser || !habboUser.motto) {
        console.log(`❌ [MOTTO] User ${habboName} not found or empty motto`);
        throw new Error('User not found or private profile');
      }

      const originalMotto = habboUser.motto;
      console.log(`📝 [MOTTO] Found motto: "${originalMotto}"`);
      
      const normalizedMotto = originalMotto.trim().toLowerCase();
      const normalizedCode = verificationCode.trim().toLowerCase();
      
      if (normalizedMotto.includes(normalizedCode)) {
        console.log(`✅ [MOTTO] Code found in motto!`);
        return habboUser;
      } else {
        console.log(`❌ [MOTTO] Code "${verificationCode}" not found in motto "${originalMotto}"`);
        throw new Error(`Verification code not found in motto. Current motto: "${originalMotto}"`);
      }
    } catch (error) {
      console.error('❌ [MOTTO] Verification error:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    habboAccount,
    loading,
    getLinkedAccount,
    createLinkedAccount,
    signUpWithHabbo,
    signInWithHabbo,
    signOut,
    verifyHabboMotto
  };
};
