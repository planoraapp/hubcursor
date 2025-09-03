
import { CreditIcon } from './CreditIcon';

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

interface MarketStatsFooterProps {
  stats: MarketStats;
  totalItems: number;
  hotel: { id: string; name: string; flag: string };
}

export const MarketStatsFooter = ({ stats, totalItems, hotel }: MarketStatsFooterProps) => {
  return (
    <div className="border-t border-gray-200 bg-gray-50 rounded-b-lg p-4 mt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{totalItems}</div>
          <div className="text-gray-600">Itens Ativos</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600 flex items-center justify-center gap-1">
            <CreditIcon size="sm" />
            {stats.averagePrice.toLocaleString()}
          </div>
          <div className="text-gray-600">Preço Médio</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{stats.totalVolume}</div>
          <div className="text-gray-600">Vendas Hoje</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600 flex items-center justify-center gap-1">
            <CreditIcon size="sm" />
            {stats.highestPrice.toLocaleString()}
          </div>
          <div className="text-gray-600">Mais Caro</div>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
        <p>🕒 Última atualização: {new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    </div>
  );
};
