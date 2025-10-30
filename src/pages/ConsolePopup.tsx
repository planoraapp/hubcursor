import React, { useEffect, Suspense } from 'react';
import PopupConsole from '@/components/console/PopupConsole';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/I18nContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { I18nProvider } from '@/contexts/I18nContext';
import { NotificationProvider } from '@/hooks/useNotification';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

// QueryClient otimizado para o popup
const popupQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

const ConsolePopupContent: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const { t } = useI18n();

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

  return (
    <div 
      className="w-full h-screen overflow-hidden"
      style={{ 
        backgroundImage: 'url(/assets/site/bghabbohub.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }}
    >
      {/* Console em tela cheia com dimensões de smartphone */}
      <div className="w-full h-full">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
              <p className="text-white text-sm">{t('messages.loadingConsole')}</p>
            </div>
          </div>
        }>
          <PopupConsole />
        </Suspense>
      </div>
    </div>
  );
};

const ConsolePopup: React.FC = () => {
  return (
    <QueryClientProvider client={popupQueryClient}>
      <AuthProvider>
        <I18nProvider>
          <NotificationProvider>
            <ConsolePopupContent />
            <Toaster />
          </NotificationProvider>
        </I18nProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default ConsolePopup;