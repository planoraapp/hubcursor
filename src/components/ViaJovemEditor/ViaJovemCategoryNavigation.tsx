
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFlashAssetsViaJovem } from '@/hooks/useFlashAssetsViaJovem';

interface ViaJovemCategoryNavigationProps {
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const ViaJovemCategoryNavigation = ({ selectedCategory, onCategorySelect }: ViaJovemCategoryNavigationProps) => {
  const { categoryStats, totalItems, isLoading } = useFlashAssetsViaJovem();

  // Categorias ViaJovem com ícones grandes, cores e prioridade
  const categories = [
    { id: 'hr', name: 'Cabelos', icon: '💇‍♀️', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200', priority: 1 },
    { id: 'ch', name: 'Camisetas', icon: '👕', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200', priority: 2 },
    { id: 'ha', name: 'Chapéus', icon: '🎩', color: 'bg-red-50 hover:bg-red-100 border-red-200', priority: 3 },
    { id: 'cc', name: 'Casacos', icon: '🧥', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200', priority: 4 },
    { id: 'lg', name: 'Calças', icon: '👖', color: 'bg-green-50 hover:bg-green-100 border-green-200', priority: 5 },
    { id: 'ca', name: 'Acessórios', icon: '🎖️', color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200', priority: 6 },
    { id: 'sh', name: 'Sapatos', icon: '👟', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200', priority: 7 },
    { id: 'hd', name: 'Rostos', icon: '👤', color: 'bg-pink-50 hover:bg-pink-100 border-pink-200', priority: 8 },
  ];

  // Ordenar por prioridade e quantidade de itens
  const sortedCategories = categories.sort((a, b) => {
    const aCount = categoryStats[a.id] || 0;
    const bCount = categoryStats[b.id] || 0;
    
    // Se uma categoria tem muito mais itens, priorizá-la
    if (aCount > bCount * 2) return -1;
    if (bCount > aCount * 2) return 1;
    
    // Caso contrário, usar prioridade padrão
    return a.priority - b.priority;
  });

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Categorias ViaJovem</h3>
          <Badge variant="secondary" className="bg-white/80">
            {isLoading ? 'Carregando...' : `${totalItems} itens disponíveis`}
          </Badge>
        </div>

        {/* Grid responsivo estilo ViaJovem - botões grandes com ícones */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {sortedCategories.map((category) => {
            const itemCount = categoryStats[category.id] || 0;
            const isSelected = selectedCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant="outline"
                className={`h-20 flex flex-col gap-1 transition-all duration-300 border-2 ${
                  isSelected 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-lg scale-105' 
                    : `${category.color} text-gray-700 hover:scale-102`
                }`}
                onClick={() => onCategorySelect(category.id)}
                disabled={itemCount === 0}
              >
                <span className="text-2xl mb-1">{category.icon}</span>
                <span className="text-xs font-semibold leading-tight text-center">
                  {category.name}
                </span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs h-4 px-1 ${isSelected ? 'bg-white/20 text-white' : 'bg-white/60'}`}
                >
                  {itemCount}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Estatísticas rápidas */}
        <div className="text-center mt-4 text-xs text-gray-600">
          <p>
            🎨 <strong>Flash Assets</strong> • 
            📦 <strong>{Object.keys(categoryStats).length} categorias ativas</strong> • 
            ⚡ <strong>Thumbnails oficiais Habbo</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViaJovemCategoryNavigation;
