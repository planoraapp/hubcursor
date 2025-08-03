
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreditIcon } from './CreditIcon';
import { TrendingUp, TrendingDown, Package2 } from 'lucide-react';
import RealFurniImageHybrid from './RealFurniImageHybrid';

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
  soldItems?: number;
  openOffers?: number;
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
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">Carregando dados reais...</p>
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
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">{title}</h3>
        <p className="text-sm text-gray-600">{items.length} itens • Dados reais HabboAPI.site</p>
      </div>
      
      <ScrollArea className="h-96">
        <div className="p-4 space-y-3">
          {items.map((item, index) => {
            const itemType = item.id.includes('wallitem') ? 'wallitem' : 'roomitem';
            const isTopItem = index < 3; // Destaque para top 3
            
            return (
              <div
                key={item.id}
                onClick={() => onItemClick(item)}
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-all border-2 hover:border-blue-300 ${
                  isTopItem ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100'
                } hover:shadow-md`}
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
                    {isTopItem && <span className="text-yellow-500 font-bold">#{index + 1}</span>}
                    <p className="font-medium text-sm truncate" title={item.name}>
                      {item.name}
                    </p>
                  </div>
                  
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
                  
                  {(item.soldItems || item.quantity) && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Package2 size={10} />
                      <span>
                        {item.soldItems ? `${item.soldItems} vendidos` : `${item.quantity} na feira`}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-1">
                    Real: {item.className}
                  </div>
                </div>
                
                {/* Indicador de dados reais */}
                <div className="text-xs text-green-600 font-medium">
                  📊 Real
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
