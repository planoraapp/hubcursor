
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreditIcon } from './CreditIcon';
import { TrendingUp, TrendingDown } from 'lucide-react';
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
}

interface MarketCategoryBoxProps {
  title: string;
  items: MarketItem[];
  onItemClick: (item: MarketItem) => void;
}

export const MarketCategoryBox = ({ title, items, onItemClick }: MarketCategoryBoxProps) => {
  return (
    <div className="habbo-card">
      <div className="p-4 border-b">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{items.length} itens</p>
      </div>
      
      <ScrollArea className="h-96">
        <div className="p-4 space-y-3">
          {items.map((item) => {
            const itemType = item.id.includes('wallitem') ? 'wallitem' : 'roomitem';
            
            return (
              <div
                key={item.id}
                onClick={() => onItemClick(item)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <RealFurniImage
                  className={item.className}
                  name={item.name}
                  type={itemType}
                  hotel={item.hotel}
                  size="sm"
                />
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1">
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
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
