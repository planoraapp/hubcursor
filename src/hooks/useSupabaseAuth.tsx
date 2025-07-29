
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
  created_at: string;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [habboAccount, setHabboAccount] = useState<HabboAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Load linked Habbo account
          const { data: habboData } = await supabase
            .from('habbo_accounts')
            .select('*')
            .eq('supabase_user_id', session.user.id)
            .single();
          
          setHabboAccount(habboData);
        } else {
          setHabboAccount(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Load linked Habbo account
        supabase
          .from('habbo_accounts')
          .select('*')
          .eq('supabase_user_id', session.user.id)
          .single()
          .then(({ data: habboData }: { data: HabboAccount }) => {
            setHabboAccount(habboData);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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
    const { data, error } = await supabase
      .from('habbo_accounts')
      .insert({ 
        habbo_id: habboId, 
        habbo_name: habboName, 
        supabase_user_id: supabaseUserId 
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating linked account:', error);
      throw error;
    }
    return data;
  };

  const signUpWithHabbo = async (habboId: string, habboName: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: `${habboId}@habbohub.com`,
      password: password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { habbo_name: habboName }
      }
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      await createLinkedAccount(habboId, habboName, data.user.id);
    }

    return data;
  };

  const signInWithHabbo = async (habboId: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${habboId}@habbohub.com`,
      password: password
    });

    if (error) {
      throw error;
    }

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
      console.log(`🔍 Verificando motto para ${habboName} com código: ${verificationCode}`);
      
      const habboUser = await getUserByName(habboName);
      
      if (!habboUser || !habboUser.motto) {
        console.log(`❌ Usuário ${habboName} não encontrado ou motto vazia`);
        throw new Error('Usuário não encontrado ou perfil privado');
      }

      console.log(`📝 Motto encontrada: "${habboUser.motto}"`);
      
      // Limpar e normalizar tanto a motto quanto o código
      const normalizedMotto = habboUser.motto.trim().toLowerCase();
      const normalizedCode = verificationCode.trim().toLowerCase();
      
      console.log(`🔍 Procurando "${normalizedCode}" em "${normalizedMotto}"`);
      
      // Verificar se o código existe na motto (case-insensitive)
      if (!normalizedMotto.includes(normalizedCode)) {
        console.log(`❌ Código "${normalizedCode}" não encontrado na motto "${normalizedMotto}"`);
        throw new Error('Código de verificação não encontrado na motto');
      }

      console.log(`✅ Código encontrado na motto!`);
      return habboUser;
    } catch (error) {
      console.error('Error verifying motto:', error);
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
