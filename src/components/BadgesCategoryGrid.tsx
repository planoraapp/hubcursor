import React, { useState, useEffect } from 'react';
import { useHabboBadgesStorage, HabboBadgeItem } from '@/hooks/useHabboBadgesStorage';
import { categorizeBadge } from '@/utils/badgeCategorization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Crown, Award, Users, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BadgesCategoryGridProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const BadgesCategoryGridComponent: React.FC<BadgesCategoryGridProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  const { data: badges, isLoading, error } = useHabboBadgesStorage();
  const [categoryStats, setCategoryStats] = useState({
    official: 0,
    achievements: 0,
    fansites: 0,
    others: 0,
  });
  const [displayedBadges, setDisplayedBadges] = useState<HabboBadgeItem[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (badges && badges.length > 0) {
      console.log('📊 [BadgesCategoryGrid] Processing badges:', badges.length);
      
      const stats = {
        official: 0,
        achievements: 0,
        fansites: 0,
        others: 0,
      };

      badges.forEach((badge: HabboBadgeItem) => {
        const category = categorizeBadge(badge.code, badge.name);
        stats[category]++;
      });

      console.log('📊 [BadgesCategoryGrid] Category stats:', stats);
      setCategoryStats(stats);
    }
  }, [badges]);

  useEffect(() => {
    if (badges && selectedCategory) {
      setLoadingMore(true);
      setTimeout(() => {
        const filtered = badges
          .filter((badge: HabboBadgeItem) => categorizeBadge(badge.code, badge.name) === selectedCategory)
          .slice(0, 200);
        
        console.log(`📊 [BadgesCategoryGrid] Loaded ${filtered.length} badges for category: ${selectedCategory}`);
        setDisplayedBadges(filtered);
        setLoadingMore(false);
      }, 300);
    } else {
      setDisplayedBadges([]);
    }
  }, [badges, selectedCategory]);

  const categories = [
    {
      id: 'official',
      name: 'Oficiais',
      icon: Crown,
      description: 'Emblemas oficiais, staff e administração',
      color: 'bg-yellow-500',
    },
    {
      id: 'achievements',
      name: 'Conquistas',
      icon: Award,
      description: 'Achievements, games e progressos',
      color: 'bg-blue-500',
    },
    {
      id: 'fansites',
      name: 'Fã-sites',
      icon: Users,
      description: 'Eventos especiais e sites parceiros',
      color: 'bg-green-500',
    },
    {
      id: 'others',
      name: 'Outros',
      icon: Package,
      description: 'Diversos e sazonais',
      color: 'bg-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-habbo-yellow" />
        <span className="ml-2 text-gray-600">Carregando emblemas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Erro ao carregar emblemas: {error.message}
        <pre className="text-xs mt-2">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return (
      <div className="text-center text-gray-500 p-8">
        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Nenhum emblema encontrado no storage.</p>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-blue-300"
            onClick={() => onCategorySelect(category.id)}
          >
            <CardHeader className="text-center">
              <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-gray-800">{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="secondary" className="mb-2">
                {categoryStats[category.id as keyof typeof categoryStats].toLocaleString()} emblemas
              </Badge>
              <p className="text-sm text-gray-600">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => onCategorySelect(null)}
        >
          ← Voltar às Categorias
        </Button>
        <Badge variant="secondary">
          {displayedBadges.length} de {categoryStats[selectedCategory as keyof typeof categoryStats]} emblemas
        </Badge>
      </div>

      {loadingMore ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Carregando categoria...</span>
        </div>
      ) : (
        <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-2">
          {displayedBadges.map((badge, index) => (
            <div
              key={`${badge.code}-${index}`}
              className="aspect-square bg-gray-50 rounded border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-1 group cursor-pointer"
              title={`${badge.name} (${badge.code})`}
            >
              <img
                src={badge.imageUrl}
                alt={badge.name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/badge-placeholder.png';
                }}
              />
            </div>
          ))}
        </div>
      )}
      
      {displayedBadges.length === 0 && !loadingMore && (
        <div className="text-center text-gray-500 p-8">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum emblema encontrado nesta categoria.</p>
        </div>
      )}
    </div>
  );
};

// Wrapper component with state management
const BadgesCategoryGrid: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <BadgesCategoryGridComponent
      selectedCategory={selectedCategory}
      onCategorySelect={setSelectedCategory}
    />
  );
};

export default BadgesCategoryGrid;