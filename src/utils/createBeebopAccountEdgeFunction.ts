/**
 * Cria a conta Beebop usando edge function para contornar RLS
 */
export async function createBeebopAccountEdgeFunction(): Promise<{ success: boolean; message: string; account?: any }> {
  try {
    console.log('🚀 [CREATE-BEEBOP-EDGE] Iniciando criação via edge function...');

    const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/setup-beebop-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk'
      },
      body: JSON.stringify({
        action: 'create_beebop_account'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: `Edge function falhou: ${errorData.error || 'Erro desconhecido'}`
      };
    }

    const result = await response.json();
    console.log('✅ [CREATE-BEEBOP-EDGE] Conta Beebop criada com sucesso via edge function!');
    
    return {
      success: true,
      message: 'Conta Beebop criada com sucesso via edge function!',
      account: result.account
    };

  } catch (error) {
    return {
      success: false,
      message: `Erro interno: ${(error as Error).message}`
    };
  }
}
