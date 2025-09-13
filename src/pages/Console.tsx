
import React from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { FunctionalConsole } from '@/components/console/FunctionalConsole';
import { TestConsole } from '@/components/console/TestConsole';
import { PageBackground } from '@/components/layout/PageBackground';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Console: React.FC = () => {
  const { isLoggedIn, habboAccount } = useAuth();

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
      }
    };
    
    window.addEventListener('message', handleMessage);
  };

  return (
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
                {/* Exemplo de uso do currentUser */}
                {currentUser && (
                  <div className="mt-2 p-2 bg-white/10 rounded-lg border border-white/20">
                    <p className="text-white/90 text-sm volter-font">
                      👤 Logado como: <strong>{currentUser.habbo_name}</strong>
                    </p>
                    <p className="text-white/70 text-xs volter-font">
                      Hotel: {currentUser.hotel} | Admin: {currentUser.is_admin ? 'Sim' : 'Não'}
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

                {/* Botão temporário para limpar guestbook */}
                <div className="mt-4 flex justify-center gap-4">
                  <button
                    onClick={async () => {
                      if (window.confirm('Tem certeza que deseja limpar todos os comentários do guestbook (incluindo HabboHub)?')) {
                        try {
                          console.log('🧹 Limpando guestbook...');
                          // Usar a edge function diretamente
                          const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/delete-guestbook-comments', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                            },
                            body: JSON.stringify({
                              home_owner_user_id: 'hhbr-habbohub-user-id-12345' // ID da home do habbohub
                            })
                          });
                          
                          console.log('📡 Resposta da edge function:', response.status, response.statusText);
                          
                          if (response.ok) {
                            const result = await response.json();
                            console.log('✅ Resultado:', result);
                            alert('✅ Guestbook limpo com sucesso!');
                            window.location.reload();
                          } else {
                            const error = await response.json();
                            console.error('❌ Erro da edge function:', error);
                            alert(`❌ Erro: ${error.error}`);
                          }
                        } catch (error) {
                          console.error('❌ Erro ao limpar guestbook:', error);
                          alert(`❌ Erro ao limpar guestbook: ${error.message}`);
                        }
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold volter-font px-6 py-3 rounded-lg border-2 border-black shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    style={{
                      textShadow: '1px 1px 0px rgba(0,0,0,0.5)',
                      boxShadow: '4px 4px 0px rgba(0,0,0,0.3)',
                      fontSize: '14px'
                    }}
                  >
                    🧹 Limpar Guestbook (Incluindo HabboHub)
                  </button>
                  
                  <button
                    onClick={() => {
                      console.log('🔍 Testando edge function...');
                      fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/delete-guestbook-comments', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                        },
                        body: JSON.stringify({
                          home_owner_user_id: 'test'
                        })
                      })
                      .then(response => {
                        console.log('📡 Status:', response.status);
                        return response.json();
                      })
                      .then(data => {
                        console.log('📦 Dados:', data);
                        alert(`Status: ${data.success ? 'OK' : 'Erro'}\nMensagem: ${data.message || data.error}`);
                      })
                      .catch(error => {
                        console.error('❌ Erro:', error);
                        alert(`Erro: ${error.message}`);
                      });
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold volter-font px-6 py-3 rounded-lg border-2 border-black shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    style={{
                      textShadow: '1px 1px 0px rgba(0,0,0,0.5)',
                      boxShadow: '4px 4px 0px rgba(0,0,0,0.3)',
                      fontSize: '14px'
                    }}
                  >
                    🔍 Testar Edge Function
                  </button>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </PageBackground>
  );
};

export default Console;

