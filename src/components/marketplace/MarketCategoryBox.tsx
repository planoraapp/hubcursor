
import { HabboAPIImage } from './HabboAPIImage';
import { CreditIcon } from './CreditIcon';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MarketItem } from '@/contexts/MarketplaceContext';

interface MarketCategoryBoxProps {
  title: string;
  items: MarketItem[];
  hotel: { id: string; name: string; flag: string };
}

export const MarketCategoryBox = ({ title, items, hotel }: MarketCategoryBoxProps) => {
  return (
    <div className="bg-white border-2 border-black rounded-lg shadow-lg">
      <div 
        className="p-3 border-b-2 border-black rounded-t-lg"
        style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
          backgroundImage: 'url(/assets/bghabbohub.png)',
          backgroundSize: 'cover'
        }}
      >
        <h3 className="font-bold text-white volter-font text-sm" style={{
          textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
        }}>
          {title}
        </h3>
      </div>
      
      <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
        {items.length > 0 ? (
          items.slice(0, 8).map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-2 rounded hover:bg-yellow-50 border border-green-200">
              <HabboAPIImage
                className={item.className}
                name={item.name}
                size="sm"
              />
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-blue-600 font-semibold">
                    <CreditIcon size="sm" />
                    {item.currentPrice.toLocaleString()}
                  </span>
                  
                  {item.trend !== 'stable' && (
                    <div className="flex items-center gap-1">
                      {item.trend === 'up' ? (
                        <TrendingUp size={10} className="text-green-500" />
                      ) : (
                        <TrendingDown size={10} className="text-red-500" />
                      )}
                      <span className={`${
                        item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.changePercent}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 text-xs">
            Nenhum item encontrado
          </div>
        )}
      </div>
    </div>
  );
};
