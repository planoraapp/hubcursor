
import { Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketplaceProvider, useMarketplace, type MarketItem } from '@/contexts/MarketplaceContext';
import { CountryFlags } from './CountryFlags';
import { ClubItemsDisplay } from './ClubItemsDisplay';
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
  flag: '/assets/flagbrazil.png'
}, {
  id: 'com',
  name: 'Habbo.com',
  flag: '/assets/flagcom.png'
}, {
  id: 'de',
  name: 'Habbo.de',
  flag: '/assets/flagdeus.png'
}, {
  id: 'es',
  name: 'Habbo.es',
  flag: '/assets/flagspain.png'
}, {
  id: 'fr',
  name: 'Habbo.fr',
  flag: '/assets/flagfrance.png'
}, {
  id: 'it',
  name: 'Habbo.it',
  flag: '/assets/flagitaly.png'
}, {
  id: 'nl',
  name: 'Habbo.nl',
  flag: '/assets/flagnetl.png'
}, {
  id: 'fi',
  name: 'Habbo.fi',
  flag: '/assets/flafinland.png'
}, {
  id: 'tr',
  name: 'Habbo.com.tr',
  flag: '/assets/flagtrky.png'
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
                {/* Lista de Itens do Marketplace - Coluna da esquerda */}
                <div className="lg:col-span-4">
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
                
                {/* Coluna do meio - Caixas HC/CA e Tracking */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Seção de Itens Club HC/CA */}
                  <div className="bg-white border-2 border-black rounded-lg shadow-lg">
                    <div 
                      className="p-3 border-b-2 border-black rounded-t-lg"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                        backgroundImage: 'url(/assets/bghabbohub.png)',
                        backgroundSize: 'cover'
                      }}
                    >
                      <h3 className="font-bold text-white volter-font text-sm flex items-center gap-2" style={{
                        textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                      }}>
                        <img src="/assets/HC.png" alt="HC" className="w-4 h-4" />
                        Assinaturas Premium
                      </h3>
                    </div>
                    <div className="p-3">
                      <ClubItemsDisplay />
                    </div>
                  </div>
                  
                  {/* Sistema de Tracking para usuários logados */}
                  {user && (
                    <UserTrackedItems hotel={selectedHotel} />
                  )}
                </div>
                
                {/* Boxes de Categorias - Coluna da direita */}
                <div className="lg:col-span-4">
                  <Suspense fallback={<div className="h-full bg-gray-100 animate-pulse rounded-lg"></div>}>
                    <MarketplaceCategoryBoxes 
                      topSellers={getFilteredItems('topSellers')} 
                      biggestGainers={getFilteredItems('biggestGainers')} 
                      biggestLosers={[]} 
                      mostExpensive={getFilteredItems('todayHigh')} 
                      opportunities={getFilteredItems('opportunities')} 
                      stats={stats} 
                      totalItems={items.length} 
                      hotel={hotel} 
                    />
                  </Suspense>
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

export const EnhancedMarketplaceLayout = () => {
  return <MarketplaceProvider>
      <MarketplaceContent />
    </MarketplaceProvider>;
};
