
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Activity } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

interface MarketStats {
  totalItems: number;
  averagePrice: number;
  totalVolume: number;
  trendingUp: number;
  trendingDown: number;
}

export const MarketplaceCharts = () => {
  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching marketplace data...');
      
      const { data, error } = await supabase.functions.invoke('marketplace-analytics');
      
      if (error) {
        throw error;
      }
      
      if (data?.items && data?.stats) {
        setMarketData(data.items);
        setMarketStats(data.stats);
        console.log('✅ Market data loaded:', data.items.length, 'items');
      }
    } catch (error) {
      console.error('❌ Error fetching market data:', error);
      // Set fallback data
      setMarketStats({
        totalItems: 0,
        averagePrice: 0,
        totalVolume: 0,
        trendingUp: 0,
        trendingDown: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const topItems = marketData
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);

  const trendingItems = marketData
    .filter(item => item.trend === 'up')
    .sort((a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent))
    .slice(0, 5);

  const chartData = selectedItem ? 
    selectedItem.priceHistory.map((price, index) => ({
      day: `Dia ${index + 1}`,
      price
    })).slice(-14) : // Last 14 days
    [];

  const volumeChartData = topItems.map(item => ({
    name: item.name.substring(0, 15) + (item.name.length > 15 ? '...' : ''),
    volume: item.volume,
    price: item.currentPrice
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <PanelCard title="Mercado Habbo - Analytics">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados do mercado...</p>
            </div>
          </div>
        </PanelCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PanelCard>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-600">Itens Ativos</p>
              <p className="text-2xl font-bold text-gray-800">
                {marketStats?.totalItems.toLocaleString()}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </PanelCard>

        <PanelCard>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-600">Preço Médio</p>
              <p className="text-2xl font-bold text-gray-800">
                {marketStats?.averagePrice} 🪙
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </PanelCard>

        <PanelCard>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-600">Em Alta</p>
              <p className="text-2xl font-bold text-green-600">
                {marketStats?.trendingUp}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </PanelCard>

        <PanelCard>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-600">Em Baixa</p>
              <p className="text-2xl font-bold text-red-600">
                {marketStats?.trendingDown}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </PanelCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PanelCard title="Volume de Negociações - Top 10">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}`, 'Volume']} />
                <Bar dataKey="volume" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>

        <PanelCard title="Histórico de Preços">
          <div className="mb-4">
            <select
              onChange={(e) => {
                const item = marketData.find(item => item.id === e.target.value);
                setSelectedItem(item || null);
              }}
              className="habbo-input w-full"
              defaultValue=""
            >
              <option value="">Selecione um item...</option>
              {marketData.slice(0, 20).map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="h-64">
            {selectedItem && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} moedas`, 'Preço']} />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-2" />
                  <p>Selecione um item para ver o histórico</p>
                </div>
              </div>
            )}
          </div>
        </PanelCard>
      </div>

      {/* Trending Items */}
      <PanelCard title="🔥 Itens em Alta">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {trendingItems.map(item => (
            <div key={item.id} className="habbo-card">
              <div className="p-4 text-center">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-12 h-12 mx-auto mb-2 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <h4 className="font-semibold text-sm text-gray-800 mb-1">
                  {item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}
                </h4>
                <div className="text-lg font-bold text-green-600 mb-1">
                  {item.currentPrice} 🪙
                </div>
                <div className="flex items-center justify-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">
                    {item.changePercent}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Vol: {item.volume}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      {/* All Market Items */}
      <PanelCard title="Todos os Itens do Mercado">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
          {marketData.map(item => (
            <div key={item.id} className="habbo-card">
              <div className="p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-800">
                    {item.currentPrice} 🪙
                  </div>
                  <div className="flex items-center">
                    {item.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : item.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    ) : (
                      <div className="w-4 h-4 bg-gray-400 rounded-full mr-1"></div>
                    )}
                    <span className={`text-xs font-medium ${
                      item.trend === 'up' ? 'text-green-600' :
                      item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {item.changePercent}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
};
