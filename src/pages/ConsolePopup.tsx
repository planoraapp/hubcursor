import React, { useState, useEffect } from 'react';
import { FunctionalConsole } from '@/components/console/FunctionalConsole';
import { PageBackground } from '@/components/layout/PageBackground';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";

const ConsolePopup: React.FC = () => {
  const { isLoggedIn, habboAccount } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Listener para mensagens do parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CLOSE_POPUP') {
        window.close();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Função para notificar o parent window que o popup foi fechado
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (window.opener) {
        window.opener.postMessage({ type: 'CONSOLE_POPUP_CLOSED' }, '*');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Função para lidar com o fechamento do popup
  const handleClosePopup = () => {
    if (window.opener) {
      window.opener.postMessage({ type: 'CONSOLE_POPUP_CLOSED' }, '*');
    }
    window.close();
  };

  // Sempre mostrar o console, mesmo sem login
  // O console pode funcionar sem autenticação

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        backgroundImage: 'url(/assets/bghabbohub.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }}
    >
      <FunctionalConsole />
    </div>
  );
};

export default ConsolePopup;