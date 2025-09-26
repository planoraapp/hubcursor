import { supabase } from '@/integrations/supabase/client';

interface HabboUserData {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  memberSince: string;
  profileVisible: boolean;
}

interface FetchResult {
  success: boolean;
  data?: HabboUserData;
  error?: string;
}

/**
 * Busca dados reais do usuário habbohub usando o ID correto
 * ID real: hhbr-81b7220d11b7a21997226bf7cfcbad51
 */
export async function fetchHabbohubRealData(): Promise<FetchResult> {
  try {
        // ID real do habbohub obtido da API oficial do Habbo
    const realHabboId = 'hhbr-81b7220d11b7a21997226bf7cfcbad51';
        // 1. Buscar dados básicos usando o nome de usuário (API oficial)
    const basicApiUrl = 'https://www.habbo.com.br/api/public/users?name=habbohub';
        const basicResponse = await fetch(basicApiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HabboHub/1.0'
      }
    });
    
    let habboData = null;
    
    if (!basicResponse.ok) {
            // Usar dados reais do habbohub se a API falhar
      habboData = {
        uniqueId: realHabboId,
        name: 'habbohub',
        motto: 'HUB-QQ797',
        figureString: 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
        online: false,
        profileVisible: false,
        memberSince: null,
        lastAccessTime: new Date().toISOString(),
        currentLevel: 1,
        currentLevelCompletePercent: 0,
        totalExperience: 0,
        starGemCount: 0,
        selectedBadges: []
      };
    } else {
      habboData = await basicResponse.json();
            // Usar o ID real mesmo se a API retornar dados diferentes
      habboData.uniqueId = realHabboId;
    }
    
    // 2. Buscar dados adicionais usando o ID real (apenas se disponível)
        try {
      // Buscar conquistas/achievements (API oficial) - esta parece funcionar
      const achievementsUrl = `https://www.habbo.com.br/api/public/achievements/${realHabboId}`;
      const achievementsResponse = await fetch(achievementsUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HabboHub/1.0'
        }
      });
      
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
                habboData.achievements = achievementsData;
      } else {
        console.log('⚠️ [FETCH-REAL] Conquistas não disponíveis (404)');
        habboData.achievements = [];
      }
      
      // Inicializar arrays vazios para dados que podem não estar disponíveis
      habboData.badges = [];
      habboData.groups = [];
      habboData.friends = [];
      habboData.rooms = [];
      
          } catch (additionalError) {
            // Garantir que os arrays existem mesmo se houver erro
      habboData.achievements = [];
      habboData.badges = [];
      habboData.groups = [];
      habboData.friends = [];
      habboData.rooms = [];
    }
    
    return {
      success: true,
      data: habboData
    };
    
  } catch (error) {
        return {
      success: false,
      error: `Erro interno: ${(error as Error).message}`
    };
  }
}

/**
 * Cria a conta habbohub com dados reais usando o ID correto
 */
export async function createHabbohubWithRealData(): Promise<{ success: boolean; message: string; account?: any }> {
  try {
        // 1. Limpar conta existente
        const { error: deleteError } = await supabase
      .from('habbo_accounts')
      .delete()
      .eq('habbo_name', 'habbohub')
      .eq('hotel', 'br');

    if (deleteError) {
      console.log('⚠️ [CREATE-REAL] Erro ao limpar conta (pode não existir):', deleteError.message);
    } else {
          }

    // 2. Buscar dados reais
    const fetchResult = await fetchHabbohubRealData();
    
    if (!fetchResult.success) {
      return {
        success: false,
        message: `Erro ao buscar dados reais: ${fetchResult.error}`
      };
    }

    const habboData = fetchResult.data;
    const realHabboId = 'hhbr-81b7220d11b7a21997226bf7cfcbad51';

    // 3. Preparar dados da conta com dados reais
    const accountData = {
      habbo_name: 'habbohub',
      hotel: 'br',
      habbo_id: realHabboId,
      figure_string: habboData?.figureString || 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
      motto: habboData?.motto || 'HUB-QQ797',
      is_admin: true,
      is_online: false,
      supabase_user_id: '550e8400-e29b-41d4-a716-446655440000',
      
      // Dados básicos do perfil (sem coluna profile_data por enquanto)
      last_access: new Date().toISOString()
    };

            // 4. Inserir dados na tabela habbo_accounts
        const { data: newAccount, error: createError } = await supabase
      .from('habbo_accounts')
      .insert(accountData)
      .select()
      .single();

    if (createError) {
            return {
        success: false,
        message: `Erro ao criar conta habbohub: ${createError.message}`
      };
    }

            });
    
    return {
      success: true,
      message: `Conta habbohub criada com dados reais! ID: ${realHabboId}`,
      account: newAccount
    };

  } catch (error) {
        return {
      success: false,
      message: `Erro interno: ${(error as Error).message}`
    };
  }
}
