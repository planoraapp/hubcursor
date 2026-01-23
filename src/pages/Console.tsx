
import React, { useEffect, useRef } from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { FunctionalConsole } from '@/components/console/FunctionalConsole';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/I18nContext';
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
                  title="Console do Habbo"
                  subtitle="Gerencie sua experiência no HabboHub"
                  backgroundImage={getBannerImageBySeed('console')}
                  icon="/assets/consoleoff.gif"
                />
                
                {/* Console e informações (responsivo) */}
                <div className="mt-8 flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
                  {/* Console principal */}
                  <div className="w-full max-w-[375px] flex-shrink-0">
                    <div className="relative">
                      {/* Sombra e efeito de profundidade */}
                      <div className="absolute -inset-2 bg-gradient-to-br from-yellow-400/20 via-transparent to-transparent rounded-lg blur-xl opacity-50"></div>
                      <div className="relative">
                        <FunctionalConsole />
                      </div>
                    </div>
                  </div>
                  
                  {/* Painel lateral com informações e ações */}
                  <div className="w-full max-w-[375px] lg:max-w-md space-y-6">
                    {/* Card de informações */}
                    <div className="bg-white border-2 border-black rounded-lg shadow-lg">
                      <div 
                        className="p-3 border-b-2 border-black rounded-t-lg flex items-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                          backgroundImage: 'url(/assets/site/bghabbohub.png)',
                          backgroundSize: 'cover'
                        }}
                      >
                        <span className="text-xl">📱</span>
                        <h3 className="font-bold text-white volter-font text-sm" style={{
                          textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                        }}>
                          Console Mobile
                        </h3>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                          Abra o console em uma janela popup para uma experiência mais imersiva, 
                          ideal para uso em dispositivos móveis ou quando você quer focar apenas no console.
                        </p>
                        
                        {/* Botão abre popup melhorado */}
                        <button
                          onClick={openPopupConsole}
                          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold volter-font px-6 py-4 rounded-lg border-2 border-black shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                          style={{
                            textShadow: '1px 1px 0px rgba(255,255,255,0.5)',
                            boxShadow: '4px 4px 0px rgba(0,0,0,0.3)',
                            fontSize: '16px'
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                          </svg>
                          {t('buttons.openConsolePopup')}
                        </button>
                      </div>
                    </div>

                    {/* Card de funcionalidades */}
                    <div className="bg-white border-2 border-black rounded-lg shadow-lg">
                      <div 
                        className="p-3 border-b-2 border-black rounded-t-lg flex items-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                          backgroundImage: 'url(/assets/site/bghabbohub.png)',
                          backgroundSize: 'cover'
                        }}
                      >
                        <span className="text-xl">✨</span>
                        <h3 className="font-bold text-white volter-font text-sm" style={{
                          textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                        }}>
                          Funcionalidades
                        </h3>
                      </div>
                      <div className="p-6">
                        <ul className="space-y-3 text-gray-800 text-sm">
                          <li className="flex items-start gap-3">
                            <span className="text-yellow-600 mt-0.5 font-bold">•</span>
                            <span>Visualize e gerencie seu perfil do Habbo</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-yellow-600 mt-0.5 font-bold">•</span>
                            <span>Explore fotos de amigos e feed global</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-yellow-600 mt-0.5 font-bold">•</span>
                            <span>Converse com seus amigos em tempo real</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-yellow-600 mt-0.5 font-bold">•</span>
                            <span>Gerencie badges, quartos e grupos</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-yellow-600 mt-0.5 font-bold">•</span>
                            <span>Interaja com fotos e comentários</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Card de dicas */}
                    {isLoggedIn && habboAccount && (
                      <div className="bg-white border-2 border-black rounded-lg shadow-lg">
                        <div 
                          className="p-3 border-b-2 border-black rounded-t-lg flex items-center gap-2"
                          style={{
                            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                            backgroundImage: 'url(/assets/site/bghabbohub.png)',
                            backgroundSize: 'cover'
                          }}
                        >
                          <span className="text-xl">💡</span>
                          <h3 className="font-bold text-white volter-font text-sm" style={{
                            textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                          }}>
                            Dica Rápida
                          </h3>
                        </div>
                        <div className="p-6">
                          <p className="text-gray-800 text-sm leading-relaxed">
                            Você está logado como <strong className="text-yellow-600">{habboAccount.habbo_name}</strong>. 
                            Use o console para explorar perfis de outros usuários, descobrir novas fotos e manter contato com seus amigos!
                          </p>
                        </div>
                      </div>
                    )}
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

