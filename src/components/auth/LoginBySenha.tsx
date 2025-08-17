
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useLoginDebug } from '@/hooks/useLoginDebug';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const LoginBySenha = () => {
  const [habboName, setHabboName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  const { loginWithPassword } = useUnifiedAuth();
  const { debugLogin, debugInfo } = useLoginDebug();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habboName.trim() || !password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Debug mode for troubleshooting
      if (debugMode) {
        await debugLogin(habboName.trim());
        setIsLoading(false);
        return;
      }

      await loginWithPassword(habboName.trim(), password);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta, ${habboName}!`
      });
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Erro no login';
      
      if (error.message.includes('Conta não encontrada')) {
        errorMessage = 'Conta não encontrada. Use a aba "Missão" para se cadastrar.';
      } else if (error.message.includes('Senha incorreta')) {
        errorMessage = 'Senha incorreta. Verifique suas credenciais.';
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Credenciais inválidas. Verifique nome de usuário e senha.';
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold volter-font">Login por Senha</h3>
        <p className="text-sm text-gray-600">
          Entre com seu nome Habbo e senha do HabboHub
        </p>
      </div>

      {debugInfo && debugMode && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Debug Info:</strong><br/>
            Contas encontradas: {debugInfo.accountCount}<br/>
            Tem duplicatas: {debugInfo.hasDuplicates ? 'Sim' : 'Não'}<br/>
            Email de auth: {debugInfo.authEmail || 'Não encontrado'}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="habbo-name">Nome Habbo</Label>
          <Input
            id="habbo-name"
            type="text"
            placeholder="Digite seu nome Habbo"
            value={habboName}
            onChange={(e) => setHabboName(e.target.value)}
            disabled={isLoading}
            className="volter-font"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="volter-font"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="debug-mode"
            checked={debugMode}
            onChange={(e) => setDebugMode(e.target.checked)}
            className="w-4 h-4"
          />
          <Label htmlFor="debug-mode" className="text-xs text-gray-500">
            Modo Debug (para troubleshooting)
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full volter-font"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {debugMode ? 'Verificando...' : 'Entrando...'}
            </>
          ) : (
            debugMode ? 'Verificar Conta' : 'Entrar'
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Não tem conta? Use a aba "Missão" para se cadastrar.
        </p>
      </div>
    </div>
  );
};
