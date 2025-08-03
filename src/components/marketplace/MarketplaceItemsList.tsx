
import { useState } from 'react';
import { MarketFiltersIconOnly } from './MarketFiltersIconOnly';
import { VerticalClubItems } from './VerticalClubItems';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreditIcon } from './CreditIcon';
import { TrendingUp, TrendingDown, Package2, Clock } from 'lucide-react';
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

interface MarketplaceItemsListProps {
  items: MarketItem[];
  hotel: { id: string; name: string; flag: string };
  onItemClick: (item: MarketItem) => void;
}

export const MarketplaceItemsList = ({ items, hotel, onItemClick }: MarketplaceItemsListProps) => {
  const [sortBy, setSortBy] = useState<'price' | 'recent' | 'quantity' | 'ltd'>('price');

  // Filtrar e ordenar itens baseado na seleção
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
          return b.currentPrice - a.currentPrice; // LTDs ordenados por preço
        default:
          return 0;
      }
    })
    .slice(0, 20); // Limitar exibição

  return (
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
          🏪 Feira Livre de {hotel.name}
        </h3>
        
        {/* Layout reorganizado: Filtros à esquerda, HC/CA à direita */}
        <div className="flex gap-4">
          {/* Filtros à esquerda */}
          <div className="flex-shrink-0">
            <MarketFiltersIconOnly sortBy={sortBy} setSortBy={setSortBy} />
          </div>
          
          {/* HC/CA à direita */}
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
            filteredItems.map((item, index) => {
              const itemType = item.className.includes('wall') ? 'wallitem' : 'roomitem';
              
              return (
                <div
                  key={item.id}
                  onClick={() => onItemClick(item)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-all border-2 border-gray-200 hover:border-blue-300 hover:shadow-md"
                >
                  <RealFurniImageHybrid
                    className={item.className}
                    name={item.name}
                    type={itemType}
                    hotel={item.hotel}
                    size="sm"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate" title={item.name}>
                        {item.name}
                      </p>
                      {item.rarity.toLowerCase().includes('ltd') && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded border border-purple-300">
                          LTD
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
                          {item.changePercent}
                        </span>
                      </div>
                      
                      {item.openOffers && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Package2 size={10} />
                          <span>{item.openOffers} ofertas</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock size={10} />
                        <span>atualizado</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum item encontrado para os filtros selecionados</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
