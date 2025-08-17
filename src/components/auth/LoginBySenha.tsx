
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useToast } from '@/hooks/use-toast';

export const LoginBySenha: React.FC = () => {
  const [habboName, setHabboName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const { loginWithPassword } = useUnifiedAuth();
  const { toast } = useToast();

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
    setLoginError('');
    
    try {
      await loginWithPassword(habboName, password);
      toast({
        title: "Sucesso!",
        description: `Bem-vindo de volta, ${habboName}!`
      });
    } catch (error: any) {
      console.error('Erro no login:', error);
      const errorMessage = error.message || 'Verifique suas credenciais';
      setLoginError(errorMessage);
      
      if (errorMessage.includes('Conta não encontrada')) {
        toast({
          title: "Conta não encontrada",
          description: "Use a aba 'Missão' para se cadastrar ou redefinir senha.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
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

      {loginError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {loginError}
          </AlertDescription>
        </Alert>
      )}

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
          <strong>Primeira vez aqui?</strong> Use a aba "Missão" para se cadastrar.<br/>
          <strong>Esqueceu a senha?</strong> Use também a aba "Missão" para redefinir.
        </AlertDescription>
      </Alert>
    </form>
  );
};
