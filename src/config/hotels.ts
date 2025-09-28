// Configuração completa dos hotéis Habbo para sistema de login
export interface HotelConfig {
  id: string;
  name: string;
  domain: string;
  flag: string;
  apiUrl: string;
  imagingUrl: string;
  publicApiUrl: string;
}

export const HOTELS_CONFIG: Record<string, HotelConfig> = {
  brazil: {
    id: 'br',
    name: 'Brasil',
    domain: 'com.br',
    flag: '/flags/flagbrazil.png',
    apiUrl: 'https://www.habbo.com.br',
    imagingUrl: 'https://www.habbo.com.br/habbo-imaging',
    publicApiUrl: 'https://www.habbo.com.br/api/public'
  },
  international: {
    id: 'com',
    name: 'Internacional',
    domain: 'com',
    flag: '/flags/flagcom.png',
    apiUrl: 'https://www.habbo.com',
    imagingUrl: 'https://www.habbo.com/habbo-imaging',
    publicApiUrl: 'https://www.habbo.com/api/public'
  },
  spain: {
    id: 'es',
    name: 'España',
    domain: 'es',
    flag: '/flags/flagspain.png',
    apiUrl: 'https://www.habbo.es',
    imagingUrl: 'https://www.habbo.es/habbo-imaging',
    publicApiUrl: 'https://www.habbo.es/api/public'
  },
  france: {
    id: 'fr',
    name: 'France',
    domain: 'fr',
    flag: '/flags/flagfrance.png',
    apiUrl: 'https://www.habbo.fr',
    imagingUrl: 'https://www.habbo.fr/habbo-imaging',
    publicApiUrl: 'https://www.habbo.fr/api/public'
  },
  germany: {
    id: 'de',
    name: 'Deutschland',
    domain: 'de',
    flag: '/flags/flagdeus.png',
    apiUrl: 'https://www.habbo.de',
    imagingUrl: 'https://www.habbo.de/habbo-imaging',
    publicApiUrl: 'https://www.habbo.de/api/public'
  },
  italy: {
    id: 'it',
    name: 'Italia',
    domain: 'it',
    flag: '/flags/flagitaly.png',
    apiUrl: 'https://www.habbo.it',
    imagingUrl: 'https://www.habbo.it/habbo-imaging',
    publicApiUrl: 'https://www.habbo.it/api/public'
  },
  netherlands: {
    id: 'nl',
    name: 'Nederland',
    domain: 'nl',
    flag: '/flags/flagnetl.png',
    apiUrl: 'https://www.habbo.nl',
    imagingUrl: 'https://www.habbo.nl/habbo-imaging',
    publicApiUrl: 'https://www.habbo.nl/api/public'
  },
  finland: {
    id: 'fi',
    name: 'Suomi',
    domain: 'fi',
    flag: '/flags/flafinland.png',
    apiUrl: 'https://www.habbo.fi',
    imagingUrl: 'https://www.habbo.fi/habbo-imaging',
    publicApiUrl: 'https://www.habbo.fi/api/public'
  },
  turkey: {
    id: 'tr',
    name: 'Türkiye',
    domain: 'com.tr',
    flag: '/flags/flagtrky.png',
    apiUrl: 'https://www.habbo.com.tr',
    imagingUrl: 'https://www.habbo.com.tr/habbo-imaging',
    publicApiUrl: 'https://www.habbo.com.tr/api/public'
  }
};

export const getHotelConfig = (hotelId: string): HotelConfig => {
  return HOTELS_CONFIG[hotelId] || HOTELS_CONFIG.brazil;
};

export const getAllHotels = (): HotelConfig[] => {
  return Object.values(HOTELS_CONFIG);
};

export const generateVerificationCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'HUB-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
