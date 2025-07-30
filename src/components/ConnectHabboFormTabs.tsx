
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getUserByName } from '../lib/habboApi';
import { supabase } from '../lib/supabaseClient';
import { generateVerificationCode } from './auth/AuthUtils';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export const ConnectHabboFormTabs = () => {
  const [habboNameInput, setHabboNameInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [userHabboId, setUserHabboId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('password');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUpWithHabbo, signInWithHabbo, verifyHabboMotto, getLinkedAccount } = useSupabaseAuth();

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
    try {
      console.log(`🔐 [ConnectHabbo] Attempting login by password for: ${currentHabboName}`);
      
      const { data: linkedAccount } = await supabase
        .from('habbo_accounts')
        .select('habbo_id')
        .eq('habbo_name', currentHabboName)
        .single();

      if (!linkedAccount) {
        toast({
          title: "Erro",
          description: "Conta não encontrada. Use a aba 'Verificação por Motto' para criar uma conta.",
          variant: "destructive"
        });
        return;
      }

      await signInWithHabbo(linkedAccount.habbo_id, password);
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!"
      });
      navigate('/');
    } catch (error: any) {
      console.error('❌ [ConnectHabbo] Login by password error:', error);
      toast({
        title: "Erro",
        description: error.message || 'Erro no login',
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
    try {
      console.log(`🔍 [ConnectHabbo] Starting motto verification for: ${currentHabboName}`);
      
      const habboUserCheck = await getUserByName(currentHabboName);
      if (!habboUserCheck) {
        toast({
          title: "Erro",
          description: `O Habbo "${currentHabboName}" não foi encontrado. Verifique o nome e se está online/perfil público.`,
          variant: "destructive"
        });
        return;
      }

      if (!habboUserCheck.motto) {
        toast({
          title: "Erro",
          description: `O Habbo "${currentHabboName}" está offline ou com perfil privado. Altere a privacidade do seu perfil e fique online.`,
          variant: "destructive"
        });
        return;
      }

      const newCode = generateVerificationCode();
      setVerificationCode(newCode);
      setUserHabboId(habboUserCheck.id);
      setStep(2);
      toast({
        title: "Código Gerado",
        description: `Copie o código "${newCode}" e cole-o na sua motto do Habbo Hotel.`
      });
    } catch (error) {
      console.error('❌ [ConnectHabbo] Motto verification init error:', error);
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
    if (!habboNameInput.trim() || !verificationCode) {
      toast({
        title: "Erro",
        description: "Erro na verificação. Por favor, reinicie o processo.",
        variant: "destructive"
      });
      setStep(1);
      return;
    }

    setIsProcessing(true);
    try {
      console.log(`✅ [ConnectHabbo] Verifying motto for: ${habboNameInput}`);
      
      const habboUser = await verifyHabboMotto(habboNameInput, verificationCode);
      
      if (habboUser) {
        setUserHabboId(habboUser.id);
        const linkedAccount = await getLinkedAccount(habboUser.id);
        
        if (linkedAccount) {
          setStep(4); // Login with existing password
          toast({
            title: "Sucesso",
            description: "Código verificado! Digite sua senha do Habbo Hub."
          });
        } else {
          setStep(3); // Create password
          toast({
            title: "Sucesso",
            description: "Código verificado! Crie uma senha para o seu Habbo Hub."
          });
        }
      }
    } catch (error: any) {
      console.error('❌ [ConnectHabbo] Motto verification error:', error);
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
        
        console.log(`🔐 [ConnectHabbo] Login existing user: ${habboNameInput}`);
        await signInWithHabbo(userHabboId, password);
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
        
        console.log(`📝 [ConnectHabbo] Creating new user: ${habboNameInput}`);
        await signUpWithHabbo(userHabboId, habboNameInput, password);
        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso!"
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error(`❌ [ConnectHabbo] Password action error (${actionType}):`, error);
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
    );
  }

  if (step === 2) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border border-gray-900 shadow-md">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg">
          <CardTitle className="text-center volter-font">Verifique sua Motto</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
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
          <Button
            onClick={handleVerifyMotto}
            className="w-full bg-green-600 hover:bg-green-700 text-white volter-font"
            disabled={isProcessing}
          >
            {isProcessing ? 'Verificando Motto...' : 'Verificar Motto'}
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
