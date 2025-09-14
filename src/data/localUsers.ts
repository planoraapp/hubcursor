// Dados de usuários locais (simulando banco de dados)
import { generateUniqueUsername, extractOriginalUsername, extractHotelFromUsername } from '@/utils/usernameUtils';

export interface LocalUser {
  id: string;
  habbo_username: string; // Nome com domínio (ex: ptbr-habbohub)
  habbo_motto: string;
  habbo_avatar?: string;
  password: string;
  is_admin: boolean;
  hotel: string;
  created_at: string;
}

export const LOCAL_USERS: LocalUser[] = [
  {
    id: '1',
    habbo_username: 'ptbr-habbohub', // Nome com domínio
    habbo_motto: 'HUB-ADMIN',
    habbo_avatar: 'https://www.habbo.com/habbo-imaging/avatarimage?size=l&figure=hd-190-7.ch-3030-66.lg-275-82.sh-290-80.hr-3811-61&direction=2&head_direction=2&img_format=png',
    password: '151092',
    is_admin: true,
    hotel: 'br',
    created_at: new Date().toISOString()
  }
];

// Função para buscar usuário por username (com ou sem domínio)
export const findUserByUsername = (username: string): LocalUser | undefined => {
  // Primeiro, tentar buscar pelo nome exato (com domínio)
  let user = LOCAL_USERS.find(user => 
    user.habbo_username.toLowerCase() === username.toLowerCase()
  );
  
  // Se não encontrar, tentar buscar pelo nome original (sem domínio)
  if (!user) {
    user = LOCAL_USERS.find(user => {
      const originalName = extractOriginalUsername(user.habbo_username);
      return originalName.toLowerCase() === username.toLowerCase();
    });
  }
  
  return user;
};

// Função para verificar credenciais
export const verifyCredentials = (username: string, password: string): { success: boolean; user?: LocalUser; error?: string } => {
  const user = findUserByUsername(username);
  
  if (!user) {
    return { success: false, error: 'Usuário não encontrado' };
  }
  
  if (user.password !== password) {
    return { success: false, error: 'Senha incorreta' };
  }
  
  return { success: true, user };
};

// Função para criar usuário com domínio
export const createUserWithDomain = (
  username: string, 
  hotel: string, 
  motto: string, 
  avatar: string, 
  password: string, 
  isAdmin: boolean = false
): LocalUser => {
  const domainUsername = generateUniqueUsername(username, hotel);
  
  const newUser: LocalUser = {
    id: (LOCAL_USERS.length + 1).toString(),
    habbo_username: domainUsername,
    habbo_motto: motto,
    habbo_avatar: avatar,
    password: password,
    is_admin: isAdmin,
    hotel: hotel,
    created_at: new Date().toISOString()
  };
  
  LOCAL_USERS.push(newUser);
  return newUser;
};
