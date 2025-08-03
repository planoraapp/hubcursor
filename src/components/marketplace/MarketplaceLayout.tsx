
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketplaceItemsList } from './MarketplaceItemsList';
import { MarketplaceCategoryBoxes } from './MarketplaceCategoryBoxes';
import { MarketplaceCharts } from '../MarketplaceCharts';
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
  quantity?: number;
  listedAt?: string;
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

export const MarketplaceLayout = () => {
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
  const [selectedHotel, setSelectedHotel] = useState('br');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'price' | 'recent' | 'quantity'>('price');

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

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching marketplace data for hotel:', selectedHotel);
      
      const { data, error: functionError } = await supabase.functions.invoke('habbo-market-real', {
        body: { 
          searchTerm, 
          category: selectedCategory === 'all' ? '' : selectedCategory,
          hotel: selectedHotel,
          days: 30,
          includeMarketplace: true
        }
      });
      
      if (functionError) {
        console.error('❌ Function error:', functionError);
        setError(`Erro na função: ${functionError.message}`);
        return;
      }
      
      console.log('📊 Function response:', data);
      
      if (data?.items && Array.isArray(data.items)) {
        // Sort items based on selected sort option
        const sortedItems = [...data.items].sort((a, b) => {
          switch (sortBy) {
            case 'price':
              return b.currentPrice - a.currentPrice;
            case 'recent':
              return new Date(b.listedAt || b.lastUpdated).getTime() - new Date(a.listedAt || a.lastUpdated).getTime();
            case 'quantity':
              return (a.quantity || 999) - (b.quantity || 999);
            default:
              return 0;
          }
        });
        
        setItems(sortedItems);
        setStats(data.stats || stats);
        console.log(`✅ Loaded ${sortedItems.length} marketplace items from ${selectedHotel}`);
        
        if (sortedItems.length === 0) {
          setError('Nenhum item encontrado. Verifique os filtros ou tente outro hotel.');
        }
      } else {
        console.warn('⚠️ No items array in response:', data);
        setError('Nenhum item retornado pela API');
        setItems([]);
      }
    } catch (error) {
      console.error('❌ Error fetching marketplace data:', error);
      setError(`Erro ao buscar dados: ${error.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchMarketData();
  }, [selectedHotel, searchTerm, selectedCategory, sortBy]);

  // Auto-refresh every 60 seconds when not loading
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchMarketData();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [loading, selectedHotel, searchTerm, selectedCategory, sortBy]);

  // Filter items for different categories
  const topSellers = [...items].sort((a, b) => b.volume - a.volume).slice(0, 10);
  const biggestGainers = [...items].filter(item => item.trend === 'up').sort((a, b) => 
    parseFloat(b.changePercent) - parseFloat(a.changePercent)
  ).slice(0, 10);
  const biggestLosers = [...items].filter(item => item.trend === 'down').sort((a, b) => 
    parseFloat(a.changePercent) - parseFloat(b.changePercent)
  ).slice(0, 10);
  const mostExpensive = [...items].sort((a, b) => b.currentPrice - a.currentPrice).slice(0, 10);
  const opportunities = [...items].filter(item => item.rarity === 'rare' && item.currentPrice < 200).slice(0, 10);

  if (error && items.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar Marketplace</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchMarketData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hotel Selection Tabs */}
      <Tabs value={selectedHotel} onValueChange={setSelectedHotel} className="w-full">
        <TabsList className="grid grid-cols-9 mb-6 max-w-4xl">
          {hotels.map(hotel => (
            <TabsTrigger key={hotel.id} value={hotel.id} className="text-xs px-2">
              <span className="mr-1">{hotel.flag}</span>
              <span className="hidden sm:inline">{hotel.id.toUpperCase()}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {hotels.map(hotel => (
          <TabsContent key={hotel.id} value={hotel.id}>
            {/* Error message if items loaded but with issues */}
            {error && items.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Marketplace Items List (5/12 width) */}
              <div className="lg:col-span-5">
                <MarketplaceItemsList
                  items={items}
                  loading={loading}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  hotel={hotel}
                />
                
                {/* Charts at bottom of left column */}
                <div className="mt-6">
                  <MarketplaceCharts />
                </div>
              </div>
              
              {/* Right Column - Category Boxes (7/12 width) */}
              <div className="lg:col-span-7">
                <MarketplaceCategoryBoxes
                  topSellers={topSellers}
                  biggestGainers={biggestGainers}
                  biggestLosers={biggestLosers}
                  mostExpensive={mostExpensive}
                  opportunities={opportunities}
                  stats={stats}
                  totalItems={items.length}
                  hotel={hotel}
                />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
