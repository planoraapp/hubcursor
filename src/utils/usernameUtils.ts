// Utilitários para gerenciamento de nomes de usuário com domínio por hotel

export interface HotelConfig {
  code: string;
  name: string;
  domain: string;
  apiUrl: string;
  flag: string;
}

export const HOTEL_CONFIGS: Record<string, HotelConfig> = {
  'br': {
    code: 'br',
    name: 'Brasil/Portugal',
    domain: 'ptbr',
    apiUrl: 'https://www.habbo.com.br/api/public',
    flag: '/flags/flagbrazil.png'
  },
  'com': {
    code: 'com',
    name: 'UK e .com',
    domain: 'com',
    apiUrl: 'https://www.habbo.com/api/public',
    flag: '/flags/flagcom.png'
  },
  'fi': {
    code: 'fi',
    name: 'Finlândia',
    domain: 'fi',
    apiUrl: 'https://www.habbo.fi/api/public',
    flag: '/flags/flafinland.png'
  },
  'it': {
    code: 'it',
    name: 'Itália',
    domain: 'it',
    apiUrl: 'https://www.habbo.it/api/public',
    flag: '/flags/flagitaly.png'
  },
  'de': {
    code: 'de',
    name: 'Alemanha',
    domain: 'de',
    apiUrl: 'https://www.habbo.de/api/public',
    flag: '/flags/flagdeus.png'
  },
  'es': {
    code: 'es',
    name: 'Espanha',
    domain: 'es',
    apiUrl: 'https://www.habbo.es/api/public',
    flag: '/flags/flagspain.png'
  },
  'fr': {
    code: 'fr',
    name: 'França',
    domain: 'fr',
    apiUrl: 'https://www.habbo.fr/api/public',
    flag: '/flags/flagfrance.png'
  },
  'nl': {
    code: 'nl',
    name: 'Holanda',
    domain: 'nl',
    apiUrl: 'https://www.habbo.nl/api/public',
    flag: '/flags/flagnetl.png'
  },
  'tr': {
    code: 'tr',
    name: 'Turquia',
    domain: 'com.tr',
    apiUrl: 'https://www.habbo.com.tr/api/public',
    flag: '/flags/flagtrky.png'
  }
};

/**
 * Gera um nome de usuário único com domínio do hotel
 * Formato: hotel-nome (ex: ptbr-Beebop, com-admin, fi-user123)
 */
export function generateUniqueUsername(username: string, hotel: string): string {
  // Normalizar hotel para evitar inconsistências
  const normalizedHotel = hotel === 'ptbr' ? 'br' : hotel;
  
  const hotelConfig = HOTEL_CONFIGS[normalizedHotel];
  if (!hotelConfig) {
        return `ptbr-${username}`; // Preservar capitalização original
  }
  
  return `${hotelConfig.domain}-${username}`; // Preservar capitalização original
}

/**
 * Extrai o nome original do usuário de um nome com domínio
 * Ex: ptbr-habbohub -> habbohub
 */
export function extractOriginalUsername(domainUsername: string): string {
  const parts = domainUsername.split('-');
  if (parts.length < 2) {
    return domainUsername; // Retorna o nome original se não tiver domínio
  }
  
  // Remove o primeiro elemento (domínio) e junta o resto
  return parts.slice(1).join('-');
}

/**
 * Extrai o hotel de um nome com domínio
 * Ex: ptbr-habbohub -> br
 */
export function extractHotelFromUsername(domainUsername: string): string {
  const parts = domainUsername.split('-');
  if (parts.length < 2) {
    return 'br'; // Padrão se não tiver domínio
  }
  
  const domain = parts[0];
  
  // Encontrar o hotel correspondente ao domínio
  for (const [hotelCode, config] of Object.entries(HOTEL_CONFIGS)) {
    if (config.domain === domain) {
      return hotelCode; // Retorna 'br', 'com', etc.
    }
  }
  
  return 'br'; // Padrão se não encontrar
}

/**
 * Valida se um nome de usuário é válido
 */
export function isValidUsername(username: string): boolean {
  if (!username || username.length < 3 || username.length > 20) {
    return false;
  }
  
  // Permitir apenas letras, números, hífens e underscores
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(username);
}

/**
 * Gera um nome de usuário para exibição (sem domínio)
 */
export function getDisplayUsername(domainUsername: string): string {
  return extractOriginalUsername(domainUsername);
}

/**
 * Gera um nome completo para URLs (com domínio)
 */
export function getUrlUsername(username: string, hotel: string): string {
  return generateUniqueUsername(username, hotel);
}

/**
 * Obtém configuração do hotel
 */
export function getHotelConfig(hotel: string): HotelConfig {
  return HOTEL_CONFIGS[hotel] || HOTEL_CONFIGS['br'];
}

/**
 * Lista todos os hotéis disponíveis
 */
export function getAvailableHotels(): HotelConfig[] {
  return Object.values(HOTEL_CONFIGS);
}
