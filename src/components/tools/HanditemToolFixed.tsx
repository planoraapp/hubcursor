import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Search, Package, Utensils, Coffee, Candy, Wrench, Smartphone, Gamepad2, RefreshCw, Download, Filter, Eye, Zap, AlertCircle, Music, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { HanditemImage } from './HanditemImage';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { TraxPlayerWidget } from '@/components/widgets/TraxPlayerWidget';

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
  'Bebidas': { label: 'Bebidas', icon: Coffee, subCategories: ['Suco', 'Chá', 'Energéticos', 'Alcoólicas', 'Milkshakes', 'Refrigerantes', 'Água', 'Sopas', 'Laticínios', 'Café', 'Especiais'] },
  'Doces': { label: 'Doces', icon: Candy, subCategories: ['Sorvetes', 'Gomas', 'Chicletes', 'Pirulitos', 'Algodão Doce', 'Diversos'] },
  'Utensílios': { label: 'Utensílios', icon: Wrench, subCategories: ['Ferramentas', 'Escritório', 'Saúde', 'Laboratório'] },
  'Eletrônicos': { label: 'Eletrônicos', icon: Smartphone, subCategories: ['Tablets', 'Celulares', 'Diversos'] },
  'Outros': { label: 'Outros', icon: Gamepad2, subCategories: ['Plantas e Flores', 'Animais', 'Diversos'] }
};

// Dados de exemplo simplificados
const MOBIS_DATA: MobiData[] = [
  {
    name: "Frigobar",
    furniId: "bar_polyfon",
    imageUrl: "https://habboapi.site/api/image/bar_polyfon",
    iconUrl: "https://habbofurni.com/furni_assets/48082/bar_polyfon_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Suco", webId: 6, inGameId: 2, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png", categoryType: "Bebidas - Suco" },
      { name: "Chá Árabe", webId: 6, inGameId: 27, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_japanesetea.png", categoryType: "Bebidas - Chá" },
    ]
  }
];

export const HanditemToolFixed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'trax'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof MAIN_CATEGORIES>('Todos');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Todos');
  const [selectedMobi, setSelectedMobi] = useState<MobiData | null>(null);
  const [selectedHanditem, setSelectedHanditem] = useState<HanditemData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string>('');
  const [selectedHanditemId, setSelectedHanditemId] = useState<number | null>(null);
  
  // Sistema de Trax
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: 'Habbo Lounge Mix',
    artist: 'DJ Habbo',
    duration: '3:45'
  });
  
  const { toast } = useToast();
  const { habboAccount } = useAuth();

  const defaultHabboName = habboAccount?.habbo_username || "Beebop";

  // Funções do Sistema de Trax
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Música pausada" : "Música tocando",
      description: `${currentTrack.title} - ${currentTrack.artist}`,
    });
  };

  const handleTrackChange = (direction: 'next' | 'prev') => {
    const tracks = [
      { title: 'Habbo Lounge Mix', artist: 'DJ Habbo', duration: '3:45' },
      { title: 'Club Vibes', artist: 'Habbo DJ', duration: '4:12' },
      { title: 'Retro Sounds', artist: 'Classic Habbo', duration: '3:28' }
    ];
    
    const currentIndex = tracks.findIndex(t => t.title === currentTrack.title);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % tracks.length;
    } else {
      newIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    }
    
    setCurrentTrack(tracks[newIndex]);
    toast({
      title: "Música alterada",
      description: `${tracks[newIndex].title} - ${tracks[newIndex].artist}`,
    });
  };

  // Função para testar handitem em avatar
  const testHanditemInAvatar = async (handitemId: number, habboName: string) => {
    try {
      setPreviewAvatar(habboName);
      setSelectedHanditemId(handitemId);
      setShowPreview(true);
      toast({
        title: "Preview criado",
        description: `Testando handitem ${handitemId} com ${habboName}`,
      });
    } catch (error) {
            toast({
        title: "Erro",
        description: "Não foi possível testar o handitem",
      });
    }
  };

  // Função para copiar ID do handitem
  const handleCopyHanditemId = (item: HanditemData) => {
    navigator.clipboard.writeText(item.inGameId.toString());
    toast({
      title: "ID copiado",
      description: `ID ${item.inGameId} copiado para a área de transferência`,
    });
  };

  // Filtrar mobis baseado na busca e categoria
  const filteredMobis = useMemo(() => {
    return MOBIS_DATA.filter(mobi => {
      const matchesSearch = searchTerm === '' || 
        mobi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mobi.handitems.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesCategory = selectedCategory === 'Todos' || 
        mobi.handitems.some(item => 
          item.categoryType.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Abas */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'catalog' | 'trax')}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="catalog" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Catálogo de Handitems
              </TabsTrigger>
              <TabsTrigger value="trax" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                Sistema Trax
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Conteúdo das abas */}
      {activeTab === 'catalog' ? (
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

          {/* Filtros */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar mobis ou handitems..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as keyof typeof MAIN_CATEGORIES)}>
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
              </div>
            </CardContent>
          </Card>

          {/* Lista de Mobis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMobis.map((mobi) => (
              <Card 
                key={mobi.furniId}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedMobi(mobi)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={mobi.iconUrl}
                      alt={mobi.name}
                      className="w-12 h-12 border border-border rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/48x48/cccccc/ffffff?text=?';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold volter-font">{mobi.name}</h3>
                      <p className="text-sm text-muted-foreground">{mobi.function}</p>
                      <Badge variant="secondary" className="mt-1">
                        {mobi.handitems.length} itens
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detalhes do Mobi Selecionado */}
          {selectedMobi && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img
                    src={selectedMobi.iconUrl}
                    alt={selectedMobi.name}
                    className="w-8 h-8"
                  />
                  {selectedMobi.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preview do Mobi */}
                  <div className="space-y-4">
                    <h4 className="volter-font font-bold text-lg">Preview:</h4>
                    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                      <img
                        src={selectedMobi.imageUrl}
                        alt={selectedMobi.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/200x200/cccccc/ffffff?text=Preview';
                        }}
                      />
                    </div>
                  </div>

                  {/* Lista de Handitems */}
                  <div className="space-y-4">
                    <h4 className="volter-font font-bold text-lg">Itens de Mão:</h4>
                    <ScrollArea className="h-64">
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
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header do Sistema Trax */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="volter-font text-2xl text-primary flex items-center gap-2">
                <Music className="w-6 h-6" />
                Sistema Trax - Player de Música
              </CardTitle>
              <p className="text-muted-foreground volter-font">
                Controle de música e sistema de rastreamento de itens
              </p>
            </CardHeader>
          </Card>

          {/* Player de Música */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-purple-600" />
                  Trax Player
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Music className="w-10 h-10 text-purple-600" />
                  </div>
                  <div className="font-bold text-lg volter-font">{currentTrack.title}</div>
                  <div className="text-sm text-gray-600 volter-font">{currentTrack.artist}</div>
                  <div className="text-xs text-gray-500 volter-font">{currentTrack.duration}</div>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => handleTrackChange('prev')}>
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={handlePlayPause}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleTrackChange('next')}>
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: '45%' }}></div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas do Sistema */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Sistema Ativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">Sistema Ativo</p>
                      <p className="text-sm text-green-600">Trax funcionando perfeitamente</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-purple-800">Status da Música</p>
                      <p className="text-sm text-purple-600">{isPlaying ? 'Tocando' : 'Pausada'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Modal de Preview de Avatar */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview de Avatar com Handitem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Preview do Avatar</h3>
              <p className="text-sm text-muted-foreground">
                Testando handitem {selectedHanditemId} com {previewAvatar}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['s', 'm', 'l', 'xl'].map((size) => (
                <div key={size} className="text-center space-y-2">
                  <div className="w-24 h-32 mx-auto bg-muted rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Avatar {size}
                    </div>
                  </div>
                  <p className="text-sm font-medium">Tamanho {size.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
