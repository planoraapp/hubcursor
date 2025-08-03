import { TrendingUp, TrendingDown, Clock, Package2 } from 'lucide-react';
import { CreditIcon } from './CreditIcon';

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
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-blue-100 text-blue-800';
      case 'rare': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="habbo-card p-3 hover:shadow-md transition-all cursor-pointer border hover:border-blue-200"
      >
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-center">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/package.png';
              }}
            />
          </div>
          
          <div className="text-center">
            <p className="font-medium text-xs truncate" title={item.name}>
              {item.name}
            </p>
            
            <div className="flex items-center justify-center gap-1 mt-1">
              <CreditIcon size="sm" />
              <span className="font-bold text-sm">{item.currentPrice.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-center gap-1 mt-1">
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

            {/* Additional info for compact cards */}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
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
            </div>
            
            <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${getRarityColor(item.rarity)}`}>
              {item.rarity}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Regular card layout for other uses
  return (
    <div
      onClick={onClick}
      className="habbo-card p-4 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-center space-x-4">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-16 h-16 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/package.png';
          }}
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
          <p className="text-sm text-gray-600 truncate">{item.description}</p>
          
          <div className="flex items-center space-x-3 mt-2">
            <div className="flex items-center gap-1">
              <CreditIcon size="sm" />
              <span className="font-bold">{item.currentPrice.toLocaleString()}</span>
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
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
            <span className={`inline-block px-2 py-1 rounded-full ${getRarityColor(item.rarity)}`}>
              {item.rarity}
            </span>
            
            <span className="text-xs">
              Atualizado: {new Date(item.lastUpdated).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
