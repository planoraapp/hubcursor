import { useEffect } from 'react';

/**
 * Hook para manter o backend Supabase ativo
 * Faz requisições periódicas ao backend para evitar que seja pausado por inatividade
 * (Projetos gratuitos do Supabase são pausados após 7 dias sem atividade)
 * 
 * Nota: Este hook complementa o cron job diário (api/supabase_start.js)
 * fornecendo atividade adicional durante o uso do site
 * 
 * IMPORTANTE: Erros são silenciados completamente - não aparecem no console
 */
export const useKeepOnline = () => {
  useEffect(() => {
    // Constantes do Supabase (mesmas usadas no client.ts)
    const SUPABASE_URL = "https://wueccgeizznjmjgmuscy.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc";

    // Função para fazer ping no backend (mantém sistema ativo)
    const pingBackend = async () => {
      // Usar fetch diretamente para ter controle total sobre tratamento de erros
      // Isso evita que o Supabase client logue erros no console
      try {
        // Interceptar console.error temporariamente para silenciar erros desta requisição
        const originalError = console.error;
        const originalWarn = console.warn;
        
        // Substituir temporariamente para filtrar erros relacionados ao keep-online
        console.error = (...args: any[]) => {
          const message = args.join(' ');
          // Não logar erros relacionados ao keep-online
          if (!message.includes('keep-online') && !message.includes('400')) {
            originalError.apply(console, args);
          }
        };
        
        console.warn = (...args: any[]) => {
          const message = args.join(' ');
          // Não logar warnings relacionados ao keep-online
          if (!message.includes('keep-online')) {
            originalWarn.apply(console, args);
          }
        };

        // Fazer requisição diretamente com fetch
        await fetch(`${SUPABASE_URL}/functions/v1/keep-online`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({})
        }).catch(() => {
          // Silenciar completamente - não logar no console
          // O importante é que a requisição foi feita, mesmo que falhe
        });

        // Restaurar console original após um pequeno delay
        setTimeout(() => {
          console.error = originalError;
          console.warn = originalWarn;
        }, 100);
      } catch (error: any) {
        // Silenciar erros de rede/parsing - não são críticos para keep-alive
        // O objetivo é apenas fazer requisições periódicas
      }
    };

    // Fazer ping imediatamente ao montar
    pingBackend();

    // Fazer ping a cada 5 minutos (300000ms)
    // Isso complementa o cron diário com atividade durante o uso
    const interval = setInterval(() => {
      pingBackend();
    }, 300000); // 5 minutos

    return () => {
      clearInterval(interval);
    };
  }, []); // Sem dependências - roda sempre que o componente monta
};
