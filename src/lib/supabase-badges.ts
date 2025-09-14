/**
 * Cliente Supabase para operações com badges
 * Fornece funções para buscar, filtrar e gerenciar emblemas
 */

import { createClient } from '@supabase/supabase-js';
// import badgeCodes from '@/data/badge-codes.json';
// import fullBadgeInfo from '@/data/full-badge-info.json';
// import realBadgeDescriptions from '@/data/real-badge-descriptions.json';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback para quando Supabase não estiver configurado
let supabase: any = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project') && !supabaseKey.includes('your-anon-key')) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  }

// Funções de fallback usando dados locais
const generateBadgesFromLocalData = (limit?: number): Badge[] => {
  const badges: Badge[] = [];
  const codesToProcess = limit ? badgeCodes.slice(0, limit) : badgeCodes;
  
  codesToProcess.forEach((code: string) => {
    const badgeInfo = fullBadgeInfo[code as keyof typeof fullBadgeInfo] || {};
    const description = realBadgeDescriptions[code as keyof typeof realBadgeDescriptions] || badgeInfo.description || '';
    
    // Detectar país baseado no código
    const getCountryFromCode = (code: string): string => {
      const countryMap = {
        'BR': 'Brasil/Portugal', 'PT': 'Brasil/Portugal', 'ES': 'Espanha', 'FR': 'França', 'DE': 'Alemanha', 
        'IT': 'Itália', 'NL': 'Holanda', 'TR': 'Turquia', 'FI': 'Finlândia', 
        'US': 'Estados Unidos', 'UK': 'Reino Unido'
      };
      
      for (const [prefix, country] of Object.entries(countryMap)) {
        if (code.startsWith(prefix)) {
          return country;
        }
      }
      return 'Outros';
    };

    // Detectar categoria especial
    const getSpecialCategory = (code: string, description: string): string => {
      const desc = description.toLowerCase();
      
      if (code.includes('ADM') || code.includes('MOD') || code.includes('STAFF') || 
          code.includes('HC') || code.includes('HIT') || code.includes('HLA') ||
          code.includes('HLIVE') || code.includes('COMSN') ||
          desc.includes('staff') || desc.includes('administrator') ||
          desc.includes('moderator') || desc.includes('habbo club') ||
          desc.includes('habbo live')) {
        return 'Staff';
      }
      
      if (code.startsWith('ACH_') || 
          desc.includes('achievement') || desc.includes('conquista') ||
          desc.includes('for being') || desc.includes('for having') ||
          desc.includes('for completing') || desc.includes('for purchasing') ||
          desc.includes('for participating') || desc.includes('for winning') ||
          desc.includes('for collecting') || desc.includes('for trading') ||
          desc.includes('for building') || desc.includes('for creating')) {
        return 'Achievements';
      }
      
      if (code.includes('FBC') || code.includes('COM') || code.includes('FAN') ||
          code.includes('WUP') || code.includes('HWS') || code.includes('NY') ||
          code.includes('HWN') || code.includes('VAL') || code.includes('EAST') ||
          desc.includes('facebook') || desc.includes('fansite') ||
          desc.includes('community') || desc.includes('group') ||
          desc.includes('competition') || desc.includes('winner') ||
          desc.includes('wake up party') || desc.includes('winter special') ||
          desc.includes('halloween') || desc.includes('valentine') ||
          desc.includes('easter') || desc.includes('new year') ||
          desc.includes('christmas') || desc.includes('xmas')) {
        return 'Fã-Sites';
      }
      
      return 'Outros';
    };

    // Detectar hotel baseado no código
    const getHotelFromCode = (code: string): string => {
      const hotelMap = {
        'BR': 'com.br', 'PT': 'com.br', 'ES': 'es', 'FR': 'fr', 'DE': 'de', 
        'IT': 'it', 'NL': 'nl', 'TR': 'com.tr', 'FI': 'fi', 
        'US': 'com', 'UK': 'com'
      };
      
      for (const [prefix, hotel] of Object.entries(hotelMap)) {
        if (code.startsWith(prefix)) {
          return hotel;
        }
      }
      return 'com';
    };

    const country = getCountryFromCode(code);
    const specialCategory = getSpecialCategory(code, description);
    const hotel = getHotelFromCode(code);

    badges.push({
      id: badges.length + 1,
      code,
      name: badgeInfo.name || code,
      description: description,
      hotel: hotel,
      image_url: badgeInfo.imageUrl || `/badges/c_images/album1584/${code}.gif`,
      created_at: badgeInfo.createdAt ? new Date(badgeInfo.createdAt).toISOString() : new Date().toISOString(),
      updated_at: badgeInfo.updatedAt ? new Date(badgeInfo.updatedAt).toISOString() : new Date().toISOString(),
      is_active: true,
      categories: ['all', ...(specialCategory !== 'Outros' ? [specialCategory] : [])],
      countries: [country]
    });
  });

  // Ordenar por data de criação (mais recentes primeiro)
  return badges.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });
};

// Cache dos badges gerados
let cachedBadges: Badge[] = [];
let isGenerating = false;
let totalBadgesCount = 0;

// Carregar dados em lotes para melhor performance
const loadBadgesInBatches = async (batchSize: number = 500, initialLimit?: number): Promise<Badge[]> => {
  if (cachedBadges.length > 0) {
    return cachedBadges;
  }
  
  isGenerating = true;
  const allBadges: Badge[] = [];
  totalBadgesCount = badgeCodes.length;
  
  // Se especificado um limite inicial, carregar apenas esse número
  const codesToProcess = initialLimit ? badgeCodes.slice(0, initialLimit) : badgeCodes;
  
  for (let i = 0; i < codesToProcess.length; i += batchSize) {
    const batch = codesToProcess.slice(i, i + batchSize);
    const batchBadges = generateBadgesFromLocalData(batch.length);
    allBadges.push(...batchBadges);
    
    // Pequena pausa para não bloquear a UI
    if (i + batchSize < codesToProcess.length) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  cachedBadges = allBadges;
  isGenerating = false;
  return allBadges;
};

// Função para obter progresso do carregamento
export function getLoadingProgress(): { loaded: number; total: number; isGenerating: boolean } {
  return {
    loaded: cachedBadges.length,
    total: totalBadgesCount,
    isGenerating
  };
};

export interface Badge {
  id: number;
  code: string;
  name: string;
  description: string;
  hotel: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  categories: string[];
  countries: string[];
}

export interface BadgeFilters {
  search?: string;
  country?: string;
  category?: string;
  hotel?: string;
  limit?: number;
  offset?: number;
}

export interface BadgeStats {
  total: number;
  byCategory: Record<string, number>;
  byCountry: Record<string, number>;
  byHotel: Record<string, number>;
}

/**
 * Buscar badges com filtros
 */
export async function getBadges(filters: BadgeFilters = {}): Promise<Badge[]> {
  // Fallback para quando Supabase não estiver configurado
  if (!supabase) {
    await loadBadgesInBatches();
    
    // Se ainda está gerando, retorna array vazio temporariamente
    if (isGenerating) {
      return [];
    }
    
    let filteredBadges = [...cachedBadges];
    
    // Aplicar filtros
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredBadges = filteredBadges.filter(badge => 
        badge.name.toLowerCase().includes(searchTerm) || 
        badge.code.toLowerCase().includes(searchTerm) ||
        badge.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.country) {
      filteredBadges = filteredBadges.filter(badge => 
        badge.countries.includes(filters.country!)
      );
    }
    
    if (filters.category) {
      filteredBadges = filteredBadges.filter(badge => 
        badge.categories.includes(filters.category!)
      );
    }
    
    if (filters.hotel) {
      filteredBadges = filteredBadges.filter(badge => 
        badge.hotel === filters.hotel
      );
    }
    
    // Paginação
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    
    return filteredBadges.slice(offset, offset + limit);
  }

  try {
    let query = supabase
      .from('badges')
      .select(`
        *,
        badge_categories(category),
        badge_countries(country)
      `)
      .eq('is_active', true);

    // Aplicar filtros
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.hotel) {
      query = query.eq('hotel', filters.hotel);
    }

    if (filters.country) {
      query = query.eq('badge_countries.country', filters.country);
    }

    if (filters.category) {
      query = query.eq('badge_categories.category', filters.category);
    }

    // Ordenação por data de criação (mais recentes primeiro por padrão)
    query = query.order('created_at', { ascending: false });

    // Paginação
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Processar dados para incluir categorias e países
    return data?.map(badge => ({
      ...badge,
      categories: badge.badge_categories?.map((c: any) => c.category) || [],
      countries: badge.badge_countries?.map((c: any) => c.country) || []
    })) || [];

  } catch (error) {
        throw error;
  }
}

/**
 * Buscar badge por código
 */
export async function getBadgeByCode(code: string): Promise<Badge | null> {
  if (!supabase) {
        return null;
  }

  try {
    const { data, error } = await supabase
      .from('badges')
      .select(`
        *,
        badge_categories(category),
        badge_countries(country)
      `)
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Badge não encontrado
      }
      throw error;
    }

    return {
      ...data,
      categories: data.badge_categories?.map((c: any) => c.category) || [],
      countries: data.badge_countries?.map((c: any) => c.country) || []
    };

  } catch (error) {
        throw error;
  }
}

/**
 * Buscar estatísticas dos badges
 */
export async function getBadgeStats(): Promise<BadgeStats> {
  if (!supabase) {
    await loadBadgesInBatches();
    
    const byCategory: Record<string, number> = {};
    const byCountry: Record<string, number> = {};
    const byHotel: Record<string, number> = {};
    
    cachedBadges.forEach(badge => {
      // Contar categorias
      badge.categories.forEach(cat => {
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      });
      
      // Contar países
      badge.countries.forEach(country => {
        byCountry[country] = (byCountry[country] || 0) + 1;
      });
      
      // Contar hotéis
      byHotel[badge.hotel] = (byHotel[badge.hotel] || 0) + 1;
    });
    
    return {
      total: cachedBadges.length,
      byCategory,
      byCountry,
      byHotel
    };
  }

  try {
    // Total de badges
    const { count: total } = await supabase
      .from('badges')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Por categoria
    const { data: categoryData } = await supabase
      .from('badge_categories')
      .select('category')
      .eq('badges.is_active', true)
      .innerJoin('badges', 'badge_categories.badge_id', 'badges.id');

    const byCategory: Record<string, number> = {};
    categoryData?.forEach((item: any) => {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    });

    // Por país
    const { data: countryData } = await supabase
      .from('badge_countries')
      .select('country')
      .eq('badges.is_active', true)
      .innerJoin('badges', 'badge_countries.badge_id', 'badges.id');

    const byCountry: Record<string, number> = {};
    countryData?.forEach((item: any) => {
      byCountry[item.country] = (byCountry[item.country] || 0) + 1;
    });

    // Por hotel
    const { data: hotelData } = await supabase
      .from('badges')
      .select('hotel')
      .eq('is_active', true);

    const byHotel: Record<string, number> = {};
    hotelData?.forEach((item: any) => {
      byHotel[item.hotel] = (byHotel[item.hotel] || 0) + 1;
    });

    return {
      total: total || 0,
      byCategory,
      byCountry,
      byHotel
    };

  } catch (error) {
        throw error;
  }
}

/**
 * Buscar categorias disponíveis
 */
export async function getAvailableCategories(): Promise<string[]> {
  if (!supabase) {
    await loadBadgesInBatches();
    
    const categories = new Set<string>();
    cachedBadges.forEach(badge => {
      badge.categories.forEach(cat => categories.add(cat));
    });
    
    return Array.from(categories).sort();
  }

  try {
    const { data, error } = await supabase
      .from('badge_categories')
      .select('category')
      .eq('badges.is_active', true)
      .innerJoin('badges', 'badge_categories.badge_id', 'badges.id')
      .order('category');

    if (error) {
      throw error;
    }

    return [...new Set(data?.map((item: any) => item.category) || [])];

  } catch (error) {
        throw error;
  }
}

/**
 * Buscar países disponíveis
 */
export async function getAvailableCountries(): Promise<string[]> {
  if (!supabase) {
    await loadBadgesInBatches();
    
    const countries = new Set<string>();
    cachedBadges.forEach(badge => {
      badge.countries.forEach(country => countries.add(country));
    });
    
    return Array.from(countries).sort();
  }

  try {
    const { data, error } = await supabase
      .from('badge_countries')
      .select('country')
      .eq('badges.is_active', true)
      .innerJoin('badges', 'badge_countries.badge_id', 'badges.id')
      .order('country');

    if (error) {
      throw error;
    }

    return [...new Set(data?.map((item: any) => item.country) || [])];

  } catch (error) {
        throw error;
  }
}

/**
 * Buscar hotéis disponíveis
 */
export async function getAvailableHotels(): Promise<string[]> {
  if (!supabase) {
    return ['com', 'com.br', 'es', 'fr', 'de', 'it', 'nl', 'com.tr', 'fi'];
  }

  try {
    const { data, error } = await supabase
      .from('badges')
      .select('hotel')
      .eq('is_active', true)
      .order('hotel');

    if (error) {
      throw error;
    }

    return [...new Set(data?.map((item: any) => item.hotel) || [])];

  } catch (error) {
        throw error;
  }
}

/**
 * Buscar badges mais recentes
 */
export async function getRecentBadges(limit: number = 10): Promise<Badge[]> {
  if (!supabase) {
    await loadBadgesInBatches();
    
    // Já estão ordenados por data de criação (mais recentes primeiro)
    return cachedBadges.slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('badges')
      .select(`
        *,
        badge_categories(category),
        badge_countries(country)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data?.map(badge => ({
      ...badge,
      categories: badge.badge_categories?.map((c: any) => c.category) || [],
      countries: badge.badge_countries?.map((c: any) => c.country) || []
    })) || [];

  } catch (error) {
        throw error;
  }
}

/**
 * Buscar badges clássicos (mais antigos)
 */
export async function getClassicBadges(limit: number = 10): Promise<Badge[]> {
  if (!supabase) {
    await loadBadgesInBatches();
    
    // Pegar os mais antigos (últimos da lista ordenada)
    const classicBadges = cachedBadges.slice(-limit);
    return classicBadges.reverse(); // Mais antigos primeiro
  }

  try {
    const { data, error } = await supabase
      .from('badges')
      .select(`
        *,
        badge_categories(category),
        badge_countries(country)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data?.map(badge => ({
      ...badge,
      categories: badge.badge_categories?.map((c: any) => c.category) || [],
      countries: badge.badge_countries?.map((c: any) => c.country) || []
    })) || [];

  } catch (error) {
        throw error;
  }
}
