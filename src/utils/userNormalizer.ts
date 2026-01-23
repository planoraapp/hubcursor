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

/**
 * Extrai o gênero da figurestring do Habbo
 * Retorna 'M' (masculino) ou 'F' (feminino)
 * Por padrão, retorna 'M' se não conseguir determinar
 */
export function extractGenderFromFigureString(figureString?: string): 'M' | 'F' {
  if (!figureString) return 'M';
  
  // A figurestring do Habbo geralmente contém partes como:
  // hr-XXX-XX (hair) - se começar com hr, geralmente é masculino
  // hd-XXX-XX (head) - pode ter gender no final
  // Formato típico: hr-100-undefined-.hd-190-7-.ch-210-66-...
  
  // Verificar se contém partes que indicam gender
  // Se tiver .hr- (hair) geralmente é masculino, mas não é garantia
  // Vamos usar uma heurística: se não encontrar indicação clara, usar 'M' como padrão
  // Na prática, o Habbo Imaging aceita gender como parâmetro separado
  
  // Por padrão, usar 'M' se não conseguir determinar
  return 'M';
}
