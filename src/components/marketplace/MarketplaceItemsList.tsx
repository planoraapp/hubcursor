
import { useState, useRef, useCallback } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarketItemCard } from './MarketItemCard';
import { MarketItemModal } from './MarketItemModal';
import { PanelCard } from '../PanelCard';
import { RealPremiumItems } from './RealPremiumItems';
import { MarketStatsFooter } from './MarketStatsFooter';
import { MarketFilters } from './MarketFilters';

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
  openOffers?: number;
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

  const filteredItems = items.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (sortBy === 'ltd' && !item.className.toLowerCase().includes('ltd')) return false;
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
      <PanelCard title={`🏪 Feira Livre - ${hotel.name}`}>
        <div className="space-y-4">
          {/* Top Section: Filtros à esquerda + Premium Items à direita */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="lg:flex-1">
              <MarketFilters sortBy={sortBy} setSortBy={setSortBy} />
            </div>
            <div className="lg:w-80">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="font-bold text-gray-800 mb-3 text-sm">🏆 Preços Atuais</h4>
                <RealPremiumItems hotel={hotel.id} />
              </div>
            </div>
          </div>

          {/* Search */}
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
          
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="habbo-input px-3 py-2 flex-1 text-sm"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
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
