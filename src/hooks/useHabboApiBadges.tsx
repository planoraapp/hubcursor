
import { useQuery } from '@tanstack/react-query';
import { getAchievements } from '@/services/habboApi';
import { fetchAllBadges, getNewBadges, type BadgeInfo } from '@/services/badgeScraperService';

export interface HabboApiBadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  rarity: string;
  source: string;
  scrapedAt: string;
  hotel?: string;
  isNew?: boolean;
}

interface UseHabboApiBadgesProps {
  limit?: number;
  search?: string;
  category?: string;
  forceRefresh?: boolean;
  enabled?: boolean;
  page?: number;
  pageSize?: number;
}

// Cache de badges da API
let cachedBadges: HabboApiBadgeItem[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 4; // 4 horas - buscar algumas vezes ao dia

// Tracking de novos badges (armazenado no localStorage)
const NEW_BADGES_KEY = 'habbo_hub_new_badges';
const NEW_BADGES_COUNT = 15; // Marcar últimos 15 badges como novos

// Função para obter lista de novos badges do localStorage
function getNewBadgeCodes(): Set<string> {
  try {
    const stored = localStorage.getItem(NEW_BADGES_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (error) {
    console.error('Erro ao ler novos badges do localStorage:', error);
  }
  return new Set<string>();
}

// Função para salvar lista de novos badges no localStorage
function saveNewBadgeCodes(codes: string[]): void {
  try {
    localStorage.setItem(NEW_BADGES_KEY, JSON.stringify(codes));
  } catch (error) {
    console.error('Erro ao salvar novos badges no localStorage:', error);
  }
}

// Função para categorizar badge baseado no código
function categorizeBadge(code: string): string {
  const upperCode = code.toUpperCase();
  
  // Official/Staff badges
  if (['ADM', 'MOD', 'STAFF', 'SUP', 'GUIDE', 'HELPER', 'VIP', 'ADMIN', 'CM'].some(p => upperCode.includes(p))) {
    return 'official';
  }
  
  // Achievement badges
  if (upperCode.startsWith('ACH_')) {
    return 'achievements';
  }
  
  // Habbo Club
  if (upperCode.startsWith('HC')) {
    return 'official';
  }
  
  // Country badges (BR, US, ES, etc)
  const countryCodes = ['BR', 'US', 'ES', 'DE', 'FR', 'IT', 'NL', 'TR', 'FI', 'PT'];
  if (countryCodes.some(cc => upperCode.startsWith(cc))) {
    return 'fansites';
  }
  
  // Event badges
  const events = ['XMAS', 'EASTER', 'SUMMER', 'HALLOWEEN', 'VALENTINES', 'NEWYEAR', 'HWEEN'];
  if (events.some(e => upperCode.includes(e))) {
    return 'others';
  }
  
  return 'others';
}

// Função para determinar raridade
function getRarity(code: string): string {
  const upperCode = code.toUpperCase();
  
  if (['ADM', 'MOD', 'ADMIN'].some(p => upperCode.includes(p))) {
    return 'legendary';
  }
  
  if (upperCode.startsWith('ACH_')) {
    return 'common';
  }
  
  if (upperCode.startsWith('HC')) {
    return 'uncommon';
  }
  
  return 'common';
}

// Função para buscar achievements da API e gerar badges
async function fetchBadgesFromAPI(): Promise<HabboApiBadgeItem[]> {
  const badges: HabboApiBadgeItem[] = [];
  
  try {
    // Buscar achievements da API oficial
    const achievements = await getAchievements();
    
    if (achievements && Array.isArray(achievements)) {
      achievements.forEach((achievement: any) => {
        const ach = achievement.achievement || achievement;
        const levels = achievement.levelRequirements || [];
        
        if (!ach || !ach.name) return;
        
        // Gerar badges para cada nível do achievement
        levels.forEach((level: any, index: number) => {
          const code = `ACH_${ach.name}${level.level || index + 1}`;
          badges.push({
            id: `api_${code}`,
            code,
            name: ach.name || `Achievement ${code}`,
            description: `Nível ${level.level || index + 1} - ${ach.category || 'achievement'}`,
            imageUrl: buildBadgeImageUrl(code),
            category: categorizeBadge(code),
            rarity: getRarity(code),
            source: 'api-achievements',
            scrapedAt: new Date().toISOString()
          });
        });

        // Também adicionar badge base (nível 1)
        if (levels.length === 0) {
          const code = `ACH_${ach.name}1`;
          badges.push({
            id: `api_${code}`,
            code,
            name: ach.name || `Achievement ${code}`,
            description: ach.category ? `Categoria: ${ach.category}` : 'Badge de conquista',
            imageUrl: buildBadgeImageUrl(code),
            category: categorizeBadge(code),
            rarity: getRarity(code),
            source: 'api-achievements',
            scrapedAt: new Date().toISOString()
          });
        }
      });
    }
  } catch (error) {
    console.error('Erro ao buscar achievements da API:', error);
  }
  
  return badges;
}

// Lista de badges conhecidos não-achievements
function getKnownNonAchievementBadges(): HabboApiBadgeItem[] {
  const badges: HabboApiBadgeItem[] = [];
  
  // Badges de Staff
  const staffBadges = [
    { code: 'ADM', name: 'Administrador', description: 'Badge de administrador do Habbo' },
    { code: 'MOD', name: 'Moderador', description: 'Badge de moderador do Habbo' },
    { code: 'STAFF', name: 'Staff', description: 'Badge de membro da equipe' },
    { code: 'SUP', name: 'Supervisor', description: 'Badge de supervisor' },
    { code: 'GUIDE', name: 'Guia', description: 'Badge de guia do Habbo' },
    { code: 'HELPER', name: 'Helper', description: 'Badge de helper' },
    { code: 'VIP', name: 'VIP', description: 'Badge VIP' },
    { code: 'ADMIN', name: 'Admin', description: 'Badge de administrador' },
    { code: 'CM', name: 'Community Manager', description: 'Badge de Community Manager' }
  ];
  
  staffBadges.forEach(badge => {
    badges.push({
      id: `staff_${badge.code}`,
      code: badge.code,
      name: badge.name,
      description: badge.description,
      imageUrl: buildBadgeImageUrl(badge.code),
      category: 'official',
      rarity: 'legendary',
      source: 'known-list',
      scrapedAt: new Date().toISOString()
    });
  });
  
  // Habbo Club badges
  for (let i = 1; i <= 50; i++) {
    const code = `HC${i}`;
    badges.push({
      id: `hc_${code}`,
      code,
      name: `Habbo Club ${i}`,
      description: `Badge do Habbo Club nível ${i}`,
      imageUrl: `https://images.habbo.com/c_images/album1584/${code}.gif`,
      category: 'official',
      rarity: 'uncommon',
      source: 'known-list',
      scrapedAt: new Date().toISOString()
    });
  }
  
  // Badges de países (formato: BR001, BR002, etc)
  const countries = [
    { code: 'BR', name: 'Brasil' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'ES', name: 'Espanha' },
    { code: 'DE', name: 'Alemanha' },
    { code: 'FR', name: 'França' },
    { code: 'IT', name: 'Itália' },
    { code: 'NL', name: 'Holanda' },
    { code: 'TR', name: 'Turquia' },
    { code: 'FI', name: 'Finlândia' },
    { code: 'PT', name: 'Portugal' }
  ];
  
  countries.forEach(country => {
    for (let i = 1; i <= 20; i++) {
      const code = `${country.code}${String(i).padStart(3, '0')}`;
      badges.push({
        id: `country_${code}`,
        code,
        name: `${country.name} ${i}`,
        description: `Badge de ${country.name}`,
        imageUrl: buildBadgeImageUrl(code),
        category: 'fansites',
        rarity: 'common',
        source: 'known-list',
        scrapedAt: new Date().toISOString()
      });
    }
  });
  
  // Badges de eventos sazonais
  const events = [
    { prefix: 'XMAS', years: [18, 19, 20, 21, 22, 23, 24] },
    { prefix: 'EASTER', years: [18, 19, 20, 21, 22, 23, 24] },
    { prefix: 'SUMMER', years: [18, 19, 20, 21, 22, 23, 24] },
    { prefix: 'HALLOWEEN', years: [18, 19, 20, 21, 22, 23, 24] },
    { prefix: 'VALENTINES', years: [18, 19, 20, 21, 22, 23, 24] },
    { prefix: 'NEWYEAR', years: [18, 19, 20, 21, 22, 23, 24] },
    { prefix: 'HWEEN', years: [22, 23, 24] }
  ];
  
  events.forEach(event => {
    event.years.forEach(year => {
      const code = `${event.prefix}${year}`;
      badges.push({
        id: `event_${code}`,
        code,
        name: `${event.prefix} 20${year}`,
        description: `Badge de evento ${event.prefix} 20${year}`,
        imageUrl: `https://images.habbo.com/c_images/album1584/${code}.gif`,
        category: 'others',
        rarity: 'rare',
        source: 'known-list',
        scrapedAt: new Date().toISOString()
      });
    });
  });
  
  // Badges especiais conhecidos
  const specialBadges = [
    'HUG', 'GLA', 'GLB', 'GLC', 'GLD', 'GLE', 'DEE', 'BGW2', 'BGW3', 'BGW4'
  ];
  
  specialBadges.forEach(code => {
    badges.push({
      id: `special_${code}`,
      code,
      name: `Badge ${code}`,
      description: `Badge especial ${code}`,
      imageUrl: buildBadgeImageUrl(code),
      category: 'others',
      rarity: 'common',
      source: 'known-list',
      scrapedAt: new Date().toISOString()
    });
  });
  
  return badges;
}

// Função para construir URL da imagem do emblema com fallback para sufixos de hotel
function buildBadgeImageUrl(code: string): string {
  // Usar images.habbo.com/c_images/album1584/ conforme especificação
  return `https://images.habbo.com/c_images/album1584/${code}.gif`;
}

// Função para obter URL da imagem com fallback (usada no componente)
export function getBadgeImageUrl(code: string): string {
  // Primeiro tenta com código completo, depois sem sufixo se houver _
  const baseUrl = 'https://images.habbo.com/c_images/album1584/';

  // Se tiver sufixo de hotel (ex: AC4_HHUK), retorna URL com código completo
  // O componente SimpleBadgeImage pode implementar lógica de fallback
  return `${baseUrl}${code}.gif`;
}

// Função para converter BadgeInfo em HabboApiBadgeItem
function convertBadgeInfoToItem(badgeInfo: BadgeInfo, hotelDomain: string): HabboApiBadgeItem {
  // Extrair nome e descrição da string combinada (formato: "Nome: Descrição")
  const [namePart, ...descParts] = badgeInfo.description.split(': ');
  const name = namePart && namePart !== badgeInfo.code ? namePart : badgeInfo.code;
  const description = descParts.join(': ').trim() || '';

  return {
    id: `scraped_${badgeInfo.code}_${badgeInfo.hotel}`,
    code: badgeInfo.code,
    name: name,
    description: description,
    imageUrl: buildBadgeImageUrl(badgeInfo.code),
    category: categorizeBadge(badgeInfo.code),
    rarity: getRarity(badgeInfo.code),
    source: `scraped-${badgeInfo.hotel}`,
    scrapedAt: badgeInfo.discoveredAt,
    hotel: badgeInfo.hotel,
  };
}

const fetchMassiveBadges = async ({
  limit = 10000,
  search = '',
  category = 'all',
  forceRefresh = false,
  page = 1,
  pageSize = 100
}: UseHabboApiBadgesProps): Promise<{
  badges: HabboApiBadgeItem[];
  metadata: any;
}> => {
  try {
    // Verificar cache se não for refresh forçado
    const shouldRefresh = forceRefresh || cachedBadges.length === 0 || (Date.now() - cacheTimestamp) >= CACHE_DURATION;
    
    if (shouldRefresh) {
      console.log('🔄 [BadgesAPI] Buscando badges de todas as fontes...');
      
      // 1. Buscar badges de todos os hotéis via external_flash_texts
      const scrapedBadges = await fetchAllBadges(forceRefresh);
      console.log(`✅ [BadgesScraper] ${scrapedBadges.length} badges encontrados via external_flash_texts`);
      
      // 2. Buscar badges da API (achievements)
      const apiBadges = await fetchBadgesFromAPI();
      console.log(`✅ [BadgesAPI] ${apiBadges.length} badges de achievements`);
      
      // 3. Buscar badges conhecidos não-achievements
      const knownBadges = getKnownNonAchievementBadges();
      console.log(`✅ [BadgesKnown] ${knownBadges.length} badges conhecidos`);
      
      // 4. Converter badges scraped para formato HabboApiBadgeItem
      const convertedScrapedBadges = scrapedBadges.map(badgeInfo => {
        // Encontrar domínio do hotel
        const hotelDomain = badgeInfo.hotel === 'com' ? 'habbo.com' :
                           badgeInfo.hotel === 'com.br' ? 'habbo.com.br' :
                           badgeInfo.hotel === 'com.tr' ? 'habbo.com.tr' :
                           badgeInfo.hotel === 'sandbox' ? 'sandbox.habbo.com' :
                           `habbo.${badgeInfo.hotel}`;
        return convertBadgeInfoToItem(badgeInfo, hotelDomain);
      });
      
      // 5. Combinar todos os badges e remover duplicatas
      const allBadgesMap = new Map<string, HabboApiBadgeItem>();
      
      // Adicionar badges conhecidos primeiro (podem ter nomes/descrições melhores)
      knownBadges.forEach(badge => {
        allBadgesMap.set(badge.code.toUpperCase(), badge);
      });
      
      // Adicionar badges scraped (podem sobrescrever com descrições reais)
      convertedScrapedBadges.forEach(badge => {
        const existing = allBadgesMap.get(badge.code.toUpperCase());
        // Preferir scraped se tiver descrição melhor
        if (!existing || !existing.description || existing.description === existing.code) {
          allBadgesMap.set(badge.code.toUpperCase(), badge);
        }
      });
      
      // Adicionar badges da API (achievements)
      apiBadges.forEach(badge => {
        const existing = allBadgesMap.get(badge.code.toUpperCase());
        if (!existing) {
          allBadgesMap.set(badge.code.toUpperCase(), badge);
        }
      });
      
      // Converter map para array
      cachedBadges = Array.from(allBadgesMap.values());
      
      // 6. Detectar novos badges e marcar os últimos 15
      const previousNewBadges = getNewBadgeCodes();
      const currentBadgeCodes = new Set(cachedBadges.map(b => b.code.toUpperCase()));
      
      // Encontrar badges novos (não estavam na lista anterior)
      const newBadgeCodes = Array.from(currentBadgeCodes).filter(code => !previousNewBadges.has(code));
      
      // Ordenar badges por data de descoberta (mais recentes primeiro)
      cachedBadges.sort((a, b) => {
        const dateA = new Date(a.scrapedAt).getTime();
        const dateB = new Date(b.scrapedAt).getTime();
        return dateB - dateA;
      });
      
      // Marcar os últimos 15 badges como novos
      const latestBadgeCodes = cachedBadges.slice(0, NEW_BADGES_COUNT).map(b => b.code.toUpperCase());
      cachedBadges.forEach(badge => {
        badge.isNew = latestBadgeCodes.includes(badge.code.toUpperCase());
      });
      
      // Salvar novos badges no localStorage
      if (newBadgeCodes.length > 0) {
        saveNewBadgeCodes(latestBadgeCodes);
        console.log(`🆕 [BadgesNew] ${newBadgeCodes.length} novos badges detectados, ${NEW_BADGES_COUNT} marcados como novos`);
      }
      
      cacheTimestamp = Date.now();
      console.log(`✅ [BadgesAPI] Total: ${cachedBadges.length} badges únicos carregados`);
    } else {
      console.log('💾 [BadgesCache] Usando badges em cache');
    }
    
    // Filtrar badges
    let filtered = [...cachedBadges];

    // Aplicar filtro de pesquisa
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(badge =>
        badge.name.toLowerCase().includes(searchLower) ||
        badge.code.toLowerCase().includes(searchLower) ||
        badge.description.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar filtro de categoria
    if (category !== 'all') {
      filtered = filtered.filter(badge => badge.category === category);
    }

    // Paginação para scroll infinito
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBadges = filtered.slice(startIndex, endIndex);
    const hasMore = endIndex < filtered.length;

    return {
      badges: paginatedBadges,
      metadata: {
        source: 'multi-source',
        totalAvailable: filtered.length,
        totalReturned: paginatedBadges.length,
        currentPage: page,
        pageSize,
        hasMore,
        totalPages: Math.ceil(filtered.length / pageSize),
        search,
        category,
        fetchedAt: new Date().toISOString(),
        cacheAge: Date.now() - cacheTimestamp
      }
    };
  } catch (error) {
    console.error('❌ [BadgesAPI] Erro ao buscar badges:', error);
    
    // Fallback para badges conhecidos em caso de erro
    const knownBadges = getKnownNonAchievementBadges();
    let filtered = knownBadges;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(badge =>
        badge.name.toLowerCase().includes(searchLower) ||
        badge.code.toLowerCase().includes(searchLower) ||
        badge.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (category !== 'all') {
      filtered = filtered.filter(badge => badge.category === category);
    }
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBadges = filtered.slice(startIndex, endIndex);
    const hasMore = endIndex < filtered.length;
    
    return {
      badges: paginatedBadges,
      metadata: {
        source: 'fallback-known-list',
        totalAvailable: filtered.length,
        totalReturned: paginatedBadges.length,
        currentPage: page,
        pageSize,
        hasMore,
        totalPages: Math.ceil(filtered.length / pageSize),
        search,
        category,
        fetchedAt: new Date().toISOString(),
        error: true
      }
    };
  }
};

export const useHabboApiBadges = ({
  limit = 10000,
  search = '',
  category = 'all',
  forceRefresh = false,
  enabled = true,
  page = 1,
  pageSize = 100
}: UseHabboApiBadgesProps = {}) => {
    return useQuery({
    queryKey: ['massive-badges-system', limit, search, category, forceRefresh, page, pageSize],
    queryFn: () => fetchMassiveBadges({ limit, search, category, forceRefresh, page, pageSize }),
    enabled,
    staleTime: 1000 * 60 * 60 * 2, // 2 horas para dados massivos
    gcTime: 1000 * 60 * 60 * 8, // 8 horas
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
    // Configurações para dados massivos
    refetchOnWindowFocus: false, // Não refetch automaticamente
    refetchOnReconnect: false,   // Economizar recursos
    refetchInterval: false,      // Sem refresh automático
  });
};
