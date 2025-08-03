
import { MarketCategoryBox } from './MarketCategoryBox';
import { MarketDashboard } from './MarketDashboard';

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

interface MarketStats {
  totalItems: number;
  averagePrice: number;
  totalVolume: number;
  trendingUp: number;
  trendingDown: number;
  featuredItems: number;
  highestPrice: number;
  mostTraded: string;
}

interface MarketplaceCategoryBoxesProps {
  topSellers: MarketItem[];
  biggestGainers: MarketItem[];
  biggestLosers: MarketItem[];
  mostExpensive: MarketItem[];
  opportunities: MarketItem[];
  stats: MarketStats;
  totalItems: number;
  hotel: { id: string; name: string; flag: string };
}

export const MarketplaceCategoryBoxes = ({
  topSellers,
  biggestGainers,
  biggestLosers,
  mostExpensive,
  opportunities,
  stats,
  totalItems,
  hotel
}: MarketplaceCategoryBoxesProps) => {
  const handleItemClick = (item: MarketItem) => {
    console.log('Item clicked:', item);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <MarketDashboard 
        stats={stats} 
        items={topSellers.concat(biggestGainers, biggestLosers, mostExpensive, opportunities)} 
      />

      {/* Category Boxes Grid - Improved layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketCategoryBox 
          title="🔥 Top Vendedores" 
          items={topSellers} 
          onItemClick={handleItemClick}
        />
        <MarketCategoryBox 
          title="📈 Maiores Altas" 
          items={biggestGainers} 
          onItemClick={handleItemClick}
        />
        <MarketCategoryBox 
          title="📉 Maiores Baixas" 
          items={biggestLosers} 
          onItemClick={handleItemClick}
        />
        <MarketCategoryBox 
          title="💎 Mais Caros" 
          items={mostExpensive} 
          onItemClick={handleItemClick}
        />
        <MarketCategoryBox 
          title="🎯 Oportunidades" 
          items={opportunities} 
          onItemClick={handleItemClick}
        />
        
        {/* Hotel Status Box */}
        <div className="habbo-card p-6">
          <div className="text-center">
            <div className="text-4xl mb-3">{hotel.flag}</div>
            <h3 className="font-bold text-gray-800 mb-3">{hotel.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center justify-center gap-2">
                📦 {totalItems} itens ativos
              </p>
              <p className="flex items-center justify-center gap-2">
                🕒 Última atualização: {new Date().toLocaleTimeString('pt-BR')}
              </p>
              <p className="text-xs text-green-600 font-medium">
                ✅ Atualização automática ativa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
