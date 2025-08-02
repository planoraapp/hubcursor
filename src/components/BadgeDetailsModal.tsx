
import { X, Calendar, Tag, Award, ExternalLink } from 'lucide-react';
import EnhancedBadgeImage from './EnhancedBadgeImage';

interface BadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  source: string;
  scrapedAt?: string;
}

interface BadgeDetailsModalProps {
  badge: BadgeItem;
  onClose: () => void;
}

export const BadgeDetailsModal = ({ badge, onClose }: BadgeDetailsModalProps) => {
  const getCategoryInfo = (category: string) => {
    const categories = {
      'official': { name: 'Oficial', color: 'bg-blue-100 text-blue-800', icon: '🛡️' },
      'achievements': { name: 'Conquistas', color: 'bg-yellow-100 text-yellow-800', icon: '🏆' },
      'fansites': { name: 'Fã-sites', color: 'bg-purple-100 text-purple-800', icon: '⭐' },
      'others': { name: 'Outros', color: 'bg-gray-100 text-gray-800', icon: '🎨' }
    };
    return categories[category as keyof typeof categories] || categories.others;
  };

  const getRarityInfo = (rarity: string) => {
    const rarities = {
      'legendary': { name: 'Lendário', color: 'bg-gradient-to-r from-yellow-400 to-orange-500', textColor: 'text-white' },
      'rare': { name: 'Raro', color: 'bg-gradient-to-r from-purple-400 to-pink-500', textColor: 'text-white' },
      'uncommon': { name: 'Incomum', color: 'bg-gradient-to-r from-blue-400 to-cyan-500', textColor: 'text-white' },
      'common': { name: 'Comum', color: 'bg-gradient-to-r from-gray-400 to-gray-500', textColor: 'text-white' }
    };
    return rarities[rarity as keyof typeof rarities] || rarities.common;
  };

  const categoryInfo = getCategoryInfo(badge.category);
  const rarityInfo = getRarityInfo(badge.rarity);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <EnhancedBadgeImage
              code={badge.code}
              name={badge.name}
              size="lg"
              className="shadow-md"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {badge.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">
                  {badge.code}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${rarityInfo.color} ${rarityInfo.textColor}`}>
                  {rarityInfo.name}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Descrição
            </h3>
            <p className="text-gray-800 leading-relaxed">
              {badge.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Categoria
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-lg">{categoryInfo.icon}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.color}`}>
                  {categoryInfo.name}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Fonte
              </h4>
              <span className="text-sm text-gray-800 capitalize">
                {badge.source === 'habbowidgets' ? 'HabboWidgets' : badge.source}
              </span>
            </div>
          </div>

          {/* Scraped Date */}
          {badge.scrapedAt && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data da Coleta
              </h4>
              <span className="text-sm text-blue-700">
                {new Date(badge.scrapedAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}

          {/* Badge Preview */}
          <div className="text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
            <h4 className="text-sm font-semibold text-gray-600 mb-4">Preview em Alta Resolução</h4>
            <div className="inline-block p-4 bg-white rounded-lg shadow-md">
              <EnhancedBadgeImage
                code={badge.code}
                name={badge.name}
                size="xl"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            Badge oficial do Habbo Hotel • Sistema HabboHub
          </p>
        </div>
      </div>
    </div>
  );
};
