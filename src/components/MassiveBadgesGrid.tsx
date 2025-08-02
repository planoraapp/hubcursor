
import { useState, useMemo, useCallback } from 'react';
import { Search, Filter, RefreshCw, Info, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useEnhancedBadges, EnhancedBadgeItem } from '@/hooks/useEnhancedBadges';
import { BadgeDetailsModal } from './BadgeDetailsModal';
import EnhancedBadgeImage from './EnhancedBadgeImage';

const CATEGORY_CONFIG = {
  official: {
    name: 'Oficiais',
    icon: '🛡️',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    description: 'Badges da equipe oficial do Habbo'
  },
  achievements: {
    name: 'Conquistas',
    icon: '🏆',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    description: 'Badges de jogos e achievements'
  },
  fansites: {
    name: 'Fã-sites',
    icon: '⭐',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    description: 'Badges de eventos e parceiros'
  },
  others: {
    name: 'Outros',
    icon: '🎨',
    color: 'bg-gray-100 border-gray-300 text-gray-800',
    description: 'Badges diversos e sazonais'
  }
};

export const MassiveBadgesGrid = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState<EnhancedBadgeItem | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);
  
  const { data, isLoading, error, refetch } = useEnhancedBadges({
    limit: 10000,
    search: searchTerm,
    category: activeCategory,
    forceRefresh,
    enabled: true
  });

  const badges = data?.badges || [];
  const metadata = data?.metadata || {};

  const filteredBadges = useMemo(() => {
    let filtered = badges;
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(badge => badge.category === activeCategory);
    }
    
    if (searchTerm && searchTerm.length >= 2) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(badge => 
        badge.name.toLowerCase().includes(searchLower) ||
        badge.code.toLowerCase().includes(searchLower) ||
        badge.description.toLowerCase().includes(searchLower)
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
    }, {} as Record<string, EnhancedBadgeItem[]>);
  }, [badges]);

  const handleBadgeClick = useCallback((badge: EnhancedBadgeItem) => {
    setSelectedBadge(badge);
  }, []);

  const handleForceRefresh = useCallback(async () => {
    setForceRefresh(true);
    await refetch();
    setForceRefresh(false);
  }, [refetch]);

  const getRarityColor = (rarity: string) => {
    const colors = {
      'legendary': 'border-yellow-400 shadow-yellow-200',
      'rare': 'border-purple-400 shadow-purple-200',
      'uncommon': 'border-blue-400 shadow-blue-200',
      'common': 'border-gray-300 shadow-gray-100'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Carregando Sistema Massivo de Badges</h3>
            <p className="text-gray-600 mb-2">Scraping do HabboWidgets em andamento...</p>
            <p className="text-sm text-gray-500">Coletando 10.000+ badges oficiais</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-red-600 mb-6">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Erro no Carregamento</h3>
            <p className="text-sm mb-4">Não foi possível carregar os badges</p>
            <Button onClick={handleForceRefresh} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Sistema Ativo</span>
              </div>
              <div className="flex gap-3 text-sm">
                <Badge variant="outline" className="bg-white">
                  📊 {badges.length.toLocaleString()} badges
                </Badge>
                <Badge variant="outline" className="bg-white">
                  🔍 {filteredBadges.length.toLocaleString()} filtrados
                </Badge>
                <Badge variant="outline" className="bg-white">
                  📡 {metadata.source || 'HabboWidgets'}
                </Badge>
              </div>
            </div>
            <Button 
              onClick={handleForceRefresh}
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar nos {badges.length.toLocaleString()} Badges Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Pesquisar por código, nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Todas ({badges.length})
                  </SelectItem>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.icon} {config.name} ({badgesByCategory[key]?.length || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              {config.icon} {config.name} ({badgesByCategory[key]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 lg:grid-cols-25 xl:grid-cols-30 2xl:grid-cols-35 gap-2">
                {filteredBadges.map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => handleBadgeClick(badge)}
                    className={`group relative aspect-square p-1 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:z-10 hover:shadow-lg ${getRarityColor(badge.rarity)}`}
                    title={`${badge.name} (${badge.code}) - ${badge.description}`}
                  >
                    <EnhancedBadgeImage
                      code={badge.code}
                      name={badge.name}
                      size="sm"
                      className="w-full h-full"
                    />
                    
                    {/* Rarity indicator */}
                    {badge.rarity !== 'common' && (
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                        badge.rarity === 'legendary' ? 'bg-yellow-400' :
                        badge.rarity === 'rare' ? 'bg-purple-400' : 'bg-blue-400'
                      }`} />
                    )}
                  </button>
                ))}
              </div>

              {filteredBadges.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Nenhum badge encontrado
                  </h3>
                  <p className="text-gray-500">
                    Tente ajustar os filtros ou termos de busca
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-3 px-4 py-2 rounded-full w-fit ${config.color}`}>
                  <span className="text-lg">{config.icon}</span>
                  {config.name}
                  <Badge variant="secondary" className="ml-2">
                    {badgesByCategory[key]?.length || 0}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600">{config.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 lg:grid-cols-25 xl:grid-cols-30 2xl:grid-cols-35 gap-2">
                  {(badgesByCategory[key] || [])
                    .filter(badge => 
                      !searchTerm || searchTerm.length < 2 ||
                      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      badge.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      badge.description.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((badge) => (
                      <button
                        key={badge.id}
                        onClick={() => handleBadgeClick(badge)}
                        className={`group relative aspect-square p-1 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:z-10 hover:shadow-lg ${getRarityColor(badge.rarity)}`}
                        title={`${badge.name} (${badge.code}) - ${badge.description}`}
                      >
                        <EnhancedBadgeImage
                          code={badge.code}
                          name={badge.name}
                          size="sm"
                          className="w-full h-full"
                        />
                        
                        {/* Rarity indicator */}
                        {badge.rarity !== 'common' && (
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                            badge.rarity === 'legendary' ? 'bg-yellow-400' :
                            badge.rarity === 'rare' ? 'bg-purple-400' : 'bg-blue-400'
                          }`} />
                        )}
                      </button>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Badge Details Modal */}
      {selectedBadge && (
        <BadgeDetailsModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};
