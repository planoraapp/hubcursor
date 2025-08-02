
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Package } from 'lucide-react';
import { useOfficialHabboData } from '@/hooks/useOfficialHabboData';

const CATEGORY_CONFIG = {
  official: { name: 'Oficiais', icon: '🛡️', color: 'bg-blue-500' },
  achievements: { name: 'Conquistas', icon: '🏆', color: 'bg-yellow-500' },
  fansites: { name: 'Fã-sites', icon: '🌟', color: 'bg-purple-500' },
  others: { name: 'Outros', icon: '🎨', color: 'bg-gray-500' }
};

const SimplifiedBadgesGrid = () => {
  const { data, isLoading, error } = useOfficialHabboData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-habbo-yellow" />
        <span className="ml-2">Carregando emblemas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Erro ao carregar emblemas</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const badges = data?.badges || [];
  
  // Agrupar por categoria
  const groupedBadges = badges.reduce((acc, badge) => {
    const category = badge.category || 'others';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, typeof badges>);

  // Filtrar badges por categoria e busca
  const filteredBadges = selectedCategory 
    ? (groupedBadges[selectedCategory] || []).filter(badge => 
        badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (!selectedCategory) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {badges.length.toLocaleString()} emblemas disponíveis
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const categoryCount = groupedBadges[key]?.length || 0;
            
            return (
              <Card
                key={key}
                className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-habbo-yellow"
                onClick={() => setSelectedCategory(key)}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${config.color} rounded-full flex items-center justify-center mx-auto mb-2 text-2xl`}>
                    {config.icon}
                  </div>
                  <CardTitle>{config.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="secondary" className="mb-2">
                    {categoryCount.toLocaleString()} emblemas
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com busca */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setSelectedCategory(null)}
        >
          ← Voltar às Categorias
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar emblemas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Badge variant="secondary">
            {filteredBadges.length} emblemas
          </Badge>
        </div>
      </div>

      {/* Grid de emblemas */}
      {filteredBadges.length === 0 ? (
        <div className="text-center text-gray-500 p-12">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Nenhum emblema encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-2">
          {filteredBadges.map((badge, index) => (
            <div
              key={`${badge.code}-${index}`}
              className="aspect-square bg-white/5 rounded border border-gray-200 hover:border-habbo-yellow hover:shadow-md transition-all p-1 group cursor-pointer"
              title={`${badge.name} (${badge.code})`}
            >
              <img
                src={badge.imageUrl}
                alt={badge.name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // Fallback para múltiplas fontes
                  if (!target.src.includes('habboassets.com')) {
                    target.src = `https://habboassets.com/c_images/album1584/${badge.code}.gif`;
                  } else if (!target.src.includes('images.habbo.com')) {
                    target.src = `https://images.habbo.com/c_images/album1584/${badge.code}.gif`;
                  } else {
                    // Placeholder final
                    target.style.background = '#f0f0f0';
                    target.alt = badge.code;
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimplifiedBadgesGrid;
