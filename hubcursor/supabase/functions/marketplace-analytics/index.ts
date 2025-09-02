
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
  isFeatured: boolean;
  description?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🌐 [Enhanced Marketplace] Fetching market data...');

    // Try multiple reliable sources for market data
    const sources = [
      { url: 'https://www.habbowidgets.com/api/marketplace', type: 'habbowidgets' },
      { url: 'https://habbowidgets.com/api/marketplace', type: 'habbowidgets' },
      { url: 'https://api.furnieye.net/marketplace', type: 'furnieye' },
      { url: 'https://furnieye.net/api/marketplace', type: 'furnieye' }
    ];

    let marketData: any[] = [];
    let successfulSource = '';
    let sourceType = '';

    // Try each source
    for (const source of sources) {
      try {
        console.log(`📡 [Enhanced Marketplace] Trying: ${source.url}`);
        
        const response = await fetch(source.url, {
          headers: {
            'User-Agent': 'HabboHub-Enhanced/2.0',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(8000)
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            marketData = data.slice(0, 150); // Limit to top 150 items
            successfulSource = source.url;
            sourceType = source.type;
            console.log(`✅ Success with ${marketData.length} items from ${source.url}`);
            break;
          } else if (data.items && Array.isArray(data.items)) {
            marketData = data.items.slice(0, 150);
            successfulSource = source.url;
            sourceType = source.type;
            console.log(`✅ Success with ${marketData.length} items from ${source.url}`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Error with ${source.url}:`, error.message);
        continue;
      }
    }

    // Enhanced fallback with realistic market data
    if (marketData.length === 0) {
      console.log('🔄 Generating enhanced marketplace fallback data');
      marketData = generateEnhancedMarketplaceFallback();
      successfulSource = 'enhanced-fallback';
      sourceType = 'fallback';
    }

    // Process market data with enhanced features
    const processedItems: MarketItem[] = marketData.map((item: any, index: number) => {
      const currentPrice = item.price || item.credits || item.current_price || Math.floor(Math.random() * 800) + 100;
      const previousPrice = Math.floor(currentPrice * (0.75 + Math.random() * 0.5)); // ±25% variation
      const change = ((currentPrice - previousPrice) / previousPrice) * 100;
      const trend = change > 8 ? 'up' : change < -8 ? 'down' : 'stable';
      
      const itemName = item.name || item.furni_name || item.item_name || `Item Raro ${index + 1}`;
      
      return {
        id: item.id || `market_${index}`,
        name: itemName,
        category: categorizeMarketItem(itemName),
        currentPrice,
        previousPrice,
        trend,
        changePercent: change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`,
        volume: item.volume || Math.floor(Math.random() * 200) + 20,
        imageUrl: generateMarketItemImageUrl(item, index),
        rarity: determineMarketRarity(currentPrice, itemName),
        priceHistory: generatePriceHistory(currentPrice),
        isFeatured: index < 6, // Top 6 items are featured
        description: generateItemDescription(itemName, currentPrice)
      };
    });

    // Sort by volume and price for better featured items
    const sortedItems = processedItems.sort((a, b) => b.volume - a.volume);
    
    // Mark top items as featured
    sortedItems.forEach((item, index) => {
      item.isFeatured = index < 8;
    });

    // Calculate enhanced market statistics
    const marketStats = {
      totalItems: sortedItems.length,
      averagePrice: Math.floor(sortedItems.reduce((sum, item) => sum + item.currentPrice, 0) / sortedItems.length),
      totalVolume: sortedItems.reduce((sum, item) => sum + item.volume, 0),
      trendingUp: sortedItems.filter(item => item.trend === 'up').length,
      trendingDown: sortedItems.filter(item => item.trend === 'down').length,
      featuredItems: sortedItems.filter(item => item.isFeatured).length,
      highestPrice: Math.max(...sortedItems.map(item => item.currentPrice)),
      mostTraded: sortedItems[0]?.name || 'N/A'
    };

    console.log(`🎯 Processed ${sortedItems.length} enhanced market items`);

    return new Response(
      JSON.stringify({
        items: sortedItems,
        stats: marketStats,
        metadata: {
          source: successfulSource,
          sourceType,
          fetchedAt: new Date().toISOString(),
          nextUpdate: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [Enhanced Marketplace] Error:', error);
    
    const fallbackData = generateEnhancedMarketplaceFallback();
    
    return new Response(
      JSON.stringify({
        items: fallbackData,
        stats: { 
          totalItems: fallbackData.length, 
          averagePrice: 285, 
          totalVolume: 1250, 
          trendingUp: 12, 
          trendingDown: 8,
          featuredItems: 8,
          highestPrice: 2500,
          mostTraded: 'Trono Dourado'
        },
        metadata: {
          source: 'error-fallback',
          error: error.message
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateMarketItemImageUrl(item: any, index: number): string {
  // Try to use provided image URL first
  if (item.image || item.image_url || item.icon) {
    return item.image || item.image_url || item.icon;
  }
  
  // Generate based on item name or use fallback patterns
  const itemName = item.name || item.furni_name || `item_${index}`;
  const cleanName = itemName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  
  const patterns = [
    `https://www.habbowidgets.com/images/furni/${cleanName}.gif`,
    `https://habbowidgets.com/images/${cleanName}.gif`,
    `https://images.habbo.com/dcr/hof_furni/${cleanName}.png`,
    `https://habboemotion.com/images/furnis/${cleanName}.png`,
    `https://via.placeholder.com/64x64/f0f0f0/666?text=${encodeURIComponent(itemName.charAt(0))}`
  ];
  
  return patterns[0];
}

function categorizeMarketItem(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('trono') || lowerName.includes('throne') || lowerName.includes('throne')) return 'tronos';
  if (lowerName.includes('chair') || lowerName.includes('cadeira')) return 'cadeiras';
  if (lowerName.includes('plant') || lowerName.includes('planta') || lowerName.includes('flower')) return 'plantas';
  if (lowerName.includes('clothing') || lowerName.includes('roupa') || lowerName.includes('hat')) return 'roupas';
  if (lowerName.includes('pet') || lowerName.includes('animal')) return 'pets';
  if (lowerName.includes('rare') || lowerName.includes('raro') || lowerName.includes('ltd')) return 'raros';
  if (lowerName.includes('wall') || lowerName.includes('parede') || lowerName.includes('poster')) return 'parede';
  
  return 'moveis';
}

function determineMarketRarity(price: number, name: string): string {
  const lowerName = name.toLowerCase();
  
  if (price > 2000 || lowerName.includes('throne') || lowerName.includes('trono')) return 'legendary';
  if (price > 800 || lowerName.includes('rare') || lowerName.includes('ltd')) return 'rare';
  if (price > 300 || lowerName.includes('hc') || lowerName.includes('special')) return 'uncommon';
  return 'common';
}

function generateItemDescription(name: string, price: number): string {
  const category = categorizeMarketItem(name);
  const rarity = determineMarketRarity(price, name);
  
  const descriptions = {
    'tronos': 'Móvel extremamente raro e valioso, símbolo de status no Habbo.',
    'raros': 'Item de edição limitada com alto valor de colecionador.',
    'roupas': 'Peça exclusiva para personalizar seu avatar.',
    'pets': 'Animal de estimação raro para seu quarto.',
    'plantas': 'Decoração natural para ambientes sofisticados.',
    'moveis': 'Móvel funcional para decoração de quartos.'
  };
  
  return descriptions[category as keyof typeof descriptions] || 'Item exclusivo do Habbo Hotel.';
}

function generatePriceHistory(currentPrice: number): number[] {
  const history = [];
  let price = Math.floor(currentPrice * 0.6); // Start 40% lower
  
  for (let i = 0; i < 30; i++) { // 30 days of history
    const variation = (Math.random() - 0.5) * 0.15; // ±7.5% daily variation
    price = Math.max(10, Math.floor(price * (1 + variation)));
    history.push(price);
  }
  
  // Ensure the last price is close to current price
  history[29] = Math.floor(currentPrice * (0.95 + Math.random() * 0.1));
  
  return history;
}

function generateEnhancedMarketplaceFallback(): MarketItem[] {
  const premiumItems = [
    { name: 'Trono Dourado', basePrice: 2800, category: 'tronos' },
    { name: 'Dragão de Cristal', basePrice: 1850, category: 'pets' },
    { name: 'Sofá Real Premium', basePrice: 920, category: 'raros' },
    { name: 'Planta Tropical Rara', basePrice: 680, category: 'plantas' },
    { name: 'Mesa de Jantar Imperial', basePrice: 540, category: 'moveis' },
    { name: 'Cadeira Gamer Elite', basePrice: 450, category: 'cadeiras' },
    { name: 'Poster Vintage LTD', basePrice: 380, category: 'parede' },
    { name: 'Chapéu de Diamante', basePrice: 720, category: 'roupas' },
    { name: 'Luminária de Cristal', basePrice: 290, category: 'moveis' },
    { name: 'Estante Real', basePrice: 220, category: 'moveis' },
    { name: 'Tapete Persa Antigo', basePrice: 390, category: 'raros' },
    { name: 'Aquário de Luxo', basePrice: 480, category: 'pets' },
    { name: 'Cama Imperial', basePrice: 350, category: 'moveis' },
    { name: 'Espelho Mágico', basePrice: 260, category: 'parede' },
    { name: 'Televisão 4K Premium', basePrice: 420, category: 'moveis' }
  ];

  return premiumItems.map((item, index) => {
    const variation = Math.random() * 200 - 100; // ±100 credits variation
    const currentPrice = item.basePrice + variation;
    const previousPrice = Math.floor(currentPrice * (0.8 + Math.random() * 0.4));
    const change = ((currentPrice - previousPrice) / previousPrice) * 100;
    
    return {
      id: `enhanced_${index}`,
      name: item.name,
      category: item.category,
      currentPrice: Math.floor(currentPrice),
      previousPrice,
      trend: change > 0 ? 'up' : 'down',
      changePercent: change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`,
      volume: Math.floor(Math.random() * 150) + 25,
      imageUrl: generateMarketItemImageUrl({ name: item.name }, index),
      rarity: determineMarketRarity(currentPrice, item.name),
      priceHistory: generatePriceHistory(currentPrice),
      isFeatured: index < 8,
      description: generateItemDescription(item.name, currentPrice)
    };
  });
}
