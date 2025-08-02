
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { BADGE_CATEGORIES, groupBadgesByCategory } from '@/utils/badgeCategorization';
import { useHabboBadgesStorage } from '@/hooks/useHabboBadgesStorage';
import { useState as useStateAsync, useEffect } from 'react';

interface BadgesCategoryGridProps {
  className?: string;
}

const BadgesCategoryGrid = ({ className = '' }: BadgesCategoryGridProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<Record<string, any[]>>({});
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  
  const { data: allBadges, isLoading } = useHabboBadgesStorage({ 
    limit: 1000, 
    enabled: true 
  });

  useEffect(() => {
    if (allBadges && allBadges.length > 0) {
      const grouped = groupBadgesByCategory(allBadges);
      setCategoryData(grouped);
    }
  }, [allBadges]);

  const handleCategoryClick = async (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      return;
    }

    setExpandedCategory(categoryId);
    setLoadingCategory(categoryId);

    // Simular carregamento adicional se necessário
    setTimeout(() => {
      setLoadingCategory(null);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando categorias de emblemas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Emblemas HabboHub</h2>
        <p className="text-gray-600">Explore nossa coleção completa de emblemas organizados por categoria</p>
      </div>

      {/* Categorias principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {BADGE_CATEGORIES.map((category) => {
          const count = categoryData[category.id]?.length || 0;
          const isExpanded = expandedCategory === category.id;
          
          return (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${category.color} ${isExpanded ? 'ring-2 ring-blue-400' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                <Badge variant="secondary" className="mb-2">
                  {count.toLocaleString()} emblemas
                </Badge>
                <p className="text-sm opacity-75 mb-3">{category.description}</p>
                <div className="flex items-center justify-center">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grid expandido da categoria selecionada */}
      {expandedCategory && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">
                {BADGE_CATEGORIES.find(c => c.id === expandedCategory)?.icon}
              </span>
              {BADGE_CATEGORIES.find(c => c.id === expandedCategory)?.name}
              <Badge variant="outline" className="ml-auto">
                {categoryData[expandedCategory]?.length || 0} emblemas
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCategory === expandedCategory ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-3">
                {(categoryData[expandedCategory] || []).slice(0, 100).map((badge) => (
                  <div
                    key={badge.id}
                    className="group relative aspect-square bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-105 cursor-pointer"
                    title={`${badge.name} (${badge.code})`}
                  >
                    <img
                      src={badge.imageUrl}
                      alt={badge.name}
                      className="w-full h-full object-contain p-1 rounded-lg"
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/badge-placeholder.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg" />
                  </div>
                ))}
              </div>
            )}
            
            {categoryData[expandedCategory]?.length > 100 && (
              <div className="text-center mt-6">
                <Button variant="outline">
                  Carregar mais emblemas
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BadgesCategoryGrid;
