
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getUserByName } from '../services/habboApi';
import { supabase } from '../integrations/supabase/client';

// Helper Functions (Exported)
export const getSupabaseLinkedAccount = async (habboId: string) => {
  const { data, error } = await supabase
    .from('habbo_accounts')
    .select('*')
    .eq('habbo_id', habboId)
    .single();
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
    console.error('Supabase: Error fetching linked account:', error);
    throw new Error('Failed to verify account link.');
  }
  return data; // Returns data object or null if not found
};

export const getSupabaseLinkedAccountBySupabaseId = async (supabaseUserId: string) => {
  const { data, error } = await supabase
    .from('habbo_accounts')
    .select('habbo_id, habbo_name, is_admin')
    .eq('supabase_user_id', supabaseUserId)
    .single();
  if (error && error.code !== 'PGRST116') {
    console.error('Supabase: Error fetching Habbo link by Supabase ID:', error);
    throw new Error('Failed to fetch account link.');
  }
  return data;
};

export const createSupabaseLinkedAccount = async (habboId: string, habboName: string, supabaseUserId: string, isAdmin = false) => {
  const { data, error } = await supabase
    .from('habbo_accounts')
    .insert({ habbo_id: habboId, habbo_name: habboName, supabase_user_id: supabaseUserId, is_admin: isAdmin })
    .select()
    .single();
  if (error) {
    console.error('Supabase: Error creating Habbo link:', error);
    throw error;
  }
  return data;
};

export const getSupabaseUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signOutSupabase = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase: Error signing out:', error);
    toast.error('Error signing out. Please try again.');
  } else {
    toast.info('You have signed out of your Habbo Hub account.');
  }
};

const generateVerificationCode = () => { 
  return 'HUB-' + Math.random().toString(36).substring(2, 6).toUpperCase(); 
};

// Panel component (local to this page and other pages)
function HabboPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-center volter-font" style={{ textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black' }}>
            {title}
          </h3>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Connect Habbo Page Component
export default function ConnectHabbo() {
  const [habboName, setHabboName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Choose Login/Motto, 2: Show Motto, 3: Create Password, 4: Login Password, 5: Already Logged
  const [userHabboId, setUserHabboId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('password'); // 'password' or 'motto'
  const navigate = useNavigate();

  const [debugLog, setDebugLog] = useState<string[]>([]);
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setDebugLog((prev) => [...prev, `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    addLog('🔍 Verificando estado de autenticação Supabase...');
    const checkUserAndLink = async () => {
      const user = await getSupabaseUser();
      setSupabaseUser(user);

      if (user) {
        addLog(`✅ Usuário Supabase autenticado: ${user.email} (ID: ${user.id})`);
        try {
          const linkedAccount = await getSupabaseLinkedAccountBySupabaseId(user.id);

          if (linkedAccount) {
            addLog(`🔗 Vínculo Habbo encontrado: ${linkedAccount.habbo_name} (Admin: ${linkedAccount.is_admin ? 'Sim' : 'Não'})`);
            setHabboName(linkedAccount.habbo_name);
            setUserHabboId(linkedAccount.habbo_id);
            setStep(5); // Already logged and linked
          } else {
            addLog('⚠️ Usuário Supabase logado, mas sem vínculo Habbo. Redirecionando para vinculação.');
            setStep(1);
            setActiveTab('motto'); // Suggest motto tab for linking
            toast.info("Você está logado no Habbo Hub, mas precisa vincular sua conta Habbo. Por favor, use a Verificação por Motto.");
          }
        } catch (error: any) {
          addLog(`❌ Erro ao buscar vínculo Habbo por Supabase ID: ${error.message}`);
          toast.error('Ocorreu um erro ao buscar o vínculo da sua conta Habbo.');
          setStep(1);
        }
      } else {
        addLog('❌ Nenhum usuário Supabase autenticado. Iniciando login/cadastro.');
        setStep(1);
      }
    };
    checkUserAndLink();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        addLog(`⚡️ Evento de autenticação Supabase: ${event}`);
        setSupabaseUser(session?.user || null);
        if (event === 'SIGNED_OUT') {
          addLog('🚪 Usuário deslogado do Supabase.');
          setStep(1);
          setHabboName(''); setPassword(''); setConfirmPassword(''); setVerificationCode(''); setUserHabboId(null);
          setActiveTab('password'); // Return to default password tab
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          addLog('🎉 Usuário Supabase logado ou sessão atualizada. Re-verificando vínculo Habbo.');
          checkUserAndLink();
        }
      }
    );

    return () => { authListener?.unsubscribe(); };
  }, []);

  // handleLoginByPassword
  const handleLoginByPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentHabboName = habboName.trim();
    if (!currentHabboName || !password) { 
      toast.error('Por favor, digite seu nome Habbo e sua senha.'); 
      return; 
    }
    setIsProcessing(true); 
    addLog(`🔐 Tentando login por senha para: ${currentHabboName}`);

    try {
      // Try to find the link by Habbo name to get the associated Supabase ID
      const { data: linkedAccount, error: fetchLinkError } = await supabase
        .from('habbo_accounts')
        .select('habbo_id, supabase_user_id')
        .eq('habbo_name', currentHabboName)
        .single();

      if (fetchLinkError && fetchLinkError.code === 'PGRST116') {
        addLog(`❌ Conta Habbo "${currentHabboName}" não encontrada na tabela de vínculos. Sugerindo registro.`);
        toast.error("Conta não encontrada. Use a aba 'Verificação por Motto' para criar uma conta.");
        setIsProcessing(false);
        setActiveTab('motto'); // Redirect to motto tab if not found
        return;
      } else if (fetchLinkError) {
        addLog(`❌ Erro ao buscar vínculo para login por senha: ${fetchLinkError.message}`);
        toast.error('Erro ao verificar sua conta. Tente novamente.');
        setIsProcessing(false);
        return;
      }

      const authEmail = `${linkedAccount.habbo_id}@habbohub.com`; // Use Habbo ID from link as part of email

      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: password,
      });

      if (error) {
        addLog(`❌ Erro de login Supabase: ${error.message}`);
        toast.error(`Erro de login: ${error.message}`);
        console.error('Supabase login error:', error);
      } else if (data.user) {
        addLog(`✅ Login Supabase bem-sucedido: ${data.user.email}`);
        setSupabaseUser(data.user);
        toast.success('Login bem-sucedido no Habbo Hub!');
        navigate('/'); // Redirect to home
      }
    } catch (err: any) { 
      addLog(`❌ Erro inesperado no login por senha: ${err.message}`); 
      console.error('Erro inesperado no login por senha:', err); 
      toast.error('Ocorreu um erro inesperado. Tente novamente.'); 
    }
    finally { setIsProcessing(false); }
  };

  // handleInitiateMottoVerification
  const handleInitiateMottoVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentHabboName = habboName.trim();
    if (!currentHabboName) { 
      toast.error('Por favor, digite seu nome Habbo.'); 
      return; 
    }

    setIsProcessing(true); 
    addLog(`🔍 Verificando Habbo "${currentHabboName}" na API...`);

    try {
      const habboUserCheck = await getUserByName(currentHabboName);

      if (!habboUserCheck) {
        addLog(`❌ Habbo "${currentHabboName}" NÃO ENCONTRADO na API.`);
        toast.error(`O Habbo "${currentHabboName}" não foi encontrado. Verifique o nome e se está online/perfil público.`);
        return;
      }
      
      addLog(`✅ Habbo encontrado: ${habboUserCheck.name}`); 
      addLog(`👤 Online: ${habboUserCheck.online ? 'Sim' : 'Não'}`); 
      addLog(`💬 Motto atual: "${habboUserCheck.motto}"`);

      if (!habboUserCheck.motto) {
        addLog('⚠️ Motto não disponível. Perfil pode estar privado ou usuário offline.');
        toast.error(`O Habbo "${currentHabboName}" está offline ou com perfil privado. Altere a privacidade do seu perfil e fique online.`);
        return;
      }

      // Check if a link already exists for this Habbo ID
      const existingLink = await getSupabaseLinkedAccount(habboUserCheck.id);
      if (existingLink) {
        addLog(`❗ Vínculo Habbo existente para ID ${habboUserCheck.id}. Prosseguindo para login por senha.`);
        toast.info("Este Habbo já está vinculado a uma conta. Por favor, use a aba 'Login por Senha'.");
        setHabboName(currentHabboName); // Fill the name for the login tab
        setStep(1);
        setActiveTab('password');
        return;
      }
      
      const newCode = generateVerificationCode(); 
      setVerificationCode(newCode); 
      addLog(`🔑 Código de verificação gerado: ${newCode}`);
      setUserHabboId(habboUserCheck.id);
      setStep(2); // Go to motto display step
      toast.info(`Agora, copie o código "${newCode}" e cole-o na sua motto do Habbo Hotel.`);

    } catch (err: any) { 
      addLog(`❌ Erro inesperado ao iniciar verificação: ${err.message}`); 
      console.error('Erro ao verificar nome Habbo inicial:', err); 
      toast.error('Não foi possível verificar o nome Habbo. Tente novamente.'); 
    }
    finally { setIsProcessing(false); }
  };

  // handleVerifyMotto
  const handleVerifyMotto = async () => {
    if (!habboName.trim() || !verificationCode || userHabboId === null) {
      toast.error('Erro na verificação. Por favor, reinicie o processo.'); 
      setStep(1); 
      return;
    }
    setIsProcessing(true); 
    toast.info('Verificando sua motto no Habbo Hotel...');
    try {
      const habboUser = await getUserByName(habboName);
      if (!habboUser || !habboUser.motto) { 
        toast.error(`Não foi possível encontrar o Habbo "${habboName}", ou o perfil está privado/offline.`); 
        setIsProcessing(false); 
        return; 
      }
      addLog(`✅ Motto lida da API: "${habboUser.motto}"`); 
      addLog(`🔑 Código esperado: "${verificationCode}"`);

      const normalizedMotto = habboUser.motto.toLowerCase();
      const normalizedCode = verificationCode.toLowerCase();

      if (normalizedMotto.includes(normalizedCode)) {
        addLog('✅ Código de verificação ENCONTRADO na motto!');
        setStep(4); // Go to create password
        toast.success('Código verificado! Agora crie uma senha para o seu Habbo Hub.');
      } else {
        addLog(`❌ Código de verificação NÃO ENCONTRADO na motto.`);
        toast.error(`Código "${verificationCode}" não encontrado na sua motto atual: "${habboUser.motto}". Verifique se você colou o código corretamente e está online.`);
      }
    } catch (err: any) { 
      addLog(`❌ Erro ao verificar motto: ${err.message}`); 
      console.error('Erro ao verificar motto:', err); 
      toast.error('Ocorreu um erro ao tentar verificar a motto. Tente novamente.'); 
    }
    finally { setIsProcessing(false); }
  };

  // handleCreateOrLoginAccount
  const handleCreateOrLoginAccount = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsProcessing(true);
    addLog('➡️ Tentando criar/logar conta Supabase...');

    if (password.length < 6) { 
      toast.error('A senha deve ter pelo menos 6 caracteres.'); 
      setIsProcessing(false); 
      return; 
    }
    if (password !== confirmPassword) { 
      toast.error('As senhas não coincidem.'); 
      setIsProcessing(false); 
      return; 
    }

    try {
      const authEmail = `${userHabboId}@habbohub.com`;
      const isAdminUser = habboName.toLowerCase() === 'habbohub';

      // First, try sign-up (to create Supabase user if it doesn't exist)
      let authResult = await supabase.auth.signUp({
        email: authEmail,
        password: password,
        options: { 
          data: { habbo_name: habboName, is_admin_flag: isAdminUser },
          emailRedirectTo: `${window.location.origin}/`
        },
      });

      if (authResult.error) {
        if (authResult.error.message.includes("User already registered") || authResult.error.message.includes("already registered")) {
          addLog(`User "${authEmail}" already registered in Supabase Auth. Attempting sign-in...`);
          authResult = await supabase.auth.signInWithPassword({ email: authEmail, password: password });
          if (authResult.error) {
             addLog(`❌ Sign-in failed for existing user: ${authResult.error.message}`);
             toast.error(`Erro de login: ${authResult.error.message}. Senha incorreta ou problema na conta.`);
             setIsProcessing(false);
             return;
          }
        } else {
          addLog(`❌ Erro ao criar conta Supabase: ${JSON.stringify(authResult.error)}`);
          toast.error(`Erro ao criar conta: ${authResult.error.message}`);
          setIsProcessing(false);
          return;
        }
      }

      const authUser = authResult.data.user;
      if (!authUser) {
        toast.error('Erro na autenticação do usuário.');
        setIsProcessing(false);
        return;
      }
      
      addLog(`✅ Usuário Supabase processado: ${authUser.email} (ID: ${authUser.id})`);

      // Check and create/update the link in habbo_accounts table
      let linkedAccount = await getSupabaseLinkedAccount(userHabboId!);
      if (!linkedAccount) {
        addLog('🔗 Criando novo vínculo Habbo-Supabase...');
        let linkedAccountCreated = false; 
        const maxRetries = 5;
        for (let i = 0; i < maxRetries; i++) {
          try {
            linkedAccount = await createSupabaseLinkedAccount(userHabboId!, habboName, authUser.id, isAdminUser);
            linkedAccountCreated = true; 
            break;
          } catch (linkError: any) {
            addLog(`❌ Falha ao criar vínculo (tentativa ${i + 1}/${maxRetries}): ${linkError.message}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
        if (!linkedAccountCreated) {
          addLog('❌ Falha persistente ao criar vínculo Habbo-Supabase após múltiplos retries.');
          toast.error('Erro ao vincular sua conta Habbo. Por favor, tente novamente ou entre em contato com o suporte.');
          await supabase.auth.signOut();
          setIsProcessing(false);
          return;
        }
        addLog('✅ Vínculo Habbo-Supabase criado com sucesso.');
      } else {
        // If link already exists, update is_admin if it's 'habbohub' (to ensure)
        if (isAdminUser && !linkedAccount.is_admin) {
          const { error: updateAdminError } = await supabase
            .from('habbo_accounts')
            .update({ is_admin: true })
            .eq('habbo_id', userHabboId);
          if (updateAdminError) {
            console.error('Erro ao atualizar status de admin:', updateAdminError);
            toast.error('Erro ao atualizar status de admin da conta.');
          } else {
            addLog('Admin status updated for existing account.');
          }
        }
      }

      toast.success('Conta criada e vinculada com sucesso!');
      navigate('/'); // Redirect to home

    } catch (err: any) { 
      addLog(`❌ Erro inesperado na criação/login da conta: ${err.message}`); 
      console.error('Erro inesperado na criação/login da conta:', err); 
      toast.error('Ocorreu um erro inesperado. Tente novamente.'); 
    }
    finally { setIsProcessing(false); }
  };

  const handleLogout = async () => {
    await signOutSupabase();
    navigate('/connect-habbo');
  };

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <div className="relative mb-6 p-6 rounded-lg overflow-hidden"
        style={{ backgroundImage: 'url("/assets/1360__-3C7.png")', backgroundSize: 'cover', backgroundPosition: 'center center' }}>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 flex items-center space-x-4">
          <img src="/assets/hub.gif" alt="Habbo Hub Logo" className="w-12 h-12" />
          <h1 className="text-2xl font-bold text-white volter-font" style={{ textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black' }}>
            Conectar Conta Habbo
          </h1>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 mb-6 border border-gray-900">
        <div className="space-y-6">
          <HabboPanel title="Console de Debug:">
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
              {debugLog.map((log, index) => (<div key={index} className="mb-1">{log}</div>))}
            </div>
          </HabboPanel>

          {step === 5 && (
            <HabboPanel title="Bem-vindo de Volta!">
              <div className="text-center">
                <p className="text-gray-700 mb-4">Você já está logado no Habbo Hub como <strong>{habboName}</strong>.</p>
                <button 
                  onClick={() => navigate('/')} 
                  className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors volter-font"
                >
                  Ver Meu Perfil
                </button>
                <button 
                  onClick={handleLogout} 
                  className="ml-4 mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors volter-font" 
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Saindo...' : 'Sair'}
                </button>
              </div>
            </HabboPanel>
          )}

          {step === 1 && (
            <div className="flex justify-center">
              <div className="space-y-6 w-full max-w-md">
                <div className="bg-white border border-gray-900 rounded-lg shadow-md w-full mx-auto">
                  <div className="w-full">
                    <div className="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-2">
                      <button 
                        type="button"
                        onClick={() => setActiveTab('password')} 
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'password' ? 'bg-background text-foreground shadow-sm' : 'bg-transparent text-muted-foreground'} volter-font`}
                      >
                        Login por Senha
                      </button>
                      <button 
                        type="button"
                        onClick={() => setActiveTab('motto')} 
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'motto' ? 'bg-background text-foreground shadow-sm' : 'bg-transparent text-muted-foreground'} volter-font`}
                      >
                        Verificação por Motto
                      </button>
                    </div>

                    {activeTab === 'password' && (
                      <div className="space-y-4 p-6">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-semibold">Login por Senha</h3>
                          <p className="text-sm text-gray-600">Para contas já verificadas</p>
                        </div>
                        <form onSubmit={handleLoginByPassword} className="space-y-4">
                          <div>
                            <label htmlFor="habboNameLogin" className="block text-sm font-medium text-gray-700 mb-2">Nome Habbo:</label>
                            <input 
                              id="habboNameLogin" 
                              type="text" 
                              value={habboName} 
                              onChange={(e) => setHabboName(e.target.value)} 
                              placeholder="Digite seu nome Habbo" 
                              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                              required 
                              disabled={isProcessing} 
                            />
                          </div>
                          <div>
                            <label htmlFor="passwordLogin" className="block text-sm font-medium text-gray-700 mb-2">Senha:</label>
                            <input 
                              id="passwordLogin" 
                              type="password" 
                              value={password} 
                              onChange={(e) => setPassword(e.target.value)} 
                              placeholder="Sua senha do Habbo Hub" 
                              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                              required 
                              disabled={isProcessing} 
                            />
                          </div>
                          <button 
                            type="submit" 
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 volter-font" 
                            disabled={isProcessing}
                          >
                            {isProcessing ? 'Entrando...' : 'Entrar'}
                          </button>
                        </form>
                      </div>
                    )}

                    {activeTab === 'motto' && (
                      <div className="space-y-4 p-6">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-semibold">Crie sua Conta / Recupere Senha</h3>
                          <p className="text-sm text-gray-600">Para novos usuários ou redefinição de senha</p>
                        </div>
                        <form onSubmit={handleInitiateMottoVerification} className="space-y-4">
                          <div>
                            <label htmlFor="habboNameMotto" className="block text-sm font-medium text-gray-700 mb-2">Nome Habbo:</label>
                            <input 
                              id="habboNameMotto" 
                              type="text" 
                              value={habboName} 
                              onChange={(e) => setHabboName(e.target.value)} 
                              placeholder="Digite seu nome Habbo" 
                              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                              required 
                              disabled={isProcessing} 
                            />
                          </div>
                          <button 
                            type="submit" 
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 volter-font" 
                            disabled={isProcessing}
                          >
                            {isProcessing ? 'Verificando...' : 'Gerar Código de Verificação'}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <HabboPanel title="Passo 2: Verifique sua Motto">
              <p className="text-gray-700 mb-4">
                Para vincular sua conta, por favor, <strong>defina sua motto (legenda)</strong> no Habbo Hotel para o código abaixo.
                Certifique-se de que você está <strong>online</strong> no Habbo Hotel para a verificação funcionar.
              </p>
              <div
                className="bg-gray-100 p-4 rounded-lg border border-gray-300 mb-4 text-center cursor-pointer"
                onClick={() => { 
                  navigator.clipboard.writeText(verificationCode); 
                  toast.info('Código copiado para a área de transferência!'); 
                }}
                title="Clique no código para copiar"
              >
                <p className="text-2xl font-bold text-blue-700 select-all volter-font">{verificationCode}</p>
                <span className="text-sm text-gray-500">Clique no código para copiar</span>
              </div>
              <p className="text-gray-700 mb-6">
                Após atualizar sua motto no Habbo, clique no botão "Verificar Motto" abaixo.
              </p>
              <button 
                onClick={handleVerifyMotto} 
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed volter-font" 
                disabled={isProcessing}
              >
                {isProcessing ? 'Verificando Motto...' : 'Verificar Motto'}
              </button>
              <button 
                onClick={() => { setStep(1); setActiveTab('motto'); }} 
                type="button" 
                className="w-full mt-3 px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors volter-font" 
                disabled={isProcessing}
              >
                Voltar
              </button>
            </HabboPanel>
          )}

          {step === 4 && (
            <HabboPanel title="Passo 3: Criar Senha para o Habbo Hub">
              <p className="text-gray-700 mb-4">
                Sua conta Habbo foi verificada! Agora crie uma senha para acessar seu perfil no Habbo Hub.
              </p>
              <form onSubmit={handleCreateOrLoginAccount} className="flex flex-col gap-4">
                <label htmlFor="newPassword" className="font-medium text-gray-700">Nova Senha (min. 6 caracteres):</label>
                <input 
                  id="newPassword" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Crie uma senha" 
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                  disabled={isProcessing} 
                />
                <label htmlFor="confirmNewPassword" className="font-medium text-gray-700">Confirmar Senha:</label>
                <input 
                  id="confirmNewPassword" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Confirme sua senha" 
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                  disabled={isProcessing} 
                />
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed volter-font" 
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Criando Conta...' : 'Vincular e Criar Conta'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setStep(1); setActiveTab('motto'); }} 
                  className="w-full mt-3 px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors volter-font" 
                  disabled={isProcessing}
                >
                  Voltar
                </button>
              </form>
            </HabboPanel>
          )}
        </div>
      </div>
    </div>
  );
}
