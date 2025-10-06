import { createBeebopAccount } from './createBeebopAccount';
import { createBeebopBackground } from './createBeebopBackground';

/**
 * Configura Beebop para aparecer nas últimas homes modificadas
 * Cria a conta e o background no banco de dados
 */
export async function setupBeebopForLatestHomes(): Promise<{ success: boolean; message: string; details?: any }> {
  try {// 1. Criar conta do Beebop
    const accountResult = await createBeebopAccount();
    if (!accountResult.success) {
      return {
        success: false,
        message: `Erro ao criar conta: ${accountResult.message}`
      };
    }

    // 2. Criar background do Beebop
    const backgroundResult = await createBeebopBackground();
    if (!backgroundResult.success) {
      return {
        success: false,
        message: `Erro ao criar background: ${backgroundResult.message}`
      };
    }return {
      success: true,
      message: 'Beebop configurado com sucesso para aparecer nas últimas homes modificadas!',
      details: {
        account: accountResult.account,
        background: backgroundResult.background
      }
    };

  } catch (error) {
    return {
      success: false,
      message: `Erro interno: ${(error as Error).message}`
    };
  }
}

