
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
                    {/* Card de informações - mesma cor dos cabeçalhos dos modais */}
                    <div className="bg-white border-2 border-black rounded-lg shadow-lg">
                      <div
                        className="bg-yellow-400 border-b-2 border-black rounded-t-lg relative overflow-hidden flex flex-col space-y-1.5 text-center sm:text-left p-4 relative z-10"
                        style={{
                          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                          backgroundSize: '8px 8px'
                        }}
                      >
                        <div className="pixel-pattern absolute inset-0 opacity-20" />
                        <div className="flex items-center justify-between relative z-10">
                          <h2
                            className="tracking-tight flex items-center gap-2 text-white font-bold text-sm volter-font"
                            style={{
                              textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
                            }}
                          >
                            <span className="text-xl">📱</span>
                            Console Mobile
                          </h2>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="volter-font text-xs md:text-sm text-gray-800 mb-4 leading-relaxed drop-shadow-md max-w-2xl">
                          Abra o console em uma janela popup para uma experiência mais imersiva, 
                          ideal para uso em dispositivos móveis ou quando você quer focar apenas no console.
                        </p>
                        
                        {/* Botão abre popup - ícone em tamanho natural, console_active sobreposto com opacidade */}
                        <button
                          onClick={openPopupConsole}
                          className="group w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold volter-font px-6 py-4 rounded-lg border-2 border-black shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                          style={{
                            textShadow: '1px 1px 0px rgba(255,255,255,0.5)',
                            boxShadow: '4px 4px 0px rgba(0,0,0,0.3)',
                            fontSize: '16px'
                          }}
                        >
                          <span className="relative inline-block shrink-0">
                            <img
                              src="/assets/consoleoff.gif"
                              alt=""
                              className="block object-contain opacity-100 transition-opacity group-hover:opacity-0"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            <img
                              src="/assets/console_active.gif"
                              alt=""
                              className="absolute inset-0 size-full object-contain opacity-0 transition-opacity group-hover:opacity-100"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </span>
                          {t('buttons.openConsolePopup')}
                        </button>
                      </div>
                    </div>

                    {/* Card de funcionalidades - mesma cor dos cabeçalhos dos modais */}
                    <div className="bg-white border-2 border-black rounded-lg shadow-lg">
                      <div
                        className="bg-yellow-400 border-b-2 border-black rounded-t-lg relative overflow-hidden flex flex-col space-y-1.5 text-center sm:text-left p-4 relative z-10"
                        style={{
                          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                          backgroundSize: '8px 8px'
                        }}
                      >
                        <div className="pixel-pattern absolute inset-0 opacity-20" />
                        <div className="flex items-center justify-between relative z-10">
                          <h2
                            className="tracking-tight flex items-center gap-2 text-white font-bold text-sm volter-font"
                            style={{
                              textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
                            }}
                          >
                            <span className="text-xl">✨</span>
                            Funcionalidades
                          </h2>
                        </div>
                      </div>
                      <div className="p-6">
                        <ul className="volter-font space-y-3 text-gray-800 text-xs md:text-sm drop-shadow-md">
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

                    {/* Card de dicas - mesma cor dos cabeçalhos dos modais */}
                    {isLoggedIn && habboAccount && (
                      <div className="bg-white border-2 border-black rounded-lg shadow-lg">
                        <div
                          className="bg-yellow-400 border-b-2 border-black rounded-t-lg relative overflow-hidden flex flex-col space-y-1.5 text-center sm:text-left p-4 relative z-10"
                          style={{
                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                            backgroundSize: '8px 8px'
                          }}
                        >
                          <div className="pixel-pattern absolute inset-0 opacity-20" />
                          <div className="flex items-center justify-between relative z-10">
                            <h2
                              className="tracking-tight flex items-center gap-2 text-white font-bold text-sm volter-font"
                              style={{
                                textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
                              }}
                            >
                              <span className="text-xl">💡</span>
                              Dica Rápida
                            </h2>
                          </div>
                        </div>
                        <div className="p-6">
                          <p className="volter-font text-xs md:text-sm text-gray-800 leading-relaxed drop-shadow-md max-w-2xl">
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

