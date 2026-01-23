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
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/68d043f3-6a7b-4b6a-b189-d5232987ab3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'habboApiMultiHotel.ts:getUserByName:fetching',message:'Buscando usuário na API',data:{username:username,domain:domain,url:url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HabboHub/1.0',
        },
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/68d043f3-6a7b-4b6a-b189-d5232987ab3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'habboApiMultiHotel.ts:getUserByName:response',message:'Resposta da API recebida',data:{username:username,domain:domain,status:response.status,ok:response.ok,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion

      if (response.ok) {
        const data = await response.json();
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/68d043f3-6a7b-4b6a-b189-d5232987ab3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'habboApiMultiHotel.ts:getUserByName:data-received',message:'Dados recebidos da API',data:{username:username,domain:domain,hasData:!!data,hasName:!!(data && data.name),dataKeys:data ? Object.keys(data) : [],uniqueId:data?.uniqueId || 'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
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
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/68d043f3-6a7b-4b6a-b189-d5232987ab3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'habboApiMultiHotel.ts:getUserByName:success',message:'Usuário encontrado com sucesso',data:{username:username,domain:domain,userName:result.name,uniqueId:result.uniqueId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          
          return result;
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/68d043f3-6a7b-4b6a-b189-d5232987ab3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'habboApiMultiHotel.ts:getUserByName:no-name',message:'Resposta OK mas sem campo name',data:{username:username,domain:domain,hasData:!!data,dataKeys:data ? Object.keys(data) : []},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
        }
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/68d043f3-6a7b-4b6a-b189-d5232987ab3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'habboApiMultiHotel.ts:getUserByName:not-ok',message:'Resposta não OK da API',data:{username:username,domain:domain,status:response.status,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
      }
      // Se 404 ou outro erro, continuamos tentando os próximos domínios
      // (não retornamos null imediatamente mesmo com domínio preferido)
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/68d043f3-6a7b-4b6a-b189-d5232987ab3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'habboApiMultiHotel.ts:getUserByName:error',message:'Erro ao buscar usuário',data:{username:username,domain:domain,error:error?.message || 'Unknown error'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      // Em caso de erro de rede, continuamos tentando os próximos domínios
      continue;
    }
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/68d043f3-6a7b-4b6a-b189-d5232987ab3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'habboApiMultiHotel.ts:getUserByName:not-found',message:'Usuário não encontrado em nenhum domínio',data:{username:username,domainsTried:domainsToSearch.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion

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
