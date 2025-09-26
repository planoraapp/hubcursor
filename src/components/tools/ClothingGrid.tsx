import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  RefreshCw,
  Eye,
  Download,
  Star,
  Crown,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { 
  puhekuplaService, 
  PuhekuplaCategory, 
  PuhekuplaClothingItem 
} from '@/services/puhekuplaService';

interface ClothingGridProps {
  onItemSelect?: (item: PuhekuplaClothingItem) => void;
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

const ClothingGrid: React.FC<ClothingGridProps> = ({ 
  onItemSelect, 
  selectedCategory = 'hd',
  onCategoryChange 
}) => {
  const [categories, setCategories] = useState<PuhekuplaCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState(selectedCategory);
  const [items, setItems] = useState<PuhekuplaClothingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');

  // Carregar categorias
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const cats = await puhekuplaService.getCategories();
      setCategories(cats);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar categorias');
          } finally {
      setLoading(false);
    }
  }, []);

  // Carregar itens da categoria
  const loadCategoryItems = useCallback(async (categoryId: string) => {
    try {
      setLoading(true);
      const categoryItems = await puhekuplaService.getCategoryItems(categoryId);
      setItems(categoryItems);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar itens da categoria');
          } finally {
      setLoading(false);
    }
  }, []);

  // Buscar itens
  const searchItems = useCallback(async (query: string) => {
    if (!query.trim()) {
      loadCategoryItems(currentCategory);
      return;
    }

    try {
      setLoading(true);
      const results = await puhekuplaService.searchItems(query);
      setItems(results);
      setError(null);
    } catch (err) {
      setError('Erro na busca');
          } finally {
      setLoading(false);
    }
  }, [currentCategory]);

  // Filtrar itens
  const filteredItems = items.filter(item => {
    if (selectedRarity !== 'all' && item.rarity !== selectedRarity) return false;
    if (selectedGender !== 'all' && item.gender !== selectedGender) return false;
    return true;
  });

  // Mudar categoria
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setSearchQuery('');
    onCategoryChange?.(categoryId);
    loadCategoryItems(categoryId);
  };

  // Buscar ao digitar
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchItems(query);
    } else {
      loadCategoryItems(currentCategory);
    }
  };

  // Selecionar item
  const handleItemSelect = (item: PuhekuplaClothingItem) => {
    onItemSelect?.(item);
  };

  // Obter ícone de raridade
  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'hc': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'sell': return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case 'nft': return <Sparkles className="w-4 h-4 text-purple-500" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  // Obter cor de raridade
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'hc': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sell': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'nft': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obter nome de raridade
  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'hc': return 'HC';
      case 'sell': return 'Vendável';
      case 'nft': return 'NFT';
      default: return 'Básico';
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      loadCategoryItems(currentCategory);
    }
  }, [categories, currentCategory, loadCategoryItems]);

  if (loading && categories.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Carregando categorias...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
        <CardContent className="p-8 text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={loadCategories} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com estatísticas */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
        <CardHeader>
          <CardTitle className="volter-font text-xl flex items-center justify-between">
            <span>🎨 Catálogo de Roupas Puhekupla</span>
            <div className="flex items-center space-x-4 text-sm">
              <Badge variant="outline" className="bg-blue-50">
                {categories.length} Categorias
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                {categories.reduce((sum, cat) => sum + cat.count, 0).toLocaleString()} Itens
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Filtros e Busca */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="space-y-2">
              <Label className="volter-font">🔍 Buscar Roupas</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Nome da roupa..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro de Raridade */}
            <div className="space-y-2">
              <Label className="volter-font">⭐ Raridade</Label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">Todas as Raridades</option>
                <option value="nonhc">Básico</option>
                <option value="hc">HC</option>
                <option value="sell">Vendável</option>
                <option value="nft">NFT</option>
              </select>
            </div>

            {/* Filtro de Gênero */}
            <div className="space-y-2">
              <Label className="volter-font">👤 Gênero</Label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">Todos os Gêneros</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="U">Unisex</option>
              </select>
            </div>

            {/* Modo de Visualização */}
            <div className="space-y-2">
              <Label className="volter-font">👁️ Visualização</Label>
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
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
        </CardContent>
      </Card>

      {/* Categorias */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
        <CardHeader>
          <CardTitle className="volter-font text-lg">📂 Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={currentCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
                className="h-auto p-3 flex flex-col items-center space-y-2"
              >
                <span className="text-xs font-bold">{category.displayName}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count.toLocaleString()}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid de Itens */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
        <CardHeader>
          <CardTitle className="volter-font text-lg flex items-center justify-between">
            <span>
              {searchQuery ? `🔍 Resultados da busca: "${searchQuery}"` : 
               `📁 ${categories.find(c => c.id === currentCategory)?.displayName || 'Categoria'}`}
            </span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {filteredItems.length} itens
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadCategoryItems(currentCategory)}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span>Carregando itens...</span>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <p>Nenhum item encontrado para os filtros selecionados.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRarity('all');
                  setSelectedGender('all');
                  setSearchQuery('');
                  loadCategoryItems(currentCategory);
                }}
                className="mt-2"
              >
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 
              'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4' : 
              'space-y-2'
            }>
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={viewMode === 'grid' ? 
                    'group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg' : 
                    'flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50'
                  }
                  onClick={() => handleItemSelect(item)}
                >
                  {/* Imagem */}
                  <div className={viewMode === 'grid' ? 
                    'relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-blue-300' : 
                    'w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200'
                  }>
                    <img
                      src={item.imageUrls.front}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback para habbo-imaging se Puhekupla falhar
                        const target = e.target as HTMLImageElement;
                        target.src = item.habboImagingFallback;
                      }}
                    />
                    
                    {/* Indicador de raridade */}
                    <div className="absolute top-1 left-1">
                      {getRarityIcon(item.rarity)}
                    </div>
                  </div>

                  {/* Informações */}
                  <div className={viewMode === 'grid' ? 
                    'p-2 text-center' : 
                    'flex-1'
                  }>
                    <div className="font-medium text-sm truncate" title={item.name}>
                      {item.name}
                    </div>
                    
                    {viewMode === 'grid' ? (
                      <div className="flex items-center justify-center space-x-1 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRarityColor(item.rarity)}`}
                        >
                          {getRarityName(item.rarity)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.gender}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRarityColor(item.rarity)}`}
                        >
                          {getRarityName(item.rarity)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.gender}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  {viewMode === 'list' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemSelect(item);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClothingGrid;
