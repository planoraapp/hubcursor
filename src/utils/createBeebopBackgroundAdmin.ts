import { createClient } from '@supabase/supabase-js';

/**
 * Cria o background da home de Beebop usando service key para contornar RLS
 */
export async function createBeebopBackgroundAdmin(): Promise<{ success: boolean; message: string; background?: any }> {
  try {
    // Usar service key para contornar RLS
    const supabaseUrl = "https://wueccgeizznjmjgmuscy.supabase.co";
    const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Limpar background existente se houverconst { error: deleteError } = await supabase
      .from('user_home_backgrounds')
      .delete()
      .eq('user_id', '00000000-0000-0000-0000-000000000002');

    if (deleteError) {
      console.log('⚠️ [CREATE-BEEBOP-BG-ADMIN] Erro ao limpar background (pode não existir):', deleteError.message);
    } else {}

    // 2. Inserir o novo background
    const backgroundData = {
      user_id: '00000000-0000-0000-0000-000000000002',
      background_type: 'image',
      background_value: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/backgroundshome/bg_bathroom_tile.gif',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newBackground, error: createError } = await supabase
      .from('user_home_backgrounds')
      .insert(backgroundData)
      .select()
      .single();

    if (createError) {
      return {
        success: false,
        message: `Erro ao criar background Beebop: ${createError.message}`
      };
    }return {
      success: true,
      message: 'Background Beebop criado com sucesso!',
      background: newBackground
    };

  } catch (error) {
    return {
      success: false,
      message: `Erro interno: ${(error as Error).message}`
    };
  }
}

