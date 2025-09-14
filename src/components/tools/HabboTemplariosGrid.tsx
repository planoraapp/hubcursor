import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Sparkles,
  Shirt,
  User,
  Palette
} from 'lucide-react';
import { 
  habboOfficialService, 
  HabboCategory, 
  HabboClothingItem 
} from '@/services/habboOfficialService';

interface HabboTemplariosGridProps {
  onItemSelect?: (item: HabboClothingItem) => void;
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  currentColor?: string;
  onColorChange?: (color: string) => void;
  gender?: 'M' | 'F' | 'U';
  onGenderChange?: (gender: 'M' | 'F' | 'U') => void;
}

const HabboTemplariosGrid: React.FC<HabboTemplariosGridProps> = ({ 
  onItemSelect, 
  selectedCategory = 'hd',
  onCategoryChange,
  currentColor = '7',
  onColorChange,
  gender = 'M',
  onGenderChange
}) => {
  const [categories, setCategories] = useState<HabboCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState(selectedCategory);
  const [items, setItems] = useState<HabboClothingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>(gender);
  const [currentColorState, setCurrentColorState] = useState(currentColor);

  // Carregar categorias
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const cats = await unifiedHabboService.getCategories();
      setCategories(cats);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados do Habbo BR');
          } finally {
      setLoading(false);
    }
  }, []);

  // Carregar itens da categoria
  const loadCategoryItems = useCallback(async (categoryId: string) => {
    try {
      setLoading(true);
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        setItems(category.items);
        setError(null);
      }
    } catch (err) {
      setError('Erro ao carregar itens da categoria');
          } finally {
      setLoading(false);
    }
  }, [categories]);

  // Buscar itens
  const searchItems = useCallback(async (query: string) => {
    if (!query.trim()) {
      loadCategoryItems(currentCategory);
      return;
    }

    try {
      setLoading(true);
      const allItems = categories.flatMap(cat => cat.items);
      const results = allItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      );
      setItems(results);
      setError(null);
    } catch (err) {
      setError('Erro na busca');
          } finally {
      setLoading(false);
    }
  }, [categories, currentCategory, loadCategoryItems]);

  // Filtrar itens
  const filteredItems = items.filter(item => {
    if (selectedRarity !== 'all') {
      if (selectedRarity === 'hc' && !item.club) return false;
      if (selectedRarity === 'nonhc' && item.club) return false;
    }
    if (selectedGender !== 'all' && item.gender !== selectedGender && item.gender !== 'U') return false;
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
  const handleItemSelect = (item: HabboClothingItem) => {
    onItemSelect?.(item);
  };

  // Selecionar cor
  const handleColorSelect = (color: string) => {
    setCurrentColorState(color);
    onColorChange?.(color);
  };

  // Selecionar gênero
  const handleGenderSelect = (newGender: 'M' | 'F' | 'U') => {
    setSelectedGender(newGender);
    onGenderChange?.(newGender);
  };

  // Obter ícone de raridade
  const getRarityIcon = (item: HabboClothingItem) => {
    if (item.club) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (item.sellable) return <ShoppingBag className="w-4 h-4 text-blue-500" />;
    return <Star className="w-4 h-4 text-gray-400" />;
  };

  // Obter cor de raridade
  const getRarityColor = (item: HabboClothingItem) => {
    if (item.club) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (item.sellable) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Obter nome de raridade
  const getRarityName = (item: HabboClothingItem) => {
    if (item.club) return 'HC';
    if (item.sellable) return 'Vendável';
    return 'Básico';
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
            <span>Carregando dados do Habbo BR...</span>
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

  const currentCategoryData = categories.find(c => c.id === currentCategory);

  return (
    <div className="space-y-6">
      {/* Cabeçalho com estatísticas - Estilo Habbo Templários */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
        <CardHeader>
          <CardTitle className="volter-font text-xl flex items-center justify-between">
            <span>🎨 Editor de Visuais Habbo BR</span>
            <div className="flex items-center space-x-4 text-sm">
              <Badge variant="outline" className="bg-blue-50">
                {categories.length} Categorias
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                {categories.reduce((sum, cat) => sum + cat.items.length, 0).toLocaleString()} Itens
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Controles principais - Estilo Habbo Templários */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              </select>
            </div>

            {/* Filtro de Gênero */}
            <div className="space-y-2">
              <Label className="volter-font">👤 Gênero</Label>
              <div className="flex space-x-2">
                {(['M', 'F', 'U'] as const).map((g) => (
                  <Button
                    key={g}
                    variant={selectedGender === g ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleGenderSelect(g)}
                    className="flex-1"
                  >
                    {g === 'M' ? '♂' : g === 'F' ? '♀' : '⚤'}
                  </Button>
                ))}
              </div>
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

          {/* Categorias - Estilo Habbo Templários */}
          <div className="space-y-4">
            <Label className="volter-font text-lg">📂 Categorias</Label>
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
                    {category.items.length.toLocaleString()}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Cores disponíveis para a categoria atual */}
          {currentCategoryData && currentCategoryData.colors.length > 0 && (
            <div className="space-y-4 mt-6">
              <Label className="volter-font text-lg">🎨 Cores Disponíveis</Label>
              <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
                {currentCategoryData.colors.slice(0, 32).map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      currentColorState === color ? 'border-black scale-110' : 'border-gray-300'
                    } transition-all duration-200 hover:scale-105`}
                    style={{ backgroundColor: `#${color.padStart(6, '0')}` }}
                    title={`Cor ${color}`}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid de Itens - Estilo Habbo Templários */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-black">
        <CardHeader>
          <CardTitle className="volter-font text-lg flex items-center justify-between">
            <span>
              {searchQuery ? `🔍 Resultados da busca: "${searchQuery}"` : 
               `📁 ${currentCategoryData?.displayName || 'Categoria'}`}
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
                  setSelectedGender('M');
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
              'grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3' : 
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
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback para habbo-imaging se a imagem falhar
                        const target = e.target as HTMLImageElement;
                        target.src = unifiedHabboService.generateAvatarImageUrl(item.type, item.id.split('-')[1], selectedGender, currentColorState);
                      }}
                    />
                    
                    {/* Indicador de raridade */}
                    <div className="absolute top-1 left-1">
                      {getRarityIcon(item)}
                    </div>

                    {/* Indicador de gênero */}
                    <div className="absolute top-1 right-1">
                      <Badge variant="outline" className="text-xs bg-white/80">
                        {item.gender}
                      </Badge>
                    </div>
                  </div>

                  {/* Informações */}
                  <div className={viewMode === 'grid' ? 
                    'p-2 text-center' : 
                    'flex-1'
                  }>
                    <div className="font-medium text-xs truncate" title={item.name}>
                      {item.name}
                    </div>
                    
                    {viewMode === 'grid' ? (
                      <div className="flex items-center justify-center space-x-1 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRarityColor(item)}`}
                        >
                          {getRarityName(item)}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRarityColor(item)}`}
                        >
                          {getRarityName(item)}
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

export default HabboTemplariosGrid;
