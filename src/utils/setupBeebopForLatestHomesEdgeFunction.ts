/**
 * Configura Beebop para aparecer nas últimas homes modificadas usando edge function
 */
export async function setupBeebopForLatestHomesEdgeFunction(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('🚀 [SETUP-BEEBOP-EDGE] Iniciando configuração do Beebop via edge function...');

    // 1. Criar conta do Beebop
    const accountResponse = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/setup-beebop-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk'
      },
      body: JSON.stringify({
        action: 'create_beebop_account'
      })
    });

    if (!accountResponse.ok) {
      const errorData = await accountResponse.json();
      return {
        success: false,
        message: `Erro ao criar conta: ${errorData.error || 'Erro desconhecido'}`
      };
    }

    const accountResult = await accountResponse.json();

    // 2. Criar background do Beebop
    const backgroundResponse = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/setup-beebop-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk'
      },
      body: JSON.stringify({
        action: 'create_beebop_background'
      })
    });

    if (!backgroundResponse.ok) {
      const errorData = await backgroundResponse.json();
      return {
        success: false,
        message: `Erro ao criar background: ${errorData.error || 'Erro desconhecido'}`
      };
    }

    const backgroundResult = await backgroundResponse.json();

    console.log('✅ [SETUP-BEEBOP-EDGE] Beebop configurado com sucesso via edge function!');
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
