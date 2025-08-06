
import React, { useState } from 'react';
import { useUnifiedAuth } from '../hooks/useUnifiedAuth';
import { useToast } from '@/hooks/use-toast';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Info } from 'lucide-react';

export const HabboLoginForm = () => {
  const { 
    user, 
    loading, 
    isLoggedIn,
    checkUserExists, 
    generateVerificationCode, 
    registerWithMotto, 
    loginWithPassword 
  } = useUnifiedAuth();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Estados para o formulário
  const [habboName, setHabboName] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Se já estiver logado, redirecionar
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-lg volter-font text-white">Carregando...</div>
      </div>
    );
  }

  // Gerar novo código de verificação
  const handleGenerateCode = () => {
    const newCode = generateVerificationCode();
    setVerificationCode(newCode);
  };

  // Copiar código para clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(verificationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Código copiado!",
        description: "Cole na sua motto do Habbo"
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Copie manualmente o código",
        variant: "destructive"
      });
    }
  };

  // Primeiro cadastro (via motto)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habboName.trim() || !verificationCode.trim() || !password.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await registerWithMotto(habboName, verificationCode, password);
      toast({
        title: "Sucesso!",
        description: `Bem-vindo ao Habbo Hub, ${habboName}!`
      });
      navigate('/');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || 'Erro desconhecido',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Login com senha (usuários existentes)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habboName.trim() || !password.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await loginWithPassword(habboName, password);
      toast({
        title: "Sucesso!",
        description: `Bem-vindo de volta, ${habboName}!`
      });
      navigate('/');
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error.message || 'Verifique suas credenciais',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-repeat flex items-center justify-center p-4"
         style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-black">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/assets/habbohub.gif" alt="Habbo Hub" className="h-16" />
          </div>
          <CardTitle className="text-2xl volter-font text-gray-800">
            Habbo Hub
          </CardTitle>
          <CardDescription>
            Conecte sua conta Habbo para acessar o hub
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Primeiro Acesso</TabsTrigger>
            </TabsList>

            {/* Tab de Login */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-habbo" className="text-sm font-medium">
                    Nome Habbo
                  </label>
                  <Input
                    id="login-habbo"
                    type="text"
                    placeholder="Digite seu nome Habbo"
                    value={habboName}
                    onChange={(e) => setHabboName(e.target.value)}
                    className="border-2 border-gray-300 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-password" className="text-sm font-medium">
                    Senha
                  </label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-2 border-gray-300 focus:border-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Já tem conta? Use seu nome Habbo e a senha que criou no primeiro acesso.
                  </AlertDescription>
                </Alert>
              </form>
            </TabsContent>

            {/* Tab de Registro */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="register-habbo" className="text-sm font-medium">
                    Nome Habbo
                  </label>
                  <Input
                    id="register-habbo"
                    type="text"
                    placeholder="Digite seu nome Habbo"
                    value={habboName}
                    onChange={(e) => setHabboName(e.target.value)}
                    className="border-2 border-gray-300 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="register-password" className="text-sm font-medium">
                    Criar Senha
                  </label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Crie uma senha para próximos acessos"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-2 border-gray-300 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Código de Verificação</label>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleGenerateCode}
                      variant="outline"
                      className="flex-1"
                    >
                      Gerar Código
                    </Button>
                    {verificationCode && (
                      <Button
                        type="button"
                        onClick={handleCopyCode}
                        variant="outline"
                        className="px-3"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>

                  {verificationCode && (
                    <Badge variant="secondary" className="w-full justify-center p-2 font-mono text-lg">
                      {verificationCode}
                    </Badge>
                  )}

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      1. Gere um código acima<br/>
                      2. Copie e cole na sua motto do Habbo<br/>
                      3. Clique em "Cadastrar" abaixo
                    </AlertDescription>
                  </Alert>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2"
                  disabled={isLoading || !verificationCode}
                >
                  {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
