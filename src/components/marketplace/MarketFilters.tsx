
import { Filter, TrendingUp, Package2, Clock, Gem } from 'lucide-react';

interface MarketFiltersProps {
  sortBy: 'price' | 'recent' | 'quantity' | 'ltd';
  setSortBy: (sort: 'price' | 'recent' | 'quantity' | 'ltd') => void;
}

export const MarketFilters = ({ sortBy, setSortBy }: MarketFiltersProps) => {
  const filterOptions = [
    { id: 'price', name: 'Mais Caros', icon: TrendingUp, color: 'text-blue-600' },
    { id: 'quantity', name: 'Menor Qtd', icon: Package2, color: 'text-orange-600' },
    { id: 'recent', name: 'Recentes', icon: Clock, color: 'text-green-600' },
    { id: 'ltd', name: 'LTD', icon: Gem, color: 'text-purple-600' },
  ];

  return (
    <div className="flex gap-2">
      {filterOptions.map(option => {
        const IconComponent = option.icon;
        const isActive = sortBy === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => setSortBy(option.id as any)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isActive 
                ? `bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md` 
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
            }`}
          >
            <IconComponent size={12} className={isActive ? 'text-white' : option.color} />
            <span>{option.name}</span>
          </button>
        );
      })}
    </div>
  );
};
