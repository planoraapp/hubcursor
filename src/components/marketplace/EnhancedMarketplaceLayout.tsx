
import { Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketplaceProvider, useMarketplace } from '@/contexts/MarketplaceContext';
import { CountryFlags } from './CountryFlags';
import { MarketStatsFooter } from './MarketStatsFooter';
import { UserTrackedItems } from './UserTrackedItems';
import { useAuth } from '@/hooks/useAuth';

// Lazy loading para otimização
const MarketplaceItemsList = lazy(() => import('./MarketplaceItemsList').then(module => ({
  default: module.MarketplaceItemsList
})));
const MarketplaceCategoryBoxes = lazy(() => import('./MarketplaceCategoryBoxes').then(module => ({
  default: module.MarketplaceCategoryBoxes
})));

const hotels = [{
  id: 'br',
  name: 'Habbo.com.br',
  flag: '/flags/flagbrazil.png'
}, {
  id: 'com',
  name: 'Habbo.com',
  flag: '/flags/flagcom.png'
}, {
  id: 'de',
  name: 'Habbo.de',
  flag: '/flags/flagdeus.png'
}, {
  id: 'es',
  name: 'Habbo.es',
  flag: '/flags/flagspain.png'
}, {
  id: 'fr',
  name: 'Habbo.fr',
  flag: '/flags/flagfrance.png'
}, {
  id: 'it',
  name: 'Habbo.it',
  flag: '/flags/flagitaly.png'
}, {
  id: 'nl',
  name: 'Habbo.nl',
  flag: '/flags/flagnetl.png'
}, {
  id: 'fi',
  name: 'Habbo.fi',
  flag: '/flags/flafinland.png'
}, {
  id: 'tr',
  name: 'Habbo.com.tr',
  flag: '/flags/flagtrky.png'
}];

const MarketplaceContent = () => {
  const {
    state,
    setHotel,
    setSearch,
    setCategory,
    setSort,
    getFilteredItems
  } = useMarketplace();
  const {
    items,
    stats,
    loading,
    error,
    selectedHotel,
    searchTerm,
    selectedCategory,
    sortBy
  } = state;
  
  const { user } = useAuth();
  const selectedHotelData = hotels.find(h => h.id === selectedHotel) || hotels[0];
  
  if (error && items.length === 0) {
    return <div className="text-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar Dados</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
            Tentar Novamente
          </button>
        </div>
      </div>;
  }
  
  return <div className="space-y-6">
      {/* Hotel Selection com Bandeiras */}
      <div className="flex justify-center">
        <Tabs value={selectedHotel} onValueChange={setHotel} className="w-full max-w-4xl">
          <div className="flex justify-center mb-6">
            <TabsList className="grid grid-cols-9 w-full max-w-3xl">
              {hotels.map(hotel => <TabsTrigger key={hotel.id} value={hotel.id} className="text-xs px-2 flex items-center gap-1">
                  <CountryFlags hotelId={hotel.id} />
                  <span className="hidden sm:inline">{hotel.id.toUpperCase()}</span>
                </TabsTrigger>)}
            </TabsList>
          </div>
          
          {hotels.map(hotel => <TabsContent key={hotel.id} value={hotel.id}>
              {error && items.length > 0 && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 text-sm">{error}</p>
                </div>}
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
                {/* Lista de Itens do Marketplace - Coluna Maior (6/12) */}
                <div className="lg:col-span-6">
                  <Suspense fallback={<div className="h-full bg-gray-100 animate-pulse rounded-lg"></div>}>
                    <MarketplaceItemsList 
                      items={items} 
                      loading={loading} 
                      searchTerm={searchTerm} 
                      setSearchTerm={setSearch} 
                      selectedCategory={selectedCategory} 
                      setSelectedCategory={setCategory} 
                      sortBy={sortBy} 
                      setSortBy={setSort} 
                      hotel={hotel} 
                      stats={stats} 
                    />
                  </Suspense>
                </div>
                
                {/* Primeira Coluna de Categorias (3/12) */}
                <div className="lg:col-span-3">
                  <div className="space-y-4 h-full">
                    <div className="grid grid-cols-1 gap-4">
                      <MarketCategoryBox
                        title="🔥 Mais Vendidos"
                        items={getFilteredItems('topSellers')}
                        hotel={hotel}
                        icon="/assets/promo_star.gif"
                        height="h-[290px]"
                      />
                      <MarketCategoryBox
                        title="📈 Maiores Altas"
                        items={getFilteredItems('biggestGainers')}
                        hotel={hotel}
                        icon="/assets/135217166.gif"
                        height="h-[290px]"
                      />
                    </div>
                    
                    {/* Sistema de Tracking para usuários logados */}
                    {user && (
                      <UserTrackedItems hotel={selectedHotel} />
                    )}
                  </div>
                </div>
                
                {/* Segunda Coluna de Categorias (3/12) */}
                <div className="lg:col-span-3">
                  <div className="space-y-4 h-full">
                    <div className="grid grid-cols-1 gap-4">
                      <MarketCategoryBox
                        title="💰 Mais Caros"
                        items={getFilteredItems('todayHigh')}
                        hotel={hotel}
                        icon="/assets/Diamantes.png"
                        height="h-[290px]"
                      />
                      <MarketCategoryBox
                        title="💎 Oportunidades"
                        items={getFilteredItems('opportunities')}
                        hotel={hotel}
                        icon="/assets/gcreate_icon_credit.png"
                        height="h-[290px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer com Estatísticas */}
              <MarketStatsFooter stats={stats} totalItems={items.length} hotel={selectedHotelData} />
            </TabsContent>)}
        </Tabs>
      </div>
      
      {/* Assets Reference Footer */}
      <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200">
        <p>Assets: HabboAPI.site • Imagens: Habbo.com • Interface: HabboHub</p>
      </div>
    </div>;
};

// Componente individual para as caixas de categoria
const MarketCategoryBox = ({ title, items, hotel, icon, height = "h-[145px]" }: {
  title: string;
  items: any[];
  hotel: any;
  icon: string;
  height?: string;
}) => {
  return (
    <div className="bg-white border-2 border-black rounded-lg shadow-lg">
      <div 
        className="p-3 border-b-2 border-black rounded-t-lg flex items-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
          backgroundImage: 'url(/assets/bghabbohub.png)',
          backgroundSize: 'cover'
        }}
      >
        <img src={icon} alt="" className="w-4 h-4" />
        <h3 className="font-bold text-white volter-font text-xs" style={{
          textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
        }}>
          {title}
        </h3>
      </div>
      <div className={`${height} overflow-y-auto p-2`}>
        {items.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-4">
            Carregando...
          </div>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 8).map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-xs">
                <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-gray-800">{item.name}</div>
                  <div className="text-green-600 font-bold">
                    {item.currentPrice?.toLocaleString()} c
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const EnhancedMarketplaceLayout = () => {
  return <MarketplaceProvider>
      <MarketplaceContent />
    </MarketplaceProvider>;
};
