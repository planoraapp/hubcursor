import { useState, useRef, useCallback } from 'react';
import { Search, Filter, SortAsc, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarketItemCard } from './MarketItemCard';
import { MarketItemModal } from './MarketItemModal';
import { PanelCard } from '../PanelCard';
import { PremiumItemsDisplay } from './PremiumItemsDisplay';
import { MarketStatsFooter } from './MarketStatsFooter';

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

interface MarketplaceItemsListProps {
  items: MarketItem[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: 'price' | 'recent' | 'quantity';
  setSortBy: (sort: 'price' | 'recent' | 'quantity') => void;
  hotel: { id: string; name: string; flag: string };
  stats: any;
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
  const [displayedItems, setDisplayedItems] = useState(50);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'chair', name: 'Cadeiras' },
    { id: 'table', name: 'Mesas' },
    { id: 'bed', name: 'Camas' },
    { id: 'plant', name: 'Plantas' },
    { id: 'lamp', name: 'Iluminação' },
    { id: 'rare', name: 'Raros' },
  ];

  const sortOptions = [
    { id: 'price', name: 'Mais Caros', icon: '💎' },
    { id: 'recent', name: 'Mais Recentes', icon: '🕒' },
    { id: 'quantity', name: 'Menor Quantidade', icon: '📦' },
  ];

  const filteredItems = items.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }).slice(0, displayedItems);

  const loadMore = useCallback(() => {
    if (displayedItems < filteredItems.length) {
      setDisplayedItems(prev => Math.min(prev + 50, items.length));
    }
  }, [displayedItems, filteredItems.length, items.length]);

  const handleItemClick = (item: MarketItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  return (
    <>
      <PanelCard title={`🏪 Feira Livre - ${hotel.flag} ${hotel.name}`}>
        <div className="space-y-4">
          {/* Premium Items Display */}
          <PremiumItemsDisplay hotel={hotel.id} />

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar na feira..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="habbo-input w-full pl-10 pr-4 py-2 text-sm"
              />
              {loading && (
                <RefreshCw size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin" />
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <Filter size={16} className="text-gray-600 flex-shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="habbo-input px-2 py-1 flex-1 text-sm min-w-0"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <SortAsc size={16} className="text-gray-600 flex-shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'price' | 'recent' | 'quantity')}
                  className="habbo-input px-2 py-1 flex-1 text-sm min-w-0"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.icon} {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <ScrollArea className="h-[500px]" ref={scrollAreaRef}>
            <div className="grid grid-cols-2 gap-3 p-1">
              {filteredItems.map((item) => (
                <MarketItemCard
                  key={item.id}
                  item={item}
                  onClick={() => handleItemClick(item)}
                  compact
                />
              ))}
            </div>
            
            {displayedItems < items.length && (
              <div className="text-center p-4">
                <button
                  onClick={loadMore}
                  className="habbo-button px-4 py-2 text-sm"
                  disabled={loading}
                >
                  Carregar Mais ({items.length - displayedItems} restantes)
                </button>
              </div>
            )}
          </ScrollArea>

          {/* Market Stats Footer */}
          <MarketStatsFooter 
            stats={stats}
            totalItems={items.length}
            hotel={hotel}
          />
        </div>
      </PanelCard>

      <MarketItemModal 
        item={selectedItem}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
};
