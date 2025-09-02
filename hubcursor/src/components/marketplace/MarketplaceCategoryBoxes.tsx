
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
    <div className="space-y-4 h-full">
      <div className="grid grid-cols-1 gap-4 h-full">
        <MarketCategoryBox
          title="🔥 Mais Vendidos"
          items={topSellers}
          hotel={hotel}
          icon="/assets/promo_star.gif"
          height="h-[145px]"
        />
        <MarketCategoryBox
          title="📈 Maiores Altas"
          items={biggestGainers}
          hotel={hotel}
          icon="/assets/135217166.gif"
          height="h-[145px]"
        />
        <MarketCategoryBox
          title="💰 Mais Caros"
          items={mostExpensive}
          hotel={hotel}
          icon="/assets/Diamantes.png"
          height="h-[145px]"
        />
        <MarketCategoryBox
          title="💎 Oportunidades"
          items={opportunities}
          hotel={hotel}
          icon="/assets/gcreate_icon_credit.png"
          height="h-[145px]"
        />
      </div>
    </div>
  );
};
