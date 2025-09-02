
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Shield, Trophy, Star, Palette, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import StableBadgeImage from './StableBadgeImage';

interface BadgeItem {
  id: string;
  code: string;
  name: string;
  category: 'official' | 'achievements' | 'fansites' | 'others';
  rarity: string;
}

const CATEGORY_CONFIG = {
  official: {
    name: 'Oficiais',
    icon: Shield,
    color: 'bg-blue-100 border-blue-300 text-blue-800'
  },
  achievements: {
    name: 'Conquistas',
    icon: Trophy,
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
  },
  fansites: {
    name: 'Fã-sites',
    icon: Star,
    color: 'bg-purple-100 border-purple-300 text-purple-800'
  },
  others: {
    name: 'Outros',
    icon: Palette,
    color: 'bg-gray-100 border-gray-300 text-gray-800'
  }
};

const fetchBadges = async (): Promise<BadgeItem[]> => {
  const response = await supabase.functions.invoke('habbo-badges-storage', {
    body: { limit: 2000, search: '', category: 'all' }
  });
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  return response.data?.badges || [];
};

const SimplifiedBadgesGrid = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const { data: badges = [], isLoading, error } = useQuery({
    queryKey: ['simplified-badges'],
    queryFn: fetchBadges,
    staleTime: 1000 * 60 * 30, // 30 minutos
    gcTime: 1000 * 60 * 60, // 1 hora
  });

  const filteredBadges = useMemo(() => {
    let filtered = badges;
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(badge => badge.category === activeCategory);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(badge => 
        badge.name.toLowerCase().includes(searchLower) ||
        badge.code.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [badges, activeCategory, searchTerm]);

  const badgesByCategory = useMemo(() => {
    return badges.reduce((acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    }, {} as Record<string, BadgeItem[]>);
  }, [badges]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Carregando Emblemas</h3>
            <p className="text-gray-600">Buscando emblemas do sistema oficial...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-red-600 mb-4">
            <Shield className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Erro ao Carregar Emblemas</h3>
            <p className="text-sm mt-2">Não foi possível carregar os emblemas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Busca Global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Emblemas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Pesquisar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {badges.length} emblemas total
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {filteredBadges.length} encontrados
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs por Categoria */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="all">
            Todos ({badges.length})
          </TabsTrigger>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <TabsTrigger key={key} value={key}>
              <config.icon className="w-4 h-4 mr-2" />
              {config.name} ({badgesByCategory[key]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className="group relative"
                title={`${badge.name} (${badge.code})`}
              >
                <StableBadgeImage
                  code={badge.code}
                  name={badge.name}
                  size="md"
                  className="hover:scale-110 transition-transform duration-200"
                />
                <div className="absolute -top-1 -right-1">
                  <div className={`w-3 h-3 rounded-full ${
                    CATEGORY_CONFIG[badge.category as keyof typeof CATEGORY_CONFIG]?.color || 'bg-gray-300'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${config.color} px-3 py-1 rounded-full inline-flex w-fit`}>
                  <config.icon className="w-5 h-5" />
                  {config.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
                  {(badgesByCategory[key] || [])
                    .filter(badge => 
                      !searchTerm || 
                      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      badge.code.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((badge) => (
                      <div
                        key={badge.id}
                        className="group relative"
                        title={`${badge.name} (${badge.code})`}
                      >
                        <StableBadgeImage
                          code={badge.code}
                          name={badge.name}
                          size="md"
                          className="hover:scale-110 transition-transform duration-200"
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SimplifiedBadgesGrid;
