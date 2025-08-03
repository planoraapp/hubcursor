
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreditIcon } from './CreditIcon';
import { TrendingUp, TrendingDown, Package2 } from 'lucide-react';
import RealFurniImage from './RealFurniImage';

interface MarketItem {
  id: string;
  name: string;
  currentPrice: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: string;
  volume: number;
  imageUrl: string;
  rarity: string;
  className: string;
  hotel: string;
  quantity?: number;
}

interface MarketCategoryBoxProps {
  title: string;
  items: MarketItem[];
  onItemClick: (item: MarketItem) => void;
}

export const MarketCategoryBox = ({ title, items, onItemClick }: MarketCategoryBoxProps) => {
  if (items.length === 0) {
    return (
      <div className="habbo-card">
        <div className="p-4 border-b">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">Carregando itens...</p>
        </div>
        <div className="p-4 text-center text-gray-500">
          <Package2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum item disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="habbo-card">
      <div className="p-4 border-b">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{items.length} itens reais</p>
      </div>
      
      <ScrollArea className="h-96">
        <div className="p-4 space-y-3">
          {items.map((item) => {
            const itemType = item.id.includes('wallitem') ? 'wallitem' : 'roomitem';
            
            return (
              <div
                key={item.id}
                onClick={() => onItemClick(item)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100 hover:border-blue-200"
              >
                <RealFurniImage
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
                  {item.quantity && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Package2 size={10} />
                      <span>{item.quantity} disponíveis na feira</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    Real: {item.className}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
