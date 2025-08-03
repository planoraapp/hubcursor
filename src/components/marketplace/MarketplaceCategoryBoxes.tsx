
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
      {/* Dashboard Stats Compacto - sem gráficos como solicitado */}
      <div className="habbo-card p-6">
        <div className="text-center border-b pb-4 mb-4">
          <div className="text-4xl mb-3">{hotel.flag}</div>
          <h3 className="font-bold text-gray-800 mb-2">{hotel.name} - Dados em Tempo Real</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
              <div className="text-gray-600">Itens Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.averagePrice.toLocaleString()}</div>
              <div className="text-gray-600">Preço Médio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalVolume}</div>
              <div className="text-gray-600">Vendas Hoje</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.highestPrice.toLocaleString()}</div>
              <div className="text-gray-600">Mais Caro</div>
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-600">
          <p>🕒 Última atualização: {new Date().toLocaleTimeString('pt-BR')}</p>
          <p className="text-xs text-green-600 font-medium mt-1">✅ Dados reais da HabboAPI.site</p>
        </div>
      </div>

      {/* Category Boxes Grid Redesenhada - Foco em "Maiores Ofertas do Dia" */}
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
