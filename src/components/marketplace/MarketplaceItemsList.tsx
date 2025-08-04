import { useState } from 'react';
import { MarketFiltersIconOnly } from './MarketFiltersIconOnly';
import { VerticalClubItems } from './VerticalClubItems';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreditIcon } from './CreditIcon';
import { TrendingUp, TrendingDown, Package2, Clock, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { OfficialMarketplaceImage } from './OfficialMarketplaceImage';
import { MarketItemModal } from './MarketItemModal';
import { MarketplaceSkeleton } from './MarketplaceSkeleton';
import { FurnidataService } from '@/services/FurnidataService';

interface MarketItem {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  previousPrice: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: string;
  volume: number;
  imageUrl: string;
  rarity: string;
  description: string;
  className: string;
  hotel: string;
  priceHistory: number[];
  lastUpdated: string;
  quantity?: number;
  listedAt?: string;
  soldItems?: number;
  openOffers?: number;
}

interface MarketStats {
  totalItems: number;
  averagePrice: number;
  totalVolume: number;
  trendingUp: number;
  trendingDown: number;
  featuredItems: number;
  highestPrice: number;
  mostTraded: string;
  apiStatus: 'success' | 'partial' | 'no-data' | 'error' | 'unavailable';
  apiMessage: string;
}

interface MarketplaceItemsListProps {
  items: MarketItem[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: 'price' | 'recent' | 'quantity' | 'ltd';
  setSortBy: (sort: 'price' | 'recent' | 'quantity' | 'ltd') => void;
  hotel: { id: string; name: string; flag: string };
  stats: MarketStats;
}

export const MarketplaceItemsList = ({ 
  items, 
  loading, 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  sortBy, 
  setSortBy, 
  hotel, 
  stats 
}: MarketplaceItemsListProps) => {
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleItemClick = (item: MarketItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const filteredItems = [...items]
    .filter(item => {
      // Mostrar apenas itens com dados oficiais
      if (!(item as any).isOfficialData) return false;
      
      if (sortBy === 'ltd') {
        return item.rarity === 'legendary' || 
               item.className.toLowerCase().includes('ltd') || 
               item.name.toLowerCase().includes('ltd') ||
               item.currentPrice > 500;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.currentPrice - a.currentPrice;
        case 'quantity':
          return (a.openOffers || 0) - (b.openOffers || 0);
        case 'recent':
          return new Date(b.lastUpdated || '').getTime() - new Date(a.lastUpdated || '').getTime();
        case 'ltd':
          return b.currentPrice - a.currentPrice;
        default:
          return 0;
      }
    })
    .slice(0, 25);

  // Contar apenas itens oficiais
  const officialItemsCount = items.filter((item: any) => item.isOfficialData === true).length;

  // Função para obter status da API de forma visual
  const getApiStatusIndicator = () => {
    const apiStatus = stats.apiStatus || 'unknown';
    
    switch (apiStatus) {
      case 'success':
        return {
          icon: <Zap size={12} className="text-green-600" />,
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300',
          textColor: 'text-green-700',
          label: 'API Oficial Ativa'
        };
      case 'partial':
        return {
          icon: <TrendingUp size={12} className="text-yellow-600" />,
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-700',
          label: 'API Parcial'
        };
      case 'no-data':
        return {
          icon: <Clock size={12} className="text-blue-600" />,
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-700',
          label: 'API Sem Dados'
        };
      case 'error':
      case 'unavailable':
        return {
          icon: <AlertCircle size={12} className="text-red-600" />,
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          textColor: 'text-red-700',
          label: 'API Indisponível'
        };
      default:
        return {
          icon: <RefreshCw size={12} className="text-gray-600" />,
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-700',
          label: 'Carregando...'
        };
    }
  };

  if (loading) {
    return (
      <>
        <MarketplaceSkeleton />
        <MarketItemModal 
          item={selectedItem}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </>
    );
  }

  const apiIndicator = getApiStatusIndicator();

  return (
    <>
      <div className="bg-white border-2 border-black rounded-lg shadow-lg">
        <div 
          className="p-4 border-b-2 border-black rounded-t-lg"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
            backgroundImage: 'url(/assets/bghabbohub.png)',
            backgroundSize: 'cover'
          }}
        >
          <h3 className="font-bold text-white volter-font mb-3" style={{
            textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
          }}>
            🏪 Feira Livre de {hotel.name}
          </h3>
          
          {/* Indicadores de status da API */}
          <div className="flex items-center gap-2 mb-3">
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${apiIndicator.bgColor} ${apiIndicator.borderColor} border`}>
              {apiIndicator.icon}
              <span className={`text-xs font-medium ${apiIndicator.textColor}`}>
                {apiIndicator.label}
              </span>
            </div>
            
            {officialItemsCount > 0 && (
              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded border border-green-300">
                <Package2 size={12} className="text-green-600" />
                <span className="text-xs text-green-700">{officialItemsCount} itens oficiais</span>
              </div>
            )}
            
            {stats.apiMessage && (
              <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded border border-blue-300">
                <span className="text-xs text-blue-700">{stats.apiMessage}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <MarketFiltersIconOnly sortBy={sortBy} setSortBy={setSortBy} />
            </div>
            
            <div className="flex-1 flex justify-end">
              <div className="bg-transparent">
                <VerticalClubItems hotel={hotel.id} />
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="h-96">
          <div className="p-4 space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-yellow-50 cursor-pointer transition-all border-2 border-green-200 hover:border-green-400 hover:shadow-md"
                >
                  <OfficialMarketplaceImage
                    className={item.className}
                    name={FurnidataService.getFurniName(item.className)}
                    size="md"
                    priority={index < 10}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate" title={FurnidataService.getFurniName(item.className)}>
                        {FurnidataService.getFurniName(item.className)}
                      </p>
                      
                      {/* Badge de dados oficiais */}
                      <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs px-2 py-1 rounded border border-green-300 font-medium">
                        ✅ Oficial
                      </span>
                      
                      {/* Outras badges baseadas em dados reais */}
                      {(FurnidataService.getFurniRarity(item.className) === 'legendary' || 
                        item.className.toLowerCase().includes('ltd')) && (
                        <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs px-2 py-1 rounded border border-purple-300 font-medium">
                          ✨ LTD
                        </span>
                      )}
                      {FurnidataService.getFurniRarity(item.className) === 'rare' && (
                        <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-300">
                          💎 Raro
                        </span>
                      )}
                      {item.soldItems && item.soldItems > 5 && (
                        <span className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-xs px-2 py-1 rounded border border-orange-300">
                          🔥 {item.soldItems} vendidos
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-blue-600 font-semibold">
                        <CreditIcon size="sm" />
                        {item.currentPrice.toLocaleString()} créditos
                      </span>
                      
                      {item.openOffers !== undefined && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Package2 size={10} />
                          <span>{item.openOffers} ofertas disponíveis</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <span>📊 Dados da API oficial</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {stats.apiStatus === 'error' || stats.apiStatus === 'unavailable' ? (
                  <>
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                    <p className="text-red-600 font-medium">API Oficial Indisponível</p>
                    <p className="text-xs mt-2 text-gray-600">
                      A API oficial do Habbo está temporariamente indisponível.
                      <br />
                      Os dados serão atualizados automaticamente quando a API voltar ao normal.
                    </p>
                  </>
                ) : stats.apiStatus === 'no-data' ? (
                  <>
                    <Package2 className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                    <p className="text-blue-600 font-medium">Sem Dados Oficiais no Momento</p>
                    <p className="text-xs mt-2 text-gray-600">
                      A API oficial está funcionando, mas não há dados de marketplace disponíveis.
                      <br />
                      Isso é normal e os dados podem aparecer a qualquer momento.
                    </p>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-400 animate-spin" />
                    <p>Buscando dados oficiais...</p>
                  </>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <MarketItemModal 
        item={selectedItem}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
};
