import { getHotelConfig } from '@/config/hotels';
import { supabase } from '@/integrations/supabase/client';

export interface HabboUser {
  id: string;
  habbo_username: string;
  habbo_motto: string;
  habbo_avatar?: string;
  hotel: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: HabboUser;
  error?: string;
}

export class AuthService {
  // Verificar se usuário existe e tem o código na motto
  static async verifyUserWithCode(
    username: string, 
    verificationCode: string, 
    hotelId: string
  ): Promise<AuthResponse> {
    try {
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

      // Criar objeto do usuário verificado
      const user: HabboUser = {
        id: userData.uniqueId || `hh${hotelConfig.id}-${userData.name.toLowerCase()}`,
        habbo_username: userData.name,
        habbo_motto: userData.motto,
        habbo_avatar: `${hotelConfig.imagingUrl}/avatarimage?user=${userData.name}&headonly=1`,
        hotel: hotelConfig.id,
        created_at: new Date().toISOString()
      };

      return {
        success: true,
        user
      };

    } catch (error) {
      console.error('Erro na verificação:', error);
      return {
        success: false,
        error: 'Erro ao verificar usuário. Tente novamente.'
      };
    }
  }

  // Registrar usuário no sistema interno
  static async registerUser(
    user: HabboUser,
    password: string
  ): Promise<AuthResponse> {
    try {
      // Usar o sistema Supabase existente
      const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: user.habbo_username,
          motto: user.habbo_motto,
          password: password,
          action: 'register',
          hotel: user.hotel
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Erro ao criar conta'
        };
      }

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          user: data.user
        };
      } else {
        return {
          success: false,
          error: data.error || 'Erro ao criar conta'
        };
      }

    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        success: false,
        error: 'Erro ao criar conta. Tente novamente.'
      };
    }
  }

  // Login com senha
  static async loginWithPassword(
    username: string,
    password: string,
    hotelId: string
  ): Promise<AuthResponse> {
    try {
      // Usar o sistema Supabase existente
      const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password,
          action: 'login',
          hotel: hotelId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Usuário ou senha incorretos'
        };
      }

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          user: data.user
        };
      } else {
        return {
          success: false,
          error: data.error || 'Usuário ou senha incorretos'
        };
      }

    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: 'Erro ao fazer login. Tente novamente.'
      };
    }
  }

  // Verificar se usuário já tem conta
  static async checkExistingUser(
    username: string,
    hotelId: string
  ): Promise<{ exists: boolean; needsPassword: boolean }> {
    try {
      // Usar diretamente o Supabase
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('habbo_name, is_admin')
        .ilike('habbo_name', username)
        .eq('hotel', hotelId)
        .single();

      if (error) {
        console.log('🔍 [checkExistingUser] Usuário não encontrado:', username);
        return { exists: false, needsPassword: false };
      }

      console.log('✅ [checkExistingUser] Usuário encontrado:', data);
      return { 
        exists: true, 
        needsPassword: true // Todos os usuários precisam de senha
      };

    } catch (error) {
      console.error('❌ [checkExistingUser] Erro ao verificar usuário:', error);
      return { exists: false, needsPassword: false };
    }
  }
}
