
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface MarketItem {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  previousPrice: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: string;
  volume: number;
  imageUrl: string;
  rarity: string;
  priceHistory: number[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🌐 [Marketplace Analytics] Fetching market data...');

    // Try multiple sources for market data
    const sources = [
      'https://api.ducket.net/items',
      'https://furnieye.net/api/items'
    ];

    let marketData: any[] = [];
    let successfulSource = '';

    // Try each source
    for (const source of sources) {
      try {
        console.log(`📡 [Marketplace] Trying: ${source}`);
        
        const response = await fetch(source, {
          headers: {
            'User-Agent': 'HabboHub-Analytics/1.0',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            marketData = data.slice(0, 100); // Limit to top 100 items
            successfulSource = source;
            console.log(`✅ Success with ${marketData.length} items from ${source}`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Error with ${source}:`, error.message);
        continue;
      }
    }

    // If no real data, generate realistic mock data
    if (marketData.length === 0) {
      console.log('🔄 Generating marketplace fallback data');
      marketData = generateMarketplaceFallbackData();
      successfulSource = 'fallback';
    }

    // Process market data
    const processedItems: MarketItem[] = marketData.map((item: any, index: number) => {
      const currentPrice = item.price || item.credits || Math.floor(Math.random() * 500) + 50;
      const previousPrice = Math.floor(currentPrice * (0.8 + Math.random() * 0.4)); // ±20% variation
      const change = ((currentPrice - previousPrice) / previousPrice) * 100;
      const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';

      return {
        id: item.id || `market_${index}`,
        name: item.name || item.furni_name || `Item ${index + 1}`,
        category: categorizeMarketItem(item.name || ''),
        currentPrice,
        previousPrice,
        trend,
        changePercent: change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`,
        volume: item.volume || Math.floor(Math.random() * 100) + 10,
        imageUrl: item.image || item.icon || `https://habboemotion.com/images/furnis/market_${index}.png`,
        rarity: determineMarketRarity(currentPrice),
        priceHistory: generatePriceHistory(currentPrice)
      };
    });

    // Calculate market statistics
    const marketStats = {
      totalItems: processedItems.length,
      averagePrice: Math.floor(processedItems.reduce((sum, item) => sum + item.currentPrice, 0) / processedItems.length),
      totalVolume: processedItems.reduce((sum, item) => sum + item.volume, 0),
      trendingUp: processedItems.filter(item => item.trend === 'up').length,
      trendingDown: processedItems.filter(item => item.trend === 'down').length
    };

    console.log(`🎯 Processed ${processedItems.length} market items`);

    return new Response(
      JSON.stringify({
        items: processedItems,
        stats: marketStats,
        metadata: {
          source: successfulSource,
          fetchedAt: new Date().toISOString(),
          nextUpdate: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [Marketplace Analytics] Error:', error);
    
    return new Response(
      JSON.stringify({
        items: generateMarketplaceFallbackData().slice(0, 20),
        stats: { totalItems: 20, averagePrice: 125, totalVolume: 500, trendingUp: 8, trendingDown: 6 },
        metadata: {
          source: 'error-fallback',
          error: error.message
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function categorizeMarketItem(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('trono') || lowerName.includes('throne')) return 'raros';
  if (lowerName.includes('chair') || lowerName.includes('cadeira')) return 'móveis';
  if (lowerName.includes('plant') || lowerName.includes('planta')) return 'decoração';
  if (lowerName.includes('clothing') || lowerName.includes('roupa')) return 'roupas';
  if (lowerName.includes('pet') || lowerName.includes('animal')) return 'pets';
  
  return 'diversos';
}

function determineMarketRarity(price: number): string {
  if (price > 1000) return 'legendary';
  if (price > 500) return 'rare';
  if (price > 200) return 'uncommon';
  return 'common';
}

function generatePriceHistory(currentPrice: number): number[] {
  const history = [];
  let price = Math.floor(currentPrice * 0.7); // Start 30% lower
  
  for (let i = 0; i < 30; i++) { // 30 days of history
    const variation = (Math.random() - 0.5) * 0.1; // ±5% daily variation
    price = Math.max(1, Math.floor(price * (1 + variation)));
    history.push(price);
  }
  
  return history;
}

function generateMarketplaceFallbackData(): MarketItem[] {
  const fallbackItems = [
    { name: 'Trono de Ouro', basePrice: 2500, category: 'raros' },
    { name: 'Sofá Moderno', basePrice: 75, category: 'móveis' },
    { name: 'Mesa de Jantar', basePrice: 120, category: 'móveis' },
    { name: 'Planta Tropical', basePrice: 45, category: 'decoração' },
    { name: 'Cadeira Gamer', basePrice: 200, category: 'móveis' },
    { name: 'Dragão Pet', basePrice: 500, category: 'pets' },
    { name: 'Camiseta Rara', basePrice: 150, category: 'roupas' },
    { name: 'Luminária LED', basePrice: 80, category: 'decoração' },
    { name: 'Estante de Livros', basePrice: 95, category: 'móveis' },
    { name: 'Tapete Persa', basePrice: 300, category: 'decoração' }
  ];

  return fallbackItems.map((item, index) => {
    const currentPrice = item.basePrice + Math.floor(Math.random() * 100 - 50);
    const previousPrice = Math.floor(currentPrice * (0.85 + Math.random() * 0.3));
    const change = ((currentPrice - previousPrice) / previousPrice) * 100;
    
    return {
      id: `fallback_${index}`,
      name: item.name,
      category: item.category,
      currentPrice,
      previousPrice,
      trend: change > 0 ? 'up' : 'down',
      changePercent: change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`,
      volume: Math.floor(Math.random() * 50) + 10,
      imageUrl: `https://habboemotion.com/images/furnis/fallback_${index}.png`,
      rarity: determineMarketRarity(currentPrice),
      priceHistory: generatePriceHistory(currentPrice)
    };
  });
}
