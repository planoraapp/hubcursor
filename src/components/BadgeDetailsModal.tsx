
import { X, Calendar, Tag, Award, ExternalLink } from 'lucide-react';
import ValidatedBadgeImage from './ValidatedBadgeImage';
import { ValidatedBadgeItem } from '../hooks/useValidatedBadges';
import { EnhancedBadgeItem } from '../hooks/useEnhancedBadges';
import { HabboApiBadgeItem } from '../hooks/useHabboApiBadges';
import { RealBadgeItem } from '../hooks/useRealBadges';

// Type union for all badge types
type AnyBadgeItem = ValidatedBadgeItem | EnhancedBadgeItem | HabboApiBadgeItem | RealBadgeItem;

interface BadgeDetailsModalProps {
  badge: AnyBadgeItem;
  onClose: () => void;
}

export const BadgeDetailsModal = ({ badge, onClose }: BadgeDetailsModalProps) => {
  // Helper function to get badge code (different property names across types)
  const getBadgeCode = (badge: AnyBadgeItem): string => {
    if ('badge_code' in badge) return badge.badge_code;
    if ('code' in badge) return badge.code;
    return 'Unknown';
  };

  // Helper function to get badge name
  const getBadgeName = (badge: AnyBadgeItem): string => {
    if ('badge_name' in badge) return badge.badge_name;
    if ('name' in badge) return badge.name;
    return `Badge ${getBadgeCode(badge)}`;
  };

  // Helper function to get source info
  const getSourceInfo = (badge: AnyBadgeItem) => {
    const defaultSources = {
      'HabboWidgets': { name: 'HabboWidgets', color: 'bg-blue-100 text-blue-800', icon: '🌐' },
      'HabboAssets': { name: 'HabboAssets', color: 'bg-purple-100 text-purple-800', icon: '🏛️' },
      'SupabaseBucket': { name: 'Storage', color: 'bg-orange-100 text-orange-800', icon: '📦' },
      'habbo-api': { name: 'HabboAPI', color: 'bg-green-100 text-green-800', icon: '🌍' },
      'cache': { name: 'Cache', color: 'bg-gray-100 text-gray-800', icon: '⚡' }
    };

    let source = 'HabboWidgets';
    if ('source' in badge && badge.source) {
      source = badge.source;
    }

    return defaultSources[source as keyof typeof defaultSources] || defaultSources.HabboWidgets;
  };

  // Helper function to get rarity info
  const getRarityInfo = (badge: AnyBadgeItem) => {
    const rarities = {
      'common': { name: 'Comum', color: 'bg-gray-100 text-gray-800' },
      'uncommon': { name: 'Incomum', color: 'bg-blue-100 text-blue-800' },
      'rare': { name: 'Raro', color: 'bg-purple-100 text-purple-800' },
      'legendary': { name: 'Lendário', color: 'bg-yellow-100 text-yellow-800' }
    };

    let rarity = 'common';
    if ('rarity' in badge && badge.rarity) {
      rarity = badge.rarity;
    }

    return rarities[rarity as keyof typeof rarities] || rarities.common;
  };

  const badgeCode = getBadgeCode(badge);
  const badgeName = getBadgeName(badge);
  const sourceInfo = getSourceInfo(badge);
  const rarityInfo = getRarityInfo(badge);

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
            <ValidatedBadgeImage
              code={badgeCode}
              name={badgeName}
              size="lg"
              className="shadow-md"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {badgeName}
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">
                  {badgeCode}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${rarityInfo.color}`}>
                  {rarityInfo.name}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fechar modal"
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
              {'description' in badge && badge.description 
                ? badge.description 
                : 'Badge oficial do Habbo Hotel. Este emblema foi verificado e confirmado como real.'
              }
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Raridade
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {rarityInfo.name === 'Lendário' ? '👑' : 
                   rarityInfo.name === 'Raro' ? '💎' : 
                   rarityInfo.name === 'Incomum' ? '⭐' : '🏷️'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${rarityInfo.color}`}>
                  {rarityInfo.name}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Fonte
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-lg">{sourceInfo.icon}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${sourceInfo.color}`}>
                  {sourceInfo.name}
                </span>
              </div>
            </div>
          </div>

          {/* Category Info if available */}
          {'category' in badge && badge.category && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categoria
              </h4>
              <p className="text-sm text-blue-700">
                {badge.category === 'official' ? '👑 Oficial/Staff' :
                 badge.category === 'achievements' ? '🏆 Conquistas' :
                 badge.category === 'fansites' ? '⭐ Fã-sites' :
                 badge.category === 'others' ? '🎨 Outros' :
                 badge.category}
              </p>
            </div>
          )}

          {/* Validation Info for ValidatedBadgeItem */}
          {'validation_count' in badge && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Informações de Validação
              </h4>
              <div className="space-y-1">
                <p className="text-sm text-green-700">
                  <strong>Validações:</strong> {badge.validation_count}x
                </p>
                {'last_validated_at' in badge && (
                  <p className="text-sm text-green-700">
                    <strong>Última validação:</strong> {new Date(badge.last_validated_at).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Badge Preview */}
          <div className="text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
            <h4 className="text-sm font-semibold text-gray-600 mb-4">Preview em Alta Resolução</h4>
            <div className="inline-block p-4 bg-white rounded-lg shadow-md">
              <ValidatedBadgeImage
                code={badgeCode}
                name={badgeName}
                size="xl"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            Badge oficial • Sistema HabboHub • Fonte: {sourceInfo.name}
          </p>
        </div>
      </div>
    </div>
  );
};
