
import { MarketCategoryBox } from './MarketCategoryBox';
import type { MarketItem, MarketStats } from '@/contexts/MarketplaceContext';

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
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MarketCategoryBox
          title="🔥 Mais Vendidos"
          items={topSellers}
          hotel={hotel}
        />
        <MarketCategoryBox
          title="📈 Maiores Altas"
          items={biggestGainers}
          hotel={hotel}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MarketCategoryBox
          title="💰 Mais Caros"
          items={mostExpensive}
          hotel={hotel}
        />
        <MarketCategoryBox
          title="💎 Oportunidades"
          items={opportunities}
          hotel={hotel}
        />
      </div>
    </div>
  );
};
