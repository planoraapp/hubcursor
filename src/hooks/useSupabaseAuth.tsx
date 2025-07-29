
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
    
    for (let i = 0; i < 8; i++) { // Aumentar para 8 tentativas
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
          
          // Estratégia de retry baseada no tipo de erro
          if (error.code === '42501' || error.message.includes('row-level security')) {
            console.log(`⏳ Erro de RLS detectado, aguardando ${(i + 1) * 1500}ms...`);
            await new Promise(resolve => setTimeout(resolve, (i + 1) * 1500));
            continue;
          } else if (error.code === '23505') {
            // Duplicate key error - vínculo já existe
            console.log('✅ Vínculo já existe, verificando...');
            const existingAccount = await getLinkedAccount(habboId);
            if (existingAccount) {
              return existingAccount;
            }
          } else {
            // Para outros erros, aguardar menos tempo
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } else {
          console.log('✅ Vínculo criado com sucesso:', data);
          return data;
        }
        
      } catch (error) {
        lastError = error;
        console.error(`❌ Tentativa ${i + 1} falhou com erro:`, JSON.stringify(error, null, 2));
        
        // Aguardar antes da próxima tentativa
        if (i < 7) {
          await new Promise(resolve => setTimeout(resolve, (i + 1) * 800));
        }
      }
    }

    console.error('❌ Falha persistente ao criar vínculo após todas as tentativas:', JSON.stringify(lastError, null, 2));
    throw new Error('Falha ao criar vínculo após múltiplas tentativas. Verifique sua conexão e tente novamente.');
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

      // Aguardar um pouco para garantir que a sessão seja estabelecida
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Depois, criar o vínculo na tabela habbo_accounts
      if (authData.user) {
        try {
          const linkedAccount = await createLinkedAccount(habboId, habboName, authData.user.id);
          console.log('✅ Vínculo criado:', linkedAccount);
          
          // Aguardar mais um pouco para garantir que tudo esteja sincronizado
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return authData;
        } catch (linkError) {
          console.error('❌ Erro ao criar vínculo:', JSON.stringify(linkError, null, 2));
          
          // Se falhar em criar o vínculo, tentar uma vez mais após aguardar
          console.log('🔄 Tentando criar vínculo novamente após aguardar...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          try {
            const linkedAccount = await createLinkedAccount(habboId, habboName, authData.user.id);
            console.log('✅ Vínculo criado na segunda tentativa:', linkedAccount);
            return authData;
          } catch (finalError) {
            console.error('❌ Falha final ao criar vínculo:', JSON.stringify(finalError, null, 2));
            // Se falhar definitivamente, deslogar para evitar conta órfã
            await supabase.auth.signOut();
            throw new Error('Falha ao vincular conta Habbo. A conta foi limpa. Tente novamente em alguns segundos.');
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
      
      // Verificação robusta com múltiplas tentativas
      const normalizedMotto = originalMotto.trim().toLowerCase();
      const normalizedCode = verificationCode.trim().toLowerCase();
      
      console.log(`🔍 [MOTTO] Motto normalizada: "${normalizedMotto}"`);
      console.log(`🔍 [MOTTO] Código normalizado: "${normalizedCode}"`);
      console.log(`🔍 [MOTTO] Motto bruta: "${originalMotto}"`);
      
      if (normalizedMotto.includes(normalizedCode)) {
        console.log(`✅ [MOTTO] Código encontrado na motto!`);
        return habboUser;
      } else {
        console.log(`❌ [MOTTO] Código "${verificationCode}" não encontrado na motto "${originalMotto}"`);
        console.log(`📊 [MOTTO] Detalhes da verificação:`);
        console.log(`   - Motto lida (normalizada): "${normalizedMotto}"`);
        console.log(`   - Código esperado (normalizado): "${normalizedCode}"`);
        console.log(`   - Motto bruta: "${originalMotto}"`);
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
