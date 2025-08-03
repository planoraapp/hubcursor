
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreditIcon } from './CreditIcon';
import { TrendingUp, TrendingDown, Package2 } from 'lucide-react';
import { useState } from 'react';

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

const ItemImage = ({ item }: { item: MarketItem }) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getImageUrls = (className: string, hotel: string) => [
    `https://www.habbowidgets.com/images/furni/${className}.gif`,
    `https://habbowidgets.com/images/furni/${className}.gif`,
    `https://images.habbo.com/dcr/hof_furni/${className}.png`,
    `https://habboemotion.com/images/furnis/${className}.png`,
    `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/habbo-imaging/furni/${className}.png`
  ];

  const imageUrls = getImageUrls(item.className, item.hotel);

  const handleImageError = () => {
    if (currentImageIndex < imageUrls.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setImageError(true);
    }
  };

  if (imageError) {
    return (
      <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded">
        <Package2 size={16} className="text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={imageUrls[currentImageIndex]}
      alt={item.name}
      className="w-10 h-10 object-contain"
      onError={handleImageError}
      loading="lazy"
    />
  );
};

export const MarketCategoryBox = ({ title, items, onItemClick }: MarketCategoryBoxProps) => {
  return (
    <div className="habbo-card">
      <div className="p-4 border-b">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{items.length} itens</p>
      </div>
      
      <ScrollArea className="h-96">
        <div className="p-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick(item)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <ItemImage item={item} />
              
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
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
