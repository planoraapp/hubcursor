/**
 * Normalizador de Dados de Usuários
 * Garante consistência na comunicação entre APIs, páginas e perfis
 */

/**
 * Extrai o nome do usuário de forma consistente
 * Prioridade: userName > habbo_name > user_name > name > user
 */
export function getUserName(user: any): string {
  return user?.userName || 
         user?.habbo_name || 
         user?.habboName ||
         user?.user_name || 
         user?.name || 
         user?.user || 
         '';
}

/**
 * Extrai o hotel do usuário de forma consistente
 */
export function getUserHotel(user: any): string {
  return user?.hotel || 
         user?.hotelDomain || 
         user?.hotel_domain || 
         'br';
}

/**
 * Normaliza dados de usuário para formato padrão
 */
export function normalizeUser(user: any): {
  userName: string;
  habboName: string;
  hotel: string;
  hotelDomain: string;
  figureString?: string;
  uniqueId?: string;
  [key: string]: any;
} {
  const userName = getUserName(user);
  const hotel = getUserHotel(user);
  
  // Normalizar hotelDomain (pode ser 'br' ou 'com.br')
  const hotelDomain = user?.hotelDomain || 
                      user?.hotel_domain || 
                      (hotel === 'br' ? 'com.br' : hotel === 'tr' ? 'com.tr' : hotel);

  return {
    userName,
    habboName: userName, // Alias para compatibilidade
    hotel,
    hotelDomain,
    figureString: user?.figureString || user?.figure_string || user?.figure || '',
    uniqueId: user?.uniqueId || user?.unique_id || user?.id || '',
    ...user, // Preservar outros campos
  };
}

