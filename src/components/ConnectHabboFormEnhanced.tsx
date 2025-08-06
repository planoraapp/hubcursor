import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getUserByName } from '../services/habboApi';
import { supabase } from '@/integrations/supabase/client';
import { generateVerificationCode } from './auth/AuthUtils';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export const ConnectHabboFormEnhanced = () => {
  const [habboNameInput, setHabboNameInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [userHabboId, setUserHabboId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('password');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUpWithHabbo, signInWithHabbo, verifyHabboMotto } = useSupabaseAuth();

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const logMessage = `${timestamp}: ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev.slice(-10), logMessage]);
  };

  // Lista de usuários admin que podem fazer bypass da verificação
  const adminUsers = ['habbohub', 'beebop'];
  
  const isAdminUser = (habboName: string) => {
    return adminUsers.includes(habboName.toLowerCase());
  };

  // Case-insensitive account lookup
  const findLinkedAccountByName = async (habboName: string) => {
    try {
      addDebugLog(`🔍 Procurando conta vinculada para: ${habboName}`);
      
      const { data: accounts, error } = await supabase
        .from('habbo_accounts')
        .select('*')
        .ilike('habbo_name', habboName); // Case-insensitive search
      
      if (error) {
        addDebugLog(`❌ Erro na busca: ${error.message}`);
        return null;
      }
      
      if (accounts && accounts.length > 0) {
        addDebugLog(`✅ Conta encontrada: ${accounts[0].habbo_name} (ID: ${accounts[0].habbo_id})`);
        return accounts[0];
      } else {
        addDebugLog(`❌ Nenhuma conta vinculada encontrada para "${habboName}"`);
        return null;
      }
    } catch (error) {
      addDebugLog(`❌ Erro geral na busca: ${error}`);
      return null;
    }
  };

  const handleLoginByPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentHabboName = habboNameInput.trim();
    if (!currentHabboName || !password) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu nome Habbo e sua senha.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    addDebugLog(`🔐 Tentando login por senha para: ${currentHabboName}`);
    
    try {
      const linkedAccount = await findLinkedAccountByName(currentHabboName);

      if (!linkedAccount) {
        addDebugLog(`❌ Conta "${currentHabboName}" não encontrada. Sugerindo registro.`);
        toast({
          title: "Conta não encontrada",
          description: `Não foi encontrada uma conta vinculada para "${currentHabboName}". Use a aba "Verificação por Motto" para criar uma conta.`,
          variant: "destructive"
        });
        return;
      }

      addDebugLog(`🔑 Tentando autenticar com Supabase...`);
      await signInWithHabbo(linkedAccount.habbo_id, password);
      
      addDebugLog(`✅ Login realizado com sucesso!`);
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!"
      });
      navigate('/');
    } catch (error: any) {
      addDebugLog(`❌ Erro no login: ${error.message}`);
      toast({
        title: "Erro",
        description: error.message || 'Erro no login. Verifique suas credenciais.',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitiateMottoVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentHabboName = habboNameInput.trim();
    if (!currentHabboName) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu nome Habbo.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    addDebugLog(`🔍 Iniciando verificação por motto para: ${currentHabboName}`);
    
    try {
      // BYPASS PARA ADMINS: Pular verificação da API do Habbo
      if (isAdminUser(currentHabboName)) {
        addDebugLog(`🔑 ADMIN BYPASS: Usuário "${currentHabboName}" é admin, pulando verificação da API`);
        
        // Gerar um ID único para admin (usando timestamp + nome)
        const adminHabboId = `admin_${currentHabboName.toLowerCase()}_${Date.now()}`;
        
        const newCode = generateVerificationCode();
        setVerificationCode(newCode);
        setUserHabboId(adminHabboId);
        setStep(2);
        
        addDebugLog(`✅ Admin bypass ativado. Código gerado: ${newCode}`);
        toast({
          title: "Admin Bypass Ativo",
          description: `Como você é admin, pode pular a verificação. Código: "${newCode}" (pode usar qualquer motto)`,
        });
        return;
      }

      // Verificação normal para usuários não-admin
      const habboUserCheck = await getUserByName(currentHabboName);
      if (!habboUserCheck) {
        addDebugLog(`❌ Usuário "${currentHabboName}" não encontrado na API do Habbo`);
        toast({
          title: "Erro",
          description: `O Habbo "${currentHabboName}" não foi encontrado. Verifique o nome e se está online/perfil público.`,
          variant: "destructive"
        });
        return;
      }

      if (!habboUserCheck.motto) {
        addDebugLog(`❌ Motto vazio para usuário "${currentHabboName}"`);
        toast({
          title: "Erro",
          description: `O Habbo "${currentHabboName}" está offline ou com perfil privado. Altere a privacidade do seu perfil e fique online.`,
          variant: "destructive"
        });
        return;
      }

      const newCode = generateVerificationCode();
      setVerificationCode(newCode);
      setUserHabboId(habboUserCheck.uniqueId);
      setStep(2);
      
      addDebugLog(`✅ Código gerado: ${newCode}`);
      toast({
        title: "Código Gerado",
        description: `Copie o código "${newCode}" e cole-o na sua motto do Habbo Hotel.`
      });
    } catch (error) {
      addDebugLog(`❌ Erro na verificação inicial: ${error}`);
      toast({
        title: "Erro",
        description: "Não foi possível verificar o nome Habbo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyMotto = async () => {
    if (!habboNameInput.trim() || !verificationCode || !userHabboId) {
      toast({
        title: "Erro",
        description: "Erro na verificação. Por favor, reinicie o processo.",
        variant: "destructive"
      });
      setStep(1);
      return;
    }

    setIsProcessing(true);
    addDebugLog(`🔍 Verificando motto para: ${habboNameInput}`);
    
    try {
      let habboUser = null;

      // BYPASS PARA ADMINS: Aceitar qualquer "verificação"
      if (isAdminUser(habboNameInput)) {
        addDebugLog(`🔑 ADMIN BYPASS: Pulando verificação real da motto para admin "${habboNameInput}"`);
        
        // Criar objeto simulado para admin
        habboUser = {
          uniqueId: userHabboId,
          name: habboNameInput,
          motto: `Admin ${habboNameInput}`,
          online: true,
          memberSince: new Date().toISOString(),
          selectedBadges: [],
          badges: [],
          figureString: 'default'
        };
        
        addDebugLog(`✅ Admin bypass: Verificação "aprovada" automaticamente`);
      } else {
        // Verificação normal para usuários não-admin
        habboUser = await verifyHabboMotto(habboNameInput, verificationCode);
      }
      
      if (habboUser) {
        setUserHabboId(habboUser.uniqueId);
        
        // Check for existing linked account (case-insensitive)
        const linkedAccount = await findLinkedAccountByName(habboNameInput);
        
        if (linkedAccount) {
          setStep(4); // Login with existing password
          addDebugLog(`✅ Conta existente encontrada. Solicitando senha.`);
          toast({
            title: "Sucesso",
            description: "Verificação concluída! Digite sua senha do Habbo Hub."
          });
        } else {
          setStep(3); // Create password
          addDebugLog(`✅ Nova conta. Solicitando criação de senha.`);
          toast({
            title: "Sucesso",
            description: "Verificação concluída! Crie uma senha para o seu Habbo Hub."
          });
        }
      }
    } catch (error: any) {
      addDebugLog(`❌ Erro na verificação do motto: ${error.message}`);
      toast({
        title: "Erro",
        description: error.message || 'Erro ao verificar motto',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordAction = async (e: React.FormEvent, actionType: 'login' | 'signup') => {
    e.preventDefault();
    if (!userHabboId) return;
    
    setIsProcessing(true);
    addDebugLog(`🔐 Executando ${actionType} para usuário: ${habboNameInput}`);

    try {
      if (actionType === 'login') {
        if (!password) {
          toast({
            title: "Erro",
            description: "Por favor, digite sua senha.",
            variant: "destructive"
          });
          return;
        }
        
        await signInWithHabbo(userHabboId, password);
        addDebugLog(`✅ Login existente realizado com sucesso`);
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
        navigate('/');
        
      } else if (actionType === 'signup') {
        if (password.length < 6) {
          toast({
            title: "Erro",
            description: "A senha deve ter pelo menos 6 caracteres.",
            variant: "destructive"
          });
          return;
        }
        
        if (password !== confirmPassword) {
          toast({
            title: "Erro",
            description: "As senhas não coincidem.",
            variant: "destructive"
          });
          return;
        }
        
        await signUpWithHabbo(userHabboId, habboNameInput, password);
        addDebugLog(`✅ Nova conta criada com sucesso`);
        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso!"
        });
        navigate('/');
      }
    } catch (error: any) {
      addDebugLog(`❌ Erro no ${actionType}: ${error.message}`);
      toast({
        title: "Erro",
        description: error.message || `Erro no ${actionType === 'login' ? 'login' : 'cadastro'}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-6">
        <Card className="w-full max-w-md mx-auto bg-white border border-gray-900 shadow-md">
          <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="text-center volter-font">Conectar Conta Habbo</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password" className="volter-font">Login por Senha</TabsTrigger>
                <TabsTrigger value="motto" className="volter-font">Verificação por Motto</TabsTrigger>
              </TabsList>
              
              <TabsContent value="password" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Login por Senha</h3>
                  <p className="text-sm text-gray-600">Para contas já verificadas</p>
                  {isAdminUser(habboNameInput.trim()) && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700 volter-font">🔑 Conta Admin Detectada</p>
                    </div>
                  )}
                </div>
                <form onSubmit={handleLoginByPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Habbo:</label>
                    <Input
                      type="text"
                      value={habboNameInput}
                      onChange={(e) => setHabboNameInput(e.target.value)}
                      placeholder="Digite seu nome Habbo"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha:</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha do Habbo Hub"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white volter-font"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="motto" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Crie sua Conta / Recupere Senha</h3>
                  <p className="text-sm text-gray-600">Para novos usuários ou redefinição de senha</p>
                  {isAdminUser(habboNameInput.trim()) && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-700 volter-font">🔑 Admin Bypass Disponível - Verificação Simplificada</p>
                    </div>
                  )}
                </div>
                <form onSubmit={handleInitiateMottoVerification} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Habbo:</label>
                    <Input
                      type="text"
                      value={habboNameInput}
                      onChange={(e) => setHabboNameInput(e.target.value)}
                      placeholder="Digite seu nome Habbo"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white volter-font"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Verificando...' : 'Gerar Código de Verificação'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Debug Console */}
        <Card className="w-full max-w-md mx-auto bg-white border border-gray-900 shadow-md">
          <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="text-center volter-font">Console de Debug:</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
              {debugLogs.length === 0 ? (
                <div className="mb-1">Aguardando ações...</div>
              ) : (
                debugLogs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border border-gray-900 shadow-md">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg">
          <CardTitle className="text-center volter-font">
            {isAdminUser(habboNameInput) ? 'Admin Bypass Ativo' : 'Verifique sua Motto'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {isAdminUser(habboNameInput) ? (
            <div>
              <p className="text-gray-700 mb-4">
                🔑 <strong>Modo Admin:</strong> Como você é administrador, pode pular a verificação normal. 
                Clique em "Verificar" abaixo para continuar.
              </p>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                <p className="text-lg font-bold text-green-700 volter-font">BYPASS ADMINISTRATIVO</p>
                <span className="text-sm text-green-600">Verificação simplificada ativa</span>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-700">
                Para vincular sua conta, defina sua motto no Habbo Hotel para o código abaixo.
                Certifique-se de estar online no Habbo Hotel.
              </p>
              <div
                className="bg-gray-100 p-4 rounded-lg border border-gray-300 text-center cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(verificationCode);
                  toast({
                    title: "Copiado",
                    description: "Código copiado para a área de transferência!"
                  });
                }}
                title="Clique para copiar"
              >
                <p className="text-2xl font-bold text-blue-700 select-all volter-font">{verificationCode}</p>
                <span className="text-sm text-gray-500">Clique no código para copiar</span>
              </div>
              <p className="text-gray-700">
                Após atualizar sua motto no Habbo, clique no botão "Verificar Motto" abaixo.
              </p>
            </div>
          )}
          
          <Button
            onClick={handleVerifyMotto}
            className="w-full bg-green-600 hover:bg-green-700 text-white volter-font"
            disabled={isProcessing}
          >
            {isProcessing ? 'Verificando...' : (isAdminUser(habboNameInput) ? 'Verificar Admin' : 'Verificar Motto')}
          </Button>
          <Button
            onClick={() => setStep(1)}
            variant="outline"
            className="w-full"
            disabled={isProcessing}
          >
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 3) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border border-gray-900 shadow-md">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg">
          <CardTitle className="text-center volter-font">Criar Senha para o Habbo Hub</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-700 mb-4">
            Sua conta Habbo foi verificada! Agora crie uma senha para acessar seu perfil no Habbo Hub.
          </p>
          <form onSubmit={(e) => handlePasswordAction(e, 'signup')} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha (min. 6 caracteres):</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha"
                required
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha:</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                required
                disabled={isProcessing}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white volter-font"
              disabled={isProcessing}
            >
              {isProcessing ? 'Criando Conta...' : 'Vincular e Criar Conta'}
            </Button>
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="w-full"
              disabled={isProcessing}
            >
              Voltar
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (step === 4) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border border-gray-900 shadow-md">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg">
          <CardTitle className="text-center volter-font">Fazer Login no Habbo Hub</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-700 mb-4">
            Sua conta Habbo está verificada. Por favor, insira sua senha do Habbo Hub para acessar.
          </p>
          <form onSubmit={(e) => handlePasswordAction(e, 'login')} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha do Habbo Hub:</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                disabled={isProcessing}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white volter-font"
              disabled={isProcessing}
            >
              {isProcessing ? 'Entrando...' : 'Entrar'}
            </Button>
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="w-full"
              disabled={isProcessing}
            >
              Voltar
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return null;
};
