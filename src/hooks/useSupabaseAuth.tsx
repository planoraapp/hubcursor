
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
    let mounted = true;

    const fetchHabboAccount = async (userId: string) => {
      try {
        console.log(`🔍 Buscando conta vinculada para usuário: ${userId}`);
        
        const { data: habboData, error } = await supabase
          .from('habbo_accounts')
          .select('*')
          .eq('supabase_user_id', userId)
          .maybeSingle();

        if (!mounted) return;

        if (error) {
          console.error('❌ Erro ao buscar conta vinculada:', error);
          setHabboAccount(null);
          return;
        }

        console.log('✅ Conta vinculada encontrada:', habboData);
        setHabboAccount(habboData);
      } catch (error) {
        console.error('❌ Erro geral ao buscar conta vinculada:', error);
        if (mounted) {
          setHabboAccount(null);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log(`🔄 Auth state changed: ${event}`, session?.user?.id);
        
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

    // Verificar sessão inicial
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        console.log('🔍 Sessão inicial encontrada:', currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchHabboAccount(currentSession.user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Erro na inicialização da auth:', error);
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

  // VERSÃO MELHORADA com retry logic para RLS
  const createLinkedAccount = async (habboId: string, habboName: string, supabaseUserId: string) => {
    console.log(`🔗 Criando vínculo: habboId=${habboId}, habboName=${habboName}, supabaseUserId=${supabaseUserId}`);
    
    const maxRetries = 5;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📝 Tentativa ${attempt}/${maxRetries} de criar vínculo...`);
        
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
          lastError = error;
          console.error(`❌ Erro na tentativa ${attempt}: ${error.message}`);
          
          // Se for erro de RLS ou duplicate key, tenta reautenticar
          if (error.message.includes('violates row-level security policy') || 
              error.message.includes('duplicate key value violates unique constraint')) {
            console.log('🔄 Erro de RLS detectado, tentando reautenticar...');
            
            // Força refresh da sessão
            await supabase.auth.refreshSession();
            
            // Delay exponencial
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          } else {
            // Se não for erro de RLS, para as tentativas
            break;
          }
        } else {
          console.log('✅ Vínculo criado com sucesso:', data);
          return data;
        }
      } catch (generalError) {
        lastError = generalError;
        console.error(`❌ Erro geral na tentativa ${attempt}:`, generalError);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    console.error(`❌ Falhou após ${maxRetries} tentativas. Último erro:`, lastError);
    throw lastError || new Error('Falha ao criar vínculo após múltiplas tentativas');
  };

  const signUpWithHabbo = async (habboId: string, habboName: string, password: string) => {
    console.log(`🔐 Iniciando signUp para: habboId=${habboId}, habboName=${habboName}`);
    
    // Tratamento especial para admins
    let authUser = null;
    const authEmail = `${habboId}@habbohub.com`;

    // Para usuários admin, tentar login primeiro
    if (habboName.toLowerCase() === 'habbohub' || habboName.toLowerCase() === 'beebop') {
      console.log('🛠️ Usuário admin detectado, tentando login direto primeiro...');
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: password,
        });
        
        if (signInData.user) {
          authUser = signInData.user;
          console.log('✅ Login admin automático bem-sucedido');
          return { user: authUser };
        } else if (signInError && !signInError.message.includes('not found')) {
          throw signInError;
        }
      } catch (error) {
        console.log('⚠️ Login admin falhou, tentando signup...', error);
      }
    }

    // Se não conseguiu fazer login (ou não é admin), tenta signUp
    if (!authUser) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: authEmail,
        password: password,
        options: {
          data: { habbo_name: habboName }
        }
      });

      if (authError) {
        console.error('❌ Erro na autenticação:', authError);
        throw authError;
      }
      
      authUser = authData.user;
    }

    console.log('✅ Usuário autenticado no Supabase Auth:', authUser?.id);

    if (authUser) {
      try {
        const linkedAccount = await createLinkedAccount(habboId, habboName, authUser.id);
        console.log('✅ Vínculo criado:', linkedAccount);
        return { user: authUser };
      } catch (linkError) {
        console.error('❌ Erro ao criar vínculo:', linkError);
        await supabase.auth.signOut();
        throw new Error('Falha ao vincular conta Habbo. Tente novamente.');
      }
    }

    throw new Error('Falha na autenticação');
  };

  const signInWithHabbo = async (habboId: string, password: string) => {
    console.log(`🔐 Tentando login para: habboId=${habboId}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${habboId}@habbohub.com`,
      password: password
    });

    if (error) {
      console.error('❌ Erro no login:', error);
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
        throw new Error('Usuário não encontrado ou perfil privado');
      }

      const originalMotto = habboUser.motto;
      console.log(`📝 [MOTTO] Motto encontrada: "${originalMotto}"`);
      
      const normalizedMotto = originalMotto.trim().toLowerCase();
      const normalizedCode = verificationCode.trim().toLowerCase();
      
      if (normalizedMotto.includes(normalizedCode)) {
        console.log(`✅ [MOTTO] Código encontrado na motto!`);
        return habboUser;
      } else {
        console.log(`❌ [MOTTO] Código "${verificationCode}" não encontrado na motto "${originalMotto}"`);
        throw new Error(`Código de verificação não encontrado na motto. Motto atual: "${originalMotto}"`);
      }
    } catch (error) {
      console.error('❌ [MOTTO] Erro na verificação:', error);
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
