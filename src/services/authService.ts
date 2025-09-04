import { getHotelConfig } from '@/config/hotels';

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
      // Aqui você integraria com o Supabase para salvar o usuário
      // Por enquanto, vamos simular o registro
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          habbo_username: user.habbo_username,
          habbo_motto: user.habbo_motto,
          habbo_avatar: user.habbo_avatar,
          hotel: user.hotel,
          password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Erro ao criar conta'
        };
      }

      const registeredUser = await response.json();

      return {
        success: true,
        user: registeredUser
      };

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password,
          hotel: hotelId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Usuário ou senha incorretos'
        };
      }

      const userData = await response.json();

      return {
        success: true,
        user: userData
      };

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
      const response = await fetch(`/api/auth/check-user?username=${encodeURIComponent(username)}&hotel=${hotelId}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          exists: data.exists,
          needsPassword: data.needsPassword
        };
      }

      return { exists: false, needsPassword: false };

    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      return { exists: false, needsPassword: false };
    }
  }
}
