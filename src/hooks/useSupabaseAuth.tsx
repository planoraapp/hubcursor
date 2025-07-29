
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
    let timeoutId: NodeJS.Timeout;

    // Timeout de segurança para evitar loading infinito
    const safetyTimeout = setTimeout(() => {
      console.log('⏰ Timeout de segurança ativado - forçando loading = false');
      setLoading(false);
    }, 10000); // 10 segundos

    const fetchHabboAccount = async (userId: string) => {
      try {
        console.log(`🔍 Buscando conta vinculada para usuário: ${userId}`);
        
        const { data: habboData, error } = await supabase
          .from('habbo_accounts')
          .select('*')
          .eq('supabase_user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('❌ Erro ao buscar conta vinculada:', error);
          console.error('📊 Detalhes do erro:', JSON.stringify(error, null, 2));
          
          // Mesmo com erro, não deixar loading infinito
          setHabboAccount(null);
          setLoading(false);
          return;
        }

        console.log('✅ Conta vinculada encontrada:', habboData);
        setHabboAccount(habboData);
        setLoading(false);
      } catch (error) {
        console.error('❌ Erro geral ao buscar conta vinculada:', error);
        setHabboAccount(null);
        setLoading(false);
      }
    };

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 Auth state changed: ${event}`, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchHabboAccount(session.user.id);
        } else {
          setHabboAccount(null);
          setLoading(false);
        }
        
        // Limpar timeout se a autenticação foi resolvida
        clearTimeout(safetyTimeout);
      }
    );

    // Verificar sessão existente - UMA ÚNICA VEZ
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('🔍 Sessão inicial encontrada:', currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchHabboAccount(currentSession.user.id);
        } else {
          setLoading(false);
        }
        
        // Limpar timeout se inicialização foi bem-sucedida
        clearTimeout(safetyTimeout);
      } catch (error) {
        console.error('❌ Erro na inicialização da auth:', error);
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
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

  const waitForSession = async (maxAttempts: number = 20): Promise<Session | null> => {
    for (let i = 0; i < maxAttempts; i++) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log(`✅ Sessão encontrada na tentativa ${i + 1}`);
        return session;
      }
      console.log(`⏳ Aguardando sessão... tentativa ${i + 1}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return null;
  };

  const createLinkedAccount = async (habboId: string, habboName: string, supabaseUserId: string) => {
    console.log(`🔗 Tentando criar vínculo: habboId=${habboId}, habboName=${habboName}, supabaseUserId=${supabaseUserId}`);
    
    // Aguardar sessão estar completamente estabelecida
    const session = await waitForSession();
    if (!session) {
      throw new Error('Falha ao estabelecer sessão. Tente novamente.');
    }

    // Implementar retry logic mais robusto
    let lastError = null;
    
    for (let i = 0; i < 5; i++) { // Reduzir para 5 tentativas
      try {
        console.log(`🔄 Tentativa ${i + 1} de criar vínculo...`);
        
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
          console.error(`❌ Tentativa ${i + 1} falhou:`, JSON.stringify(error, null, 2));
          
          if (error.code === '23505') {
            // Duplicate key error - vínculo já existe
            console.log('✅ Vínculo já existe, verificando...');
            const existingAccount = await getLinkedAccount(habboId);
            if (existingAccount) {
              return existingAccount;
            }
          }
          
          // Aguardar antes da próxima tentativa
          if (i < 4) {
            await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
          }
        } else {
          console.log('✅ Vínculo criado com sucesso:', data);
          return data;
        }
        
      } catch (error) {
        lastError = error;
        console.error(`❌ Tentativa ${i + 1} falhou com erro:`, JSON.stringify(error, null, 2));
        
        if (i < 4) {
          await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
        }
      }
    }

    console.error('❌ Falha persistente ao criar vínculo após todas as tentativas:', JSON.stringify(lastError, null, 2));
    throw new Error('Falha ao criar vínculo após múltiplas tentativas. Tente novamente.');
  };

  const signUpWithHabbo = async (habboId: string, habboName: string, password: string) => {
    console.log(`🔐 Iniciando signUp para: habboId=${habboId}, habboName=${habboName}`);
    
    try {
      // Primeiro, criar o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${habboId}@habbohub.com`,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        console.error('❌ Erro na autenticação:', JSON.stringify(authError, null, 2));
        throw authError;
      }

      console.log('✅ Usuário criado no Supabase Auth:', authData.user?.id);

      // Aguardar sessão ser estabelecida
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Criar o vínculo na tabela habbo_accounts
      if (authData.user) {
        try {
          const linkedAccount = await createLinkedAccount(habboId, habboName, authData.user.id);
          console.log('✅ Vínculo criado:', linkedAccount);
          return authData;
        } catch (linkError) {
          console.error('❌ Erro ao criar vínculo:', JSON.stringify(linkError, null, 2));
          
          // Se falhar em criar o vínculo, deslogar para evitar conta órfã
          await supabase.auth.signOut();
          throw new Error('Falha ao vincular conta Habbo. Tente novamente.');
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
