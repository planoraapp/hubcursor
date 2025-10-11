/**
 * Utilitários para conversão e padronização de hotéis
 * 
 * REGRA DE OURO:
 * - No banco: Sempre códigos curtos (br, com, es, etc)
 * - Em buscas: Sempre códigos curtos
 * - Em APIs: Converter para domínio quando necessário
 */

/**
 * Converte código do hotel para domínio de API
 * @param hotelCode - Código curto do hotel (br, com, es, etc)
 * @returns Domínio para usar em URLs de API
 * 
 * @example
 * getHotelApiDomain('br') → 'com.br'
 * getHotelApiDomain('com') → 'com'
 * getHotelApiDomain('tr') → 'com.tr'
 */
export function getHotelApiDomain(hotelCode: string): string {
  const domainMap: Record<string, string> = {
    'br': 'com.br',
    'com': 'com',
    'es': 'es',
    'fr': 'fr',
    'de': 'de',
    'it': 'it',
    'fi': 'fi',
    'nl': 'nl',
    'tr': 'com.tr'
  };
  
  return domainMap[hotelCode] || 'com';
}

/**
 * Constrói URL completa da API do Habbo
 * @param hotelCode - Código do hotel (br, com, etc)
 * @param path - Caminho da API (ex: 'users?name=habbohub')
 * 
 * @example
 * getHabboApiUrl('br', 'users?name=habbohub')
 * → 'https://www.habbo.com.br/api/public/users?name=habbohub'
 */
export function getHabboApiUrl(hotelCode: string, path: string): string {
  const domain = getHotelApiDomain(hotelCode);
  return `https://www.habbo.${domain}/api/public/${path}`;
}

/**
 * Constrói URL base do Habbo (sem /api/public)
 * @param hotelCode - Código do hotel
 * 
 * @example
 * getHabboBaseUrl('br') → 'https://www.habbo.com.br'
 * getHabboBaseUrl('com') → 'https://www.habbo.com'
 */
export function getHabboBaseUrl(hotelCode: string): string {
  const domain = getHotelApiDomain(hotelCode);
  return `https://www.habbo.${domain}`;
}

/**
 * Converte domínio de API de volta para código
 * @param domain - Domínio da API (com.br, com, es, etc)
 * @returns Código do hotel
 * 
 * @example
 * getHotelCodeFromDomain('com.br') → 'br'
 * getHotelCodeFromDomain('com') → 'com'
 */
export function getHotelCodeFromDomain(domain: string): string {
  const codeMap: Record<string, string> = {
    'com.br': 'br',
    'com': 'com',
    'es': 'es',
    'fr': 'fr',
    'de': 'de',
    'it': 'it',
    'fi': 'fi',
    'nl': 'nl',
    'com.tr': 'tr'
  };
  
  return codeMap[domain] || 'com';
}

/**
 * Valida se um código de hotel é válido
 * @param hotelCode - Código a validar
 */
export function isValidHotelCode(hotelCode: string): boolean {
  const validCodes = ['br', 'com', 'es', 'fr', 'de', 'it', 'fi', 'nl', 'tr'];
  return validCodes.includes(hotelCode);
}

/**
 * Normaliza código do hotel (garante que seja código curto)
 * @param input - Pode ser código (br) ou domínio (com.br)
 * @returns Código curto normalizado
 * 
 * @example
 * normalizeHotelCode('br') → 'br'
 * normalizeHotelCode('com.br') → 'br'
 * normalizeHotelCode('com') → 'com'
 */
export function normalizeHotelCode(input: string): string {
  // Se já é um código válido, retorna direto
  if (isValidHotelCode(input)) {
    return input;
  }
  
  // Se é um domínio, converte para código
  return getHotelCodeFromDomain(input);
}

/**
 * Mapa de hotéis com todas as informações
 */
export const HOTEL_INFO = {
  br: { code: 'br', domain: 'com.br', name: 'Brasil/Portugal', flag: '🇧🇷' },
  com: { code: 'com', domain: 'com', name: 'Internacional', flag: '🌍' },
  es: { code: 'es', domain: 'es', name: 'Espanha', flag: '🇪🇸' },
  fr: { code: 'fr', domain: 'fr', name: 'França', flag: '🇫🇷' },
  de: { code: 'de', domain: 'de', name: 'Alemanha', flag: '🇩🇪' },
  it: { code: 'it', domain: 'it', name: 'Itália', flag: '🇮🇹' },
  fi: { code: 'fi', domain: 'fi', name: 'Finlândia', flag: '🇫🇮' },
  nl: { code: 'nl', domain: 'nl', name: 'Holanda', flag: '🇳🇱' },
  tr: { code: 'tr', domain: 'com.tr', name: 'Turquia', flag: '🇹🇷' }
} as const;

export type HotelCode = keyof typeof HOTEL_INFO;

