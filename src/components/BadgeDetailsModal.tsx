
import React, { useEffect } from 'react';
import { X, Star, Calendar, Tag } from 'lucide-react';
import { Badge } from './ui/badge';
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
  source?: string;
  scrapedAt?: string;
  metadata?: {
    year?: number;
    event?: string;
    source_info?: string;
    validation_count?: number;
    last_validated_at?: string;
  };
}

interface BadgeDetailsModalProps {
  badge: BadgeItem;
  onClose: () => void;
}

export const BadgeDetailsModal: React.FC<BadgeDetailsModalProps> = ({ badge, onClose }) => {
  const { t } = useLanguage();
  
  // Buscar tradução do emblema
  const { data: translationData, isLoading: translationLoading } = useBadgeTranslation({ 
    badgeCode: badge.code 
  });

  // Usar tradução se disponível, senão usar dados originais
  const displayName = translationData?.success ? translationData.translation.name : badge.name;
  const displayDescription = translationData?.success 
    ? translationData.translation.description || `Badge ${badge.code}` 
    : badge.description;

  // Bloquear scroll e centralizar modal
  useEffect(() => {
    const body = document.body;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    body.style.overflow = 'hidden';
    body.style.paddingRight = `${scrollBarWidth}px`;
    
    const modalElement = document.getElementById('badge-modal');
    if (modalElement) {
      modalElement.focus();
    }
    
    return () => {
      body.style.overflow = 'unset';
      body.style.paddingRight = '0px';
    };
  }, []);

  // Fechar com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getCategoryInfo = (category: string) => {
    const categories: Record<string, { name: string; color: string; icon: string }> = {
      'official': { 
        name: t('official'), 
        color: 'bg-amber-100 border-amber-300 text-amber-800',
        icon: '🛡️'
      },
      'achievements': { 
        name: t('achievements'), 
        color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        icon: '🏆'
      },
      'fansites': { 
        name: t('fansites'), 
        color: 'bg-purple-100 border-purple-300 text-purple-800',
        icon: '⭐'
      },
      'others': { 
        name: t('others'), 
        color: 'bg-gray-100 border-gray-300 text-gray-800',
        icon: '🎨'
      },
    };
    return categories[category] || categories['others'];
  };

  const getRarityInfo = (rarity: string) => {
    const rarities: Record<string, { name: string; color: string }> = {
      'legendary': { name: t('legendary'), color: 'text-yellow-600' },
      'rare': { name: t('rare'), color: 'text-purple-600' },
      'uncommon': { name: t('uncommon'), color: 'text-blue-600' },
      'common': { name: t('common'), color: 'text-gray-600' },
    };
    return rarities[rarity] || rarities['common'];
  };

  const categoryInfo = getCategoryInfo(badge.category);
  const rarityInfo = getRarityInfo(badge.rarity);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      {/* Backdrop with HabboHub styling */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      
      {/* Modal com design do HabboHub */}
      <div
        id="badge-modal"
        className="relative w-full max-w-md mx-auto transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        style={{
          backgroundColor: '#2a2a2a',
          border: '3px solid #d4af37',
          borderRadius: '15px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.3)',
          fontFamily: "'Volter', monospace"
        }}
      >
        {/* Header com gradiente dourado do HabboHub */}
        <div 
          className="flex items-center justify-between p-6 border-b-3"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)',
            borderBottom: '3px solid #b8860b',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          }}
        >
          <h2 
            id="modal-title" 
            className="text-xl font-bold truncate pr-4"
            style={{
              color: '#1a1a1a',
              textShadow: '1px 1px 2px rgba(255, 255, 255, 0.3)',
              fontFamily: "'Volter', monospace"
            }}
          >
            {translationLoading ? badge.code : displayName}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-full transition-colors"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: '#1a1a1a'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            }}
            aria-label={t('closeModal')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content com fundo escuro HabboHub */}
        <div className="p-6 space-y-6" style={{ backgroundColor: '#2a2a2a' }}>
          {/* Badge Display com efeito dourado */}
          <div className="text-center">
            <div 
              className="inline-block p-6 rounded-2xl shadow-inner relative"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%)',
                border: '2px solid #d4af37',
                boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(212, 175, 55, 0.2)'
              }}
            >
              <div className="relative">
                <IntelligentBadgeImage
                  code={badge.code}
                  name={displayName}
                  size="lg"
                  className="w-16 h-16 filter drop-shadow-lg"
                />
                {/* Glow effect ao redor do emblema */}
                <div 
                  className="absolute inset-0 w-16 h-16 rounded-full opacity-30"
                  style={{
                    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
                    filter: 'blur(8px)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Badge Info com styling HabboHub */}
          <div className="space-y-4">
            {/* Code com fonte Volter */}
            <div className="text-center">
              <Badge 
                variant="outline" 
                className="text-lg font-mono px-4 py-2"
                style={{
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  borderColor: '#d4af37',
                  color: '#f4d03f',
                  fontFamily: "'Volter', monospace"
                }}
              >
                {badge.code}
              </Badge>
            </div>

            {/* Category and Rarity com cores HabboHub */}
            <div className="grid grid-cols-2 gap-4">
              <div 
                className="text-center p-3 rounded-xl"
                style={{
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid #d4af37'
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Tag className="w-4 h-4" style={{ color: '#d4af37' }} />
                  <span className="text-sm" style={{ color: '#f4d03f' }}>
                    {t('category')}
                  </span>
                </div>
                <Badge style={{
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  color: '#f4d03f',
                  borderColor: '#d4af37'
                }}>
                  {categoryInfo.icon} {categoryInfo.name}
                </Badge>
              </div>

              <div 
                className="text-center p-3 rounded-xl"
                style={{
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid #d4af37'
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-4 h-4" style={{ color: '#d4af37' }} />
                  <span className="text-sm" style={{ color: '#f4d03f' }}>
                    {t('rarity')}
                  </span>
                </div>
                <span className={`font-semibold ${rarityInfo.color}`} style={{ color: '#f4d03f' }}>
                  {rarityInfo.name}
                </span>
              </div>
            </div>

            {/* Description com estilo do HabboHub */}
            <div 
              className="p-4 rounded-xl"
              style={{
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                border: '2px solid #d4af37'
              }}
            >
              <h3 
                className="font-semibold mb-2 flex items-center gap-2"
                style={{ 
                  color: '#f4d03f',
                  fontFamily: "'Volter', monospace" 
                }}
              >
                <span className="text-lg">📝</span>
                {t('description')}
              </h3>
              <p 
                id="modal-description" 
                className="leading-relaxed"
                style={{ 
                  color: '#e8e8e8',
                  fontFamily: "'Arial', sans-serif"
                }}
              >
                {translationLoading ? 'Carregando descrição...' : displayDescription}
              </p>
            </div>

            {/* Metadata com cores HabboHub */}
            {badge.metadata && (
              <div className="space-y-3">
                {badge.metadata.year && (
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid #d4af37'
                    }}
                  >
                    <Calendar className="w-4 h-4" style={{ color: '#d4af37' }} />
                    <div>
                      <span className="text-sm" style={{ color: '#f4d03f' }}>
                        {t('year')}:
                      </span>
                      <span className="ml-2 font-semibold" style={{ color: '#e8e8e8' }}>
                        {badge.metadata.year}
                      </span>
                    </div>
                  </div>
                )}
                
                {badge.metadata.source_info && (
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid #d4af37'
                    }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#d4af37' }} />
                    <div>
                      <span className="text-sm" style={{ color: '#f4d03f' }}>
                        {t('source')}:
                      </span>
                      <span className="ml-2 font-semibold" style={{ color: '#e8e8e8' }}>
                        {badge.metadata.source_info}
                      </span>
                    </div>
                  </div>
                )}

                {badge.metadata.validation_count && badge.metadata.validation_count > 1 && (
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid #d4af37'
                    }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#32cd32' }} />
                    <div>
                      <span className="text-sm" style={{ color: '#f4d03f' }}>
                        {t('validations')}:
                      </span>
                      <span className="ml-2 font-semibold" style={{ color: '#32cd32' }}>
                        {badge.metadata.validation_count}
                      </span>
                    </div>
                  </div>
                )}

                {badge.metadata.last_validated_at && (
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid #d4af37'
                    }}
                  >
                    <Calendar className="w-4 h-4" style={{ color: '#d4af37' }} />
                    <div>
                      <span className="text-sm" style={{ color: '#f4d03f' }}>
                        {t('lastValidation')}:
                      </span>
                      <span className="ml-2 font-semibold" style={{ color: '#e8e8e8' }}>
                        {new Date(badge.metadata.last_validated_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer com gradiente dourado */}
        <div 
          className="p-6 pt-0 text-center"
          style={{ backgroundColor: '#2a2a2a' }}
        >
          <div 
            className="flex items-center justify-center gap-2 mb-2 p-3 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(244, 208, 63, 0.1) 100%)',
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
          <p 
            className="text-xs"
            style={{ 
              color: '#888',
              fontFamily: "'Arial', sans-serif" 
            }}
          >
            Pressione ESC ou clique fora para fechar
          </p>
        </div>
      </div>
    </div>
  );
};
