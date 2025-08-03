
import { TrendingUp, TrendingDown, Clock, Package2 } from 'lucide-react';
import { CreditIcon } from './CreditIcon';
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
}

interface MarketItemCardProps {
  item: MarketItem;
  onClick: () => void;
  compact?: boolean;
}

export const MarketItemCard = ({ item, onClick, compact = false }: MarketItemCardProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Determine item type based on ID
  const itemType = item.id.includes('wallitem') ? 'wallitem' : 'roomitem';

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="habbo-card p-3 hover:shadow-md transition-all cursor-pointer border hover:border-blue-200 bg-white"
      >
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-center">
            <RealFurniImageHybrid
              className={item.className}
              name={item.name}
              type={itemType}
              hotel={item.hotel}
              size="md"
            />
          </div>
          
          <div className="text-center space-y-2">
            <p className="font-medium text-xs truncate leading-tight" title={item.name}>
              {item.name}
            </p>
            
            <div className="flex items-center justify-center gap-1">
              <CreditIcon size="sm" />
              <span className="font-bold text-sm text-blue-600">
                {item.currentPrice.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-1">
              {item.trend === 'up' ? (
                <TrendingUp size={10} className="text-green-500" />
              ) : item.trend === 'down' ? (
                <TrendingDown size={10} className="text-red-500" />
              ) : null}
              <span className={`text-xs ${
                item.trend === 'up' ? 'text-green-600' : 
                item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {item.changePercent}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
              {item.quantity && (
                <div className="flex items-center gap-1">
                  <Package2 size={10} />
                  <span>{item.quantity}</span>
                </div>
              )}
              
              {item.listedAt && (
                <div className="flex items-center gap-1">
                  <Clock size={10} />
                  <span>{formatTime(item.listedAt)}</span>
                </div>
              )}
              
              {!item.quantity && !item.listedAt && (
                <div className="flex items-center gap-1">
                  <span>Vol: {item.volume}</span>
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-400 truncate" title={item.className}>
              {item.className}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular card layout for other uses
  return (
    <div
      onClick={onClick}
      className="habbo-card p-4 hover:shadow-lg transition-all cursor-pointer bg-white border hover:border-blue-200"
    >
      <div className="flex items-center space-x-4">
        <RealFurniImageHybrid
          className={item.className}
          name={item.name}
          type={itemType}
          hotel={item.hotel}
          size="lg"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
          <p className="text-sm text-gray-600 truncate">{item.description}</p>
          
          <div className="flex items-center space-x-3 mt-2">
            <div className="flex items-center gap-1">
              <CreditIcon size="sm" />
              <span className="font-bold text-blue-600">{item.currentPrice.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-1">
              {item.trend === 'up' ? (
                <TrendingUp size={14} className="text-green-500" />
              ) : item.trend === 'down' ? (
                <TrendingDown size={14} className="text-red-500" />
              ) : null}
              <span className={`${
                item.trend === 'up' ? 'text-green-600' : 
                item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {item.changePercent}
              </span>
            </div>

            {item.quantity && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Package2 size={12} />
                <span>{item.quantity} na feira</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
            <span className="text-xs">
              Real: {item.className}
            </span>
            {item.volume > 0 && (
              <span className="text-xs">
                Volume: {item.volume}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
