import { createClient } from '@supabase/supabase-js';

/**
 * Cria a conta Beebop usando service key para contornar RLS
 */
export async function createBeebopAccountAdmin(): Promise<{ success: boolean; message: string; account?: any }> {
  try {
    // Usar service key para contornar RLS
    const supabaseUrl = "https://wueccgeizznjmjgmuscy.supabase.co";
    const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Limpar conta existente se houverconst { error: deleteError } = await supabase
      .from('habbo_accounts')
      .delete()
      .eq('habbo_name', 'Beebop')
      .eq('hotel', 'br');

    if (deleteError) {
      console.log('⚠️ [CREATE-BEEBOP-ADMIN] Erro ao limpar conta (pode não existir):', deleteError.message);
    } else {}

    // 2. Inserir nova conta
    const accountData = {
      habbo_name: 'Beebop',
      hotel: 'br',
      habbo_id: 'hhbr-00e6988dddeb5a1838658c854d62fe49',
      figure_string: 'hr-155-45.hd-208-10.ch-4165-91-1408.lg-4167-91.sh-3068-1408-90.ea-3169-92.fa-1206-90.ca-1804-1326',
      motto: 'HUB-ACTI1',
      is_admin: false,
      is_online: false,
      supabase_user_id: '00000000-0000-0000-0000-000000000002'
    };

    const { data: newAccount, error: createError } = await supabase
      .from('habbo_accounts')
      .insert(accountData)
      .select()
      .single();

    if (createError) {
      return {
        success: false,
        message: `Erro ao criar conta Beebop: ${createError.message}`
      };
    }return {
      success: true,
      message: 'Conta Beebop criada com sucesso!',
      account: newAccount
    };

  } catch (error) {
    return {
      success: false,
      message: `Erro interno: ${(error as Error).message}`
    };
  }
}

