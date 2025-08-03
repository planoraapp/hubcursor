import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { Search, Filter, Globe, Calendar, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MarketDashboard } from './marketplace/MarketDashboard';
import { MarketCategoryBox } from './marketplace/MarketCategoryBox';
import { MarketItemModal } from './marketplace/MarketItemModal';
import { CreditIcon } from './marketplace/CreditIcon';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [selectedDays, setSelectedDays] = useState<number | 'all'>(30);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const filteredItems = items.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Categorize items for boxes
  const topSellers = [...items].sort((a, b) => b.volume - a.volume).slice(0, 10);
  const biggestGainers = [...items].filter(item => item.trend === 'up').sort((a, b) => 
    parseFloat(b.changePercent) - parseFloat(a.changePercent)
  ).slice(0, 10);
  const biggestLosers = [...items].filter(item => item.trend === 'down').sort((a, b) => 
    parseFloat(a.changePercent) - parseFloat(b.changePercent)
  ).slice(0, 10);
  const mostExpensive = [...items].sort((a, b) => b.currentPrice - a.currentPrice).slice(0, 10);
  const opportunities = [...items].filter(item => item.rarity === 'rare' && item.currentPrice < 100).slice(0, 10);

  const handleItemClick = (item: MarketItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PanelCard title="Mercado Real do Habbo - Dados Oficiais">
        <div className="space-y-6">
          {/* Search and Filters */}
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

          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Dashboard */}
              <MarketDashboard stats={stats} items={items} />

              {/* Category Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <MarketCategoryBox 
                  title="🔥 Top Vendedores" 
                  items={topSellers} 
                  onItemClick={handleItemClick}
                />
                <MarketCategoryBox 
                  title="📈 Maiores Altas" 
                  items={biggestGainers} 
                  onItemClick={handleItemClick}
                />
                <MarketCategoryBox 
                  title="📉 Maiores Baixas" 
                  items={biggestLosers} 
                  onItemClick={handleItemClick}
                />
                <MarketCategoryBox 
                  title="💎 Mais Caros" 
                  items={mostExpensive} 
                  onItemClick={handleItemClick}
                />
                <MarketCategoryBox 
                  title="🎯 Oportunidades" 
                  items={opportunities} 
                  onItemClick={handleItemClick}
                />
              </div>

              {/* Footer Info */}
              {filteredItems.length > 0 && (
                <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                  <p className="flex items-center justify-center gap-2">
                    Mostrando {filteredItems.length} de {stats.totalItems} itens • 
                    Hotel: {hotels.find(h => h.id === selectedHotel)?.flag} {hotels.find(h => h.id === selectedHotel)?.name} • 
                    Dados reais do marketplace oficial •
                    <CreditIcon size="sm" />
                    Preços atualizados
                  </p>
                </div>
              )}
            </>
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
        </div>
      </PanelCard>

      {/* Item Detail Modal */}
      <MarketItemModal 
        item={selectedItem}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};
