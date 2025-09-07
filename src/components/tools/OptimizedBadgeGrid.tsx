import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SimpleBadgeImage from './SimpleBadgeImage';
import BadgeTooltip from './BadgeTooltip';
import { Badge } from '@/lib/supabase-badges';

interface OptimizedBadgeGridProps {
  badges: Badge[];
  onBadgeClick: (badge: Badge) => void;
  columns?: number;
  showNames?: boolean;
  className?: string;
}

const OptimizedBadgeGrid: React.FC<OptimizedBadgeGridProps> = ({
  badges,
  onBadgeClick,
  columns = 8,
  showNames = true,
  className = ''
}) => {
  const [visibleBadges, setVisibleBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  // Carregar emblemas em lotes para melhor performance
  const loadBadgesInBatches = useCallback(async (badgeList: Badge[], batchSize: number = 20) => {
    setIsLoading(true);
    setLoadedCount(0);
    setVisibleBadges([]);
    
    const batches = [];
    for (let i = 0; i < badgeList.length; i += batchSize) {
      batches.push(badgeList.slice(i, i + batchSize));
    }

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      // Carregar lote imediatamente
      setVisibleBadges(prev => [...prev, ...batch]);
      setLoadedCount(prev => prev + batch.length);
      
      // Pequena pausa apenas se não for o último lote
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Finalizar loading após todos os lotes
    setIsLoading(false);
  }, []);

  // Carregar emblemas quando a lista mudar
  useEffect(() => {
    if (badges.length > 0) {
      setVisibleBadges([]);
      loadBadgesInBatches(badges);
    }
  }, [badges, loadBadgesInBatches]);

  // Memoizar grid classes para evitar recálculos
  const gridClasses = useMemo(() => {
    const baseClasses = 'grid gap-2 p-2';
    const columnClasses = {
      4: 'grid-cols-4',
      6: 'grid-cols-6',
      8: 'grid-cols-8',
      10: 'grid-cols-10',
      12: 'grid-cols-12',
      16: 'grid-cols-16',
      20: 'grid-cols-20'
    };
    
    return `${baseClasses} ${columnClasses[columns as keyof typeof columnClasses] || 'grid-cols-8'} ${className}`;
  }, [columns, className]);

  return (
    <div className="relative">
      {/* Grid de emblemas */}
      <div className={gridClasses}>
        {visibleBadges.map((badge, index) => (
          <BadgeTooltip
            key={`badge-${badge.code}-${index}`}
            code={badge.code}
            name={badge.name}
            description={badge.description}
            categories={badge.categories}
            countries={badge.countries}
            showOnHover={true}
            showOnClick={true}
          >
            <div
              className="group cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => onBadgeClick(badge)}
            >
              <div className="flex flex-col items-center space-y-1">
                <SimpleBadgeImage 
                  code={badge.code} 
                  name={badge.name}
                  size="md"
                />
                {showNames && (
                  <span className="text-xs text-center text-gray-600 volter-font truncate w-full">
                    {badge.name}
                  </span>
                )}
              </div>
            </div>
          </BadgeTooltip>
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
            <div className="text-center">
              <p className="text-sm text-gray-600 volter-font">
                Carregando emblemas...
              </p>
              <p className="text-xs text-gray-500 volter-font">
                {loadedCount} de {badges.length} carregados
              </p>
              <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(loadedCount / badges.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && visibleBadges.length === 0 && (
        <div className="text-center py-8 text-gray-500 volter-font">
          Nenhum emblema encontrado
        </div>
      )}
    </div>
  );
};

export default OptimizedBadgeGrid;
