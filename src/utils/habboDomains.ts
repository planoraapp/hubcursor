
// Mapeamento centralizado de domínios dos hotéis Habbo
export const HABBO_HOTEL_DOMAINS: Record<string, string> = {
  'br': 'habbo.com.br',
  'com': 'habbo.com',
  'es': 'habbo.es',
  'fr': 'habbo.fr',
  'de': 'habbo.de',
  'it': 'habbo.it',
  'nl': 'habbo.nl',
  'fi': 'habbo.fi',
  'tr': 'habbo.com.tr'
};

export const getHotelDomain = (hotel: string): string => {
  return HABBO_HOTEL_DOMAINS[hotel] || 'habbo.com';
};

export const getHabboApiUrl = (hotel: string): string => {
  return `https://www.${getHotelDomain(hotel)}`;
};

export const getHabboImageUrl = (hotel: string): string => {
  return `https://www.${getHotelDomain(hotel)}`;
};

// Detectar hotel do habbo_id - versão aprimorada
export const detectHotelFromHabboId = (habboId: string): string => {
  if (habboId.startsWith('hhbr-')) return 'br';
  if (habboId.startsWith('hhcom-') || habboId.startsWith('hhus-')) return 'com';
  if (habboId.startsWith('hhes-')) return 'es';
  if (habboId.startsWith('hhfr-')) return 'fr';
  if (habboId.startsWith('hhde-')) return 'de';
  if (habboId.startsWith('hhit-')) return 'it';
  if (habboId.startsWith('hhnl-')) return 'nl';
  if (habboId.startsWith('hhfi-')) return 'fi';
  if (habboId.startsWith('hhtr-')) return 'tr';
  return 'com'; // fallback
};
