import { supabase } from '@/integrations/supabase/client';

/**
 * Cria o background da home de Beebop na tabela user_home_backgrounds
 */
export async function createBeebopBackground(): Promise<{ success: boolean; message: string; background?: any }> {
  try {
    // 1. Limpar background existente se houverconst { error: deleteError } = await supabase
      .from('user_home_backgrounds')
      .delete()
      .eq('user_id', '00000000-0000-0000-0000-000000000002'); // UUID do Beebop

    if (deleteError) {
      console.log('⚠️ [CREATE-BEEBOP-BG] Erro ao limpar background (pode não existir):', deleteError.message);
    } else {}

    // 2. Inserir o novo background
    const backgroundData = {
      user_id: '00000000-0000-0000-0000-000000000002', // UUID do Beebop
      background_type: 'image',
      background_value: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/backgroundshome/wallpaper_BeachBunny.gif',
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

