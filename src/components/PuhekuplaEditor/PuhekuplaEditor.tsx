
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package, Shirt, Award, Sparkles } from 'lucide-react';
import PuhekuplaAvatarPreview from './PuhekuplaAvatarPreview';
import PuhekuplaFurniGrid from './PuhekuplaFurniGrid';
import PuhekuplaClothingGrid from './PuhekuplaClothingGrid';
import PuhekuplaBadgesGrid from './PuhekuplaBadgesGrid';
import { usePuhekuplaCategories } from '@/hooks/usePuhekuplaData';
import type { PuhekuplaFurni, PuhekuplaClothing, PuhekuplaBadge } from '@/hooks/usePuhekuplaData';

const PuhekuplaEditor = () => {
  const [activeTab, setActiveTab] = useState('avatar');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [avatarData, setAvatarData] = useState({
    figure: 'hr-893-45.hd-180-2.ch-210-66.lg-270-82.sh-305-62',
    direction: '2',
    head_direction: '2'
  });

  const { data: categoriesData } = usePuhekuplaCategories();
  const categories = categoriesData?.result?.categories || [];

  const handleItemSelect = (item: PuhekuplaFurni | PuhekuplaClothing | PuhekuplaBadge) => {
    console.log('Item selecionado:', item);
    // TODO: Implementar lógica de aplicação do item no avatar
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 p-4">
      {/* Avatar Preview */}
      <div className="lg:w-1/3">
        <Card className="h-full bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Preview do Avatar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <PuhekuplaAvatarPreview avatarData={avatarData} />
            
            {/* Avatar Controls */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Figura:
                </label>
                <Input
                  value={avatarData.figure}
                  onChange={(e) => setAvatarData(prev => ({ ...prev, figure: e.target.value }))}
                  className="text-sm font-mono"
                  placeholder="ex: hr-893-45.hd-180-2..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-2">
                    Direção:
                  </label>
                  <Select 
                    value={avatarData.direction} 
                    onValueChange={(value) => setAvatarData(prev => ({ ...prev, direction: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Norte</SelectItem>
                      <SelectItem value="1">Nordeste</SelectItem>
                      <SelectItem value="2">Leste</SelectItem>
                      <SelectItem value="3">Sudeste</SelectItem>
                      <SelectItem value="4">Sul</SelectItem>
                      <SelectItem value="5">Sudoeste</SelectItem>
                      <SelectItem value="6">Oeste</SelectItem>
                      <SelectItem value="7">Noroeste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-2">
                    Dir. Cabeça:
                  </label>
                  <Select 
                    value={avatarData.head_direction} 
                    onValueChange={(value) => setAvatarData(prev => ({ ...prev, head_direction: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Norte</SelectItem>
                      <SelectItem value="1">Nordeste</SelectItem>
                      <SelectItem value="2">Leste</SelectItem>
                      <SelectItem value="3">Sudeste</SelectItem>
                      <SelectItem value="4">Sul</SelectItem>
                      <SelectItem value="5">Sudoeste</SelectItem>
                      <SelectItem value="6">Oeste</SelectItem>
                      <SelectItem value="7">Noroeste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Editor Tabs */}
      <div className="lg:w-2/3">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-6 h-6" />
              Editor Puhekupla
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="furni" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Móveis
                </TabsTrigger>
                <TabsTrigger value="clothing" className="flex items-center gap-2">
                  <Shirt className="w-4 h-4" />
                  Roupas
                </TabsTrigger>
                <TabsTrigger value="badges" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Emblemas
                </TabsTrigger>
              </TabsList>

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar itens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {(activeTab === 'furni' || activeTab === 'clothing') && (
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.guid} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Content Tabs */}
              <div className="h-96 overflow-hidden">
                <TabsContent value="furni" className="h-full">
                  <PuhekuplaFurniGrid
                    searchTerm={searchTerm}
                    selectedCategory={selectedCategory}
                    onItemSelect={handleItemSelect}
                  />
                </TabsContent>

                <TabsContent value="clothing" className="h-full">
                  <PuhekuplaClothingGrid
                    searchTerm={searchTerm}
                    selectedCategory={selectedCategory}
                    onItemSelect={handleItemSelect}
                  />
                </TabsContent>

                <TabsContent value="badges" className="h-full">
                  <PuhekuplaBadgesGrid
                    searchTerm={searchTerm}
                    onItemSelect={handleItemSelect}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PuhekuplaEditor;
