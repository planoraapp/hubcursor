
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Generate verification code with HUB- prefix
const generateVerificationCode = () => {
  const code = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `HUB-${code}`;
};

export const ConnectHabboForm = () => {
  const [habboNameInput, setHabboNameInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [userHabboId, setUserHabboId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    getLinkedAccount,
    signUpWithHabbo,
    signInWithHabbo,
    verifyHabboMotto
  } = useSupabaseAuth();

  const handleInitiateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habboNameInput.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu nome Habbo.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Always use the normal verification flow for all users
      const newCode = generateVerificationCode();
      setVerificationCode(newCode);
      setStep(2);
      toast({
        title: "Código Gerado",
        description: `Copie o código "${newCode}" e cole-o na sua motto do Habbo Hotel.`
      });
    } catch (err) {
      console.error('Erro ao iniciar verificação:', err);
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
      const habboUser = await verifyHabboMotto(habboNameInput, verificationCode);
      
      if (habboUser) {
        setUserHabboId(habboUser.uniqueId);
        
        const linkedAccount = await getLinkedAccount(habboUser.uniqueId);
        
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
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao verificar motto';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userHabboId) return;
    
    setIsProcessing(true);

    try {
      if (step === 4) { // Login with existing password
        if (!password) {
          toast({
            title: "Erro",
            description: "Por favor, digite sua senha.",
            variant: "destructive"
          });
          return;
        }
        
        await signInWithHabbo(userHabboId, password);
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
        navigate('/');
        
      } else if (step === 3) { // Create new account
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
        
        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso!"
        });
        navigate('/');
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na autenticação';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white border border-gray-900 shadow-md">
      <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg">
        <CardTitle className="text-center volter-font">
          {step === 1 && "Conectar Conta Habbo"}
          {step === 2 && "Verificar Motto"}
          {step === 3 && "Criar Senha"}
          {step === 4 && "Fazer Login"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {step === 1 && (
          <form onSubmit={handleInitiateVerification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Digite seu nome Habbo:
              </label>
              <Input
                type="text"
                value={habboNameInput}
                onChange={(e) => setHabboNameInput(e.target.value)}
                placeholder="Nome do seu Habbo"
                required
                disabled={isProcessing}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white volter-font"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processando...' : 'Gerar Código'}
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-4 text-center">
            <p className="text-gray-700">Copie este código para sua motto no Habbo Hotel:</p>
            <div
              className="bg-gray-100 p-3 rounded-lg border border-gray-300 cursor-pointer"
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
            </div>
            <p className="text-sm text-gray-600">Certifique-se de estar online e com o perfil público.</p>
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
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordAction} className="space-y-4">
            <p className="text-gray-700">Crie uma senha para seu Habbo Hub:</p>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova Senha (min. 6 caracteres)"
              required
              disabled={isProcessing}
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar Senha"
              required
              disabled={isProcessing}
            />
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white volter-font"
              disabled={isProcessing}
            >
              {isProcessing ? 'Criando Conta...' : 'Criar Conta'}
            </Button>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handlePasswordAction} className="space-y-4">
            <p className="text-gray-700">Sua conta Habbo Hub já existe. Digite sua senha:</p>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              disabled={isProcessing}
            />
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white volter-font"
              disabled={isProcessing}
            >
              {isProcessing ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
