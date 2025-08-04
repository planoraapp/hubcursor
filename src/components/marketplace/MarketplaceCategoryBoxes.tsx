import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ShoppingCart, Gem, Target } from 'lucide-react';
import { OfficialMarketplaceImage } from './OfficialMarketplaceImage';
import { CreditIcon } from './CreditIcon';
import { FurnidataService } from '@/services/FurnidataService';
import { OfficialTrendsService } from '@/services/OfficialTrendsService';
import { useEffect, useState } from 'react';

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
  mostExpensive,
  opportunities,
  stats,
  totalItems,
  hotel
}: MarketplaceCategoryBoxesProps) => {
  const [todayHighs, setTodayHighs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ETAPA 4: Carregar "Altas de Hoje" com dados oficiais
  useEffect(() => {
    const fetchTodayHighs = async () => {
      try {
        setLoading(true);
        const highs = await OfficialTrendsService.getTodayHighs(hotel.id);
        setTodayHighs(highs);
      } catch (error) {
        console.error('Error fetching today highs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayHighs();
  }, [hotel.id]);

  const CategoryBox = ({ 
    title, 
    items, 
    icon, 
    bgColor, 
    textColor,
    isOfficialData = false
  }: { 
    title: string; 
    items: any[]; 
    icon: React.ReactNode; 
    bgColor: string; 
    textColor: string;
    isOfficialData?: boolean;
  }) => (
    <Card className={`${bgColor} border-2 hover:shadow-lg transition-all`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className={`font-bold text-sm ${textColor}`}>{title}</h3>
          {isOfficialData && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded border border-green-300">
              📊 Oficial
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length > 0 ? (
          items.slice(0, 5).map((item, index) => (
            <div key={item.id || item.className} className="flex items-center gap-2 p-2 bg-white/50 rounded border">
              <OfficialMarketplaceImage
                className={item.className}
                name={FurnidataService.getFurniName(item.className)}
                size="sm"
                priority={index < 3}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs truncate" title={FurnidataService.getFurniName(item.className)}>
                  {FurnidataService.getFurniName(item.className)}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-blue-600 font-semibold">
                    <CreditIcon size="sm" />
                    {(item.currentPrice || item.price || 0).toLocaleString()}
                  </span>
                  {item.changePercent && parseFloat(item.changePercent) !== 0 && (
                    <div className="flex items-center gap-1">
                      {parseFloat(item.changePercent) > 0 ? (
                        <TrendingUp size={10} className="text-green-500" />
                      ) : (
                        <TrendingDown size={10} className="text-red-500" />
                      )}
                      <span className={parseFloat(item.changePercent) > 0 ? 'text-green-600' : 'text-red-600'}>
                        {parseFloat(item.changePercent) > 0 ? '+' : ''}{parseFloat(item.changePercent).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {item.totalOpenOffers !== undefined && (
                    <span className="text-gray-600">{item.totalOpenOffers} ofertas</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : loading ? (
          <div className="text-center py-4">
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto"></div>
            <p className="text-xs text-gray-500 mt-2">Carregando...</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500">Nenhum item disponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* ETAPA 4: "Altas de Hoje" com dados oficiais */}
      <CategoryBox
        title="📈 Altas de Hoje"
        items={todayHighs}
        icon={<TrendingUp className="w-4 h-4 text-green-600" />}
        bgColor="bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
        textColor="text-green-800"
        isOfficialData={true}
      />

      {/* Top Sellers */}
      <CategoryBox
        title="🔥 Mais Vendidos"
        items={topSellers}
        icon={<ShoppingCart className="w-4 h-4 text-red-600" />}
        bgColor="bg-gradient-to-br from-red-50 to-pink-50 border-red-300"
        textColor="text-red-800"
      />

      {/* Biggest Gainers */}
      <CategoryBox
        title="🚀 Maiores Altas"
        items={biggestGainers}
        icon={<TrendingUp className="w-4 h-4 text-green-600" />}
        bgColor="bg-gradient-to-br from-green-50 to-lime-50 border-green-300"
        textColor="text-green-800"
      />

      {/* Opportunities (LTD/Raros) */}
      <CategoryBox
        title="💎 Oportunidades"
        items={opportunities}
        icon={<Gem className="w-4 h-4 text-purple-600" />}
        bgColor="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-300"
        textColor="text-purple-800"
      />

      {/* Most Expensive */}
      <CategoryBox
        title="💰 Mais Caros"
        items={mostExpensive}
        icon={<Target className="w-4 h-4 text-orange-600" />}
        bgColor="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-300"
        textColor="text-orange-800"
      />

      {/* Estatísticas do Marketplace */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
        <CardHeader>
          <h3 className="font-bold text-sm text-blue-800">📊 Estatísticas do {hotel.name}</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-600">Total de Itens</p>
              <p className="font-semibold text-blue-800">{totalItems.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Preço Médio</p>
              <p className="font-semibold text-blue-800 flex items-center gap-1">
                <CreditIcon size="sm" />
                {stats.averagePrice.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Em Alta</p>
              <p className="font-semibold text-green-600 flex items-center gap-1">
                <TrendingUp size={12} />
                {stats.trendingUp}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Em Baixa</p>
              <p className="font-semibold text-red-600 flex items-center gap-1">
                <TrendingDown size={12} />
                {stats.trendingDown}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
