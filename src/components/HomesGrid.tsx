import React, { useState } from 'react';
import { HomeCard } from './HomeCard';
import { Loader2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomeData {
  user_id: string;
  habbo_name?: string;
  hotel?: string;
  updated_at: string;
  background_type?: string;
  background_value?: string;
  average_rating?: number;
  ratings_count?: number;
  visit_count?: number;
}

interface HomesGridProps {
  title: string;
  homes: HomeData[];
  isLoading: boolean;
  error: any;
  showVisits?: boolean;
  onHomeClick: (userId: string, habboName?: string, hotel?: string) => void;
  initialDisplayCount?: number;
}

export const HomesGrid: React.FC<HomesGridProps> = ({
  title,
  homes,
  isLoading,
  error,
  showVisits = false,
  onHomeClick,
  initialDisplayCount = 8
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Determinar quantas homes mostrar
  const displayedHomes = isExpanded ? homes : homes.slice(0, initialDisplayCount);
  const hasMore = homes.length > initialDisplayCount;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 220; // Width of card + gap
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 volter-goldfish-font" 
            style={{ textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 2px 0px #000, 0px -2px 0px #000, 2px 0px 0px #000, -2px 0px 0px #000' }}>
          {title}
        </h2>
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
          <span className="ml-2 text-sm text-white">Carregando {title.toLowerCase()}...</span>
        </div>
      </div>
    );
  }

  if (error || !homes || homes.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 volter-goldfish-font" 
            style={{ textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 2px 0px #000, 0px -2px 0px #000, 2px 0px 0px #000, -2px 0px 0px #000' }}>
          {title}
        </h2>
        <div className="text-center py-8">
          <p className="text-white/70">Nenhuma home encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white volter-goldfish-font" 
            style={{ textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 2px 0px #000, 0px -2px 0px #000, 2px 0px 0px #000, -2px 0px 0px #000' }}>
          {title}
        </h2>
        
        {/* Scroll Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' }
        }}
      >
        {displayedHomes.map((home) => (
          <HomeCard
            key={home.user_id}
            home={home}
            onHomeClick={onHomeClick}
            showVisits={showVisits}
          />
        ))}
      </div>

      {/* Botão Ver Mais */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="habbo-button-blue volter-font"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Ver Menos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Ver Mais ({homes.length - initialDisplayCount} homes)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
