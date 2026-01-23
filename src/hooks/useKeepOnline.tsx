import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para manter o backend Supabase ativo
 * Faz requisições periódicas ao backend para evitar que seja pausado por inatividade
 * (Projetos gratuitos do Supabase são pausados após 7 dias sem atividade)
 * 
 * Nota: Este hook complementa o cron job diário (api/supabase_start.js)
 * fornecendo atividade adicional durante o uso do site
 */
export const useKeepOnline = () => {
  useEffect(() => {
    // Função para fazer ping no backend (mantém sistema ativo)
    const pingBackend = async () => {
      try {
        // Chamar Edge Function que apenas faz ping no banco
        // Não precisa de parâmetros - apenas mantém o sistema ativo
        const { error } = await supabase.functions.invoke('keep-online', {
          body: {} // Body vazio - apenas ping
        });

        // Silenciar erros - o importante é que a requisição foi feita
        // Mesmo erros 400/500 indicam que o sistema está processando requisições
        if (error && error.status >= 500) {
          // Apenas logar erros críticos de servidor
          console.error('[KEEP ONLINE] Server error:', error);
        }
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
