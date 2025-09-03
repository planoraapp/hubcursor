
import { Button } from '@/components/ui/button';
import { CategoryIcon, CATEGORY_NAMES } from './CategoryIcons';

interface HabboHubCategoryNavigationProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const HabboHubCategoryNavigation = ({
  selectedCategory,
  onCategorySelect
}: HabboHubCategoryNavigationProps) => {
  const categories = [
    { id: 'hr', name: 'Cabelo' },
    { id: 'hd', name: 'Chapéu' },
    { id: 'ch', name: 'Peito' },
    { id: 'cc', name: 'Camisa' },
    { id: 'cp', name: 'Calça' },
    { id: 'ca', name: 'Acessório' },
    { id: 'wa', name: 'Cintura' },
    { id: 'sh', name: 'Sapatos' },
    { id: 'lg', name: 'Pernas' },
    { id: 'ha', name: 'Mãos' },
    { id: 'he', name: 'Cabeça' },
    { id: 'ea', name: 'Orelhas' },
    { id: 'fa', name: 'Rosto' },
    { id: 'ey', name: 'Olhos' }
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
          <CategoryIcon 
            category={category.id} 
            isActive={selectedCategory === category.id}
            className="w-6 h-6" 
          />
          <span className="text-xs font-medium text-center leading-tight">
            {category.name}
          </span>
        </Button>
      ))}
    </div>
  );
};

export default HabboHubCategoryNavigation;
