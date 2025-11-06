
import React, { useEffect, useRef } from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { FunctionalConsole } from '@/components/console/FunctionalConsole';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import PageBanner from '@/components/ui/PageBanner';
import { getBannerImageBySeed } from '@/utils/bannerUtils';
import { Footer } from '@/components/Footer';

const Console: React.FC = () => {
  const { isLoggedIn, habboAccount } = useAuth();
  const { t } = useI18n();
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);

  const openPopupConsole = () => {
    // Calcular posição centralizada na tela com dimensões adequadas para o console
    const width = 400; // Largura com margem para bordas da janela
    const height = 850; // Altura com margem para bordas da janela
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    const popupFeatures = `width=${width},height=${height},left=${left},top=${top},scrollbars=no,resizable=yes,menubar=no,toolbar=no,location=no,status=no,directories=no`;
    
    const popup = window.open('/console-popup', 'ConsolePopup', popupFeatures);
    
    if (!popup) {
      alert(t('messages.popupBlocked'));
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
                backgroundImage: 'url(/assets/site/bghabbohub.png)',
                backgroundRepeat: 'repeat'
              }}
            >
              <div className="max-w-7xl mx-auto">
                {/* Banner com fundo padrão e formatação correta */}
                <PageBanner 
                  title="🖥️ Console do Habbo"
                  subtitle="Gerencie sua experiência no HabboHub"
                  backgroundImage={getBannerImageBySeed('console')}
                />
                
                {/* Console e botão lado a lado */}
                <div className="flex justify-center mt-8 gap-6">
                  <div className="w-full max-w-[375px]">
                    <FunctionalConsole />
                  </div>
                  
                  {/* Popup button positioned to the right of console */}
                  <div className="flex items-start pt-4">
                    <button
                      onClick={openPopupConsole}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold volter-font px-6 py-3 rounded-lg border-2 border-black shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 whitespace-nowrap"
                      style={{
                        textShadow: '1px 1px 0px rgba(255,255,255,0.5)',
                        boxShadow: '4px 4px 0px rgba(0,0,0,0.3)',
                        fontSize: '14px'
                      }}
                    >
                      {t('buttons.openConsolePopup')}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Footer Disclaimer */}
              <Footer />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </EnhancedErrorBoundary>
  );
};

export default Console;

