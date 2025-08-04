import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Star, Sparkles, Crown, Gem } from 'lucide-react';
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

  const { furniData, loading } = useHabboFurniApi({
    searchTerm: searchTerm.length >= 2 ? searchTerm : '',
    className: selectedCategory !== 'all' ? selectedCategory : ''
  });
  
  const { trackedItems, trackItem, untrackItem, isTracked } = useTrackedItems(hotel);
  const { isLoggedIn } = useAuth();

  const filteredData = useMemo(() => {
    let filtered = furniData || [];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.className?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    
    if (selectedRarity !== 'all') {
      const rarityFilter = selectedRarity.toLowerCase();
      filtered = filtered.filter(item => {
        const name = item.name?.toLowerCase() || '';
        if (rarityFilter === 'rare') return name.includes('rare') || name.includes('ltd');
        if (rarityFilter === 'super_rare') return name.includes('super') || name.includes('throne');
        if (rarityFilter === 'limited') return name.includes('limited') || name.includes('ltd');
        return true;
      });
    }
    
    if (showHcOnly) {
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes('hc') || 
        item.name?.toLowerCase().includes('club')
      );
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'recent') return (Number(b.id) || 0) - (Number(a.id) || 0);
      return 0;
    });
  }, [furniData, selectedCategory, selectedRarity, showHcOnly, sortBy]);

  const getRarityBadge = (item: any) => {
    const name = item.name?.toLowerCase() || '';
    if (name.includes('ltd') || name.includes('limited')) {
      return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white"><Crown size={12} /> LTD</Badge>;
    }
    if (name.includes('rare') || name.includes('super')) {
      return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"><Gem size={12} /> Raro</Badge>;
    }
    if (name.includes('hc') || name.includes('club')) {
      return <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"><Star size={12} /> HC</Badge>;
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-600">Carregando catálogo...</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar móveis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="chair">Cadeiras</SelectItem>
              <SelectItem value="table">Mesas</SelectItem>
              <SelectItem value="bed">Camas</SelectItem>
              <SelectItem value="plant">Plantas</SelectItem>
              <SelectItem value="rare">Raros</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedRarity} onValueChange={setSelectedRarity}>
            <SelectTrigger className="w-48">
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

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">
              {filteredData.length} móveis encontrados
            </h3>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Por nome</SelectItem>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="rarity">Por raridade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredData.map((item, index) => (
              <Card key={`${item.id}-${index}`} className="group hover:shadow-md transition-shadow">
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredData.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">Nenhum móvel encontrado</div>
              <div className="text-sm text-gray-400">
                Tente ajustar os filtros ou termo de busca
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
