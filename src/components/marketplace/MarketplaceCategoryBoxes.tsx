
import { MarketCategoryBox } from './MarketCategoryBox';
import { MarketItemModal } from './MarketItemModal';
import { useState } from 'react';

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
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleItemClick = (item: MarketItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  // Melhorar lógica de filtragem com dados reais
  const maioresOfertas = [...topSellers, ...biggestGainers, ...mostExpensive]
    .filter(item => item.openOffers && item.openOffers > 0)
    .sort((a, b) => (b.openOffers || 0) - (a.openOffers || 0))
    .slice(0, 8);
    
  const maisVendidosHoje = [...topSellers, ...biggestGainers]
    .filter(item => item.volume > 0 && item.currentPrice > 0)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 8);
    
  const melhoresNegocios = [...opportunities, ...topSellers]
    .filter(item => item.currentPrice > 0 && item.currentPrice < 1000)
    .sort((a, b) => a.currentPrice - b.currentPrice)
    .slice(0, 8);
    
  const altasDeHoje = [...biggestGainers]
    .filter(item => item.trend === 'up' && parseFloat(item.changePercent.replace('%', '')) > 0)
    .sort((a, b) => {
      const aChange = parseFloat(a.changePercent.replace('%', ''));
      const bChange = parseFloat(b.changePercent.replace('%', ''));
      return bChange - aChange;
    })
    .slice(0, 8);

  return (
    <>
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

      {/* Item Modal */}
      <MarketItemModal 
        item={selectedItem}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
};
