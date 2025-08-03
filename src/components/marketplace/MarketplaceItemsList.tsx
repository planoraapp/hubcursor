import { useState } from 'react';
import { Search, Filter, Package2, TrendingUp, TrendingDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MarketFilters } from './MarketFilters';
import { CreditIcon } from './CreditIcon';
import { MarketStatsFooter } from './MarketStatsFooter';
import { RealPremiumItems } from './RealPremiumItems';
import RealFurniImageHybrid from './RealFurniImageHybrid';

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

interface MarketplaceItemsListProps {
  items: MarketItem[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: 'price' | 'recent' | 'quantity' | 'ltd';
  setSortBy: (sort: 'price' | 'recent' | 'quantity' | 'ltd') => void;
  hotel: { id: string; name: string; flag: string };
  stats: MarketStats;
}

export const MarketplaceItemsList = ({ 
  items, 
  loading, 
  searchTerm, 
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  hotel,
  stats
}: MarketplaceItemsListProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="habbo-card">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-bold text-gray-800 mb-2">🏪 Mercado {hotel.name}</h3>
        
        {/* Premium Items */}
        <RealPremiumItems hotel={hotel.id} />
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou classe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="chair">Cadeiras</SelectItem>
                <SelectItem value="table">Mesas</SelectItem>
                <SelectItem value="bed">Camas</SelectItem>
                <SelectItem value="plant">Plantas</SelectItem>
                <SelectItem value="rare">Raros</SelectItem>
              </SelectContent>
            </Select>
            
            <MarketFilters sortBy={sortBy} setSortBy={setSortBy} />
          </div>
        </div>
      </div>

      {/* Items List */}
      <ScrollArea className="h-96">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            <Package2 className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <p>Carregando itens...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Package2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum item encontrado.</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {items.map((item) => {
              const itemType = item.id.includes('wallitem') ? 'wallitem' : 'roomitem';
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-all border border-gray-100 hover:shadow-md"
                >
                  <RealFurniImageHybrid
                    className={item.className}
                    name={item.name}
                    type={itemType}
                    hotel={item.hotel}
                    size="sm"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" title={item.name}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className="flex items-center gap-1 text-blue-600 font-semibold">
                        <CreditIcon size="sm" />
                        {item.currentPrice.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.trend === 'up' ? (
                          <TrendingUp size={12} className="text-green-500" />
                        ) : item.trend === 'down' ? (
                          <TrendingDown size={12} className="text-red-500" />
                        ) : null}
                        <span className={`${
                          item.trend === 'up' ? 'text-green-600' : 
                          item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {item.changePercent}
                        </span>
                      </div>
                    </div>
                    {(item.soldItems || item.quantity) && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Package2 size={10} />
                        <span>
                          {item.soldItems ? `${item.soldItems} vendidos` : `${item.quantity} disponível`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Stats Footer */}
      <MarketStatsFooter stats={stats} totalItems={items.length} hotel={hotel} />
    </div>
  );
};
