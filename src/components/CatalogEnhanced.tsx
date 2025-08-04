
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { HabboIcon } from './HabboIcon';
import { Search, Filter, Star, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useHabboFurniApi } from '@/hooks/useHabboFurniApi';
import { FurnidataService } from '@/services/FurnidataService';
import IntelligentFurniImage from './IntelligentFurniImage';

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  rarity: string;
  price: number;
  imageUrl: string;
  description: string;
  className: string;
  behaviors?: string[];
  dimensions?: { width: number; height: number; };
  club: 'HC' | 'FREE';
  animated?: boolean;
}

export const CatalogEnhanced = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: furniData, isLoading: apiLoading } = useHabboFurniApi({
    searchTerm: searchTerm || '',
    limit: 300,
    enabled: true
  });

  const categories = [
    { id: 'all', name: 'Todos', icon: Package },
    { id: 'seating', name: '🪑 Assentos', icon: Package },
    { id: 'table', name: '🪑 Mesas', icon: Package },
    { id: 'decoration', name: '🖼️ Decoração', icon: Star },
    { id: 'floor', name: '📐 Pisos', icon: Package },
    { id: 'wallitem', name: '🖼️ Parede', icon: Star },
    { id: 'rare', name: '💎 Raros', icon: Star },
    { id: 'hc', name: '🏆 Habbo Club', icon: Package },
  ];

  // Processar dados da API e combinar com furnidata local
  useEffect(() => {
    const processApiData = async () => {
      if (!furniData?.furnis) {
        setLoading(false);
        return;
      }

      try {
        const processedItems: CatalogItem[] = furniData.furnis.map(item => {
          // Enriquecer com dados do FurnidataService
          const furniInfo = FurnidataService.getFurniInfo(item.className || item.name);
          const behaviors = FurnidataService.getFurniBehaviors(item.className || item.name);
          const dimensions = FurnidataService.getFurniDimensions(item.className || item.name);

          return {
            id: item.id,
            name: item.name || furniInfo.name,
            category: item.category || furniInfo.category,
            rarity: item.rarity || furniInfo.rarity,
            price: 0, // Preço será calculado posteriormente se necessário
            imageUrl: item.imageUrl,
            description: furniInfo.description || `Móvel do Habbo: ${item.name}`,
            className: item.className || item.name,
            behaviors,
            dimensions,
            club: item.club || (item.name?.toLowerCase().includes('hc') ? 'HC' : 'FREE'),
            animated: item.imageUrl?.includes('.gif') || behaviors?.includes('animated')
          };
        });

        setCatalogItems(processedItems);
      } catch (error) {
        console.error('Erro ao processar dados do catálogo:', error);
      } finally {
        setLoading(false);
      }
    };

    if (furniData) {
      processApiData();
    }
  }, [furniData]);

  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           item.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                           (selectedCategory === 'hc' && item.club === 'HC') ||
                           (selectedCategory === 'rare' && ['rare', 'legendary', 'ltd'].includes(item.rarity));
    return matchesSearch && matchesCategory;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-blue-600';
      case 'rare': return 'text-purple-600';
      case 'legendary':
      case 'ltd': return 'text-yellow-600';
      case 'hc': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'bg-gray-100';
      case 'uncommon': return 'bg-blue-100';
      case 'rare': return 'bg-purple-100';
      case 'legendary':
      case 'ltd': return 'bg-yellow-100';
      case 'hc': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };

  const formatBehaviors = (behaviors?: string[]) => {
    if (!behaviors || behaviors.length === 0) return 'Decorativo';
    
    const behaviorNames: Record<string, string> = {
      'canSitOn': 'Pode sentar',
      'canLayOn': 'Pode deitar', 
      'canStandOn': 'Pode ficar em cima',
      'canWalk': 'Atravessável',
      'animated': 'Animado',
      'interactive': 'Interativo'
    };

    return behaviors
      .map(b => behaviorNames[b] || b)
      .slice(0, 2)
      .join(', ');
  };

  if (loading || apiLoading) {
    return (
      <div className="space-y-6">
        <PanelCard title="Carregando Catálogo...">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Carregando catálogo de móveis...</p>
              <p className="text-gray-500 text-sm mt-1">Conectando com HabboFurni API</p>
            </div>
          </div>
        </PanelCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PanelCard title="Catálogo Oficial do Habbo - Móveis e Decoração">
        <div className="space-y-6">
          {/* Filtros e Busca */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar móveis por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="habbo-input w-full pl-10 pr-4 py-2"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="habbo-input px-4 py-2 min-w-[200px]"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-blue-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{catalogItems.length}</div>
              <div className="text-gray-600">Total de Móveis</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{catalogItems.filter(i => i.rarity === 'rare').length}</div>
              <div className="text-gray-600">Itens Raros</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{catalogItems.filter(i => i.club === 'HC').length}</div>
              <div className="text-gray-600">Exclusivos HC</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{filteredItems.length}</div>
              <div className="text-gray-600">Resultados</div>
            </div>
          </div>

          {/* Grid de Itens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.slice(0, 50).map((item) => (
              <div key={item.id} className="habbo-card hover:shadow-lg transition-shadow">
                <div className={`p-4 ${getRarityBg(item.rarity)} flex justify-center relative`}>
                  {/* Badge de raridade */}
                  {item.rarity !== 'common' && (
                    <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded ${getRarityColor(item.rarity)} bg-white/80`}>
                      {item.rarity.toUpperCase()}
                    </div>
                  )}
                  
                  {/* Badge HC */}
                  {item.club === 'HC' && (
                    <div className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded bg-orange-500 text-white">
                      HC
                    </div>
                  )}

                  <IntelligentFurniImage
                    swfName={item.className}
                    name={item.name}
                    originalUrl={item.imageUrl}
                    size="lg"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-gray-800 text-sm truncate" title={item.name}>
                    {item.name}
                  </h3>
                  
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Informações técnicas */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Comportamento:</span>
                      <span className="font-medium">{formatBehaviors(item.behaviors)}</span>
                    </div>
                    
                    {item.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Dimensões:</span>
                        <span className="font-medium">
                          {item.dimensions.width}x{item.dimensions.height}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Categoria:</span>
                      <span className="font-medium capitalize">{item.category}</span>
                    </div>
                  </div>

                  {/* Código do móvel */}
                  <div className="text-xs bg-gray-100 p-2 rounded font-mono break-all">
                    {item.className}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mensagem quando sem resultados */}
          {filteredItems.length === 0 && !loading && (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-semibold mb-2">Nenhum móvel encontrado</p>
              <p className="text-gray-500">Tente ajustar os filtros ou termos de busca</p>
            </div>
          )}

          {/* Rodapé com informações */}
          <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
            <p>📊 Dados: HabboFurni API • 🎨 Imagens: Habbo.com • 💻 Interface: HabboHub</p>
            <p className="mt-1">
              🔄 Última atualização: {new Date().toLocaleString('pt-BR')} • 
              📦 {catalogItems.length} móveis disponíveis
            </p>
          </div>
        </div>
      </PanelCard>
    </div>
  );
};
