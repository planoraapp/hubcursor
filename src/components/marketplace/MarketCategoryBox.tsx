
import { HabboAPIImage } from './HabboAPIImage';
import { CreditIcon } from './CreditIcon';
import { TrendingUp, TrendingDown, Bookmark } from 'lucide-react';
import { useState } from 'react';
import type { MarketItem } from '@/contexts/MarketplaceContext';
import { useAuth } from '@/hooks/useAuth';
import { useTrackedItems } from '@/hooks/useTrackedItems';

interface MarketCategoryBoxProps {
  title: string;
  items: MarketItem[];
  hotel: { id: string; name: string; flag: string };
  icon?: string;
  height?: string;
}

export const MarketCategoryBox = ({ 
  title, 
  items, 
  hotel, 
  icon,
  height = "h-80" 
}: MarketCategoryBoxProps) => {
  const { user } = useAuth();
  const { trackItem, untrackItem, isTracked } = useTrackedItems(hotel.id);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleTrackItem = async (item: MarketItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    if (isTracked(item.className)) {
      await untrackItem(item.className);
    } else {
      await trackItem({
        classname: item.className,
        name: item.name,
        hotel_id: hotel.id
      });
    }
  };

  return (
    <div className="bg-white border-2 border-black rounded-lg shadow-lg flex flex-col">
      <div 
        className="p-3 border-b-2 border-black rounded-t-lg flex items-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
          backgroundImage: 'url(/assets/site/bghabbohub.png)',
          backgroundSize: 'cover'
        }}
      >
        {icon && (
          <img src={icon} alt="" className="w-4 h-4" style={{ imageRendering: 'pixelated' }} />
        )}
        <h3 className="font-bold text-white volter-font text-sm" style={{
          textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
        }}>
          {title}
        </h3>
      </div>
      
      <div className={`p-3 overflow-y-auto flex-1 ${height}`}>
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.slice(0, 25).map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-2 p-2 rounded hover:bg-yellow-50 border border-green-200 relative group"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
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

                {/* Botão de Tracking para usuários logados */}
                {user && hoveredItem === item.id && (
                  <button
                    onClick={(e) => handleTrackItem(item, e)}
                    className={`absolute right-1 top-1 p-1 rounded transition-colors ${
                      isTracked(item.className) 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-200 hover:bg-yellow-200'
                    }`}
                    title={isTracked(item.className) ? "Parar de acompanhar" : "Acompanhar preço"}
                  >
                    <Bookmark size={12} fill={isTracked(item.className) ? "currentColor" : "none"} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-xs">
            Nenhum item encontrado
          </div>
        )}
      </div>
    </div>
  );
};
