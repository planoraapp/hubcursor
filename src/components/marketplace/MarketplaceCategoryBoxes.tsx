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
  soldItems?: number;
  openOffers?: number;
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

  // Separar itens por "Maiores Ofertas do Dia" (maior volume de vendas)
  const maioresOfertas = [...topSellers].sort((a, b) => (b.soldItems || b.volume) - (a.soldItems || a.volume)).slice(0, 8);
  const maisVendidosHoje = [...biggestGainers].filter(item => item.trend === 'up').slice(0, 8);
  const melhoresNegocios = [...opportunities, ...mostExpensive.filter(item => item.currentPrice < 300)].slice(0, 8);
  const altasDeHoje = [...biggestGainers].slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Category Boxes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketCategoryBox 
          title="🔥 Maiores Ofertas do Dia" 
          items={maioresOfertas} 
          onItemClick={handleItemClick}
        />
        <MarketCategoryBox 
          title="⭐ Mais Vendidos Hoje" 
          items={maisVendidosHoje} 
          onItemClick={handleItemClick}
        />
        <MarketCategoryBox 
          title="💎 Melhores Negócios" 
          items={melhoresNegocios} 
          onItemClick={handleItemClick}
        />
        <MarketCategoryBox 
          title="📈 Altas de Hoje" 
          items={altasDeHoje} 
          onItemClick={handleItemClick}
        />
      </div>
    </div>
  );
};
