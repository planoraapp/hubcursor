
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Sparkles, Crown, Zap, Heart, Music } from 'lucide-react';
import { useEnhancedFlashAssets } from '@/hooks/useEnhancedFlashAssets';

interface EnhancedFlashAssetsEditorProps {
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: any, colorId: string) => void;
  selectedItem: string;
  selectedColor: string;
  className?: string;
}

const EnhancedFlashAssetsEditor = ({
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem,
  selectedColor,
  className = ''
}: EnhancedFlashAssetsEditorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('hd');

  const { 
    items, 
    categoryStats, 
    isLoading, 
    error, 
    totalItems 
  } = useEnhancedFlashAssets({
    category: selectedCategory,
    gender: selectedGender,
    search: searchTerm
  });

  console.log('🎯 [EnhancedFlashAssetsEditor] Stats:', {
    category: selectedCategory,
    gender: selectedGender,
    itemsCount: items.length,
    totalItems,
    stats: categoryStats
  });

  // Categories with enhanced organization
  const categories = [
    { id: 'hd', name: 'Rostos', icon: '😊', color: 'bg-pink-100' },
    { id: 'hr', name: 'Cabelos', icon: '💇', color: 'bg-purple-100' },
    { id: 'ha', name: 'Chapéus', icon: '🎩', color: 'bg-blue-100' },
    { id: 'ea', name: 'Óculos', icon: '🕶️', color: 'bg-gray-100' },
    { id: 'fa', name: 'Máscaras', icon: '🎭', color: 'bg-red-100' },
    { id: 'ch', name: 'Camisetas', icon: '👕', color: 'bg-green-100' },
    { id: 'cc', name: 'Casacos', icon: '🧥', color: 'bg-orange-100' },
    { id: 'ca', name: 'Acessórios', icon: '💍', color: 'bg-yellow-100' },
    { id: 'cp', name: 'Estampas', icon: '🎨', color: 'bg-teal-100' },
    { id: 'lg', name: 'Calças', icon: '👖', color: 'bg-indigo-100' },
    { id: 'sh', name: 'Sapatos', icon: '👟', color: 'bg-cyan-100' },
    { id: 'wa', name: 'Cintura', icon: '🎀', color: 'bg-rose-100' },
    { id: 'fx', name: 'Efeitos', icon: '✨', color: 'bg-violet-100' }
  ];

  const handleItemClick = (item: any) => {
    console.log('🎯 [EnhancedFlashAssetsEditor] Item selecionado:', item);
    onItemSelect(item, selectedColor);
  };

  const getItemImageUrl = (item: any) => {
    if (item.thumbnailUrl) return item.thumbnailUrl;
    if (item.imageUrl) return item.imageUrl;
    
    // Fallback para Supabase storage
    return `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/flash-assets/${item.swfName || item.id}.png`;
  };

  const filteredItems = items.filter(item => 
    !searchTerm || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.figureId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center p-8`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ Erro ao carregar assets: {error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex flex-col h-full`}>
      {/* Header com estatísticas */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-lg font-bold">Enhanced Flash Assets</h3>
          </div>
          <Badge className="bg-white/20 text-white">
            {totalItems}+ Assets Categorizados
          </Badge>
        </div>
        
        {/* Estatísticas por categoria */}
        <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="font-bold">{categoryStats.hd || 0}</div>
            <div className="opacity-80">Rostos</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{categoryStats.hr || 0}</div>
            <div className="opacity-80">Cabelos</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{categoryStats.ch || 0}</div>
            <div className="opacity-80">Roupas</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{categoryStats.fx || 0}</div>
            <div className="opacity-80">Efeitos</div>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="p-4 border-b bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs de categorias */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
        <div className="p-2 border-b bg-white">
          <ScrollArea className="w-full">
            <TabsList className="grid grid-cols-13 w-max gap-1">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id} 
                  className="flex flex-col items-center gap-1 p-2 min-w-[80px]"
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-xs font-medium">{cat.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {categoryStats[cat.id] || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        {/* Conteúdo das categorias */}
        {categories.map(cat => (
          <TabsContent key={cat.id} value={cat.id} className="flex-1 p-0 m-0">
            <ScrollArea className="h-[500px] p-4">
              {isLoading ? (
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <p>Nenhum item encontrado em {cat.name}</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`aspect-square ${cat.color} rounded-lg border-2 border-gray-200 hover:border-blue-400 cursor-pointer transition-all duration-200 p-2 flex flex-col items-center justify-center ${
                        selectedItem === item.figureId ? 'ring-2 ring-blue-500 border-blue-500' : ''
                      }`}
                    >
                      <div className="w-12 h-12 mb-1 flex items-center justify-center">
                        <img
                          src={getItemImageUrl(item)}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain pixelated"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="text-center text-xs">
                        <div className="font-medium truncate w-full">{item.name}</div>
                        <div className="text-gray-500 text-xs">{item.figureId}</div>
                        {item.club === 'hc' && (
                          <Crown className="w-3 h-3 text-yellow-500 mx-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default EnhancedFlashAssetsEditor;
