
import React, { useEffect } from 'react';
import { X, Award, Star, Calendar, Tag } from 'lucide-react';
import { Badge } from './ui/badge';
import IntelligentBadgeImage from './IntelligentBadgeImage';

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
  };
}

interface BadgeDetailsModalProps {
  badge: BadgeItem;
  onClose: () => void;
}

export const BadgeDetailsModal: React.FC<BadgeDetailsModalProps> = ({ badge, onClose }) => {
  // Bloquear scroll e centralizar modal
  useEffect(() => {
    const body = document.body;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    body.style.overflow = 'hidden';
    body.style.paddingRight = `${scrollBarWidth}px`;
    
    // Focar no modal para acessibilidade
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
        name: 'Oficiais', 
        color: 'bg-blue-100 border-blue-300 text-blue-800',
        icon: '🛡️'
      },
      'achievements': { 
        name: 'Conquistas', 
        color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        icon: '🏆'
      },
      'fansites': { 
        name: 'Fã-sites', 
        color: 'bg-purple-100 border-purple-300 text-purple-800',
        icon: '⭐'
      },
      'others': { 
        name: 'Outros', 
        color: 'bg-gray-100 border-gray-300 text-gray-800',
        icon: '🎨'
      },
    };
    return categories[category] || categories['others'];
  };

  const getRarityInfo = (rarity: string) => {
    const rarities: Record<string, { name: string; color: string }> = {
      'legendary': { name: 'Lendário', color: 'text-yellow-600' },
      'rare': { name: 'Raro', color: 'text-purple-600' },
      'uncommon': { name: 'Incomum', color: 'text-blue-600' },
      'common': { name: 'Comum', color: 'text-gray-600' },
    };
    return rarities[rarity] || rarities['common'];
  };

  const categoryInfo = getCategoryInfo(badge.category);
  const rarityInfo = getRarityInfo(badge.rarity);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={onClose}
    >
      {/* Backdrop com blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal centralizado */}
      <div
        id="badge-modal"
        className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900 truncate pr-4">
            {badge.name}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Badge Display */}
          <div className="text-center">
            <div className="inline-block p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-inner">
              <IntelligentBadgeImage
                code={badge.code}
                name={badge.name}
                size="lg"
                className="w-16 h-16"
              />
            </div>
          </div>

          {/* Badge Info */}
          <div className="space-y-4">
            {/* Code */}
            <div className="text-center">
              <Badge variant="outline" className="text-lg font-mono px-4 py-2">
                {badge.code}
              </Badge>
            </div>

            {/* Category and Rarity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Categoria</span>
                </div>
                <Badge className={categoryInfo.color}>
                  {categoryInfo.icon} {categoryInfo.name}
                </Badge>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Raridade</span>
                </div>
                <span className={`font-semibold ${rarityInfo.color}`}>
                  {rarityInfo.name}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Descrição
              </h3>
              <p id="modal-description" className="text-gray-700 leading-relaxed">
                {badge.description}
              </p>
            </div>

            {/* Metadata */}
            {badge.metadata && (
              <div className="space-y-3">
                {badge.metadata.year && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <div>
                      <span className="text-sm text-gray-600">Ano:</span>
                      <span className="ml-2 font-semibold text-gray-900">{badge.metadata.year}</span>
                    </div>
                  </div>
                )}
                
                {badge.metadata.source_info && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div>
                      <span className="text-sm text-gray-600">Fonte:</span>
                      <span className="ml-2 font-semibold text-gray-900">{badge.metadata.source_info}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-600 mb-2">
            <Award className="w-5 h-5" />
            <span className="font-semibold">Emblema Oficial do Habbo</span>
          </div>
          <p className="text-xs text-gray-500">
            Pressione ESC ou clique fora para fechar
          </p>
        </div>
      </div>
    </div>
  );
};
