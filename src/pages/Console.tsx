
import React, { useEffect, useRef } from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import PopupConsole from '@/components/console/PopupConsole';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import PageBanner from '@/components/ui/PageBanner';

const Console: React.FC = () => {
  const { isLoggedIn, habboAccount } = useAuth();
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);

  const openPopupConsole = () => {
    // Dimensões de smartphone (iPhone 6/7/8) - mantendo suas alterações locais
    const width = 375;
    const height = 667;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    const popupFeatures = `width=${width},height=${height},left=${left},top=${top},scrollbars=no,resizable=no,menubar=no,toolbar=no,location=no,status=no,directories=no`;
    
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
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <CollapsibleAppSidebar />
          <SidebarInset className="flex-1">
            <main 
              className="flex-1 p-8 min-h-screen" 
              style={{ 
                backgroundImage: 'url(/assets/bghabbohub.png)',
                backgroundRepeat: 'repeat'
              }}
            >
              <div className="max-w-7xl mx-auto">
                {/* Banner com fundo padrão e formatação correta */}
                <PageBanner 
                  title="🖥️ Console do Habbo"
                  subtitle="Gerencie sua experiência no HabboHub"
                />
                
                {/* Console e botão lado a lado para desktop */}
                <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start gap-8 mt-8">
                  {/* Console à esquerda */}
                  <div className="w-full max-w-[375px] mx-auto lg:mx-0">
                    <PopupConsole />
                  </div>
                  
                  {/* Botão à direita no desktop, centralizado no mobile */}
                  <div className="flex justify-center lg:justify-start lg:items-start lg:pt-4">
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
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </EnhancedErrorBoundary>
  );
};

export default Console;

