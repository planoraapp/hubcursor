
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getUserByName } from '../services/habboApiMultiHotel';

interface HabboAccount {
  id: string;
  habbo_id: string;
  habbo_name: string;
  supabase_user_id: string;
  hotel: string;
  is_admin: boolean;
  created_at: string;
}

// Gerar código de verificação com prefixo HUB-
const generateVerificationCode = () => {
  const code = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `HUB-${code}`;
};

// Detectar hotel do habbo_id
const detectHotelFromHabboId = (habboId: string): string => {
  if (habboId.startsWith('hhbr-')) return 'br';
  if (habboId.startsWith('hhcom-')) return 'com';
  if (habboId.startsWith('hhes-')) return 'es';
  if (habboId.startsWith('hhfr-')) return 'fr';
  if (habboId.startsWith('hhde-')) return 'de';
  if (habboId.startsWith('hhit-')) return 'it';
  if (habboId.startsWith('hhnl-')) return 'nl';
  if (habboId.startsWith('hhfi-')) return 'fi';
  if (habboId.startsWith('hhtr-')) return 'tr';
  return 'com'; // fallback
};

export const useUnifiedAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [habboAccount, setHabboAccount] = useState<HabboAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper: garantir Home inicializada
  const ensureUserHome = async (userId: string) => {
    try {
      console.log('🏠 Garantindo Home padrão para usuário:', userId);
      const { error } = await supabase.rpc('ensure_user_home_exists', { user_uuid: userId });
      if (error) {
        console.error('❌ Erro ao garantir Home padrão:', error);
        // Não propagar erro - home pode ser criada posteriormente
      } else {
        console.log('✅ Home padrão verificada/criada com sucesso');
      }
    } catch (error) {
      console.warn('⚠️ Falha ao garantir home (ignorado):', error);
    }
  };

  const loadHabboAccount = async (userId: string) => {
    try {
      console.log('📋 Carregando conta Habbo para usuário:', userId);
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('*')
        .eq('supabase_user_id', userId)
        .single();

      if (error) {
        console.error('❌ Erro ao carregar conta habbo:', error);
        setHabboAccount(null);
      } else {
        console.log('✅ Conta Habbo carregada:', data.habbo_name);
        setHabboAccount(data);
      }
    } catch (error) {
      console.error('💥 Erro geral ao carregar conta habbo:', error);
      setHabboAccount(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔧 Inicializando sistema de autenticação...');
    
    // 1) Configurar listener de mudanças de auth PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth state changed:', event, !!session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Usar setTimeout para evitar deadlocks
        setTimeout(() => {
          loadHabboAccount(session.user!.id);
        }, 0);
      } else {
        setHabboAccount(null);
        setLoading(false);
      }
    });

    // 2) DEPOIS verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🧭 Sessão inicial:', !!session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadHabboAccount(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 Limpando subscription de auth');
      subscription.unsubscribe();
    };
  }, []);

  // Verificar se usuário já existe na tabela habbo_accounts (considerando hotel)
  const checkUserExists = async (habboName: string, hotel?: string) => {
    try {
      let query = supabase
        .from('habbo_accounts')
        .select('habbo_id, hotel')
        .ilike('habbo_name', habboName);
        
      if (hotel) {
        query = query.eq('hotel', hotel);
      }

      const { data, error } = await query;

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('❌ Erro ao verificar usuário:', error);
      return null;
    }
  };

  // Verificar motto do Habbo com detecção automática de hotel
  const verifyHabboMotto = async (habboName: string, verificationCode: string) => {
    try {
      console.log(`🔍 Verificando motto para ${habboName} com código: ${verificationCode}`);
      
      const habboUser = await getUserByName(habboName);
      
      if (!habboUser || !habboUser.motto) {
        throw new Error('Usuário não encontrado ou perfil privado');
      }

      const originalMotto = habboUser.motto;
      console.log(`📝 Motto encontrada: "${originalMotto}"`);
      console.log(`🏨 Hotel detectado: ${detectHotelFromHabboId(habboUser.uniqueId)}`);
      
      const normalizedMotto = originalMotto.trim().toLowerCase();
      const normalizedCode = verificationCode.trim().toLowerCase();
      
      if (normalizedMotto.includes(normalizedCode)) {
        console.log(`✅ Código encontrado na motto!`);
        return habboUser;
      } else {
        throw new Error(`Código de verificação não encontrado na motto. Motto atual: "${originalMotto}"`);
      }
    } catch (error) {
      console.error('❌ Erro na verificação da motto:', error);
      throw error;
    }
  };

  // Primeiro cadastro (via motto) com detecção automática de hotel
  const registerWithMotto = async (habboName: string, verificationCode: string, password: string) => {
    try {
      console.log(`📝 Registrando novo usuário: ${habboName}`);
      
      // Verificar motto e obter dados do usuário
      const habboUser = await verifyHabboMotto(habboName, verificationCode);
      
      if (!habboUser) {
        throw new Error('Verificação da motto falhou');
      }

      // Detectar hotel automaticamente
      const detectedHotel = detectHotelFromHabboId(habboUser.uniqueId);
      console.log(`🏨 Hotel detectado automaticamente: ${detectedHotel}`);
      
      // Verificar se já existe uma conta para este usuário neste hotel específico
      const existingUser = await checkUserExists(habboName, detectedHotel);
      if (existingUser) {
        throw new Error(`Este nome Habbo já está cadastrado no hotel ${detectedHotel.toUpperCase()}. Use a aba "Login" para acessar sua conta.`);
      }

      // Verificar se já existe uma conta auth com este email (limpeza adicional)
      const authEmail = `${habboUser.uniqueId}@habbohub.com`;

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: authEmail,
        password: password,
        options: {
          data: { 
            habbo_name: habboName,
            hotel: detectedHotel
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        console.error('❌ Erro na criação do auth:', authError);
        if (authError.message.includes('already registered')) {
          throw new Error('Este Habbo já possui uma conta. Use a aba "Login" para acessar.');
        }
        throw authError;
      }

      if (authData.user) {
        // Determinar se é admin (beebop ou habbohub)
        const isAdmin = ['beebop', 'habbohub'].includes(habboName.toLowerCase());

        // Criar registro na tabela habbo_accounts com hotel detectado
        const { data: accountData, error: accountError } = await supabase
          .from('habbo_accounts')
          .insert({
            habbo_id: habboUser.uniqueId,
            habbo_name: habboName,
            supabase_user_id: authData.user.id,
            hotel: detectedHotel,
            is_admin: isAdmin
          })
          .select()
          .single();

        if (accountError) {
          console.error('❌ Erro na criação da conta:', accountError);
          // Tentar remover o usuário auth se a conta habbo falhou
          await supabase.auth.signOut();
          throw accountError;
        }

        // Garantir Home padrão após cadastro
        await ensureUserHome(authData.user.id);

        console.log('✅ Usuário registrado com sucesso:', accountData);
        return authData;
      }

      throw new Error('Falha na criação do usuário');
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      throw error;
    }
  };

  // Login com senha (usuários existentes) - versão robusta
  const loginWithPassword = async (habboName: string, password: string) => {
    try {
      console.log(`🔐 Iniciando login para: ${habboName}`);
      const normalizedName = habboName.trim();

      let authEmail: string | null = null;
      let detectedHotel: string | null = null;

      try {
        // Tentar obter uniqueId via API multi-hotel (mais confiável)
        console.log('🌐 Buscando dados via API do Habbo...');
        const habboUser = await getUserByName(normalizedName);
        
        if (habboUser?.uniqueId) {
          authEmail = `${habboUser.uniqueId}@habbohub.com`;
          detectedHotel = detectHotelFromHabboId(habboUser.uniqueId);
          console.log(`📧 Email construído via API: ${authEmail} (${detectedHotel})`);
        } else {
          throw new Error('Usuário não encontrado na API do Habbo');
        }
      } catch (apiError) {
        console.warn('⚠️ API do Habbo indisponível, tentando fallback...', apiError);
        throw new Error('Não foi possível verificar sua conta Habbo. Tente novamente em alguns instantes.');
      }

      if (!authEmail) {
        throw new Error('Conta não encontrada. Use a aba "Primeiro Acesso" para se cadastrar.');
      }

      // Fazer login com o email construído
      console.log('🔑 Tentando login com Supabase Auth...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: password
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Senha incorreta. Verifique sua senha e tente novamente.');
        }
        throw new Error('Erro no login. Verifique suas credenciais.');
      }

      // Garantir Home padrão após login
      if (data.user?.id) {
        await ensureUserHome(data.user.id);
      }

      console.log(`✅ Login realizado com sucesso para ${normalizedName}`);
      
      toast({
        title: "Login realizado!",
        description: `Bem-vindo de volta, ${normalizedName}!`,
      });
      
      return data;
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      toast({
        title: "Erro no Login",
        description: error.message || "Erro desconhecido no login",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro ao sair:', error);
        toast({
          title: "Erro",
          description: "Erro ao sair. Tente novamente.",
          variant: "destructive"
        });
      } else {
        console.log('✅ Logout realizado com sucesso');
        toast({
          title: "Sucesso",
          description: "Logout realizado com sucesso!"
        });
      }
    } catch (error) {
      console.error('💥 Erro geral no logout:', error);
    }
  };

  return {
    user,
    habboAccount,
    loading,
    isLoggedIn: !!user && !!habboAccount,
    isAdmin: () => habboAccount?.is_admin || false,
    checkUserExists,
    generateVerificationCode,
    verifyHabboMotto,
    registerWithMotto,
    loginWithPassword,
    logout
  };
};
