
import { TrendingUp, Package2, Clock, Gem } from 'lucide-react';

interface MarketFiltersIconOnlyProps {
  sortBy: 'price' | 'recent' | 'quantity' | 'ltd';
  setSortBy: (sort: 'price' | 'recent' | 'quantity' | 'ltd') => void;
}

export const MarketFiltersIconOnly = ({ sortBy, setSortBy }: MarketFiltersIconOnlyProps) => {
  const filterOptions = [
    { id: 'price', name: 'Mais Caros', icon: TrendingUp, color: 'text-blue-600' },
    { id: 'quantity', name: 'Menor Qtd', icon: Package2, color: 'text-orange-600' },
    { id: 'recent', name: 'Recentes', icon: Clock, color: 'text-green-600' },
    { id: 'ltd', name: 'LTD', icon: Gem, color: 'text-purple-600' },
  ];

  return (
    <div className="flex flex-col gap-2">
      {filterOptions.map(option => {
        const IconComponent = option.icon;
        const isActive = sortBy === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => setSortBy(option.id as any)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all border-2 border-black shadow-md ${
              isActive 
                ? `bg-gradient-to-r from-blue-500 to-purple-500 text-white` 
                : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
            title={option.name}
          >
            <IconComponent size={20} className={isActive ? 'text-white' : option.color} />
          </button>
        );
      })}
    </div>
  );
};
