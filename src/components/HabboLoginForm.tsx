
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useNavigate } from 'react-router-dom';

export const HabboLoginForm = () => {
  const [habboName, setHabboName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // 1: input name, 2: motto verification, 3: create password, 4: login with password
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    checkUserExists,
    generateVerificationCode,
    registerWithMotto,
    loginWithPassword
  } = useUnifiedAuth();

  const { toast } = useToast();
  const navigate = useNavigate();

  // Etapa 1: Inserir nome Habbo
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habboName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu nome Habbo.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const userExists = await checkUserExists(habboName);
      
      if (userExists) {
        // Usuário existe - ir para login com senha
        setIsNewUser(false);
        setStep(4);
      } else {
        // Usuário novo - ir para verificação de motto
        setIsNewUser(true);
        const newCode = generateVerificationCode();
        setVerificationCode(newCode);
        setStep(2);
        toast({
          title: "Código Gerado",
          description: `Copie o código "${newCode}" e cole-o na sua motto do Habbo Hotel.`
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao verificar usuário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Etapa 2: Verificar motto (apenas novos usuários)
  const handleMottoVerification = async () => {
    setIsLoading(true);
    
    try {
      await verifyHabboMotto(habboName, verificationCode);
      setStep(3);
      toast({
        title: "Sucesso",
        description: "Código verificado! Agora crie uma senha para sua conta."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || 'Erro ao verificar motto',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Etapa 3: Criar senha (apenas novos usuários)
  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    setIsLoading(true);
    
    try {
      await registerWithMotto(habboName, verificationCode, password);
      toast({
        title: "Sucesso",
        description: `Bem-vindo ao Habbo Hub, ${habboName}!`
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || 'Erro ao criar conta',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Etapa 4: Login com senha (usuários existentes)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast({
        title: "Erro",
        description: "Por favor, digite sua senha.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await loginWithPassword(habboName, password);
      toast({
        title: "Sucesso",
        description: `Bem-vindo de volta, ${habboName}!`
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || 'Erro no login',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setHabboName('');
    setPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setIsNewUser(false);
  };

  return (
    <div className="min-h-screen bg-repeat bg-cover flex items-center justify-center p-4"
         style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <Card className="w-full max-w-md bg-white border-2 border-gray-900 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg">
          <CardTitle className="text-center volter-font text-xl">
            {step === 1 && "Habbo Hub - Login"}
            {step === 2 && "Verificar Motto"}
            {step === 3 && "Criar Senha"}
            {step === 4 && "Digite sua Senha"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Etapa 1: Nome Habbo */}
          {step === 1 && (
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <label htmlFor="habboName" className="block text-sm font-medium text-gray-700 mb-2 volter-font">
                  Nome Habbo:
                </label>
                <Input
                  id="habboName"
                  type="text"
                  value={habboName}
                  onChange={(e) => setHabboName(e.target.value)}
                  placeholder="Digite seu nome Habbo"
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white volter-font py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'Continuar'}
              </Button>
            </form>
          )}

          {/* Etapa 2: Verificação de Motto */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-gray-700 text-sm">
                Para criar sua conta, copie este código para sua motto no Habbo Hotel:
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
                <span className="text-sm text-gray-500">Clique para copiar</span>
              </div>
              <p className="text-gray-700 text-sm">
                Certifique-se de estar online no Habbo e com perfil público.
              </p>
              <Button
                onClick={handleMottoVerification}
                className="w-full bg-green-600 hover:bg-green-700 text-white volter-font"
                disabled={isLoading}
              >
                {isLoading ? 'Verificando Motto...' : 'Verificar Motto'}
              </Button>
              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Voltar
              </Button>
            </div>
          )}

          {/* Etapa 3: Criar Senha */}
          {step === 3 && (
            <form onSubmit={handleCreatePassword} className="space-y-4">
              <p className="text-gray-700 text-sm mb-4">
                Motto verificada com sucesso! Agora crie uma senha para acessar sua conta:
              </p>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 volter-font">
                  Nova Senha (mín. 6 caracteres):
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crie uma senha"
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 volter-font">
                  Confirmar Senha:
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white volter-font py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Criando Conta...' : 'Criar Conta'}
              </Button>
              
              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Voltar
              </Button>
            </form>
          )}

          {/* Etapa 4: Login com Senha */}
          {step === 4 && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <p className="text-gray-700 text-sm mb-4">
                Bem-vindo de volta, <strong>{habboName}</strong>! Digite sua senha:
              </p>
              
              <div>
                <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-2 volter-font">
                  Senha:
                </label>
                <Input
                  id="loginPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white volter-font py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
              
              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Trocar Usuário
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
