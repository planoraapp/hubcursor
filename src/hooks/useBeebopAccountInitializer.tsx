import { useEffect } from 'react';
import { createBeebopAccount } from '@/utils/createBeebopAccount';

export const useBeebopAccountInitializer = () => {
  useEffect(() => {
    const initializeBeebopAccount = async () => {
      // Aguardar um pouco para garantir que a aplicação carregou
      setTimeout(async () => {
        try {
          await createBeebopAccount();
          console.log('✅ Inicialização da conta Beebop concluída');
        } catch (error) {
          console.error('❌ Erro na inicialização da conta Beebop:', error);
        }
      }, 2000);
    };

    initializeBeebopAccount();
  }, []);
};