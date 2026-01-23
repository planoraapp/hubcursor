// Serviço para buscar badges de todos os países do Habbo via external_flash_texts

export interface BadgeInfo {
  code: string;
  description: string;
  hotel: string;
  discoveredAt: string;
}

export interface HotelConfig {
  code: string;
  domain: string;
  name: string;
}

// Lista de todos os hotéis do Habbo
export const HABBO_HOTELS: HotelConfig[] = [
  { code: 'com', domain: 'habbo.com', name: 'Estados Unidos' },
  { code: 'com.br', domain: 'habbo.com.br', name: 'Brasil' },
  { code: 'es', domain: 'habbo.es', name: 'Espanha' },
  { code: 'nl', domain: 'habbo.nl', name: 'Holanda' },
  { code: 'de', domain: 'habbo.de', name: 'Alemanha' },
  { code: 'fi', domain: 'habbo.fi', name: 'Finlândia' },
  { code: 'com.tr', domain: 'habbo.com.tr', name: 'Turquia' },
  { code: 'it', domain: 'habbo.it', name: 'Itália' },
  { code: 'fr', domain: 'habbo.fr', name: 'França' },
  { code: 'sandbox', domain: 'sandbox.habbo.com', name: 'Sandbox' },
];

// Cache de badges por hotel
const badgeCache = new Map<string, { badges: BadgeInfo[]; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60 * 4; // 4 horas - buscar algumas vezes ao dia

/**
 * Busca external_flash_texts de um hotel específico
 */
async function fetchExternalFlashTexts(hotel: HotelConfig): Promise<string | null> {
  try {
    // Sandbox usa subdomínio sem www
    const baseUrl = hotel.domain === 'sandbox.habbo.com' 
      ? `https://${hotel.domain}`
      : `https://www.${hotel.domain}`;
    
    const url = `${baseUrl}/gamedata/external_flash_texts/1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/plain, */*',
      },
      signal: AbortSignal.timeout(10000), // 10 segundos de timeout
      mode: 'cors', // Tentar CORS
    });

    if (!response.ok) {
      // Silenciosamente retornar null se falhar (CORS ou 404)
      return null;
    }

    return await response.text();
  } catch (error) {
    // Silenciosamente retornar null em caso de erro (CORS bloqueado pelo navegador)
    // Não fazer log pois é esperado que falhe no navegador devido a CORS
    return null;
  }
}

/**
 * Extrai badges do texto external_flash_texts
 * Procura por padrões: badge_name_{CODE}=nome e badge_desc_{CODE}=descrição
 * Agrupa os dados por código do emblema
 */
function extractBadgesFromText(text: string, hotel: HotelConfig): BadgeInfo[] {
  const badgeMap = new Map<string, { name?: string; description?: string }>();
  const lines = text.split('\n');

  // Padrões para badge_name e badge_desc (case insensitive)
  const namePattern = /^badge_name_([A-Za-z0-9_]+)=(.+)$/;
  const descPattern = /^badge_desc_([A-Za-z0-9_]+)=(.+)$/;

  for (const line of lines) {
    // Verificar se é badge_name
    let match = line.match(namePattern);
    if (match) {
      const code = match[1];
      const name = match[2].trim();

      if (!badgeMap.has(code)) {
        badgeMap.set(code, {});
      }
      badgeMap.get(code)!.name = name;
      continue;
    }

    // Verificar se é badge_desc
    match = line.match(descPattern);
    if (match) {
      const code = match[1];
      const description = match[2].trim();

      if (!badgeMap.has(code)) {
        badgeMap.set(code, {});
      }
      badgeMap.get(code)!.description = description;
    }
  }

  // Converter o mapa em array de BadgeInfo
  const badges: BadgeInfo[] = [];
  for (const [code, data] of badgeMap.entries()) {
    // Usar nome se disponível, senão usar o código como nome
    const name = data.name || code;
    const description = data.description || '';

    badges.push({
      code,
      description: `${name}: ${description}`.trim(), // Combinar nome e descrição
      hotel: hotel.code,
      discoveredAt: new Date().toISOString(),
    });
  }

  return badges;
}

/**
 * Busca badges de um hotel específico
 */
export async function fetchBadgesFromHotel(hotel: HotelConfig, forceRefresh = false): Promise<BadgeInfo[]> {
  const cacheKey = `badges_${hotel.code}`;
  const cached = badgeCache.get(cacheKey);

  // Retornar cache se ainda válido e não for refresh forçado
  if (!forceRefresh && cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.badges;
  }

  try {
    const text = await fetchExternalFlashTexts(hotel);
    
    // Se não conseguiu buscar (CORS bloqueado), usar cache ou retornar vazio
    if (!text) {
      if (cached) {
        return cached.badges;
      }
      return [];
    }
    
    const badges = extractBadgesFromText(text, hotel);
    
    // Salvar no cache apenas se conseguiu buscar
    if (badges.length > 0) {
      badgeCache.set(cacheKey, {
        badges,
        timestamp: Date.now(),
      });
    }
    
    return badges;
  } catch (error) {
    // Retornar cache antigo se disponível
    if (cached) {
      return cached.badges;
    }
    
    return [];
  }
}

/**
 * Busca badges de todos os hotéis
 */
export async function fetchAllBadges(forceRefresh = false): Promise<BadgeInfo[]> {
  const allBadges = new Map<string, BadgeInfo>(); // Usar Map para evitar duplicatas
  
  // Buscar de todos os hotéis em paralelo
  // Nota: A busca pode falhar silenciosamente devido a CORS (esperado no navegador)
  const promises = HABBO_HOTELS.map(hotel => 
    fetchBadgesFromHotel(hotel, forceRefresh)
      .then(badges => {
        // Adicionar badges ao mapa (último hotel encontrado mantém o badge se houver duplicata)
        badges.forEach(badge => {
          allBadges.set(badge.code.toUpperCase(), badge);
        });
      })
      .catch(() => {
        // Erro silencioso - CORS bloqueado é esperado no navegador
        // Os badges da API serão usados como fallback
      })
  );

  await Promise.allSettled(promises);
  
  const uniqueBadges = Array.from(allBadges.values());
  console.log(`✅ [BadgeScraper] Total de ${uniqueBadges.length} badges únicos encontrados`);
  
  return uniqueBadges;
}

/**
 * Obtém lista de novos badges comparando com cache anterior
 */
export async function getNewBadges(): Promise<BadgeInfo[]> {
  // Buscar badges mais recentes
  const currentBadges = await fetchAllBadges(true);
  
  // Buscar cache anterior (se existir)
  const previousBadges = new Set<string>();
  for (const hotel of HABBO_HOTELS) {
    const cacheKey = `badges_${hotel.code}`;
    const cached = badgeCache.get(cacheKey);
    if (cached) {
      cached.badges.forEach(badge => {
        previousBadges.add(badge.code.toUpperCase());
      });
    }
  }
  
  // Encontrar badges novos
  const newBadges = currentBadges.filter(badge => 
    !previousBadges.has(badge.code.toUpperCase())
  );
  
  return newBadges;
}

/**
 * Limpa o cache de badges
 */
export function clearBadgeCache(): void {
  badgeCache.clear();
  console.log('🗑️ [BadgeCache] Cache limpo');
}

