import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Package, 
  Utensils, 
  Coffee, 
  Candy, 
  Wrench, 
  Smartphone, 
  Gamepad2, 
  RefreshCw, 
  Download, 
  Filter, 
  Eye, 
  Zap, 
  AlertCircle,
  Database,
  Globe,
  Image as ImageIcon,
  Link
} from 'lucide-react';
import { habboApiService, HabboHanditem, HabboFurni, HabboBuildInfo } from '@/services/habboApiService';
import { habboDataExtractor, ExtractedHanditem } from '@/utils/habboDataExtractor';
import { DiscoveryStats } from './DiscoveryStats';
import { useToast } from '@/hooks/use-toast';

interface UnifiedCatalogProps {
  onHanditemSelect?: (handitem: HabboHanditem) => void;
  onFurniSelect?: (furni: HabboFurni) => void;
}

export const UnifiedCatalog: React.FC<UnifiedCatalogProps> = ({ 
  onHanditemSelect, 
  onFurniSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isLoading, setIsLoading] = useState(false);
  const [buildInfo, setBuildInfo] = useState<HabboBuildInfo | null>(null);
  const [handitems, setHanditems] = useState<HabboHanditem[]>([]);
  const [furni, setFurni] = useState<HabboFurni[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  // Categorias para handitems
  const HANDITEM_CATEGORIES = {
    'Todos': { label: 'Todos', icon: Package },
    'UseItem': { label: 'Para Beber', icon: Coffee },
    'CarryItem': { label: 'Para Carregar', icon: Package }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Carregando dados do servidor Habbo...');
      const data = await habboApiService.getAllData();
      
      setBuildInfo(data.buildInfo);
      setHanditems(data.handitems);
      setFurni(data.furni);
      setLastUpdate(new Date());
      
      toast({
        title: "Dados carregados com sucesso!",
        description: `Encontrados ${data.handitems.length} handitems e ${data.furni.length} mobílias`,
      });
      
      console.log('✅ Dados carregados:', data);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível conectar aos servidores do Habbo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractData = async () => {
    setIsExtracting(true);
    try {
      console.log('🚀 Iniciando extração completa de dados...');
      const report = await habboApiService.discoverHanditemsWithImages();
      
      setBuildInfo(report.buildInfo);
      setHanditems(report.handitems);
      setFurni(report.furni);
      setLastUpdate(new Date());
      
      toast({
        title: "Extração concluída!",
        description: `Descobertos ${report.totalHanditems} handitems e ${report.totalFurni} mobílias. Build: ${report.buildInfo.buildId}`,
      });
      
      console.log('✅ Extração completa finalizada:', report);
    } catch (error) {
      console.error('❌ Erro na extração:', error);
      toast({
        title: "Erro na extração",
        description: "Não foi possível extrair dados dos servidores do Habbo",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Filtrar handitems
  const filteredHanditems = useMemo(() => {
    let filtered = handitems;

    // Filtro por categoria
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(item => item.type === selectedCategory);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toString().includes(searchTerm) ||
        item.assetPrefix.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [handitems, selectedCategory, searchTerm]);

  // Filtrar mobílias
  const filteredFurni = useMemo(() => {
    let filtered = furni;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [furni, searchTerm]);

  // Obter URL da imagem do handitem
  const getHanditemImageUrl = (handitem: HabboHanditem): string => {
    if (!buildInfo) return '';
    return habboApiService.getHanditemImageUrl(handitem, buildInfo);
  };

  // Obter cor do badge baseado no tipo
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'UseItem': return 'default';
      case 'CarryItem': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas de descoberta */}
      <DiscoveryStats
        totalHanditems={handitems.length}
        useItems={handitems.filter(h => h.type === 'UseItem').length}
        carryItems={handitems.filter(h => h.type === 'CarryItem').length}
        lastUpdate={lastUpdate}
        buildInfo={buildInfo}
        isExtracting={isExtracting}
        newHanditems={handitems.filter(h => h.discovered).length}
      />

      {/* Controles de busca e filtro */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar handitems ou mobílias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={loadData} 
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                onClick={extractData} 
                disabled={isExtracting}
                variant="default"
                className="flex items-center gap-2"
              >
                <Zap className={`h-4 w-4 ${isExtracting ? 'animate-pulse' : ''}`} />
                {isExtracting ? 'Extraindo...' : 'Extrair do Servidor'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para handitems e mobílias */}
      <Tabs defaultValue="handitems" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="handitems" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Handitems ({filteredHanditems.length})
          </TabsTrigger>
          <TabsTrigger value="furni" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Mobílias ({filteredFurni.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Handitems */}
        <TabsContent value="handitems" className="space-y-4">
          {/* Filtros de categoria para handitems */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(HANDITEM_CATEGORIES).map(([key, category]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className="flex items-center gap-2"
              >
                <category.icon className="h-4 w-4" />
                {category.label}
              </Button>
            ))}
          </div>

          {/* Lista de handitems */}
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHanditems.map((handitem) => (
                <Card 
                  key={`${handitem.assetPrefix}-${handitem.id}`}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onHanditemSelect?.(handitem)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {handitem.imageUrls?.drk || handitem.imageUrls?.crr ? (
                          <img 
                            src={handitem.imageUrls.drk || handitem.imageUrls.crr} 
                            alt={handitem.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <ImageIcon className={`h-8 w-8 text-gray-400 ${handitem.imageUrls?.drk || handitem.imageUrls?.crr ? 'hidden' : ''}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {handitem.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getBadgeVariant(handitem.type)}>
                            {handitem.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {handitem.assetPrefix}{handitem.id}
                          </Badge>
                          {handitem.discovered && (
                            <Badge variant="secondary" className="text-xs">
                              Novo
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Estado: {handitem.state}
                        </p>
                        {handitem.buildId && (
                          <p className="text-xs text-blue-500 mt-1">
                            Build: {handitem.buildId}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Tab Mobílias */}
        <TabsContent value="furni" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFurni.map((furniItem) => (
                <Card 
                  key={furniItem.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onFurniSelect?.(furniItem)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {furniItem.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {furniItem.id}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {furniItem.handitems.length} handitems
                          </Badge>
                        </div>
                        {furniItem.handitems.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {furniItem.handitems.slice(0, 3).map((handitemId) => (
                              <Badge key={handitemId} variant="outline" className="text-xs">
                                {handitemId}
                              </Badge>
                            ))}
                            {furniItem.handitems.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{furniItem.handitems.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
