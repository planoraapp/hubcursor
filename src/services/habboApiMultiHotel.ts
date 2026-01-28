import type { HabboUser } from '@/types/habbo';

const HOTEL_DOMAINS = [
  'com.br', // Brazil
  'com',    // International/US
  'es',     // Spain
  'fr',     // France
  'de',     // Germany
  'it',     // Italy
  'nl',     // Netherlands
  'fi',     // Finland
  'com.tr'  // Turkey
];

const normalizePreferredDomain = (preferred?: string): string | undefined => {
  if (!preferred) return undefined;
  if (preferred === 'br') return 'com.br';
  if (preferred === 'tr') return 'com.tr';
  if (preferred === 'us') return 'com';
  return preferred;
};

export const getUserByName = async (
  username: string,
  preferredDomain?: string
): Promise<HabboUser | null> => {
  const normalizedPreferred = normalizePreferredDomain(preferredDomain);

  // Construir lista de domínios para buscar:
  // 1. Se houver domínio preferido, tentar primeiro ele
  // 2. Depois tentar todos os outros domínios (caso o preferido falhe)
  const domainsToSearch = normalizedPreferred
    ? [
        normalizedPreferred,
        ...HOTEL_DOMAINS.filter((d) => d !== normalizedPreferred),
      ]
    : [...HOTEL_DOMAINS];

  for (const domain of domainsToSearch) {
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
        
        if (data && data.name) {
          const result = {
            ...data,
            uniqueId:
              data.uniqueId ||
              `hh${domain.replace('.', '')}-${data.name.toLowerCase()}`,
            // Garantir que memberSince está presente com dados reais da API
            memberSince:
              data.memberSince ||
              data.registeredDate ||
              '2006-01-01T00:00:00.000+0000',
            hotelDomain: domain,
          } as HabboUser & { hotelDomain: string };
          
          return result;
        }
      }
      // Se 404 ou outro erro, continuamos tentando os próximos domínios
      // (não retornamos null imediatamente mesmo com domínio preferido)
    } catch (error: any) {
      // Em caso de erro de rede, continuamos tentando os próximos domínios
      continue;
    }
  }

  // Se nenhum domínio retornou o usuário, retornamos null
  return null;
};

export const getUserById = async (userId: string): Promise<HabboUser | null> => {
  // A API do Habbo pode aceitar o uniqueId em diferentes formatos:
  // 1. Formato completo: "hhbr-00e6988dddeb5a1838658c854d62fe49"
  // 2. Apenas o hash: "00e6988dddeb5a1838658c854d62fe49"
  // 3. Com diferentes prefixos de hotel (hhbr, hhcom, hhes, etc.)
  
  // Extrair apenas o hash se estiver no formato hhXX-...
  const hashOnly = userId.includes('-') ? userId.split('-').slice(1).join('-') : userId;
  
  // Lista de IDs para tentar (formato completo primeiro, depois apenas hash)
  const idsToTry = userId.startsWith('hh') ? [userId, hashOnly] : [userId, `hhbr-${userId}`, `hhcom-${userId}`];
  
  console.log(`[getUserById] Tentando buscar usuário com ID: ${userId}, formatos:`, idsToTry);
  
  for (const domain of HOTEL_DOMAINS) {
    for (const idToTry of idsToTry) {
      try {
        // Tentar endpoint básico primeiro
        const url = `https://www.habbo.${domain}/api/public/users/${encodeURIComponent(idToTry)}`;
        console.log(`[getUserById] Tentando: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HabboHub/1.0'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.name) {
            console.log(`[getUserById] ✅ Usuário encontrado em ${domain} com ID ${idToTry}:`, data.name);
            return {
              ...data,
              uniqueId: data.uniqueId || userId,
              hotelDomain: domain
            };
          }
        } else if (response.status === 404) {
          // Se 404, continuar tentando outros formatos
          console.log(`[getUserById] 404 para ${idToTry} em ${domain}, tentando próximo formato...`);
          continue;
        }
      } catch (error) {
        // Continuar para o próximo formato/domínio
        console.warn(`[getUserById] Erro ao buscar ${idToTry} em ${domain}:`, error);
        continue;
      }
    }
  }

  console.warn(`[getUserById] ❌ Usuário não encontrado com ID: ${userId}`);
  return null;
};

export const getAvatarUrl = (username: string, figureString?: string, hotel: string = 'com.br'): string => {
  // Normalize hotel domain
  let domain = hotel;
  if (hotel === 'br') domain = 'com.br';
  if (hotel === 'tr') domain = 'com.tr';
  if (hotel === 'us') domain = 'com';
  
  const baseUrl = `https://www.habbo.${domain}`;
  
  if (figureString) {
    // Alterando para direção 3,3 (diagonal direita e frente)
    return `${baseUrl}/habbo-imaging/avatarimage?figure=${encodeURIComponent(figureString)}&direction=3&head_direction=3&size=l`;
  }
  
  return `${baseUrl}/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&direction=3&head_direction=3&size=l`;
};
