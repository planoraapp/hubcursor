import React, { useState, useEffect } from 'react';
import { TabbedConsole } from '@/components/console/TabbedConsole';
import { PageBackground } from '@/components/layout/PageBackground';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";

const ConsolePopup: React.FC = () => {
  const { isLoggedIn, loginWithPassword } = useUnifiedAuth();
  const [loginForm, setLoginForm] = useState({ habboName: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Communicate with parent window
  useEffect(() => {
    const notifyParent = () => {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'CONSOLE_POPUP_OPENED' }, '*');
      }
    };
    
    notifyParent();
    
    // Notify on auth state changes
    const authChangeTimer = setInterval(() => {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ 
          type: 'AUTH_STATE_CHANGE', 
          isLoggedIn 
        }, '*');
      }
    }, 1000);

    return () => {
      clearInterval(authChangeTimer);
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'CONSOLE_POPUP_CLOSED' }, '*');
      }
    };
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.habboName || !loginForm.password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithPassword(loginForm.habboName, loginForm.password);
      if (result.error) {
        toast.error(result.error.message || 'Erro ao fazer login');
      } else {
        toast.success('Login realizado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro inesperado ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl volter-font">Console HabboHub</CardTitle>
            <CardDescription>
              Faça login para acessar seu console
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome Habbo</label>
                <Input
                  value={loginForm.habboName}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, habboName: e.target.value }))}
                  placeholder="Seu nome no Habbo"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Senha</label>
                <Input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Sua senha"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <PageBackground>
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <div 
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg"
              style={{
                width: '400px',
                height: '600px',
                minWidth: '400px',
                minHeight: '600px'
              }}
            >
              <TabbedConsole />
            </div>
          </div>
        </div>
      </PageBackground>
    </div>
  );
};

export default ConsolePopup;