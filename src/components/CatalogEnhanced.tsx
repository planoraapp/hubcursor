
import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, Crown, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHabboFurniApi } from '@/hooks/useHabboFurniApi';
import { FurnidataService } from '@/services/FurnidataService';
import { IntelligentFurniImage } from '@/components/IntelligentFurniImage';

interface CatalogItem {
  classname: string;
  name: string;
  category?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isHC?: boolean;
  behaviors?: string[];
  dimensions?: { width: number; height: number };
  credits?: number;
}

export const CatalogEnhanced = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  
  // Use the existing hook correctly
  const { furniData, loading, error } = useHabboFurniApi({
    searchTerm: searchTerm || undefined,
    className: selectedCategory !== 'all' ? selectedCategory : undefined
  });

  // Load local furnidata and combine with API data
  useEffect(() => {
    const loadCatalogData = async () => {
      try {
        // Get items from API
        const apiItems = furniData.map(item => ({
          classname: item.className || item.name,
          name: item.name,
          category: item.category || 'furniture',
          rarity: 'common' as const,
          isHC: item.name.toLowerCase().includes('hc') || item.name.toLowerCase().includes('club'),
          behaviors: [],
          dimensions: { width: 1, height: 1 },
          credits: 0
        }));

        // Try to get additional data from local service if available
        const enrichedItems = apiItems.map(item => {
          try {
            // Basic enrichment without calling non-existent methods
            const enriched = {
              ...item,
              rarity: item.isHC ? 'rare' as const : 'common' as const
            };
            return enriched;
          } catch {
            return item;
          }
        });

        setCatalogItems(enrichedItems);
      } catch (error) {
        console.error('Error loading catalog data:', error);
      }
    };

    if (furniData.length > 0) {
      loadCatalogData();
    }
  }, [furniData]);

  const categories = [
    { id: 'all', name: 'Todos', icon: '🏠', count: catalogItems.length },
    { id: 'seating', name: 'Assentos', icon: '🪑', count: catalogItems.filter(i => i.name.toLowerCase().includes('chair') || i.name.toLowerCase().includes('seat')).length },
    { id: 'table', name: 'Mesas', icon: '🪤', count: catalogItems.filter(i => i.name.toLowerCase().includes('table')).length },
    { id: 'decoration', name: 'Decoração', icon: '🎨', count: catalogItems.filter(i => i.category === 'decoration').length },
    { id: 'rare', name: 'Raros', icon: '💎', count: catalogItems.filter(i => i.rarity === 'rare' || i.rarity === 'epic').length },
    { id: 'hc', name: 'Habbo Club', icon: '👑', count: catalogItems.filter(i => i.isHC).length }
  ];

  const filteredItems = useMemo(() => {
    return catalogItems.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.classname.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        (selectedCategory === 'hc' && item.isHC) ||
        (selectedCategory === 'rare' && (item.rarity === 'rare' || item.rarity === 'epic')) ||
        item.category === selectedCategory ||
        item.name.toLowerCase().includes(selectedCategory);
      
      const matchesRarity = selectedRarity === 'all' || item.rarity === selectedRarity;
      
      return matchesSearch && matchesCategory && matchesRarity;
    });
  }, [catalogItems, searchTerm, selectedCategory, selectedRarity]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-indigo-500';
      case 'uncommon': return 'bg-gradient-to-r from-green-400 to-teal-500';
      default: return 'bg-gray-400';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="w-3 h-3" />;
      case 'epic': return <Zap className="w-3 h-3" />;
      case 'rare': return <Star className="w-3 h-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-repeat p-6 flex items-center justify-center" 
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 volter-font">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b-2 border-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <img src="/assets/Carrinho.png" alt="Catálogo" className="w-8 h-8" style={{ imageRendering: 'pixelated' }} />
            <h1 className="text-2xl font-bold volter-font">Catálogo de Mobis</h1>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar móveis, decorações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 volter-font"
              />
            </div>
            
            <Select value={selectedRarity} onValueChange={setSelectedRarity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Raridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="common">Comum</SelectItem>
                <SelectItem value="uncommon">Incomum</SelectItem>
                <SelectItem value="rare">Raro</SelectItem>
                <SelectItem value="epic">Épico</SelectItem>
                <SelectItem value="legendary">Lendário</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          {/* Category Tabs */}
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full mb-6">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                <span className="mr-1">{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-6">
              {filteredItems.length > 0 ? (
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                    : "space-y-3"
                }>
                  {filteredItems.map((item) => (
                    <div
                      key={`${item.classname}-${item.name}`}
                      className={`bg-white rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 ${
                        viewMode === 'list' ? 'flex items-center p-3 gap-4' : 'p-3'
                      }`}
                    >
                      <div className={viewMode === 'list' ? 'flex-shrink-0' : 'relative'}>
                        <IntelligentFurniImage
                          classname={item.classname}
                          name={item.name}
                          size={viewMode === 'list' ? 'sm' : 'md'}
                        />
                        
                        {/* Rarity Badge */}
                        {item.rarity !== 'common' && (
                          <div className={`absolute -top-1 -right-1 rounded-full p-1 text-white ${getRarityColor(item.rarity)}`}>
                            {getRarityIcon(item.rarity)}
                          </div>
                        )}
                      </div>
                      
                      <div className={viewMode === 'list' ? 'flex-1 min-w-0' : 'mt-2'}>
                        <h3 className="font-semibold text-sm volter-font truncate" title={item.name}>
                          {item.name || item.classname}
                        </h3>
                        
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.isHC && (
                            <Badge variant="outline" className="text-xs">
                              <Crown className="w-2 h-2 mr-1" />
                              HC
                            </Badge>
                          )}
                          
                          {item.rarity !== 'common' && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {item.rarity}
                            </Badge>
                          )}
                        </div>
                        
                        {item.behaviors && item.behaviors.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {item.behaviors.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 volter-font">
                    Nenhum item encontrado
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Tente ajustar os filtros ou termo de busca
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};
