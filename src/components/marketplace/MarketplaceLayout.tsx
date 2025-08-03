import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketplaceItemsList } from './MarketplaceItemsList';
import { MarketplaceCategoryBoxes } from './MarketplaceCategoryBoxes';
import { CountryFlags } from './CountryFlags';
import { AnimatedConsole } from '../AnimatedConsole';
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
  soldItems?: number;
  openOffers?: number;
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
  const [sortBy, setSortBy] = useState<'price' | 'recent' | 'quantity' | 'ltd'>('price');

  const hotels = [
    { id: 'br', name: 'Habbo.com.br', flag: '/assets/flagbrazil.png' },
    { id: 'com', name: 'Habbo.com', flag: '/assets/flagcom.png' },
    { id: 'de', name: 'Habbo.de', flag: '/assets/flagdeus.png' },
    { id: 'es', name: 'Habbo.es', flag: '/assets/flagspain.png' },
    { id: 'fr', name: 'Habbo.fr', flag: '/assets/flagfrance.png' },
    { id: 'it', name: 'Habbo.it', flag: '/assets/flagitaly.png' },
    { id: 'nl', name: 'Habbo.nl', flag: '/assets/flagnetl.png' },
    { id: 'fi', name: 'Habbo.fi', flag: '/assets/flafinland.png' },
    { id: 'tr', name: 'Habbo.com.tr', flag: '/assets/flagtrky.png' },
  ];

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: functionError } = await supabase.functions.invoke('habbo-market-real', {
        body: { 
          searchTerm, 
          category: selectedCategory === 'all' ? '' : selectedCategory,
          hotel: selectedHotel,
          days: 30
        }
      });
      
      if (functionError) {
        setError(`Erro na função: ${functionError.message}`);
        return;
      }
      
      if (data?.items && Array.isArray(data.items)) {
        const sortedItems = [...data.items].sort((a, b) => {
          switch (sortBy) {
            case 'price':
              return b.currentPrice - a.currentPrice;
            case 'recent':
              return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
            case 'quantity':
              return (a.openOffers || a.quantity || 999) - (b.openOffers || b.quantity || 999);
            case 'ltd':
              const aIsLTD = a.className.toLowerCase().includes('ltd');
              const bIsLTD = b.className.toLowerCase().includes('ltd');
              if (aIsLTD && !bIsLTD) return -1;
              if (!aIsLTD && bIsLTD) return 1;
              return b.currentPrice - a.currentPrice;
            default:
              return 0;
          }
        });
        
        setItems(sortedItems);
        setStats(data.stats || stats);
        
        if (sortedItems.length === 0) {
          setError('Nenhum item encontrado. Verifique os filtros ou tente outro hotel.');
        }
      } else {
        setError('Nenhum item retornado pela API');
        setItems([]);
      }
    } catch (error: any) {
      setError(`Erro ao buscar dados reais: ${error.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [selectedHotel, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchMarketData();
      }
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loading, selectedHotel, searchTerm, selectedCategory, sortBy]);

  // Organizar categorias com dados reais
  const maioresOfertas = [...items].sort((a, b) => (b.soldItems || b.volume || 0) - (a.soldItems || a.volume || 0)).slice(0, 10);
  const maisVendidosHoje = [...items].filter(item => item.trend === 'up' && (item.soldItems || item.volume || 0) > 5).slice(0, 10);
  const melhoresNegocios = [...items].filter(item => item.currentPrice < 300 && item.rarity !== 'common').slice(0, 10);
  const altasDeHoje = [...items].filter(item => item.trend === 'up').sort((a, b) => 
    parseFloat(b.changePercent) - parseFloat(a.changePercent)
  ).slice(0, 10);
  const mostExpensive = [...items].sort((a, b) => b.currentPrice - a.currentPrice).slice(0, 10);

  if (error && items.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar Dados</h3>
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
      {/* Console Animado */}
      <div className="flex justify-center">
        <AnimatedConsole isActive={true} className="mb-4" />
      </div>

      {/* Hotel Selection Tabs com Bandeiras */}
      <div className="flex justify-center">
        <Tabs value={selectedHotel} onValueChange={setSelectedHotel} className="w-full max-w-4xl">
          <div className="flex justify-center mb-6">
            <TabsList className="grid grid-cols-9 w-full max-w-3xl">
              {hotels.map(hotel => (
                <TabsTrigger key={hotel.id} value={hotel.id} className="text-xs px-2 flex items-center gap-1">
                  <CountryFlags hotelId={hotel.id} />
                  <span className="hidden sm:inline">{hotel.id.toUpperCase()}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {hotels.map(hotel => (
            <TabsContent key={hotel.id} value={hotel.id}>
              {error && items.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 text-sm">{error}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Marketplace Items List */}
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
                    stats={stats}
                  />
                </div>
                
                {/* Right Column - Category Boxes */}
                <div className="lg:col-span-7">
                  <MarketplaceCategoryBoxes
                    topSellers={maioresOfertas}
                    biggestGainers={maisVendidosHoje}
                    biggestLosers={melhoresNegocios}
                    mostExpensive={altasDeHoje}
                    opportunities={mostExpensive}
                    stats={stats}
                    totalItems={items.length}
                    hotel={hotel}
                  />
                </div>
              </div>
              
              {/* Assets Reference Footer */}
              <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200">
                <p>Assets: HabboAPI.site • Imagens: Habbo.com • Interface: HabboHub</p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};
