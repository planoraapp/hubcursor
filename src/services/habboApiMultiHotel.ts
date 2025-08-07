
import { HotelCode } from '../contexts/HotelContext';

// Cache para requisições por hotel
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const hotelUrls: Record<HotelCode, string> = {
  'br': 'https://www.habbo.com.br',
  'com': 'https://www.habbo.com',
  'es': 'https://www.habbo.es',
  'fr': 'https://www.habbo.fr',
  'de': 'https://www.habbo.de',
  'it': 'https://www.habbo.it',
  'nl': 'https://www.habbo.nl',
  'fi': 'https://www.habbo.fi',
  'tr': 'https://www.habbo.com.tr'
};

// Função para fazer requisições com retry e timeout
const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🌐 [API Request] Tentativa ${i + 1}: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HabboHub/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ [API Success] Dados recebidos de ${url}`);
      return data;
      
    } catch (error) {
      console.error(`❌ [API Error] Tentativa ${i + 1} falhou:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Função para buscar usuário por nome em hotel específico
export const getUserByNameAndHotel = async (username: string, hotel: HotelCode) => {
  const cacheKey = `user-${username}-${hotel}`;
  const cached = apiCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`🎯 [Cache Hit] Dados do usuário ${username} (${hotel})`);
    return cached.data;
  }

  try {
    const baseUrl = hotelUrls[hotel];
    const url = `${baseUrl}/api/public/users?name=${encodeURIComponent(username)}`;
    
    const data = await fetchWithRetry(url);
    
    if (data && data.name) {
      apiCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } else {
      throw new Error('Usuário não encontrado');
    }
  } catch (error) {
    console.error(`❌ Erro ao buscar usuário ${username} no hotel ${hotel}:`, error);
    throw error;
  }
};

// Função para detectar hotel do habbo_id
export const detectHotelFromHabboId = (habboId: string): HotelCode => {
  if (habboId.startsWith('hhbr-')) return 'br';
  if (habboId.startsWith('hhcom-')) return 'com';
  if (habboId.startsWith('hhes-')) return 'es';
  if (habboId.startsWith('hhfr-')) return 'fr';
  if (habboId.startsWith('hhde-')) return 'de';
  if (habboId.startsWith('hhit-')) return 'it';
  if (habboId.startsWith('hhnl-')) return 'nl';
  if (habboId.startsWith('hhfi-')) return 'fi';
  if (habboId.startsWith('hhtr-')) return 'tr';
  return 'com'; // fallback
};

// Função para buscar usuário (tentativa automática de detectar hotel)
export const getUserByName = async (username: string, preferredHotel?: HotelCode) => {
  // Se um hotel preferido for especificado, tenta primeiro nele
  if (preferredHotel) {
    try {
      return await getUserByNameAndHotel(username, preferredHotel);
    } catch (error) {
      console.warn(`⚠️ Usuário ${username} não encontrado no hotel ${preferredHotel}`);
    }
  }

  // Tenta nos hotéis mais comuns primeiro
  const commonHotels: HotelCode[] = ['com', 'br', 'es', 'fr'];
  
  for (const hotel of commonHotels) {
    if (hotel === preferredHotel) continue; // já tentou
    
    try {
      return await getUserByNameAndHotel(username, hotel);
    } catch (error) {
      console.warn(`⚠️ Usuário ${username} não encontrado no hotel ${hotel}`);
    }
  }

  // Se não encontrou nos hotéis comuns, tenta nos demais
  const otherHotels: HotelCode[] = ['de', 'it', 'nl', 'fi', 'tr'];
  
  for (const hotel of otherHotels) {
    try {
      return await getUserByNameAndHotel(username, hotel);
    } catch (error) {
      console.warn(`⚠️ Usuário ${username} não encontrado no hotel ${hotel}`);
    }
  }

  throw new Error(`Usuário ${username} não encontrado em nenhum hotel`);
};

// Limpar cache periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of apiCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      apiCache.delete(key);
    }
  }
}, CACHE_DURATION);
