
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
  const [loading, setLoading] = useState(false);
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
      console.log('🔄 Fetching marketplace data for hotel:', selectedHotel);
      
      const { data, error } = await supabase.functions.invoke('habbo-market-real', {
        body: { 
          searchTerm, 
          category: selectedCategory === 'all' ? '' : selectedCategory,
          hotel: selectedHotel,
          days: 30,
          includeMarketplace: true // Flag to include live marketplace data
        }
      });
      
      if (error) {
        throw error;
      }
      
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
      }
    } catch (error) {
      console.error('❌ Error fetching marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, [selectedHotel, searchTerm, selectedCategory, sortBy]);

  // Filter items for different categories
  const topSellers = [...items].sort((a, b) => b.volume - a.volume).slice(0, 10);
  const biggestGainers = [...items].filter(item => item.trend === 'up').sort((a, b) => 
    parseFloat(b.changePercent) - parseFloat(a.changePercent)
  ).slice(0, 10);
  const biggestLosers = [...items].filter(item => item.trend === 'down').sort((a, b) => 
    parseFloat(a.changePercent) - parseFloat(b.changePercent)
  ).slice(0, 10);
  const mostExpensive = [...items].sort((a, b) => b.currentPrice - a.currentPrice).slice(0, 10);
  const opportunities = [...items].filter(item => item.rarity === 'rare' && item.currentPrice < 100).slice(0, 10);

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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left Column - Marketplace Items List (2/5 width) */}
              <div className="lg:col-span-2">
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
              
              {/* Right Column - Category Boxes (3/5 width) */}
              <div className="lg:col-span-3">
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
