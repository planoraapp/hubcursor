import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Search, Package, Utensils, Coffee, Candy, Wrench, Smartphone, Gamepad2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface HanditemData {
  name: string;
  webId: number;
  inGameId: number;
  iconUrl: string;
  categoryType: string;
}

interface MobiData {
  name: string;
  furniId: string;
  imageUrl: string;
  iconUrl: string;
  function: string;
  handitems: HanditemData[];
}

const MAIN_CATEGORIES = {
  'Todos': { label: 'Todos', icon: Package, subCategories: [] },
  'Alimentos': { label: 'Alimentos', icon: Utensils, subCategories: ['Vegetais', 'Frutas', 'Laticínios', 'Carnes', 'Pães', 'Nozes', 'Salgados', 'Frutos do Mar'] },
  'Bebidas': { label: 'Bebidas', icon: Coffee, subCategories: ['Suco', 'Chá', 'Energéticos', 'Alcoólicas', 'Milkshakes', 'Refrigerantes', 'Água', 'Sopas', 'Laticínios'] },
  'Doces': { label: 'Doces', icon: Candy, subCategories: ['Sorvetes', 'Gomas', 'Chicletes', 'Pirulitos', 'Algodão Doce'] },
  'Utensílios': { label: 'Utensílios', icon: Wrench, subCategories: ['Ferramentas', 'Escritório', 'Saúde'] },
  'Eletrônicos': { label: 'Eletrônicos', icon: Smartphone, subCategories: ['Tablets', 'Celulares', 'Diversos'] },
  'Outros': { label: 'Outros', icon: Gamepad2, subCategories: ['Plantas e Flores', 'Animais', 'Diversos'] }
};

const MOBIS_DATA: MobiData[] = [
  {
    name: "Frigobar",
    furniId: "bar_polyfon",
    imageUrl: "https://content.puhekupla.com/img/furni/48082/bar_polyfon.png",
    iconUrl: "https://images.habbo.com/dcr/hof_furni/48082/bar_polyfon_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Suco", webId: 6, inGameId: 2, iconUrl: "https://i.imgur.com/1BGBH0d.png", categoryType: "Bebidas - Suco" },
      { name: "Chá Árabe", webId: 6, inGameId: 27, iconUrl: "https://i.imgur.com/1BGBH0d.png", categoryType: "Bebidas - Chá" },
    ]
  },
  {
    name: "Freezer",
    furniId: "ktchn_fridge",
    imageUrl: "https://content.puhekupla.com/img/furni/48082/ktchn_fridge.png",
    iconUrl: "https://images.habbo.com/dcr/hof_furni/48082/ktchn_fridge_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Cenoura", webId: 2, inGameId: 3, iconUrl: "https://i.imgur.com/IGVknDZ.png", categoryType: "Alimentos - Vegetais" },
      { name: "Pêra", webId: 50, inGameId: 36, iconUrl: "https://i.imgur.com/0u2ZtNJ.png", categoryType: "Alimentos - Frutas" },
      { name: "Pêssego Suculento", webId: 51, inGameId: 37, iconUrl: "https://i.imgur.com/VStOTCZ.png", categoryType: "Alimentos - Frutas" },
      { name: "Laranja", webId: 52, inGameId: 38, iconUrl: "https://i.imgur.com/pDRtHvO.png", categoryType: "Alimentos - Frutas" },
      { name: "Fatia de Queijo", webId: 53, inGameId: 39, iconUrl: "https://i.imgur.com/AkWndvc.png", categoryType: "Alimentos - Laticínios" },
    ]
  },
  {
    name: "Pia",
    furniId: "sink",
    imageUrl: "https://content.puhekupla.com/img/furni/48082/sink.png",
    iconUrl: "https://images.habbo.com/dcr/hof_furni/48082/sink_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Água da Torneira", webId: 1, inGameId: 18, iconUrl: "https://i.imgur.com/Cfa2xdt.png", categoryType: "Bebidas - Água" },
    ]
  },
  {
    name: "Estante de Laboratório",
    furniId: "hween_c18_medicineshelf",
    imageUrl: "https://content.puhekupla.com/img/furni/64483/hween_c18_medicineshelf.png",
    iconUrl: "https://images.habbo.com/dcr/hof_furni/64483/hween_c18_medicineshelf_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Suco Bubblejuice", webId: 5, inGameId: 19, iconUrl: "https://i.imgur.com/sMTSwiG.png", categoryType: "Bebidas - Suco" },
      { name: "Seringa", webId: 90, inGameId: 1014, iconUrl: "https://i.imgur.com/u8R1Arz.png", categoryType: "Utensílios - Saúde" },
      { name: "Energético Astrobar", webId: 56, inGameId: 44, iconUrl: "https://i.imgur.com/2xypAeW.png", categoryType: "Bebidas - Energéticos" },
    ]
  },
  {
    name: "Quiosque Tiki Baladeiro",
    furniId: "xmas14_tikibar",
    imageUrl: "https://content.puhekupla.com/img/furni/56170/xmas14_tikibar.png",
    iconUrl: "https://images.habbo.com/dcr/hof_furni/56170/xmas14_tikibar_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Espumante Rosa", webId: 45, inGameId: 31, iconUrl: "https://i.imgur.com/xzQi9tn.png", categoryType: "Bebidas - Alcoólicas" },
    ]
  },
  {
    name: "Geladeira Bling HC",
    furniId: "hc17_11",
    imageUrl: "https://content.puhekupla.com/img/furni/63905/hc17_11.png",
    iconUrl: "https://images.habbo.com/dcr/hof_furni/63905/hc17_11_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Champanhe", webId: 47, inGameId: 35, iconUrl: "https://i.imgur.com/4qHA9BV.png", categoryType: "Bebidas - Alcoólicas" },
    ]
  },
  {
    name: "Máquina de Café",
    furniId: "mall_r17_coffeem",
    imageUrl: "https://content.puhekupla.com/img/furni/63018/mall_r17_coffeem.png",
    iconUrl: "https://images.habbo.com/dcr/hof_furni/63018/mall_r17_coffeem_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Café Expresso", webId: 3, inGameId: 4, iconUrl: "https://i.imgur.com/z8p3fGH.png", categoryType: "Bebidas - Café" },
    ]
  }
];

const getMainCategoryForItem = (categoryType: string): keyof typeof MAIN_CATEGORIES => {
  if (!categoryType) return "Outros";
  for (const mainCatKey in MAIN_CATEGORIES) {
    if (mainCatKey === 'Todos') continue;
    const category = MAIN_CATEGORIES[mainCatKey as keyof typeof MAIN_CATEGORIES];
    if (category.subCategories.some(subCat => categoryType.includes(subCat))) {
      return mainCatKey as keyof typeof MAIN_CATEGORIES;
    }
  }
  return "Outros";
};

const getSubCategoryForItem = (categoryType: string): string => {
  if (!categoryType) return "Diversos";
  const parts = categoryType.split(' - ');
  return parts.length > 1 ? parts[1] : categoryType;
};

const generateHanditemAvatarUrl = (
  habboName: string, 
  handitemId: number | null, 
  size: string = 'm'
): string => {
  const direction = 2;
  const headDirection = 2;
  const gesture = 'nrm';
  const actionParam = handitemId && handitemId !== 0 ? `crr=${handitemId}` : '';
  
  return `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboName}&direction=${direction}&head_direction=${headDirection}&action=${actionParam}&gesture=${gesture}&size=${size}`;
};

export const HanditemTool: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof MAIN_CATEGORIES>('Todos');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Todos');
  const [selectedMobi, setSelectedMobi] = useState<MobiData | null>(null);
  const [selectedHanditem, setSelectedHanditem] = useState<HanditemData | null>(null);
  const { toast } = useToast();
  const { habboAccount } = useUnifiedAuth();

  const defaultHabboName = habboAccount?.habbo_name || "Beebop";

  const filteredMobis = useMemo(() => {
    return MOBIS_DATA.filter(mobi => {
      const mobiName = mobi.name.toLowerCase();
      const handitemNames = mobi.handitems.map(item => item.name.toLowerCase()).join(' ');
      const matchesSearch = mobiName.includes(searchTerm.toLowerCase()) || 
                          handitemNames.includes(searchTerm.toLowerCase());

      let matchesMainCategory = true;
      if (selectedCategory !== 'Todos') {
        matchesMainCategory = mobi.handitems.some(item => 
          getMainCategoryForItem(item.categoryType) === selectedCategory
        );
      }

      let matchesSubCategory = true;
      if (selectedSubCategory !== 'Todos') {
        matchesSubCategory = mobi.handitems.some(item => 
          getSubCategoryForItem(item.categoryType) === selectedSubCategory
        );
      }

      return matchesSearch && matchesMainCategory && matchesSubCategory;
    });
  }, [searchTerm, selectedCategory, selectedSubCategory]);

  const currentSubCategories = useMemo(() => {
    return selectedCategory === 'Todos' ? [] : MAIN_CATEGORIES[selectedCategory].subCategories;
  }, [selectedCategory]);

  const handleCopyHanditemId = useCallback((handitem: HanditemData) => {
    navigator.clipboard.writeText(handitem.inGameId.toString());
    setSelectedHanditem(handitem);
    toast({
      title: "ID Copiado!",
      description: `ID ${handitem.inGameId} do item "${handitem.name}" foi copiado.`
    });
  }, [toast]);

  const handleCategoryChange = useCallback((category: keyof typeof MAIN_CATEGORIES) => {
    setSelectedCategory(category);
    setSelectedSubCategory('Todos');
  }, []);

  const avatarUrl = useMemo(() => {
    return generateHanditemAvatarUrl(
      defaultHabboName,
      selectedHanditem?.inGameId || null
    );
  }, [defaultHabboName, selectedHanditem]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="volter-font text-2xl text-primary">
            🤲 Catálogo de Handitems Habbo
          </CardTitle>
          <p className="text-muted-foreground volter-font">
            Explore todos os itens de mão que os mobis entregam no hotel!
          </p>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar mobi ou item de mão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
            <TabsList className="grid grid-cols-7 w-full">
              {Object.entries(MAIN_CATEGORIES).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger 
                    key={key} 
                    value={key}
                    className="flex items-center gap-1 text-xs volter-font"
                  >
                    <Icon className="w-3 h-3" />
                    {category.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {currentSubCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedSubCategory === 'Todos' ? 'default' : 'outline'}
                className="cursor-pointer volter-font"
                onClick={() => setSelectedSubCategory('Todos')}
              >
                Todos
              </Badge>
              {currentSubCategories.map((subCat) => (
                <Badge
                  key={subCat}
                  variant={selectedSubCategory === subCat ? 'default' : 'outline'}
                  className="cursor-pointer volter-font"
                  onClick={() => setSelectedSubCategory(subCat)}
                >
                  {subCat}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMobis.map((mobi) => (
          <Card 
            key={mobi.furniId}
            className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => setSelectedMobi(mobi)}
          >
            <CardContent className="p-4">
              <div className="aspect-square relative mb-3 bg-muted rounded-lg overflow-hidden">
                <img
                  src={mobi.imageUrl}
                  alt={mobi.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/150x150/e0e0e0/333333?text=Mobi';
                  }}
                />
                <div className="absolute top-2 right-2 w-8 h-8 bg-background rounded-full border border-border flex items-center justify-center">
                  <img
                    src={mobi.iconUrl}
                    alt="Ícone"
                    className="w-5 h-5"
                    onError={(e) => {
                      e.currentTarget.src = 'https://i.imgur.com/8DdHXoN.png';
                    }}
                  />
                </div>
              </div>
              
              <h3 className="volter-font font-bold text-sm mb-1">{mobi.name}</h3>
              <p className="text-xs text-muted-foreground volter-font mb-2">{mobi.function}</p>
              
              <div className="flex flex-wrap gap-1">
                {mobi.handitems.slice(0, 6).map((item, idx) => (
                  <img
                    key={idx}
                    src={item.iconUrl}
                    alt={item.name}
                    title={item.name}
                    className="w-5 h-5 border border-border rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/20x20/cccccc/ffffff?text=?';
                    }}
                  />
                ))}
                {mobi.handitems.length > 6 && (
                  <div className="w-5 h-5 bg-muted border border-border rounded flex items-center justify-center text-xs volter-font">
                    +{mobi.handitems.length - 6}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMobis.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="volter-font text-lg font-bold text-muted-foreground mb-2">
              Nenhum mobi encontrado
            </h3>
            <p className="text-muted-foreground volter-font">
              Tente ajustar os filtros ou termos de busca
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <Dialog open={!!selectedMobi} onOpenChange={() => setSelectedMobi(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="volter-font text-xl">
              {selectedMobi?.name} - {selectedMobi?.function}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMobi && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Mobi Info and Avatar */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={selectedMobi.imageUrl}
                    alt={selectedMobi.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="text-center space-y-2">
                  <h4 className="volter-font font-bold">Avatar Preview ({defaultHabboName})</h4>
                  <div className="w-32 h-40 mx-auto bg-muted rounded-lg overflow-hidden">
                    <img
                      src={avatarUrl}
                      alt="Avatar com handitem"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {selectedHanditem && (
                    <div className="flex items-center justify-center gap-2">
                      <img
                        src={selectedHanditem.iconUrl}
                        alt={selectedHanditem.name}
                        className="w-6 h-6"
                      />
                      <span className="text-sm volter-font">{selectedHanditem.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Handitems Table */}
              <div className="space-y-4">
                <h4 className="volter-font font-bold text-lg">Itens de Mão Entregues:</h4>
                
                <ScrollArea className="h-80">
                  <div className="space-y-2">
                    {selectedMobi.handitems.map((item) => (
                      <Card
                        key={item.inGameId}
                        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleCopyHanditemId(item)}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.iconUrl}
                            alt={item.name}
                            className="w-8 h-8 border border-border rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/32x32/cccccc/ffffff?text=?';
                            }}
                          />
                          <div className="flex-1">
                            <h5 className="volter-font font-bold text-sm">{item.name}</h5>
                            <p className="text-xs text-muted-foreground">
                              ID: {item.inGameId} • {item.categoryType}
                            </p>
                          </div>
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                
                <p className="text-xs text-muted-foreground text-center volter-font">
                  💡 Clique em qualquer item para copiar seu ID e ver no avatar
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};