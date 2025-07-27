
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { Palette, Shirt, Eye, Smile, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export const AvatarEditor = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('hair');
  const [currentLook, setCurrentLook] = useState('hd-180-1.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61');

  const categories = [
    { id: 'hair', name: 'Cabelo', icon: Palette },
    { id: 'face', name: 'Rosto', icon: Smile },
    { id: 'eyes', name: 'Olhos', icon: Eye },
    { id: 'clothes', name: 'Roupas', icon: Shirt },
  ];

  const hairOptions = [
    { id: 'hr-828-61', name: 'Cabelo Clássico', price: 0 },
    { id: 'hr-834-61', name: 'Cabelo Moderno', price: 50 },
    { id: 'hr-890-61', name: 'Cabelo Estiloso', price: 100 },
  ];

  const faceOptions = [
    { id: 'hd-180-1', name: 'Rosto Padrão', price: 0 },
    { id: 'hd-185-1', name: 'Rosto Sorridente', price: 25 },
    { id: 'hd-190-1', name: 'Rosto Sério', price: 25 },
  ];

  const eyesOptions = [
    { id: 'ey-667-1', name: 'Olhos Normais', price: 0 },
    { id: 'ey-670-1', name: 'Olhos Grandes', price: 30 },
    { id: 'ey-675-1', name: 'Olhos Pequenos', price: 30 },
  ];

  const clothesOptions = [
    { id: 'ch-255-66', name: 'Camisa Básica', price: 0 },
    { id: 'ch-260-66', name: 'Camisa Listrada', price: 75 },
    { id: 'ch-265-66', name: 'Camisa Elegante', price: 150 },
  ];

  const getOptionsForCategory = () => {
    switch (selectedCategory) {
      case 'hair': return hairOptions;
      case 'face': return faceOptions;
      case 'eyes': return eyesOptions;
      case 'clothes': return clothesOptions;
      default: return [];
    }
  };

  const getAvatarUrl = (figureString: string) => {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&direction=2&head_direction=2&gesture=sml&size=l&frame=1`;
  };

  const updateLook = (partId: string) => {
    // Simulação simples de atualização do look
    const parts = currentLook.split('.');
    const newParts = parts.map(part => {
      if (part.startsWith(partId.split('-')[0])) {
        return partId;
      }
      return part;
    });
    setCurrentLook(newParts.join('.'));
  };

  return (
    <div className="space-y-6">
      <PanelCard title={t('avatarEditorTitle')}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Preview */}
          <div className="lg:col-span-1">
            <div className="habbo-card">
              <div className="p-6 text-center">
                <h3 className="font-bold text-gray-800 mb-4">Preview</h3>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <img
                    src={getAvatarUrl(currentLook)}
                    alt="Avatar Preview"
                    className="w-32 h-32 mx-auto object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <button className="habbo-button-green w-full">
                    Salvar Look
                  </button>
                  <button className="habbo-button-red w-full flex items-center justify-center">
                    <RefreshCw size={16} className="mr-2" />
                    Resetar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`
                        habbo-nav-link px-4 py-2
                        ${selectedCategory === category.id ? 'active' : ''}
                      `}
                    >
                      <Icon size={16} />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getOptionsForCategory().map((option) => (
                  <div key={option.id} className="habbo-card">
                    <div className="p-4 text-center">
                      <div className="bg-gray-100 rounded-lg p-4 mb-3">
                        <div className="w-16 h-16 bg-gray-200 rounded mx-auto flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Preview</span>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">{option.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {option.price === 0 ? 'Grátis' : `${option.price} moedas`}
                      </p>
                      <button
                        onClick={() => updateLook(option.id)}
                        className="habbo-button-green w-full"
                      >
                        {option.price === 0 ? 'Usar' : 'Comprar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PanelCard>
    </div>
  );
};
