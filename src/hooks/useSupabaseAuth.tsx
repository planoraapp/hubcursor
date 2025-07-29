
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
    console.log(`🔗 Tentando criar vínculo: habboId=${habboId}, habboName=${habboName}, supabaseUserId=${supabaseUserId}`);
    
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
      console.error('❌ Erro ao criar vínculo:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log('✅ Vínculo criado com sucesso:', data);
    return data;
  };

  const signUpWithHabbo = async (habboId: string, habboName: string, password: string) => {
    console.log(`🔐 Iniciando signUp para: habboId=${habboId}, habboName=${habboName}`);
    
    try {
      // Primeiro, criar o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${habboId}@habbohub.com`,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { habbo_name: habboName }
        }
      });

      if (authError) {
        console.error('❌ Erro na autenticação:', JSON.stringify(authError, null, 2));
        throw authError;
      }

      console.log('✅ Usuário criado no Supabase Auth:', authData.user?.id);

      // Aguardar um pouco para garantir que a autenticação foi processada
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Depois, criar o vínculo na tabela habbo_accounts
      if (authData.user) {
        try {
          const linkedAccount = await createLinkedAccount(habboId, habboName, authData.user.id);
          console.log('✅ Vínculo criado:', linkedAccount);
        } catch (linkError) {
          console.error('❌ Erro ao criar vínculo, mas usuário foi criado:', JSON.stringify(linkError, null, 2));
          
          // Se o erro for de RLS, pode ser que o usuário não esteja totalmente autenticado ainda
          if (linkError.code === '42501') {
            // Tentar novamente após mais tempo
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
              const linkedAccount = await createLinkedAccount(habboId, habboName, authData.user.id);
              console.log('✅ Vínculo criado na segunda tentativa:', linkedAccount);
            } catch (secondTryError) {
              console.error('❌ Falha na segunda tentativa:', JSON.stringify(secondTryError, null, 2));
              throw secondTryError;
            }
          } else {
            throw linkError;
          }
        }
      }

      return authData;
    } catch (error) {
      console.error('❌ Erro geral no signUpWithHabbo:', JSON.stringify(error, null, 2));
      throw error;
    }
  };

  const signInWithHabbo = async (habboId: string, password: string) => {
    console.log(`🔐 Tentando login para: habboId=${habboId}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${habboId}@habbohub.com`,
      password: password
    });

    if (error) {
      console.error('❌ Erro no login:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('✅ Login realizado com sucesso');
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
      console.log(`🔍 [MOTTO] Verificando motto para ${habboName} com código: ${verificationCode}`);
      
      const habboUser = await getUserByName(habboName);
      
      if (!habboUser || !habboUser.motto) {
        console.log(`❌ [MOTTO] Usuário ${habboName} não encontrado ou motto vazia`);
        console.log(`📊 [MOTTO] Dados do usuário:`, JSON.stringify(habboUser, null, 2));
        throw new Error('Usuário não encontrado ou perfil privado');
      }

      const originalMotto = habboUser.motto;
      console.log(`📝 [MOTTO] Motto encontrada: "${originalMotto}"`);
      
      // Tentar várias formas de verificação
      const checks = [
        // Verificação exata (case-sensitive)
        { name: 'Exata', motto: originalMotto, code: verificationCode },
        // Verificação case-insensitive
        { name: 'Case-insensitive', motto: originalMotto.toLowerCase(), code: verificationCode.toLowerCase() },
        // Verificação com trim
        { name: 'Com trim', motto: originalMotto.trim(), code: verificationCode.trim() },
        // Verificação case-insensitive com trim
        { name: 'Case-insensitive + trim', motto: originalMotto.trim().toLowerCase(), code: verificationCode.trim().toLowerCase() },
        // Verificação apenas do sufixo (sem HUB-)
        { name: 'Sem prefixo HUB-', motto: originalMotto.toLowerCase(), code: verificationCode.replace(/^hub-/i, '') },
      ];

      let found = false;
      for (const check of checks) {
        console.log(`🔍 [MOTTO] Verificação ${check.name}: procurando "${check.code}" em "${check.motto}"`);
        if (check.motto.includes(check.code)) {
          console.log(`✅ [MOTTO] Código encontrado com verificação ${check.name}!`);
          found = true;
          break;
        }
      }

      if (!found) {
        console.log(`❌ [MOTTO] Código "${verificationCode}" não encontrado na motto "${originalMotto}"`);
        console.log(`📊 [MOTTO] Tentativas realizadas:`, checks.map(c => `${c.name}: "${c.code}" in "${c.motto}"`));
        throw new Error('Código de verificação não encontrado na motto');
      }

      console.log(`✅ [MOTTO] Verificação bem-sucedida!`);
      return habboUser;
    } catch (error) {
      console.error('❌ [MOTTO] Erro na verificação:', JSON.stringify(error, null, 2));
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
