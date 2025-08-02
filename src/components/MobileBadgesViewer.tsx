
import { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import IntelligentBadgeImage from './IntelligentBadgeImage';

interface BadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  rarity: string;
}

interface MobileBadgesViewerProps {
  badges: BadgeItem[];
  onBadgeSelect: (badge: BadgeItem) => void;
}

export const MobileBadgesViewer = ({ badges, onBadgeSelect }: MobileBadgesViewerProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Resetar posição quando scale muda drasticamente
  useEffect(() => {
    if (scale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  // Calcular distância entre dois pontos de toque - Fix for React.TouchList
  const getDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Início do toque
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Toque único - iniciar drag
      setIsDragging(true);
      setLastTouch({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    } else if (e.touches.length === 2) {
      // Dois toques - iniciar pinch
      const distance = getDistance(e.touches);
      setInitialDistance(distance);
      setInitialScale(scale);
      setIsDragging(false);
    }
  };

  // Movimento do toque
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
      // Arrastar com um dedo
      const deltaX = e.touches[0].clientX - lastTouch.x;
      const deltaY = e.touches[0].clientY - lastTouch.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastTouch({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    } else if (e.touches.length === 2) {
      // Pinch para zoom com dois dedos
      const distance = getDistance(e.touches);
      if (initialDistance > 0) {
        const scaleMultiplier = distance / initialDistance;
        const newScale = Math.max(0.5, Math.min(4, initialScale * scaleMultiplier));
        setScale(newScale);
      }
    }
  };

  // Fim do toque
  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    setInitialDistance(0);
    
    // Se foi um tap simples em um emblema
    if (e.changedTouches.length === 1 && scale >= 0.8) {
      const touch = e.changedTouches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const badgeButton = element?.closest('[data-badge-code]');
      
      if (badgeButton) {
        const badgeCode = badgeButton.getAttribute('data-badge-code');
        const badge = badges.find(b => b.code === badgeCode);
        if (badge) {
          onBadgeSelect(badge);
        }
      }
    }
  };

  // Controles de zoom
  const zoomIn = () => setScale(prev => Math.min(4, prev * 1.5));
  const zoomOut = () => setScale(prev => Math.max(0.5, prev / 1.5));
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const getRarityClass = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'ring-2 ring-yellow-400 shadow-yellow-200';
      case 'rare': return 'ring-2 ring-purple-400 shadow-purple-200';
      case 'uncommon': return 'ring-2 ring-blue-400 shadow-blue-200';
      default: return 'ring-1 ring-gray-300 shadow-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header com controles */}
      <div className="flex justify-between items-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="text-white font-semibold">
          {badges.length} Emblemas
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={zoomOut}
            className="p-2 bg-white/20 rounded-full text-white"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={resetZoom}
            className="px-3 py-2 bg-white/20 rounded-lg text-white text-sm font-medium"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            className="p-2 bg-white/20 rounded-full text-white"
          >
            <ZoomIn size={20} />
          </button>
        </div>
      </div>

      {/* Container scrollável e com zoom */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative bg-transparent"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <div
          ref={contentRef}
          className="p-4 transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Grid de emblemas */}
          <div className="grid grid-cols-6 gap-3 max-w-sm mx-auto">
            {badges.map((badge) => (
              <button
                key={badge.id}
                data-badge-code={badge.code}
                className={`aspect-square bg-transparent rounded-lg p-2 
                  transition-all duration-300 active:scale-95
                  ${getRarityClass(badge.rarity)}`}
                style={{
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                <IntelligentBadgeImage
                  code={badge.code}
                  name={badge.name}
                  size="md"
                  transparent={true}
                  className="w-full h-full"
                />
                
                {/* Indicador de raridade */}
                {badge.rarity !== 'common' && (
                  <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                    badge.rarity === 'legendary' ? 'bg-yellow-400' :
                    badge.rarity === 'rare' ? 'bg-purple-400' : 'bg-blue-400'
                  } shadow-lg`} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer com instruções */}
      <div className="p-4 bg-black/80 backdrop-blur-sm text-center">
        <p className="text-white text-sm opacity-80">
          Arraste para navegar • Pinça para zoom • Toque para detalhes
        </p>
      </div>
    </div>
  );
};
