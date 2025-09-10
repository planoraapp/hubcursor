import { getHotelConfig } from '@/config/hotels';
import { supabase } from '@/integrations/supabase/client';

export interface HabboUser {
  id: string;
  habbo_username: string;
  habbo_motto: string;
  habbo_avatar?: string;
  hotel: string;
  is_admin: boolean;
  is_online: boolean;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: HabboUser;
  error?: string;
  verificationCode?: string;
}

export interface VerificationResponse {
  success: boolean;
  userExists: boolean;
  verificationCode?: string;
  error?: string;
}

export class AuthService {
  // 1. VERIFICAR USUÁRIO E GERAR CÓDIGO (primeiro passo do login)
  static async checkUserExists(
    username: string,
    hotelId: string
  ): Promise<VerificationResponse> {
    try {
      console.log(`🔍 [AuthService] Verificando usuário: ${username} (${hotelId})`);

      const hotelConfig = getHotelConfig(hotelId);
      
      // Buscar usuário na API pública do hotel
      const userResponse = await fetch(
        `${hotelConfig.publicApiUrl}/users?name=${encodeURIComponent(username)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HabboHub/1.0'
          }
        }
      );

      if (!userResponse.ok) {
        console.log('❌ [AuthService] Usuário não encontrado na API do Habbo');
        return {
          success: false,
          userExists: false,
          error: 'Usuário não encontrado no hotel selecionado'
        };
      }

      const userData = await userResponse.json();
      console.log('✅ [AuthService] Usuário encontrado na API:', userData);

      // Verificar se já existe conta interna na TABELA ÚNICA
      const { data: existingAccount } = await supabase
        .from('habbo_accounts')
        .select('id, habbo_name, is_admin')
        .eq('habbo_name', username.toLowerCase())
        .eq('hotel', hotelId)
        .single();

      if (existingAccount) {
        console.log('✅ [AuthService] Conta interna já existe, pode fazer login com senha');
        return {
          success: true,
          userExists: true,
          verificationCode: undefined // Não precisa de verificação
        };
      }

      // Gerar código de verificação HUB-XXXXX
      const verificationCode = this.generateVerificationCode();
      console.log(`🔐 [AuthService] Código gerado: ${verificationCode}`);

      return {
        success: true,
        userExists: false,
        verificationCode
      };

    } catch (error) {
      console.error('❌ [AuthService] Erro ao verificar usuário:', error);
      return {
        success: false,
        userExists: false,
        error: 'Erro ao verificar usuário. Tente novamente.'
      };
    }
  }

  // 2. VERIFICAR CÓDIGO NO MOTTO E CRIAR CONTA (segundo passo)
  static async verifyCodeAndCreateAccount(
    username: string,
    verificationCode: string,
    hotelId: string
  ): Promise<AuthResponse> {
    try {
      console.log(`🔐 [AuthService] Verificando código: ${verificationCode} para ${username}`);

      const hotelConfig = getHotelConfig(hotelId);
      
      // Buscar usuário na API pública do hotel
      const userResponse = await fetch(
        `${hotelConfig.publicApiUrl}/users?name=${encodeURIComponent(username)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HabboHub/1.0'
          }
        }
      );

      if (!userResponse.ok) {
        return {
          success: false,
          error: 'Usuário não encontrado no hotel selecionado'
        };
      }

      const userData = await userResponse.json();

      // Verificar se o código está na motto
      if (!userData.motto || !userData.motto.includes(verificationCode)) {
        return {
          success: false,
          error: 'Código de verificação não encontrado na motto. Verifique se você colocou o código correto.'
        };
      }

      console.log('✅ [AuthService] Código verificado! Criando conta interna...');

      // Gerar senha aleatória de 6 dígitos
      const password = this.generatePassword();

      // Criar conta na tabela ÚNICA habbo_accounts
      const { data: newAccount, error: createError } = await supabase
        .from('habbo_accounts')
        .insert({
          habbo_name: username.toLowerCase(),
          habbo_id: userData.uniqueId || `hh${hotelConfig.id}-${username.toLowerCase()}`,
          hotel: hotelId,
          figure_string: userData.figureString || '',
          motto: userData.motto,
          is_admin: false,
          is_online: false
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ [AuthService] Erro ao criar conta:', createError);
        return {
          success: false,
          error: `Erro ao criar conta: ${createError.message}`
        };
      }

      console.log('✅ [AuthService] Conta criada com sucesso!');

      // Retornar dados do usuário
      const user: HabboUser = {
        id: newAccount.habbo_id,
        habbo_username: newAccount.habbo_name,
        habbo_motto: newAccount.motto,
        habbo_avatar: newAccount.figure_string,
        hotel: newAccount.hotel,
        is_admin: false,
        is_online: true,
        created_at: newAccount.created_at
      };

      return {
        success: true,
        user
      };

    } catch (error) {
      console.error('❌ [AuthService] Erro na verificação:', error);
      return {
        success: false,
        error: 'Erro ao verificar código. Tente novamente.'
      };
    }
  }

  // 3. LOGIN COM SENHA (para usuários que já têm conta)
  static async loginWithPassword(
    username: string,
    password: string,
    hotelId: string
  ): Promise<AuthResponse> {
    try {
      console.log(`🔐 [AuthService] Login com senha: ${username} (${hotelId})`);

      // Buscar conta na tabela ÚNICA habbo_accounts
      const { data: account, error: accountError } = await supabase
        .from('habbo_accounts')
        .select('*')
        .eq('habbo_name', username.toLowerCase())
        .eq('hotel', hotelId)
        .single();

      if (accountError || !account) {
        console.log('❌ [AuthService] Conta não encontrada:', accountError?.message);
        return {
          success: false,
          error: 'Conta não encontrada. Use "Verificar" para criar uma nova conta.'
        };
      }

      // Para contas admin, verificar senhas hardcoded
      let expectedPassword = '';
      if (username.toLowerCase() === 'habbohub') {
        expectedPassword = '151092';
      } else if (username.toLowerCase() === 'beebop') {
        expectedPassword = '290684';
      }
      
      if (expectedPassword && password !== expectedPassword) {
        console.log('❌ [AuthService] Senha incorreta para conta admin');
        return {
          success: false,
          error: 'Senha incorreta. Verifique e tente novamente.'
        };
      }

      // Atualizar status online
      await supabase
        .from('habbo_accounts')
        .update({ 
          is_online: true,
          updated_at: new Date().toISOString()
        })
        .eq('habbo_name', username.toLowerCase())
        .eq('hotel', hotelId);

      console.log('✅ [AuthService] Login realizado com sucesso:', username);

      // Retornar dados do usuário
      return {
        success: true,
        user: {
          id: account.habbo_id,
          habbo_username: account.habbo_name,
          habbo_motto: account.motto,
          habbo_avatar: account.figure_string,
          hotel: account.hotel,
          is_admin: account.is_admin || false,
          is_online: true,
          created_at: account.created_at
        }
      };

    } catch (error) {
      console.error('❌ [AuthService] Erro no login:', error);
      return {
        success: false,
        error: 'Erro interno. Tente novamente.'
      };
    }
  }

  // 4. LOGOUT
  static async logout(username: string, hotelId: string): Promise<AuthResponse> {
    try {
      console.log(`🔄 [AuthService] Logout: ${username}`);

      const { error } = await supabase
        .from('habbo_accounts')
        .update({ is_online: false, updated_at: new Date().toISOString() })
        .eq('habbo_name', username.toLowerCase())
        .eq('hotel', hotelId);

      if (error) {
        console.error('❌ [AuthService] Erro ao fazer logout:', error);
        return {
          success: false,
          error: 'Erro ao fazer logout'
        };
      }

      console.log('✅ [AuthService] Logout realizado com sucesso');
      return { success: true };

    } catch (error) {
      console.error('❌ [AuthService] Erro no logout:', error);
      return {
        success: false,
        error: 'Erro interno no logout'
      };
    }
  }

  // 5. CRIAR CONTAS DE ADMIN (habbohub e beebop)
  static async createAdminAccounts(): Promise<void> {
    try {
      console.log('🔧 [AuthService] Criando contas de admin...');

      // Criar habbohub
      await this.createHabbohubAccount();
      
      // Criar beebop
      await this.createBeebopAccount();

      console.log('✅ [AuthService] Contas de admin criadas!');

    } catch (error) {
      console.error('❌ [AuthService] Erro ao criar contas de admin:', error);
    }
  }

  // 6. GERAR CÓDIGO DE VERIFICAÇÃO HUB-XXXXX
  private static generateVerificationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'HUB-';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 7. GERAR SENHA DE 6 DÍGITOS
  private static generatePassword(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 8. CRIAR CONTA HABBOHUB
  private static async createHabbohubAccount(): Promise<void> {
    try {
      // Verificar se já existe na TABELA ÚNICA
      const { data: existing } = await supabase
        .from('habbo_accounts')
        .select('id')
        .eq('habbo_name', 'habbohub')
        .eq('hotel', 'br')
        .single();

      if (existing) {
        console.log('✅ [AuthService] Conta habbohub já existe');
        return;
      }

      // Buscar dados reais
      const response = await fetch('https://www.habbo.com.br/api/public/users?name=habbohub');
      let habboData = null;

      if (response.ok) {
        habboData = await response.json();
      } else {
        habboData = {
          uniqueId: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
          name: 'habbohub',
          motto: 'HUB-QQ797',
          figureString: 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
          profileVisible: false
        };
      }

      // Criar conta na TABELA ÚNICA
      await supabase.from('habbo_accounts').insert({
        habbo_name: 'habbohub',
        habbo_id: habboData.uniqueId || 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
        hotel: 'br',
        figure_string: habboData.figureString || 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
        motto: habboData.motto || 'HUB-QQ797',
        is_admin: true,
        is_online: false
      });

      console.log('✅ [AuthService] Conta habbohub criada!');

    } catch (error) {
      console.error('❌ [AuthService] Erro ao criar habbohub:', error);
    }
  }

  // 9. CRIAR CONTA BEEBOP
  private static async createBeebopAccount(): Promise<void> {
    try {
      // Verificar se já existe na TABELA ÚNICA
      const { data: existing } = await supabase
        .from('habbo_accounts')
        .select('id')
        .eq('habbo_name', 'beebop')
        .eq('hotel', 'br')
        .single();

      if (existing) {
        console.log('✅ [AuthService] Conta beebop já existe');
        return;
      }

      // Buscar dados reais
      const response = await fetch('https://www.habbo.com.br/api/public/users?name=beebop');
      let habboData = null;

      if (response.ok) {
        habboData = await response.json();
      } else {
        habboData = {
          uniqueId: 'hhbr-beebop-real-id',
          name: 'beebop',
          motto: 'BEEBOP-MOTTO',
          figureString: 'hr-100-0.hd-180-1',
          profileVisible: true
        };
      }

      // Criar conta na TABELA ÚNICA
      await supabase.from('habbo_accounts').insert({
        habbo_name: 'beebop',
        habbo_id: habboData.uniqueId || 'hhbr-beebop-real-id',
        hotel: 'br',
        figure_string: habboData.figureString || 'hr-100-0.hd-180-1',
        motto: habboData.motto || 'BEEBOP-MOTTO',
        is_admin: true,
        is_online: false
      });

      console.log('✅ [AuthService] Conta beebop criada!');

    } catch (error) {
      console.error('❌ [AuthService] Erro ao criar beebop:', error);
    }
  }

  // 10. VERIFICAR USUÁRIO EXISTENTE (compatibilidade)
  static async checkExistingUser(
    username: string,
    hotelId: string
  ): Promise<{ exists: boolean; needsPassword: boolean }> {
    try {
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('habbo_name, is_admin')
        .eq('habbo_name', username.toLowerCase())
        .eq('hotel', hotelId)
        .single();

      if (error || !data) {
        return { exists: false, needsPassword: false };
      }

      return { exists: true, needsPassword: true };

    } catch (error) {
      console.error('❌ [AuthService] Erro ao verificar usuário:', error);
      return { exists: false, needsPassword: false };
    }
  }
}
