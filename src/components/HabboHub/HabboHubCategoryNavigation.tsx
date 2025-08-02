
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HabboHubCategoryNavigationProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const HabboHubCategoryNavigation = ({
  selectedCategory,
  onCategorySelect
}: HabboHubCategoryNavigationProps) => {
  const categories = [
    { id: 'hd', name: 'Rostos', icon: '👤' },
    { id: 'hr', name: 'Cabelos', icon: '💇' },
    { id: 'ch', name: 'Camisetas', icon: '👕' },
    { id: 'lg', name: 'Calças', icon: '👖' },
    { id: 'sh', name: 'Sapatos', icon: '👟' },
    { id: 'ha', name: 'Chapéus', icon: '🎩' },
    { id: 'ea', name: 'Óculos', icon: '👓' },
    { id: 'fa', name: 'Acessórios Faciais', icon: '😷' },
    { id: 'cc', name: 'Casacos', icon: '🧥' },
    { id: 'ca', name: 'Acessórios Peito', icon: '🎖️' },
    { id: 'wa', name: 'Cintura', icon: '👔' },
    { id: 'cp', name: 'Estampas', icon: '🎨' }
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 bg-gray-50 rounded-lg">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          size="lg"
          className={`flex flex-col items-center gap-2 h-20 transition-all duration-200 ${
            selectedCategory === category.id 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-105' 
              : 'hover:bg-gray-100 hover:border-gray-400'
          }`}
          onClick={() => onCategorySelect(category.id)}
        >
          <span className="text-2xl">{category.icon}</span>
          <span className="text-xs font-medium text-center leading-tight">
            {category.name}
          </span>
        </Button>
      ))}
    </div>
  );
};

export default HabboHubCategoryNavigation;
