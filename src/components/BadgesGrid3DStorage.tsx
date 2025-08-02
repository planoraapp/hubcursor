
import { useState, useMemo, useCallback } from 'react';
import { Search, Filter, Package, Star, Award, Users, Calendar, Gamepad2, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useHabboBadgesStorage, HabboBadgeItem } from '@/hooks/useHabboBadgesStorage';

const CATEGORY_ICONS = {
  'all': Package,
  'staff': Crown,
  'club': Star,
  'events': Calendar,
  'games': Gamepad2,
  'rare': Sparkles,
  'achievements': Award,
  'seasonal': Calendar,
  'general': Users
} as const;

const CATEGORY_NAMES = {
  'all': 'Todos os Emblemas',
  'staff': '👑 Staff & Moderação',
  'club': '⭐ Habbo Club & VIP',
  'events': '🎉 Eventos Especiais',
  'games': '🎮 Jogos & Competições',
  'rare': '💎 Raros & Especiais',
  'achievements': '🏆 Conquistas',
  'seasonal': '🎄 Sazonais',
  'general': '👥 Gerais'
};

const RARITY_COLORS = {
  'common': 'bg-gray-100 border-gray-300',
  'premium': 'bg-yellow-100 border-yellow-400',
  'rare': 'bg-purple-100 border-purple-400',
  'epic': 'bg-orange-100 border-orange-400',
  'limited': 'bg-red-100 border-red-400'
};

interface BadgeModalProps {
  badge: HabboBadgeItem;
  onClose: () => void;
}

const BadgeModal = ({ badge, onClose }: BadgeModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{badge.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>
      </div>
      
      <div className="text-center mb-4">
        <div className={`inline-block p-4 rounded-lg ${RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common}`}>
          <img
            src={badge.imageUrl}
            alt={badge.name}
            className="w-16 h-16 pixelated mx-auto"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <span className="font-semibold">Código:</span> 
          <span className="ml-2 font-mono text-sm">{badge.code}</span>
        </div>
        
        <div>
          <span className="font-semibold">Categoria:</span> 
          <span className="ml-2 capitalize">{CATEGORY_NAMES[badge.category as keyof typeof CATEGORY_NAMES] || badge.category}</span>
        </div>
        
        <div>
          <span className="font-semibold">Raridade:</span> 
          <Badge className={`ml-2 ${badge.rarity === 'limited' ? 'bg-red-500' : badge.rarity === 'rare' ? 'bg-purple-500' : 'bg-gray-500'} text-white`}>
            {badge.rarity.toUpperCase()}
          </Badge>
        </div>
        
        <div>
          <span className="font-semibold">Fonte:</span> 
          <span className="ml-2">Assets Oficiais do Habbo</span>
        </div>
      </div>
    </div>
  </div>
);

export const BadgesGrid3DStorage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState<HabboBadgeItem | null>(null);
  
  const { data: badges, isLoading, error, refetch } = useHabboBadgesStorage({
    limit: 1000,
    search,
    category,
    enabled: true
  });

  // Group badges by rarity for better organization
  const groupedBadges = useMemo(() => {
    if (!badges) return {};
    
    const groups = badges.reduce((acc, badge) => {
      const rarity = badge.rarity || 'common';
      if (!acc[rarity]) acc[rarity] = [];
      acc[rarity].push(badge);
      return acc;
    }, {} as Record<string, HabboBadgeItem[]>);

    return groups;
  }, [badges]);

  const handleBadgeClick = useCallback((badge: HabboBadgeItem) => {
    setSelectedBadge(badge);
  }, []);

  const totalBadges = badges?.length || 0;
  const categoryOptions = Object.entries(CATEGORY_NAMES);

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-600 mb-2">Erro ao Carregar Emblemas</h3>
        <p className="text-gray-600 mb-4">Não foi possível carregar os emblemas do storage.</p>
        <Button onClick={() => refetch()} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar emblemas por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="text-gray-600 w-4 h-4" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(([key, name]) => (
                <SelectItem key={key} value={key}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{totalBadges}</div>
          <div className="text-sm text-gray-500">Total de Emblemas</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
          <div className="text-2xl font-bold text-purple-600">{groupedBadges.rare?.length || 0}</div>
          <div className="text-sm text-gray-500">Emblemas Raros</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
          <div className="text-2xl font-bold text-red-600">{groupedBadges.limited?.length || 0}</div>
          <div className="text-sm text-gray-500">Edição Limitada</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">
            {Object.keys(CATEGORY_NAMES).length - 1}
          </div>
          <div className="text-sm text-gray-500">Categorias</div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="bg-white rounded-lg border shadow-sm p-4">
        {isLoading ? (
          <div className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-1">
            {Array.from({ length: 60 }, (_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : totalBadges === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum emblema encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros ou termos de busca</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedBadges).map(([rarity, rarityBadges]) => (
              <div key={rarity} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={`${
                    rarity === 'limited' ? 'bg-red-500' : 
                    rarity === 'rare' ? 'bg-purple-500' :
                    rarity === 'epic' ? 'bg-orange-500' :
                    rarity === 'premium' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  } text-white`}>
                    {rarity.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {rarityBadges.length} {rarityBadges.length === 1 ? 'emblema' : 'emblemas'}
                  </span>
                </div>
                
                <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-1">
                  {rarityBadges.map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() => handleBadgeClick(badge)}
                      className={`group aspect-square p-1 rounded transition-all duration-200 hover:scale-110 hover:z-10 ${
                        RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common
                      }`}
                      title={`${badge.name} (${badge.code})`}
                    >
                      <img
                        src={badge.imageUrl}
                        alt={badge.name}
                        className="w-full h-full object-contain pixelated group-hover:brightness-110"
                        style={{ imageRendering: 'pixelated' }}
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
        <div className="flex justify-center items-center gap-6 flex-wrap">
          <span>📊 Total: {totalBadges} emblemas oficiais</span>
          <span>🎯 Filtro: {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}</span>
          {search && <span>🔍 Busca: "{search}"</span>}
          <span>✅ Assets Oficiais do Habbo Storage</span>
        </div>
      </div>

      {/* Badge Modal */}
      {selectedBadge && (
        <BadgeModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};
