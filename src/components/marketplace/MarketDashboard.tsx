
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { CreditIcon } from './CreditIcon';
import { TrendingUp, Package, Star, Crown } from 'lucide-react';

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

interface MarketDashboardProps {
  stats: MarketStats;
  items: any[];
}

export const MarketDashboard = ({ stats, items }: MarketDashboardProps) => {
  // Prepare data for charts
  const rarityData = items.reduce((acc, item) => {
    acc[item.rarity] = (acc[item.rarity] || 0) + 1;
    return acc;
  }, {});

  const rarityChartData = Object.entries(rarityData).map(([rarity, count]) => ({
    name: rarity,
    value: count as number,
    color: getRarityColor(rarity)
  }));

  const categoryData = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.volume;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([category, volume]) => ({
    name: category,
    volume: volume as number
  }));

  const priceData = items.slice(0, 10).map((item, index) => ({
    name: item.name.slice(0, 8) + '...',
    price: item.currentPrice,
    volume: item.volume
  }));

  function getRarityColor(rarity: string) {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'uncommon': return '#3b82f6';
      case 'rare': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="habbo-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Package className="text-blue-500 mr-2" size={20} />
            <span className="text-sm font-medium text-blue-600">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalItems}</div>
          <div className="text-sm text-gray-600">Itens Ativos</div>
        </div>

        <div className="habbo-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <CreditIcon size="md" className="mr-2" />
            <span className="text-sm font-medium text-green-600">Média</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.averagePrice.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Preço Médio</div>
        </div>

        <div className="habbo-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="text-green-500 mr-2" size={20} />
            <span className="text-sm font-medium text-green-600">Volume</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalVolume}</div>
          <div className="text-sm text-gray-600">Transações</div>
        </div>

        <div className="habbo-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Crown className="text-purple-500 mr-2" size={20} />
            <span className="text-sm font-medium text-purple-600">Premium</span>
          </div>
          <div className="text-xl font-bold text-gray-800 flex items-center justify-center gap-1">
            <CreditIcon size="sm" />
            {stats.highestPrice.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Maior Preço</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rarity Distribution */}
        <div className="habbo-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star size={20} />
            Distribuição por Raridade
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rarityChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {rarityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume by Category */}
        <div className="habbo-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package size={20} />
            Volume por Categoria
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="volume" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items by Price */}
        <div className="habbo-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Top 10 - Preços Mais Altos
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [
                    <span className="flex items-center gap-1">
                      <CreditIcon size="sm" />
                      {value.toLocaleString()}
                    </span>, 
                    'Preço'
                  ]}
                />
                <Bar dataKey="price" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
