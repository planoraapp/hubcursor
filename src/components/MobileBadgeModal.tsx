
import { useEffect } from 'react';
import { X, Star } from 'lucide-react';
import IntelligentBadgeImage from './IntelligentBadgeImage';
import { useBadgeTranslation } from '../hooks/useBadgeTranslations';
import { useLanguage } from '../hooks/useLanguage';

interface BadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  rarity: string;
}

interface MobileBadgeModalProps {
  badge: BadgeItem;
  onClose: () => void;
}

export const MobileBadgeModal = ({ badge, onClose }: MobileBadgeModalProps) => {
  const { t } = useLanguage();
  
  // Buscar tradução do emblema
  const { data: translationData, isLoading: translationLoading } = useBadgeTranslation({ 
    badgeCode: badge.code 
  });

  // Usar tradução se disponível
  const displayName = translationData?.success ? translationData.translation.name : badge.name;
  const displayDescription = translationData?.success 
    ? translationData.translation.description || `Badge ${badge.code}` 
    : badge.description;

  // Bloquear scroll do body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Fechar com swipe para baixo (simplificado)
  const handleTouchStart = (e: React.TouchEvent) => {
    const startY = e.touches[0].clientY;
    
    const handleTouchEnd = (endEvent: TouchEvent) => {
      const endY = endEvent.changedTouches[0].clientY;
      const deltaY = endY - startY;
      
      if (deltaY > 100) {
        onClose();
      }
      
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-400';
      case 'rare': return 'from-purple-400 to-pink-400';
      case 'uncommon': return 'from-blue-400 to-indigo-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return t('legendary');
      case 'rare': return t('rare');
      case 'uncommon': return t('uncommon');
      default: return t('common');
    }
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'official': t('official'),
      'achievements': t('achievements'),
      'fansites': t('fansites'),
      'others': t('others')
    };
    return names[category] || category;
  };

  return (
    <div 
      className="fixed inset-0 flex items-end z-50" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
    >
      {/* Modal content com design HabboHub */}
      <div 
        className="w-full max-h-[85vh] overflow-y-auto rounded-t-3xl"
        style={{
          backgroundColor: '#2a2a2a',
          border: '3px solid #d4af37',
          borderBottom: 'none',
          boxShadow: '0 -20px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.3)'
        }}
        onTouchStart={handleTouchStart}
      >
        {/* Handle bar dourado */}
        <div className="flex justify-center pt-3 pb-2">
          <div 
            className="w-12 h-1 rounded-full"
            style={{ backgroundColor: '#d4af37' }}
          />
        </div>

        {/* Header com gradiente HabboHub */}
        <div 
          className="flex justify-between items-start p-6 pb-4"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)',
            borderBottom: '2px solid #b8860b'
          }}
        >
          <h3 
            className="text-2xl font-bold flex-1 pr-4"
            style={{
              color: '#1a1a1a',
              textShadow: '1px 1px 2px rgba(255, 255, 255, 0.3)',
              fontFamily: "'Volter', monospace"
            }}
          >
            {translationLoading ? badge.code : displayName}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: '#1a1a1a'
            }}
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Badge Display */}
        <div className="px-6 pb-6" style={{ backgroundColor: '#2a2a2a' }}>
          <div className="text-center mb-6">
            <div 
              className={`inline-block p-6 rounded-2xl shadow-2xl relative`}
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%)',
                border: '2px solid #d4af37'
              }}
            >
              <IntelligentBadgeImage
                code={badge.code}
                name={displayName}
                size="lg"
                className="w-20 h-20"
              />
              {/* Glow effect */}
              <div 
                className="absolute inset-0 w-20 h-20 rounded-full opacity-30"
                style={{
                  background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
                  filter: 'blur(10px)'
                }}
              />
            </div>
          </div>
          
          {/* Badge Info */}
          <div className="space-y-4">
            <div className="text-center">
              <span 
                className="inline-block px-4 py-2 rounded-full text-lg font-mono font-semibold"
                style={{
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  border: '2px solid #d4af37',
                  color: '#f4d03f'
                }}
              >
                {badge.code}
              </span>
            </div>
            
            <div 
              className="flex justify-between items-center p-4 rounded-xl"
              style={{
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '2px solid #d4af37'
              }}
            >
              <div>
                <span className="text-sm" style={{ color: '#f4d03f' }}>
                  {t('category')}
                </span>
                <div className="font-semibold capitalize" style={{ color: '#e8e8e8' }}>
                  {getCategoryName(badge.category)}
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-sm" style={{ color: '#f4d03f' }}>
                  {t('rarity')}
                </span>
                <div className="font-semibold capitalize flex items-center gap-2" style={{ color: '#f4d03f' }}>
                  <Star size={16} className="fill-current" />
                  {getRarityText(badge.rarity)}
                </div>
              </div>
            </div>
            
            <div 
              className="p-4 rounded-xl"
              style={{
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                border: '2px solid #d4af37'
              }}
            >
              <span 
                className="font-semibold text-sm block mb-2"
                style={{ 
                  color: '#f4d03f',
                  fontFamily: "'Volter', monospace" 
                }}
              >
                {t('description')}
              </span>
              <p className="leading-relaxed" style={{ color: '#e8e8e8' }}>
                {translationLoading ? 'Carregando descrição...' : displayDescription}
              </p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid #d4af37' }}>
            <div 
              className="flex items-center justify-center gap-2 p-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid #d4af37'
              }}
            >
              <span className="text-xl">🏆</span>
              <span 
                className="font-semibold"
                style={{ 
                  color: '#f4d03f',
                  fontFamily: "'Volter', monospace" 
                }}
              >
                HabboHub - Emblemas Oficiais
              </span>
            </div>
            <p className="text-xs mt-2" style={{ color: '#888' }}>
              Arraste para baixo para fechar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
