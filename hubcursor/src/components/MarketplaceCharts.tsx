
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Crown, Coins, Activity, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import IntelligentFurniImage from './IntelligentFurniImage';

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

interface MarketStats {
  totalItems: number;
  averagePrice: number;
  totalVolume: number;
  trendingUp: number;
  trendingDown: number;
  featuredItems: number;
  highestPrice: number;
  mostTraded: string;
}

export const MarketplaceCharts = () => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [stats, setStats] = useState<MarketStats>({
    totalItems: 0,
    averagePrice: 0,
    totalVolume: 0,
    trendingUp: 0,
    trendingDown: 0,
    featuredItems: 0,
    highestPrice: 0,
    mostTraded: 'N/A'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching enhanced marketplace data...');
      
      const { data, error } = await supabase.functions.invoke('marketplace-analytics');
      
      if (error) {
        throw error;
      }
      
      if (data?.items && Array.isArray(data.items)) {
        setItems(data.items);
        setStats(data.stats || stats);
        console.log(`✅ Loaded ${data.items.length} enhanced market items`);
      }
    } catch (error) {
      console.error('❌ Error fetching enhanced marketplace data:', error);
      setError('Erro ao carregar dados do marketplace');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500 text-white';
      case 'rare': return 'bg-purple-500 text-white';
      case 'uncommon': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatPrice = (price: number) => `${price.toLocaleString()} cr`;

  // Featured items (most traded/valuable)
  const featuredItems = items.filter(item => item.isFeatured).slice(0, 8);
  const regularItems = items.filter(item => !item.isFeatured).slice(0, 20);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-semibold">Carregando Dados do Marketplace...</p>
          <p className="text-gray-500 text-sm mt-2">Analisando tendências do mercado</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
        <button 
          onClick={fetchMarketplaceData}
          className="habbo-button-blue px-6 py-2"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="habbo-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Itens Totais</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="habbo-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Preço Médio</p>
                <p className="text-2xl font-bold">{formatPrice(stats.averagePrice)}</p>
              </div>
              <Coins className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="habbo-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Volume Total</p>
                <p className="text-2xl font-bold">{stats.totalVolume}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="habbo-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Maior Preço</p>
                <p className="text-2xl font-bold">{formatPrice(stats.highestPrice)}</p>
              </div>
              <Crown className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Items Section */}
      <Card className="habbo-panel">
        <CardHeader className="habbo-header">
          <CardTitle className="flex items-center gap-2 text-white">
            <Star className="w-5 h-5" />
            Itens Mais Negociados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredItems.map((item, index) => (
              <div key={item.id} className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                <div className="relative">
                  {/* Ranking badge */}
                  <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                    {index + 1}
                  </div>
                  
                  {/* Item image with enhanced display */}
                  <div className="text-center mb-3">
                    <div className="inline-block p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                      <IntelligentFurniImage
                        swfName={item.name.toLowerCase().replace(/\s+/g, '_')}
                        name={item.name}
                        originalUrl={item.imageUrl}
                        size="lg"
                      />
                    </div>
                  </div>
                  
                  {/* Item details */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-sm truncate" title={item.name}>
                      {item.name}
                    </h3>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(item.currentPrice)}
                      </span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(item.trend)}
                        <span className={`text-xs font-semibold ${
                          item.trend === 'up' ? 'text-green-600' : 
                          item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {item.changePercent}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Badge className={`text-xs ${getRarityColor(item.rarity)}`}>
                        {item.rarity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Vol: {item.volume}
                      </span>
                    </div>
                    
                    {item.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Trends Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="habbo-card">
          <CardHeader>
            <CardTitle>Tendências de Preço</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={featuredItems.slice(0, 5).map(item => ({
                name: item.name.slice(0, 10) + '...',
                price: item.currentPrice,
                previous: item.previousPrice
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} />
                <Line type="monotone" dataKey="previous" stroke="#64748b" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="habbo-card">
          <CardHeader>
            <CardTitle>Volume por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(
                items.reduce((acc, item) => {
                  acc[item.category] = (acc[item.category] || 0) + item.volume;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([name, volume]) => ({ name, volume })).slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volume" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Regular Items List */}
      <Card className="habbo-panel">
        <CardHeader className="habbo-header">
          <CardTitle className="text-white">Lista Geral do Mercado</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {regularItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-gray-200 rounded-lg p-2 hover:border-blue-300 transition-all duration-200 hover:scale-105"
                title={`${item.name} - ${formatPrice(item.currentPrice)}`}
              >
                <div className="aspect-square mb-2">
                  <IntelligentFurniImage
                    swfName={item.name.toLowerCase().replace(/\s+/g, '_')}
                    name={item.name}
                    originalUrl={item.imageUrl}
                    size="sm"
                  />
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-gray-700 truncate">
                    {formatPrice(item.currentPrice)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {getTrendIcon(item.trend)}
                    <span className="text-xs text-gray-500">
                      {item.volume}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
