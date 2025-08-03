
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CreditIcon } from './CreditIcon';
import { TrendingUp, TrendingDown, Star, Calendar, Package, Activity } from 'lucide-react';

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
}

interface MarketItemModalProps {
  item: MarketItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MarketItemModal = ({ item, open, onOpenChange }: MarketItemModalProps) => {
  if (!item) return null;

  const priceData = item.priceHistory.map((price, index) => ({
    day: `Dia ${index + 1}`,
    price,
    volume: Math.floor(Math.random() * 50) + 10 // Mock volume data
  }));

  const chartConfig = {
    price: {
      label: "Preço",
    },
    volume: {
      label: "Volume",
    },
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-blue-100 text-blue-800';
      case 'rare': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/package.png';
              }}
            />
            <div>
              <h2 className="text-xl font-bold">{item.name}</h2>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full">
          <div className="space-y-6 p-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="habbo-card p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CreditIcon size="md" />
                  <span className="text-2xl font-bold text-green-600">
                    {item.currentPrice.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Preço Atual</p>
              </div>

              <div className="habbo-card p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {item.trend === 'up' ? (
                    <TrendingUp className="text-green-500" size={20} />
                  ) : item.trend === 'down' ? (
                    <TrendingDown className="text-red-500" size={20} />
                  ) : (
                    <Activity className="text-gray-500" size={20} />
                  )}
                  <span className={`text-lg font-bold ${
                    item.trend === 'up' ? 'text-green-600' : 
                    item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {item.changePercent}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Variação</p>
              </div>

              <div className="habbo-card p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Package className="text-blue-500" size={20} />
                  <span className="text-lg font-bold text-blue-600">
                    {item.volume}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Volume</p>
              </div>

              <div className="habbo-card p-4 text-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRarityColor(item.rarity)}`}>
                  {item.rarity.toUpperCase()}
                </span>
                <p className="text-sm text-gray-600 mt-1">Raridade</p>
              </div>
            </div>

            {/* Price History Chart */}
            <div className="habbo-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Histórico de Preços (30 dias)
              </h3>
              <div className="h-64">
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <LineChart data={priceData}>
                    <XAxis dataKey="day" />
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
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </div>

            {/* Volume Chart */}
            <div className="habbo-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity size={20} />
                Volume de Vendas
              </h3>
              <div className="h-48">
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <BarChart data={priceData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: any) => [value, 'Volume']}
                    />
                    <Bar dataKey="volume" fill="#3b82f6" />
                  </BarChart>
                </ChartContainer>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button className="habbo-button-blue flex-1">
                <Star size={16} className="mr-2" />
                Adicionar aos Favoritos
              </button>
              <button className="habbo-button-green flex-1">
                Criar Alerta de Preço
              </button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
