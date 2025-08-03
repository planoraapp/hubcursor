
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { Search, Filter, TrendingUp, TrendingDown, Star, Globe, Calendar, Package, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  description: string;
  className: string;
  hotel: string;
  priceHistory: number[];
  lastUpdated: string;
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

export const MarketplaceReal = () => {
  const { t } = useLanguage();
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
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedHotel, setSelectedHotel] = useState('br');
  const [selectedDays, setSelectedDays] = useState(30);

  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'chair', name: 'Cadeiras' },
    { id: 'table', name: 'Mesas' },
    { id: 'bed', name: 'Camas' },
    { id: 'plant', name: 'Plantas' },
    { id: 'lamp', name: 'Iluminação' },
    { id: 'rare', name: 'Raros' },
  ];

  const hotels = [
    { id: 'br', name: 'Habbo.com.br', flag: '🇧🇷' },
    { id: 'com', name: 'Habbo.com', flag: '🇺🇸' },
    { id: 'de', name: 'Habbo.de', flag: '🇩🇪' },
    { id: 'es', name: 'Habbo.es', flag: '🇪🇸' },
    { id: 'fr', name: 'Habbo.fr', flag: '🇫🇷' },
    { id: 'it', name: 'Habbo.it', flag: '🇮🇹' },
    { id: 'nl', name: 'Habbo.nl', flag: '🇳🇱' },
    { id: 'fi', name: 'Habbo.fi', flag: '🇫🇮' },
    { id: 'tr', name: 'Habbo.com.tr', flag: '🇹🇷' },
  ];

  const daysOptions = [
    { value: 7, label: '7 dias' },
    { value: 30, label: '30 dias' },
    { value: 90, label: '90 dias' },
    { value: 'all', label: 'Todos' },
  ];

  useEffect(() => {
    fetchMarketData();
  }, [selectedHotel, selectedDays]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        fetchMarketData();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching real market data...');
      
      const { data, error } = await supabase.functions.invoke('habbo-market-real', {
        body: { 
          searchTerm, 
          category: selectedCategory === 'all' ? '' : selectedCategory,
          hotel: selectedHotel,
          days: selectedDays
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.items && Array.isArray(data.items)) {
        setItems(data.items);
        setStats(data.stats || stats);
        console.log(`✅ Loaded ${data.items.length} real market items from ${selectedHotel}`);
      }
    } catch (error) {
      console.error('❌ Error fetching real market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-blue-100 text-blue-800';
      case 'rare': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => `${price.toLocaleString()} cr`;

  const filteredItems = items.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PanelCard title="Mercado Real do Habbo - Dados Oficiais">
        <div className="space-y-6">
          {/* Market Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="habbo-card">
              <div className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="text-blue-500 mr-2" size={20} />
                  <span className="text-sm font-medium text-blue-600">Total</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalItems}</div>
                <div className="text-sm text-gray-600">Itens Ativos</div>
              </div>
            </div>

            <div className="habbo-card">
              <div className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="text-yellow-500 mr-2" size={20} />
                  <span className="text-sm font-medium text-yellow-600">Média</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{formatPrice(stats.averagePrice)}</div>
                <div className="text-sm text-gray-600">Preço Médio</div>
              </div>
            </div>

            <div className="habbo-card">
              <div className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="text-green-500 mr-2" size={20} />
                  <span className="text-sm font-medium text-green-600">{stats.trendingUp}</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalVolume}</div>
                <div className="text-sm text-gray-600">Volume Total</div>
              </div>
            </div>

            <div className="habbo-card">
              <div className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Crown className="text-purple-500 mr-2" size={20} />
                  <span className="text-sm font-medium text-purple-600">Máximo</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{formatPrice(stats.highestPrice)}</div>
                <div className="text-sm text-gray-600">Maior Preço</div>
              </div>
            </div>
          </div>

          {/* Advanced Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar móveis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="habbo-input w-full pl-10 pr-4 py-2"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="habbo-input px-4 py-2 flex-1"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Globe size={20} className="text-gray-600" />
              <select
                value={selectedHotel}
                onChange={(e) => setSelectedHotel(e.target.value)}
                className="habbo-input px-4 py-2 flex-1"
              >
                {hotels.map(hotel => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.flag} {hotel.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar size={20} className="text-gray-600" />
              <select
                value={selectedDays}
                onChange={(e) => setSelectedDays(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="habbo-input px-4 py-2 flex-1"
              >
                {daysOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Carregando dados do marketplace...</p>
              <p className="text-gray-500 text-sm mt-1">Hotel: {hotels.find(h => h.id === selectedHotel)?.flag} {hotels.find(h => h.id === selectedHotel)?.name}</p>
            </div>
          )}

          {/* Items Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="habbo-card hover:shadow-lg transition-all duration-300">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRarityColor(item.rarity)}`}>
                        {item.rarity.toUpperCase()}
                      </span>
                      <div className="flex items-center">
                        {item.trend === 'up' ? (
                          <TrendingUp size={16} className="text-green-500 mr-1" />
                        ) : item.trend === 'down' ? (
                          <TrendingDown size={16} className="text-red-500 mr-1" />
                        ) : (
                          <div className="w-4 h-4 mr-1" />
                        )}
                        <span className={`text-sm ${
                          item.trend === 'up' ? 'text-green-600' : 
                          item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {item.changePercent}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 mx-auto object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/package.png';
                          }}
                        />
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1 text-sm truncate" title={item.name}>
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{item.description}</p>
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className="text-xl font-bold text-green-600">
                        {formatPrice(item.currentPrice)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Vol: {item.volume} | Hotel: {hotels.find(h => h.id === item.hotel)?.flag}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="habbo-button-green flex-1 text-xs py-1">
                        Ver Histórico
                      </button>
                      <button className="habbo-button-blue px-2 text-xs py-1">
                        <Star size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Package size={48} className="mx-auto mb-2" />
              </div>
              <p className="text-gray-600 text-lg font-semibold mb-2">Nenhum item encontrado</p>
              <p className="text-gray-500">Tente ajustar os filtros ou termos de busca</p>
            </div>
          )}

          {/* Footer Info */}
          {!loading && filteredItems.length > 0 && (
            <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <p>
                Mostrando {filteredItems.length} de {stats.totalItems} itens • 
                Hotel: {hotels.find(h => h.id === selectedHotel)?.flag} {hotels.find(h => h.id === selectedHotel)?.name} • 
                Dados reais do marketplace oficial
              </p>
            </div>
          )}
        </div>
      </PanelCard>
    </div>
  );
};
