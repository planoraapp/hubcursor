
import React, { useEffect, useRef } from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { FunctionalConsole } from '@/components/console/FunctionalConsole';
import { TestConsole } from '@/components/console/TestConsole';
import { PageBackground } from '@/components/layout/PageBackground';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';

const Console: React.FC = () => {
  const { isLoggedIn, habboAccount } = useAuth();
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);

  const openPopupConsole = () => {
    // Calcular posição centralizada na tela
    const width = 1000;
    const height = 700;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    const popupFeatures = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no,directories=no`;
    
    const popup = window.open('/console-popup', 'ConsolePopup', popupFeatures);
    
    if (!popup) {
      alert('Popup bloqueado! Por favor, permita popups para este site.');
      return;
    }
    
    // Focar na janela popup
    popup.focus();
    
    // Listener para comunicação com o popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CONSOLE_POPUP_CLOSED') {
        window.removeEventListener('message', handleMessage);
        messageHandlerRef.current = null;
      }
    };
    
    // Limpar listener anterior se existir
    if (messageHandlerRef.current) {
      window.removeEventListener('message', messageHandlerRef.current);
    }
    
    messageHandlerRef.current = handleMessage;
    window.addEventListener('message', handleMessage);
  };

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
        messageHandlerRef.current = null;
      }
    };
  }, []);

  return (
    <EnhancedErrorBoundary
      resetOnPropsChange={true}
      onError={(error, errorInfo) => {
              }}
    >
      <PageBackground>
        <SidebarProvider>
          <div className="min-h-screen flex">
            <CollapsibleAppSidebar />
            <SidebarInset className="flex-1 bg-transparent">
              <div className="p-2 flex flex-col items-center w-full max-w-[375px] ml-12">
              <div className="mb-4 text-center w-full">
                <h1 className="text-2xl font-bold text-white mb-4 volter-font" 
                    style={{
                      textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                    }}>
                  Console do Habbo
                </h1>
                <p className="text-white/80 volter-font" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  Gerencie sua experiência no HabboHub
                </p>
                {/* Exemplo de uso do habboAccount */}
                {habboAccount && (
                  <div className="mt-2 p-2 bg-white/10 rounded-lg border border-white/20">
                    <p className="text-white/90 text-sm volter-font">
                      👤 Logado como: <strong>{habboAccount.habbo_username}</strong>
                    </p>
                    <p className="text-white/70 text-xs volter-font">
                      Hotel: {habboAccount.hotel} | Admin: {habboAccount.is_admin ? 'Sim' : 'Não'}
                    </p>
                  </div>
                )}
              </div>

              {/* Console funcional com dados reais do Habbo */}
              <div className="w-full max-w-[375px]">
                <FunctionalConsole />
                
                {/* Popup button positioned below console */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={openPopupConsole}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold volter-font px-8 py-4 rounded-lg border-2 border-black shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    style={{
                      textShadow: '1px 1px 0px rgba(255,255,255,0.5)',
                      boxShadow: '4px 4px 0px rgba(0,0,0,0.3)',
                      fontSize: '16px'
                    }}
                  >
                    Abrir Console em Pop-up
                  </button>
                </div>

              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </PageBackground>
    </EnhancedErrorBoundary>
  );
};

export default Console;

