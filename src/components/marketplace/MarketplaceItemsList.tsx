import { useState } from 'react';
import { MarketFiltersIconOnly } from './MarketFiltersIconOnly';
import { VerticalClubItems } from './VerticalClubItems';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreditIcon } from './CreditIcon';
import { TrendingUp, TrendingDown, Package2, Clock } from 'lucide-react';
import { OfficialHabboImage } from './OfficialHabboImage';
import { MarketItemModal } from './MarketItemModal';
import { MarketplaceSkeleton } from './MarketplaceSkeleton';

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
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleItemClick = (item: MarketItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const filteredItems = [...items]
    .filter(item => {
      if (sortBy === 'ltd') {
        return item.rarity.toLowerCase().includes('ltd') || item.name.toLowerCase().includes('ltd');
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.currentPrice - a.currentPrice;
        case 'quantity':
          return (a.openOffers || 0) - (b.openOffers || 0);
        case 'recent':
          return new Date(b.lastUpdated || '').getTime() - new Date(a.lastUpdated || '').getTime();
        case 'ltd':
          return b.currentPrice - a.currentPrice;
        default:
          return 0;
      }
    })
    .slice(0, 20);

  if (loading) {
    return (
      <>
        <MarketplaceSkeleton />
        <MarketItemModal 
          item={selectedItem}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </>
    );
  }

  return (
    <>
      <div className="bg-white border-2 border-black rounded-lg shadow-lg">
        <div 
          className="p-4 border-b-2 border-black rounded-t-lg"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
            backgroundImage: 'url(/assets/bghabbohub.png)',
            backgroundSize: 'cover'
          }}
        >
          <h3 className="font-bold text-white volter-font mb-3" style={{
            textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
          }}>
            🏪 Feira Livre de {hotel.name} (Dados Oficiais)
          </h3>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <MarketFiltersIconOnly sortBy={sortBy} setSortBy={setSortBy} />
            </div>
            
            <div className="flex-1 flex justify-end">
              <div className="bg-transparent">
                <VerticalClubItems hotel={hotel.id} />
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="h-96">
          <div className="p-4 space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-all border-2 border-gray-200 hover:border-blue-300 hover:shadow-md"
                >
                  <OfficialHabboImage
                    className={item.className}
                    name={item.name}
                    size="md"
                    priority={index < 5}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate" title={item.name}>
                        {item.name}
                      </p>
                      {(item.rarity.toLowerCase().includes('ltd') || item.className.toLowerCase().includes('ltd')) && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded border border-purple-300">
                          LTD
                        </span>
                      )}
                      {item.soldItems && item.soldItems > 10 && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded border border-green-300">
                          Popular
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs mt-1">
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
                          {item.changePercent}%
                        </span>
                      </div>
                      
                      {item.openOffers && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Package2 size={10} />
                          <span>{item.openOffers} ofertas</span>
                        </div>
                      )}
                      
                      {item.soldItems && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <span>📊 {item.soldItems} vendidos</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock size={10} />
                        <span>oficial</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum item encontrado na API oficial</p>
                <p className="text-xs mt-2">Verifique os filtros ou tente outro hotel</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <MarketItemModal 
        item={selectedItem}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
};
