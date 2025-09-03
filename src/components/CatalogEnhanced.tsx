import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Star, Sparkles, Crown, Gem, Package, AlertCircle } from 'lucide-react';
import { useHabboFurniApi } from '../hooks/useHabboFurniApi';
import IntelligentFurniImage from '@/components/IntelligentFurniImage';
import { useTrackedItems } from '../hooks/useTrackedItems';
import { useAuth } from '../hooks/useAuth';

interface CatalogEnhancedProps {
  hotel?: string;
}

export const CatalogEnhanced = ({ hotel = 'com.br' }: CatalogEnhancedProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [showHcOnly, setShowHcOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'recent'>('name');

  const { furniData, loading, error, refetch } = useHabboFurniApi({
    searchTerm: searchTerm.length >= 2 ? searchTerm : '',
    className: selectedCategory !== 'all' ? selectedCategory : '',
    limit: 500,
    autoFetch: true
  });
  
  const { trackedItems, trackItem, untrackItem, isTracked } = useTrackedItems(hotel);
  const { isLoggedIn } = useAuth();

  // Debug: Log dos dados recebidos
  useEffect(() => {
    console.log('📊 [CatalogEnhanced] Debug Info:', {
      furniDataLength: furniData?.length || 0,
      loading,
      error,
      searchTerm,
      selectedCategory,
      firstItem: furniData?.[0]
    });
  }, [furniData, loading, error, searchTerm, selectedCategory]);

  const filteredData = useMemo(() => {
    if (!furniData || !Array.isArray(furniData)) {
      console.log('⚠️ [CatalogEnhanced] No furniData or not array:', furniData);
      return [];
    }

    let filtered = [...furniData];
    
    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => {
        const itemCategory = item.category?.toLowerCase() || '';
        const itemClassName = item.className?.toLowerCase() || '';
        const itemName = item.name?.toLowerCase() || '';
        const searchCategory = selectedCategory.toLowerCase();
        
        return itemCategory.includes(searchCategory) || 
               itemClassName.includes(searchCategory) || 
               itemName.includes(searchCategory);
      });
    }
    
    // Filtro por raridade
    if (selectedRarity !== 'all') {
      const rarityFilter = selectedRarity.toLowerCase();
      filtered = filtered.filter(item => {
        const name = item.name?.toLowerCase() || '';
        const className = item.className?.toLowerCase() || '';
        
        if (rarityFilter === 'rare') return name.includes('rare') || name.includes('ltd') || className.includes('rare');
        if (rarityFilter === 'super_rare') return name.includes('super') || name.includes('throne') || className.includes('throne');
        if (rarityFilter === 'limited') return name.includes('limited') || name.includes('ltd') || className.includes('ltd');
        return true;
      });
    }
    
    // Filtro HC only
    if (showHcOnly) {
      filtered = filtered.filter(item => {
        const name = item.name?.toLowerCase() || '';
        const className = item.className?.toLowerCase() || '';
        return name.includes('hc') || className.includes('hc') || name.includes('club');
      });
    }
    
    // Ordenação
    return filtered.sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'recent') return (Number(b.id) || 0) - (Number(a.id) || 0);
      return 0;
    });
  }, [furniData, selectedCategory, selectedRarity, showHcOnly, sortBy]);

  const getRarityBadge = (item: any) => {
    const name = item.name?.toLowerCase() || '';
    const className = item.className?.toLowerCase() || '';
    
    if (name.includes('ltd') || name.includes('limited') || className.includes('ltd')) {
      return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs"><Crown size={12} /> LTD</Badge>;
    }
    if (name.includes('rare') || name.includes('super') || className.includes('rare')) {
      return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs"><Gem size={12} /> Raro</Badge>;
    }
    if (name.includes('hc') || name.includes('club') || className.includes('hc')) {
      return <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs"><Star size={12} /> HC</Badge>;
    }
    return null;
  };

  const handleBookmark = async (item: any) => {
    if (!isLoggedIn) return;
    
    const trackedItem = {
      classname: item.className || '',
      name: item.name || '',
      hotel_id: hotel
    };
    
    if (isTracked(item.className || '')) {
      await untrackItem(item.className || '');
    } else {
      await trackItem(trackedItem);
    }
  };

  // Fixed refetch handlers
  const handleRefetch = () => {
    refetch();
  };

  // Estados de loading e erro
  if (loading && (!furniData || furniData.length === 0)) {
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-600 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="font-semibold">Carregando catálogo...</p>
          <p className="text-sm text-gray-500">Conectando com HabboFurni.com</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && (!furniData || furniData.length === 0)) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao Carregar Catálogo</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={handleRefetch} variant="outline">
          <Package className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg p-4 shadow-sm border-2">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar móveis no HabboFurni.com..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 border-2">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="chair">Cadeiras</SelectItem>
              <SelectItem value="table">Mesas</SelectItem>
              <SelectItem value="bed">Camas</SelectItem>
              <SelectItem value="plant">Plantas</SelectItem>
              <SelectItem value="rare">Raros</SelectItem>
              <SelectItem value="lighting">Iluminação</SelectItem>
              <SelectItem value="decoration">Decorações</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedRarity} onValueChange={setSelectedRarity}>
            <SelectTrigger className="w-48 border-2">
              <SelectValue placeholder="Raridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="common">Comum</SelectItem>
              <SelectItem value="rare">Raro</SelectItem>
              <SelectItem value="super_rare">Super Raro</SelectItem>
              <SelectItem value="limited">Limitado</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showHcOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHcOnly(!showHcOnly)}
          >
            <Star className="w-4 h-4 mr-1" />
            Apenas HC
          </Button>
        </div>
      </div>

      {/* Status e Estatísticas */}
      <div className="bg-white rounded-lg shadow-sm border-2">
        <div className="p-4 border-b-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-gray-800">
                📦 {filteredData.length} móveis encontrados
              </h3>
              <Badge className="bg-blue-100 text-blue-700">
                🌐 HabboFurni.com
              </Badge>
              {furniData && (
                <Badge className="bg-green-100 text-green-700">
                  ✅ {furniData.length} total
                </Badge>
              )}
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48 border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">📝 Por nome</SelectItem>
                <SelectItem value="recent">🕐 Mais recentes</SelectItem>
                <SelectItem value="rarity">💎 Por raridade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid de Móveis */}
        <div className="p-4">
          {filteredData.length === 0 && !loading ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum móvel encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros ou termo de busca</p>
              <Button onClick={handleRefetch} variant="outline" className="mt-4">
                Recarregar Catálogo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredData.map((item, index) => (
                <Card key={`${item.id}-${index}`} className="group hover:shadow-md transition-all duration-200 hover:scale-105 border-2">
                  <CardContent className="p-3">
                    <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      <IntelligentFurniImage
                        swfName={item.className || ''}
                        name={item.name || 'Item desconhecido'}
                        originalUrl={item.imageUrl}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.name || 'Item desconhecido'}
                        </h4>
                        {isLoggedIn && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleBookmark(item)}
                            className={`p-1 h-auto ${
                              isTracked(item.className || '') 
                                ? 'text-yellow-500' 
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                          >
                            <Star 
                              className="w-4 h-4" 
                              fill={isTracked(item.className || '') ? 'currentColor' : 'none'}
                            />
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {getRarityBadge(item)}
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>ID: {item.id}</div>
                        {item.className && (
                          <div className="truncate">Classe: {item.className}</div>
                        )}
                        {item.category && (
                          <div className="truncate">Categoria: {item.category}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Loading adicional durante busca */}
          {loading && furniData && furniData.length > 0 && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Atualizando resultados...</p>
            </div>
          )}
        </div>
      </div>

      {/* Rodapé com informações */}
      <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
        <div className="flex justify-center items-center gap-6 flex-wrap">
          <span>📊 Total: {furniData?.length || 0} móveis</span>
          <span>🔍 Filtrados: {filteredData.length}</span>
          <span>🎯 Categoria: {selectedCategory === 'all' ? 'Todas' : selectedCategory}</span>
          {searchTerm && <span>🔍 Busca: "{searchTerm}"</span>}
          <span>🌐 Fonte: HabboFurni.com</span>
        </div>
      </div>
    </div>
  );
};
