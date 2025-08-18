
import React, { useState } from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Search, Star, Coins, Filter } from 'lucide-react';

const Catalogo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: '🛍️' },
    { id: 'furniture', name: 'Móveis', icon: '🪑' },
    { id: 'decoration', name: 'Decoração', icon: '🎨' },
    { id: 'lighting', name: 'Iluminação', icon: '💡' },
    { id: 'floor', name: 'Pisos', icon: '🏠' },
    { id: 'wall', name: 'Paredes', icon: '🧱' },
    { id: 'plants', name: 'Plantas', icon: '🌱' },
    { id: 'rare', name: 'Raros', icon: '💎' }
  ];

  const furniture = [
    {
      id: 1,
      name: 'Sofá Moderno',
      category: 'furniture',
      price: 25,
      image: '/assets/furniture/sofa.png',
      rarity: 'common',
      description: 'Um sofá confortável para sua sala'
    },
    {
      id: 2,
      name: 'Mesa de Café',
      category: 'furniture',
      price: 15,
      image: '/assets/furniture/table.png',
      rarity: 'common',
      description: 'Mesa perfeita para momentos de relaxamento'
    },
    {
      id: 3,
      name: 'Luminária Neon',
      category: 'lighting',
      price: 45,
      image: '/assets/furniture/neon.png',
      rarity: 'uncommon',
      description: 'Ilumine seu quarto com estilo'
    },
    {
      id: 4,
      name: 'Trono Real',
      category: 'furniture',
      price: 200,
      image: '/assets/furniture/throne.png',
      rarity: 'rare',
      description: 'Um trono digno de realeza'
    },
    {
      id: 5,
      name: 'Quadro Abstrato',
      category: 'decoration',
      price: 30,
      image: '/assets/furniture/painting.png',
      rarity: 'common',
      description: 'Arte moderna para decorar suas paredes'
    },
    {
      id: 6,
      name: 'Piso de Mármore',
      category: 'floor',
      price: 35,
      image: '/assets/furniture/marble.png',
      rarity: 'uncommon',
      description: 'Piso elegante e sofisticado'
    },
    {
      id: 7,
      name: 'Planta Tropical',
      category: 'plants',
      price: 20,
      image: '/assets/furniture/plant.png',
      rarity: 'common',
      description: 'Traga vida natural para seu quarto'
    },
    {
      id: 8,
      name: 'Cristal Raro',
      category: 'rare',
      price: 500,
      image: '/assets/furniture/crystal.png',
      rarity: 'legendary',
      description: 'Um cristal místico e extremamente raro'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'legendary': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredFurniture = furniture.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <NewAppSidebar />
        <main 
          className="flex-1 relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
        >
          {/* Background overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-purple-900/10 to-blue-900/30"></div>
          
          <div className="relative z-10 p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                  🛍️ Catálogo de Móveis
                </h1>
                <p className="text-xl text-white/90 volter-font drop-shadow">
                  Descubra móveis exclusivos para decorar sua casa
                </p>
              </div>

              {/* Search and Filters */}
              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black mb-8">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Buscar móveis..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 volter-font"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                          className="volter-font"
                        >
                          <span className="mr-1">{category.icon}</span>
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800 volter-font">850+</div>
                    <div className="text-sm text-gray-600 volter-font">Móveis Disponíveis</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800 volter-font">15</div>
                    <div className="text-sm text-gray-600 volter-font">Categorias</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800 volter-font">28</div>
                    <div className="text-sm text-gray-600 volter-font">Itens Raros</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800 volter-font">5★</div>
                    <div className="text-sm text-gray-600 volter-font">Avaliação Média</div>
                  </CardContent>
                </Card>
              </div>

              {/* Furniture Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFurniture.map((item) => (
                  <Card key={item.id} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-4xl">🪑</span>
                        </div>
                        <Badge className={`absolute top-2 right-2 ${getRarityColor(item.rarity)} text-white volter-font`}>
                          {item.rarity}
                        </Badge>
                      </div>
                      
                      <h3 className="font-bold text-gray-800 mb-2 volter-font">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 volter-font">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold text-gray-800 volter-font">{item.price}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600 volter-font">4.8</span>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white volter-font">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Comprar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredFurniture.length === 0 && (
                <div className="text-center py-12">
                  <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                    <CardContent className="p-8">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2 volter-font">
                        Nenhum móvel encontrado
                      </h3>
                      <p className="text-gray-600 volter-font">
                        Tente ajustar seus filtros ou termo de busca
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Catalogo;
