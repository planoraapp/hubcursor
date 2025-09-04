import React, { useState, useEffect } from 'react';
import { FunctionalConsole } from '@/components/console/FunctionalConsole';
import { PageBackground } from '@/components/layout/PageBackground';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';

const ConsolePopup: React.FC = () => {
  const { isLoggedIn: isUnifiedLoggedIn, loginWithPassword } = useUnifiedAuth();
  const { isLoggedIn: isAuthLoggedIn } = useAuth();
  const [loginForm, setLoginForm] = useState({ habboName: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  // Usar o estado de login que funciona
  const isLoggedIn = isAuthLoggedIn || isUnifiedLoggedIn;

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

  // Sempre mostrar o console, mesmo sem login
  // O console pode funcionar sem autenticação

  return (
    <div className="w-full h-auto min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header do popup */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-3 flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <img 
              src="https://raw.githubusercontent.com/planoraapp/hubcursor/main/public/assets/hubbeta.gif" 
              alt="HabboHub" 
              className="h-8 w-auto"
              style={{ imageRendering: 'pixelated' }}
            />
            <h1 className="text-white font-bold volter-font text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              Console HabboHub
            </h1>
          </div>
          <button
            onClick={() => window.close()}
            className="text-white/70 hover:text-white text-2xl font-bold"
            title="Fechar"
          >
            ×
          </button>
        </div>
        
        {/* Console com dimensões exatas */}
        <div className="w-full">
          <FunctionalConsole />
        </div>
      </div>
    </div>
  );
};

export default ConsolePopup;