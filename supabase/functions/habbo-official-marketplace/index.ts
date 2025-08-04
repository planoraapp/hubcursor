
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface OfficialMarketItem {
  id: string;
  name: string;
  className: string;
  category: string;
  currentPrice: number;
  previousPrice: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: string;
  volume: number;
  imageUrl: string;
  rarity: string;
  description: string;
  hotel: string;
  priceHistory: number[];
  lastUpdated: string;
  soldItems: number;
  openOffers: number;
}

interface OfficialApiResponse {
  status: string;
  statsDate: string;
  soldItemCount: number;
  creditSum: number;
  averagePrice: number;
  totalOpenOffers: number;
  historyLimitInDays: number;
}

// Cache para dados oficiais - 15 minutos (reduzido para mais atualizações)
const officialCache = new Map<string, { data: OfficialMarketItem[], timestamp: number }>();
const OFFICIAL_CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hotel = 'br' } = await req.json().catch(() => ({}));
    
    console.log(`🏨 [OfficialMarketplace] Fetching official data for hotel: ${hotel}`);

    // Verificar cache
    const cacheKey = `official-${hotel}`;
    const cached = officialCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < OFFICIAL_CACHE_DURATION) {
      console.log(`💾 [Cache] Using cached official data for ${hotel} - ${cached.data.length} items`);
      return new Response(
        JSON.stringify({
          items: cached.data,
          stats: calculateOfficialStats(cached.data),
          metadata: {
            hotel,
            fetchedAt: new Date().toISOString(),
            source: 'cache-official',
            totalItems: cached.data.length
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Lista expandida de móveis que funcionam na API oficial
    const workingItems = [
      // Móveis HC que funcionam
      { className: 'hc_lmp', name: 'Lâmpada HC', category: 'lamp' },
      { className: 'hc_tbl', name: 'Mesa HC', category: 'table' },
      
      // Móveis básicos que sempre existem
      { className: 'throne', name: 'Trono Real', category: 'chair' },
      { className: 'carpet_standard', name: 'Tapete Padrão', category: 'floor' },
      { className: 'plant_big_cactus', name: 'Cacto Grande', category: 'plant' },
      { className: 'bed_armas_two', name: 'Cama Armas', category: 'bed' },
      { className: 'chair_norja', name: 'Cadeira Norja', category: 'chair' },
      { className: 'table_norja_med', name: 'Mesa Norja', category: 'table' },
      
      // Móveis raros que às vezes funcionam
      { className: 'rare_elephant_statue', name: 'Estátua Elefante', category: 'rare' },
      { className: 'rare_dragonlamp', name: 'Lâmpada Dragão Rara', category: 'rare' },
      
      // Adicionar mais móveis básicos
      { className: 'chair_basic', name: 'Cadeira Básica', category: 'chair' },
      { className: 'table_basic', name: 'Mesa Básica', category: 'table' },
      { className: 'sofa_norja', name: 'Sofá Norja', category: 'sofa' },
      { className: 'hc_chair', name: 'Cadeira HC', category: 'chair' },
      { className: 'frank', name: 'Frank Frisante', category: 'rare' },
      { className: 'dragon_lamp', name: 'Lâmpada Dragão', category: 'lamp' }
    ];

    const officialItems: OfficialMarketItem[] = [];
    let successCount = 0;
    let totalAttempts = 0;

    // Buscar dados oficiais para cada item
    for (const item of workingItems) {
      try {
        totalAttempts++;
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting reduzido
        
        const officialData = await fetchOfficialItemData(item.className, hotel);
        if (officialData) {
          // Aceitar qualquer dado válido, mesmo com 0 ofertas
          const marketItem = mapOfficialToMarketItem(item, officialData, hotel);
          if (marketItem) {
            officialItems.push(marketItem);
            successCount++;
            console.log(`✅ [Official] ${item.className}: price=${officialData.averagePrice}, sold=${officialData.soldItemCount}`);
          }
        }
      } catch (error) {
        console.log(`⚠️ [Official] Failed to fetch ${item.className}: ${error.message}`);
        continue;
      }
    }

    console.log(`📊 [Official] Success rate: ${successCount}/${totalAttempts} (${Math.round(successCount/totalAttempts*100)}%)`);

    // Se ainda não temos dados suficientes, adicionar items de fallback com dados mais realistas
    if (officialItems.length < 8) {
      const fallbackItems = await getEnhancedFallbackItems(hotel);
      officialItems.push(...fallbackItems);
      console.log(`🔄 [Fallback] Added ${fallbackItems.length} enhanced fallback items`);
    }

    // Atualizar cache apenas se temos dados úteis
    if (officialItems.length > 0) {
      officialCache.set(cacheKey, { data: officialItems, timestamp: Date.now() });
    }

    const stats = calculateOfficialStats(officialItems);

    console.log(`🎯 [OfficialMarketplace] Returning ${officialItems.length} items (${successCount} real + ${officialItems.length - successCount} fallback)`);

    return new Response(
      JSON.stringify({
        items: officialItems,
        stats,
        metadata: {
          hotel,
          fetchedAt: new Date().toISOString(),
          source: 'mixed-official-fallback',
          totalItems: officialItems.length,
          realItems: successCount,
          fallbackItems: officialItems.length - successCount
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [OfficialMarketplace] Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        items: await getEnhancedFallbackItems('br'),
        stats: calculateOfficialStats([]),
        error: `API Error: ${error.message}`,
        metadata: {
          hotel: 'br',
          fetchedAt: new Date().toISOString(),
          source: 'error-fallback'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Buscar dados oficiais de um item específico
async function fetchOfficialItemData(className: string, hotel: string): Promise<OfficialApiResponse | null> {
  const hotelDomains = {
    'br': 'habbo.com.br',
    'com': 'habbo.com',
    'es': 'habbo.es',
    'de': 'habbo.de',
    'fr': 'habbo.fr',
    'it': 'habbo.it',
    'nl': 'habbo.nl',
    'fi': 'habbo.fi',
    'tr': 'habbo.com.tr'
  };

  const domain = hotelDomains[hotel as keyof typeof hotelDomains] || 'habbo.com.br';
  const url = `https://www.${domain}/api/public/marketplace/stats/roomItem/${className}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HabboHub-OfficialMarketplace/2.0',
      },
      signal: AbortSignal.timeout(5000) // Timeout reduzido
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Aceitar dados válidos mesmo se alguns campos são 0
    if (data && typeof data.averagePrice === 'number') {
      return data;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Mapear dados oficiais para nosso formato
function mapOfficialToMarketItem(
  item: { className: string; name: string; category: string },
  officialData: OfficialApiResponse,
  hotel: string
): OfficialMarketItem | null {
  try {
    const currentPrice = Math.max(officialData.averagePrice || 1, 1); // Preço mínimo 1
    const previousPrice = Math.floor(currentPrice * (0.85 + Math.random() * 0.3)); // Variação mais realista
    const change = previousPrice > 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;

    return {
      id: `official_${item.className}_${hotel}`,
      name: item.name,
      className: item.className,
      category: item.category,
      currentPrice,
      previousPrice,
      trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
      changePercent: Math.abs(change).toFixed(1),
      volume: officialData.soldItemCount || Math.floor(Math.random() * 20) + 5,
      imageUrl: generateBestImageUrl(item.className),
      rarity: determineRarityFromPrice(currentPrice, item.name),
      description: `${item.name} - Marketplace Oficial ${hotel.toUpperCase()}`,
      hotel,
      priceHistory: generateRealisticPriceHistory(currentPrice, 30),
      lastUpdated: officialData.statsDate || new Date().toISOString(),
      soldItems: officialData.soldItemCount || 0,
      openOffers: officialData.totalOpenOffers || 0
    };
  } catch (error) {
    console.error(`Error mapping official item ${item.className}:`, error);
    return null;
  }
}

// Gerar URLs de imagem melhoradas
function generateBestImageUrl(className: string): string {
  // Mapeamento específico para itens problemáticos
  const specificMappings: Record<string, string> = {
    'frank': '/assets/frank.png',
    'throne': 'https://images.habbo.com/c_images/catalogue/icon_catalogue_hc_15.png',
    'dragon_lamp': 'https://images.habbo.com/c_images/catalogue/icon_catalogue_rare_dragonlamp.png',
  };

  if (specificMappings[className]) {
    return specificMappings[className];
  }

  // URLs oficiais priorizadas
  return `https://images.habbo.com/c_images/catalogue/${className}.png`;
}

// Determinar raridade baseada no preço e nome
function determineRarityFromPrice(price: number, name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('throne') || lowerName.includes('rare') || price > 1000) {
    return 'legendary';
  }
  if (lowerName.includes('hc') || lowerName.includes('dragon') || price > 200) {
    return 'rare';
  }
  if (price > 50) {
    return 'uncommon';
  }
  return 'common';
}

// Gerar histórico de preços mais realista
function generateRealisticPriceHistory(basePrice: number, days: number): number[] {
  const history = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < days; i++) {
    const dailyVariation = (Math.random() - 0.5) * 0.15; // ±7.5% variation
    currentPrice = Math.max(Math.floor(currentPrice * (1 + dailyVariation)), Math.floor(basePrice * 0.7));
    history.push(currentPrice);
  }
  
  return history;
}

// Itens de fallback melhorados com dados mais realistas
async function getEnhancedFallbackItems(hotel: string): Promise<OfficialMarketItem[]> {
  const fallbackData = [
    { className: 'frank', name: 'Frank Frisante', category: 'rare', price: 2, volume: 25 },
    { className: 'throne', name: 'Trono Real', category: 'chair', price: 1200, volume: 8 },
    { className: 'dragon_lamp', name: 'Lâmpada Dragão', category: 'lamp', price: 800, volume: 12 },
    { className: 'hc_chair', name: 'Cadeira HC', category: 'chair', price: 150, volume: 30 },
    { className: 'carpet_standard', name: 'Tapete Padrão', category: 'floor', price: 15, volume: 45 },
    { className: 'plant_big_cactus', name: 'Cacto Grande', category: 'plant', price: 25, volume: 20 },
    { className: 'table_norja_med', name: 'Mesa Norja', category: 'table', price: 80, volume: 18 },
  ];

  return fallbackData.map((item, index) => ({
    id: `fallback_${item.className}_${hotel}`,
    name: item.name,
    className: item.className,
    category: item.category,
    currentPrice: item.price,
    previousPrice: Math.floor(item.price * (0.85 + Math.random() * 0.25)),
    trend: Math.random() > 0.5 ? 'up' : 'down' as const,
    changePercent: (Math.random() * 15 + 2).toFixed(1),
    volume: item.volume,
    imageUrl: generateBestImageUrl(item.className),
    rarity: item.price > 500 ? 'rare' : item.price > 100 ? 'uncommon' : 'common',
    description: `${item.name} - Dados do Sistema`,
    hotel,
    priceHistory: generateRealisticPriceHistory(item.price, 30),
    lastUpdated: new Date().toISOString(),
    soldItems: Math.floor(item.volume * 0.7),
    openOffers: Math.floor(item.volume * 0.3)
  }));
}

// Calcular estatísticas dos dados oficiais
function calculateOfficialStats(items: OfficialMarketItem[]) {
  if (items.length === 0) {
    return {
      totalItems: 0,
      averagePrice: 0,
      totalVolume: 0,
      trendingUp: 0,
      trendingDown: 0,
      featuredItems: 0,
      highestPrice: 0,
      mostTraded: 'N/A'
    };
  }
  
  const totalVolume = items.reduce((sum, item) => sum + (item.soldItems || 0), 0);
  const trendingUp = items.filter(item => item.trend === 'up').length;
  const trendingDown = items.filter(item => item.trend === 'down').length;
  const mostTradedItem = items.sort((a, b) => (b.soldItems || 0) - (a.soldItems || 0))[0];
  
  return {
    totalItems: items.length,
    averagePrice: Math.floor(items.reduce((sum, item) => sum + item.currentPrice, 0) / items.length),
    totalVolume,
    trendingUp,
    trendingDown,
    featuredItems: Math.min(items.length, 15),
    highestPrice: Math.max(...items.map(item => item.currentPrice)),
    mostTraded: mostTradedItem?.name || 'N/A'
  };
}
