import { useState } from 'react';
import { MarketFiltersIconOnly } from './MarketFiltersIconOnly';
import { VerticalClubItems } from './VerticalClubItems';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreditIcon } from './CreditIcon';
import { TrendingUp, TrendingDown, Package2, Clock, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { HabboAPIImage } from './HabboAPIImage';
import { MarketItemModal } from './MarketItemModal';
import { MarketplaceSkeleton } from './MarketplaceSkeleton';
import type { MarketItem, MarketStats } from '@/contexts/MarketplaceContext';

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

  const filteredItems = [...items].slice(0, 25); // Limitar a 25 itens para performance

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
          label: 'HabboAPI.site Ativa'
        };
      case 'partial':
        return {
          icon: <TrendingUp size={12} className="text-yellow-600" />,
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-700',
          label: 'Dados Parciais'
        };
      case 'no-data':
        return {
          icon: <Clock size={12} className="text-blue-600" />,
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-700',
          label: 'Nenhum Resultado'
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
            🏪 Marketplace {hotel.name}
          </h3>
          
          {/* Indicadores de status da API */}
          <div className="flex items-center gap-2 mb-3">
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${apiIndicator.bgColor} ${apiIndicator.borderColor} border`}>
              {apiIndicator.icon}
              <span className={`text-xs font-medium ${apiIndicator.textColor}`}>
                {apiIndicator.label}
              </span>
            </div>
            
            {stats.totalItems > 0 && (
              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded border border-green-300">
                <Package2 size={12} className="text-green-600" />
                <span className="text-xs text-green-700">{stats.totalItems} itens</span>
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
                  <HabboAPIImage
                    className={item.className}
                    name={item.name}
                    size="md"
                    priority={index < 10}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate" title={item.name}>
                        {item.name}
                      </p>
                      
                      {/* Badge HabboAPI.site */}
                      <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-300 font-medium">
                        🌐 HabboAPI
                      </span>
                      
                      {/* Badges baseadas em raridade e dados */}
                      {item.rarity === 'legendary' && (
                        <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs px-2 py-1 rounded border border-purple-300 font-medium">
                          ✨ Legendary
                        </span>
                      )}
                      {item.rarity === 'rare' && (
                        <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-300">
                          💎 Raro
                        </span>
                      )}
                      {item.volume > 10 && (
                        <span className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-xs px-2 py-1 rounded border border-orange-300">
                          🔥 Volume: {item.volume}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-blue-600 font-semibold">
                        <CreditIcon size="sm" />
                        {item.currentPrice.toLocaleString()} créditos
                      </span>
                      
                      {item.trend !== 'stable' && (
                        <div className="flex items-center gap-1">
                          {item.trend === 'up' ? (
                            <TrendingUp size={12} className="text-green-500" />
                          ) : (
                            <TrendingDown size={12} className="text-red-500" />
                          )}
                          <span className={`${
                            item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.changePercent}%
                          </span>
                        </div>
                      )}
                      
                      {item.openOffers !== undefined && item.openOffers > 0 && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Package2 size={10} />
                          <span>{item.openOffers} ofertas</span>
                        </div>
                      )}
                      
                      {item.priceHistory && item.priceHistory.length > 0 && (
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <span>📈 {item.priceHistory.length} registros históricos</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {stats.apiStatus === 'error' || stats.apiStatus === 'unavailable' ? (
                  <>
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                    <p className="text-red-600 font-medium">HabboAPI.site Indisponível</p>
                    <p className="text-xs mt-2 text-gray-600">
                      A API está temporariamente indisponível.
                      <br />
                      Tente novamente em alguns minutos.
                    </p>
                  </>
                ) : stats.apiStatus === 'no-data' ? (
                  <>
                    <Package2 className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                    <p className="text-blue-600 font-medium">Nenhum Resultado Encontrado</p>
                    <p className="text-xs mt-2 text-gray-600">
                      Tente ajustar os filtros de busca ou categoria.
                      <br />
                      Nem todos os itens podem estar disponíveis no marketplace.
                    </p>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-400 animate-spin" />
                    <p>Buscando dados da HabboAPI.site...</p>
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
