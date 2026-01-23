/**
 * Utilitários para manipulação de hotéis Habbo
 */

export const HOTEL_DOMAINS = [
  'com.br', // Brazil
  'com',    // International/US
  'es',     // Spain
  'fr',     // France
  'de',     // Germany
  'it',     // Italy
  'nl',     // Netherlands
  'fi',     // Finland
  'com.tr'  // Turkey
] as const;

export const HOTEL_COUNTRIES = [
  { code: 'com', name: 'USA/UK', flag: '/flags/flagcom.png' },
  { code: 'br', name: 'Brasil/Portugal', flag: '/flags/flagbrazil.png' },
  { code: 'de', name: 'Alemanha', flag: '/flags/flagdeus.png' },
  { code: 'fr', name: 'França', flag: '/flags/flagfrance.png' },
  { code: 'it', name: 'Itália', flag: '/flags/flagitaly.png' },
  { code: 'es', name: 'Espanha', flag: '/flags/flagspain.png' },
  { code: 'nl', name: 'Holanda', flag: '/flags/flagnetl.png' },
  { code: 'tr', name: 'Turquia', flag: '/flags/flagtrky.png' },
  { code: 'fi', name: 'Finlândia', flag: '/flags/flafinland.png' }
] as const;

/**
 * Mapeia hotel para flag
 */
export const getHotelFlag = (hotel?: string): string => {
  const hotelFlags: { [key: string]: string } = {
    'com': '/flags/flagcom.png',
    'com.br': '/flags/flagbrazil.png',
    'br': '/flags/flagbrazil.png',
    'de': '/flags/flagdeus.png',
    'fr': '/flags/flagfrance.png',
    'it': '/flags/flagitaly.png',
    'es': '/flags/flagspain.png',
    'nl': '/flags/flagnetl.png',
    'tr': '/flags/flagtrky.png',
    'com.tr': '/flags/flagtrky.png',
    'fi': '/flags/flafinland.png',
  };
  return hotelFlags[hotel || ''] || '/flags/flagcom.png';
};

/**
 * Converte código de hotel para domínio completo
 */
export const hotelCodeToDomain = (code: string): string => {
  if (code === 'br') return 'com.br';
  if (code === 'tr') return 'com.tr';
  if (code === 'us' || code === 'com') return 'com';
  return code; // es, fr, de, it, nl, fi já são domínios
};

/**
 * Converte domínio de hotel para código
 */
export const hotelDomainToCode = (domain: string): string => {
  if (domain === 'com.br') return 'br';
  if (domain === 'com.tr') return 'tr';
  if (domain === 'com' || domain === 'us') return 'com';
  return domain; // es, fr, de, it, nl, fi já são códigos
};

/**
 * Normaliza hotel (ptbr -> br)
 */
export const normalizeHotel = (hotel: string): string => {
  return hotel === 'ptbr' ? 'br' : hotel;
};

