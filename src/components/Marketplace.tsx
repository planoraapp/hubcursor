
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { TrendingUp, TrendingDown, DollarSign, Package, BarChart3 } from 'lucide-react';

export const Marketplace = () => {
  const { t } = useLanguage();

  const marketStats = [
    {
      title: 'Total de Itens',
      value: '12,543',
      change: '+245',
      trend: 'up',
      icon: Package
    },
    {
      title: 'Vendas Hoje',
      value: '1,234',
      change: '+89',
      trend: 'up',
      icon: DollarSign
    },
    {
      title: 'Preço Médio',
      value: '156 moedas',
      change: '-12',
      trend: 'down',
      icon: BarChart3
    }
  ];

  const trendingItems = [
    {
      id: 1,
      name: 'Trono Dourado',
      currentPrice: 5000,
      change: '+12%',
      trend: 'up',
      volume: 23,
      image: 'https://images.habbo.com/dcr/hof_furni/icons/throne_gold.png'
    },
    {
      id: 2,
      name: 'Poltrona Clássica',
      currentPrice: 50,
      change: '-5%',
      trend: 'down',
      volume: 156,
      image: 'https://images.habbo.com/dcr/hof_furni/icons/chair_norja.png'
    },
    {
      id: 3,
      name: 'Planta Tropical',
      currentPrice: 150,
      change: '+8%',
      trend: 'up',
      volume: 89,
      image: 'https://images.habbo.com/dcr/hof_furni/icons/plant_jungle.png'
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      item: 'Trono Dourado',
      seller: 'HabboTrader',
      buyer: 'CollectorPro',
      price: 5000,
      time: '2 min atrás'
    },
    {
      id: 2,
      item: 'Poltrona Clássica',
      seller: 'FurniShop',
      buyer: 'NewPlayer123',
      price: 50,
      time: '5 min atrás'
    },
    {
      id: 3,
      item: 'Planta Tropical',
      seller: 'GreenDecorator',
      buyer: 'RoomDesigner',
      price: 150,
      time: '8 min atrás'
    }
  ];

  return (
    <div className="space-y-6">
      <PanelCard title={t('marketplaceTitle')} subtitle={t('marketplaceSubtitle')}>
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-lg border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] shadow-[2px_2px_0px_0px_#cccccc] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-[#38332c]">{stat.value}</p>
                      <div className={`flex items-center space-x-1 text-xs ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{stat.change}</span>
                      </div>
                    </div>
                    <Icon size={32} className="text-[#008800]" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trending Items */}
          <div className="bg-white rounded-lg border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] shadow-[2px_2px_0px_0px_#cccccc] p-6">
            <h3 className="font-bold text-[#38332c] mb-4">Itens em Alta</h3>
            <div className="space-y-3">
              {trendingItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-contain"
                    />
                    <div>
                      <h4 className="font-medium text-[#38332c]">{item.name}</h4>
                      <p className="text-sm text-gray-600">Volume: {item.volume} vendas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#38332c]">{item.currentPrice} moedas</p>
                    <div className={`flex items-center space-x-1 text-sm ${
                      item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span>{item.change}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] shadow-[2px_2px_0px_0px_#cccccc] p-6">
            <h3 className="font-bold text-[#38332c] mb-4">Transações Recentes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Item</th>
                    <th className="text-left p-2">Vendedor</th>
                    <th className="text-left p-2">Comprador</th>
                    <th className="text-left p-2">Preço</th>
                    <th className="text-left p-2">Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{transaction.item}</td>
                      <td className="p-2 text-blue-600">{transaction.seller}</td>
                      <td className="p-2 text-green-600">{transaction.buyer}</td>
                      <td className="p-2 font-bold">{transaction.price} moedas</td>
                      <td className="p-2 text-gray-500">{transaction.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PanelCard>
    </div>
  );
};
