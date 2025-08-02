
import { useState, useMemo, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useHabboBadgesStorage, HabboBadgeItem } from '@/hooks/useHabboBadgesStorage';
import SimpleBadgeImage from './SimpleBadgeImage';

const CATEGORY_NAMES = {
  'all': 'Todos',
  'staff': '👑 Staff',
  'club': '⭐ Club',
  'events': '🎉 Eventos',
  'games': '🎮 Jogos',
  'rare': '💎 Raros',
  'achievements': '🏆 Conquistas',
  'seasonal': '🎄 Sazonais',
  'general': '👥 Gerais'
};

interface BadgeModalProps {
  badge: HabboBadgeItem;
  onClose: () => void;
}

const BadgeModal = ({ badge, onClose }: BadgeModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-lg max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-gray-800">{badge.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>
      </div>
      
      <div className="text-center mb-4">
        <div className="inline-block p-4 rounded-lg bg-gray-50">
          <SimpleBadgeImage
            code={badge.code}
            className="w-16 h-16"
          />
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div><span className="font-semibold">Código:</span> <span className="font-mono">{badge.code}</span></div>
        <div><span className="font-semibold">Categoria:</span> <span className="capitalize">{badge.category}</span></div>
        <div><span className="font-semibold">Raridade:</span> <span className="capitalize">{badge.rarity}</span></div>
      </div>
    </div>
  </div>
);

export const BadgesGrid3DStorage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState<HabboBadgeItem | null>(null);
  
  const { data: badges, isLoading, error } = useHabboBadgesStorage({
    limit: 5000,
    search,
    category,
    enabled: true
  });

  const handleBadgeClick = useCallback((badge: HabboBadgeItem) => {
    setSelectedBadge(badge);
  }, []);

  const totalBadges = badges?.length || 0;

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold text-red-600 mb-2">Erro ao Carregar</h3>
        <p className="text-gray-600">Não foi possível carregar os emblemas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-lg border shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar emblemas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="text-gray-600 w-4 h-4" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                <SelectItem key={key} value={key}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid Ultra-Denso */}
      <div className="bg-white rounded-lg border shadow-sm p-2">
        {isLoading ? (
          <div className="grid grid-cols-16 md:grid-cols-24 lg:grid-cols-32 xl:grid-cols-40 gap-1">
            {Array.from({ length: 200 }, (_, i) => (
              <Skeleton key={i} className="aspect-square rounded-sm" />
            ))}
          </div>
        ) : totalBadges === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum emblema encontrado</h3>
          </div>
        ) : (
          <div className="grid grid-cols-16 md:grid-cols-24 lg:grid-cols-32 xl:grid-cols-40 gap-1">
            {badges?.map((badge) => (
              <button
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className="aspect-square p-0.5 rounded-sm transition-transform duration-150 hover:scale-110 hover:z-10 hover:shadow-md bg-gray-50 hover:bg-gray-100"
                title={`${badge.name} (${badge.code})`}
              >
                <SimpleBadgeImage
                  code={badge.code}
                  className="w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedBadge && (
        <BadgeModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};
