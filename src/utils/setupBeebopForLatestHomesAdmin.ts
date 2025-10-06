import { createBeebopAccountAdmin } from './createBeebopAccountAdmin';
import { createBeebopBackgroundAdmin } from './createBeebopBackgroundAdmin';

/**
 * Configura Beebop para aparecer nas últimas homes modificadas usando service key
 */
export async function setupBeebopForLatestHomesAdmin(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('🚀 [SETUP-BEEBOP-ADMIN] Iniciando configuração do Beebop para últimas homes...');

    // 1. Criar conta do Beebop
    const accountResult = await createBeebopAccountAdmin();
    if (!accountResult.success) {
      return {
        success: false,
        message: `Erro ao criar conta: ${accountResult.message}`
      };
    }

    // 2. Criar background do Beebop
    const backgroundResult = await createBeebopBackgroundAdmin();
    if (!backgroundResult.success) {
      return {
        success: false,
        message: `Erro ao criar background: ${backgroundResult.message}`
      };
    }

    console.log('✅ [SETUP-BEEBOP-ADMIN] Beebop configurado com sucesso para últimas homes!');
    return {
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
