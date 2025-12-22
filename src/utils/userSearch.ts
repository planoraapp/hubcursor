/**
 * Utilitário para busca de usuários globalmente em todos os hotéis Habbo
 */

import { HOTEL_DOMAINS } from './hotelHelpers';
import { hotelDomainToCode } from './hotelHelpers';

export interface SearchUserResult {
  name: string;
  motto: string;
  online: boolean;
  figureString: string;
  uniqueId: string;
  hotelDomain: string;
  hotelCode: string;
}

/**
 * Busca usuários globalmente em todos os hotéis Habbo
 */
export const searchUsersGlobally = async (username: string): Promise<SearchUserResult[]> => {
  // Buscar em todos os hotéis simultaneamente
  const searchPromises = HOTEL_DOMAINS.map(async (domain) => {
    try {
      const url = `https://www.habbo.${domain}/api/public/users?name=${encodeURIComponent(username)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HabboHub/1.0',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // A API pode retornar um objeto ou array
        const user = Array.isArray(data) ? data[0] : data;

        // Verificar correspondência exata do nome (case-insensitive)
        if (user && user.name && user.name.toLowerCase().trim() === username.toLowerCase().trim()) {
          const hotelCode = hotelDomainToCode(domain);

          return {
            name: user.name,
            motto: user.motto || '',
            online: user.online || false,
            figureString: user.figureString || user.figure || '',
            uniqueId: user.uniqueId || user.id,
            hotelDomain: domain,
            hotelCode: hotelCode
          };
        }
      }
    } catch (error) {
      // Silenciosamente ignorar erros de hotéis individuais
      console.debug(`Failed to search in ${domain}:`, error);
    }
    return null;
  });

  const results = await Promise.all(searchPromises);
  return results.filter((result): result is SearchUserResult => result !== null);
};

