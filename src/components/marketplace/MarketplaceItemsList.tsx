
import { useState } from 'react';
import { Search, Filter, SortAsc, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditIcon } from './CreditIcon';
import { ClubItemsDisplay } from './ClubItemsDisplay';
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
  const [showFilters, setShowFilters] = useState(false);
  
  const categories = [
    { id: 'all', name: 'Todas', icon: '📦' },
    { id: 'furniture', name: 'Móveis', icon: '🪑' },
    { id: 'decoration', name: 'Decorações', icon: '🖼️' },
    { id: 'lighting', name: 'Iluminação', icon: '💡' },
    { id: 'rare', name: 'Raros', icon: '💎' },
    { id: 'ltd', name: 'Limitados', icon: '⭐' }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />;
      default: return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getRarityBadge = (rarity: string) => {
    const rarityConfig = {
      common: { color: 'bg-gray-100 text-gray-700', text: 'Comum' },
      uncommon: { color: 'bg-blue-100 text-blue-700', text: 'Incomum' },
      rare: { color: 'bg-purple-100 text-purple-700', text: 'Raro' },
      epic: { color: 'bg-orange-100 text-orange-700', text: 'Épico' },
      legendary: { color: 'bg-yellow-100 text-yellow-700', text: 'Lendário' },
      ltd: { color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white', text: 'LTD' }
    };
    
    const config = rarityConfig[rarity as keyof typeof rarityConfig] || rarityConfig.common;
    return <Badge className={`${config.color} text-xs px-2 py-1`}>{config.text}</Badge>;
  };

  if (loading && items.length === 0) {
    return (
      <Card className="border-2 border-black shadow-lg">
        <CardHeader className="pb-3" style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
          backgroundImage: 'url(/assets/site/bghabbohub.png)',
          backgroundSize: 'cover'
        }}>
          <CardTitle className="text-white volter-font text-lg" style={{
            textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
          }}>
            🏪 Feira Livre - {hotel.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-black shadow-lg">
      <CardHeader className="pb-3" style={{
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
        backgroundImage: 'url(/assets/site/bghabbohub.png)',
        backgroundSize: 'cover'
      }}>
        <CardTitle className="text-white volter-font text-lg flex items-center gap-2" style={{
          textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
        }}>
          🏪 Feira Livre - {hotel.name}
          <Badge className="bg-white/20 text-white text-xs">
            {items.length} itens
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Seção HC/CA Integrada */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 rounded-lg p-3">
          <h4 className="font-bold text-sm text-gray-800 mb-2 flex items-center gap-2">
            <img src="/assets/HC.png" alt="HC" className="w-4 h-4" />
            Assinaturas Premium
          </h4>
          <ClubItemsDisplay />
        </div>

        {/* Busca e Filtros */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar itens na feira..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1 border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40 border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">💰 Por Preço</SelectItem>
                <SelectItem value="recent">🕐 Mais Recentes</SelectItem>
                <SelectItem value="quantity">📦 Por Quantidade</SelectItem>
                <SelectItem value="ltd">⭐ LTDs Primeiro</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-2"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Status da API */}
        {stats.apiStatus && (
          <div className={`text-xs p-2 rounded ${
            stats.apiStatus === 'success' ? 'bg-green-50 text-green-700' :
            stats.apiStatus === 'partial' ? 'bg-yellow-50 text-yellow-700' :
            'bg-red-50 text-red-700'
          }`}>
            📡 API: {stats.apiMessage || 'Dados carregados da HabboAPI.site'}
          </div>
        )}

        {/* Lista de Itens */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">
                {loading ? 'Carregando itens...' : 'Nenhum item encontrado'}
              </div>
            </div>
          ) : (
            items.slice(0, 20).map((item, index) => (
              <div 
                key={`${item.id}-${index}`}
                className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-lg border transition-colors"
              >
                {/* Imagem do Item */}
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/gcreate_icon_credit.png';
                    }}
                  />
                </div>

                {/* Informações do Item */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-800 truncate">
                    {item.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {getRarityBadge(item.rarity)}
                    <div className="text-xs text-gray-500">
                      {item.openOffers || item.quantity || 0} ofertas
                    </div>
                  </div>
                </div>

                {/* Preço e Trend */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <CreditIcon size="sm" />
                    <span className="font-bold text-green-600">
                      {item.currentPrice?.toLocaleString() || '0'}
                    </span>
                    {getTrendIcon(item.trend)}
                  </div>
                  {item.changePercent && item.changePercent !== '0%' && (
                    <div className={`text-xs ${
                      item.trend === 'up' ? 'text-green-600' : 
                      item.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {item.trend === 'up' ? '+' : ''}{item.changePercent}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ver Mais */}
        {items.length > 20 && (
          <div className="text-center pt-2">
            <Button variant="outline" size="sm" className="text-xs">
              Ver mais {items.length - 20} itens
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
