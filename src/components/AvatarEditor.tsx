
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { Palette, Download, Share2, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export const AvatarEditor = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('hair');
  const [currentLook, setCurrentLook] = useState('hd-180-1.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61');

  const categories = [
    { id: 'hair', name: 'Cabelo', items: ['hr-828-61', 'hr-515-61', 'hr-110-61'] },
    { id: 'face', name: 'Rosto', items: ['hd-180-1', 'hd-180-2', 'hd-180-3'] },
    { id: 'shirt', name: 'Camisa', items: ['ch-255-66', 'ch-210-66', 'ch-215-66'] },
    { id: 'pants', name: 'Calça', items: ['lg-280-110', 'lg-270-110', 'lg-285-110'] },
    { id: 'shoes', name: 'Sapatos', items: ['sh-305-62', 'sh-300-62', 'sh-310-62'] },
    { id: 'accessories', name: 'Acessórios', items: ['ha-1012-110', 'ha-1013-110', 'ha-1014-110'] }
  ];

  const getAvatarUrl = (figureString: string) => {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&direction=2&head_direction=2&gesture=sml&size=l&frame=1`;
  };

  const updateLook = (newPart: string) => {
    const parts = currentLook.split('.');
    const category = selectedCategory;
    
    // Simple logic to replace parts (this would be more complex in a real implementation)
    const newLook = parts.map(part => {
      if (category === 'hair' && part.startsWith('hr-')) return newPart;
      if (category === 'face' && part.startsWith('hd-')) return newPart;
      if (category === 'shirt' && part.startsWith('ch-')) return newPart;
      if (category === 'pants' && part.startsWith('lg-')) return newPart;
      if (category === 'shoes' && part.startsWith('sh-')) return newPart;
      if (category === 'accessories' && part.startsWith('ha-')) return newPart;
      return part;
    }).join('.');
    
    setCurrentLook(newLook);
  };

  const resetLook = () => {
    setCurrentLook('hd-180-1.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61');
  };

  const downloadAvatar = () => {
    const link = document.createElement('a');
    link.href = getAvatarUrl(currentLook);
    link.download = 'meu-avatar-habbo.png';
    link.click();
  };

  const shareAvatar = () => {
    navigator.clipboard.writeText(currentLook);
    alert('Código do visual copiado para a área de transferência!');
  };

  return (
    <div className="space-y-6">
      <PanelCard title={t('avatarEditorTitle')} subtitle={t('avatarEditorSubtitle')}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] shadow-[2px_2px_0px_0px_#cccccc] p-6 text-center">
              <h3 className="font-bold text-[#38332c] mb-4">Prévia do Avatar</h3>
              <div className="bg-[#f0ede6] rounded-lg p-4 mb-4">
                <img
                  src={getAvatarUrl(currentLook)}
                  alt="Avatar Preview"
                  className="mx-auto w-32 h-32"
                />
              </div>
              <div className="space-y-2">
                <button
                  onClick={downloadAvatar}
                  className="w-full bg-[#008800] text-white px-4 py-2 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 flex items-center justify-center space-x-2"
                >
                  <Download size={16} />
                  <span>Baixar</span>
                </button>
                <button
                  onClick={shareAvatar}
                  className="w-full bg-[#007bff] text-white px-4 py-2 rounded-lg font-medium border-2 border-[#0056b3] border-r-[#0099ff] border-b-[#0099ff] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#0099ff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 flex items-center justify-center space-x-2"
                >
                  <Share2 size={16} />
                  <span>Compartilhar</span>
                </button>
                <button
                  onClick={resetLook}
                  className="w-full bg-[#dd0000] text-white px-4 py-2 rounded-lg font-medium border-2 border-[#aa0000] border-r-[#ff0000] border-b-[#ff0000] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#ff0000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 flex items-center justify-center space-x-2"
                >
                  <RotateCcw size={16} />
                  <span>Resetar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Editor Controls */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] shadow-[2px_2px_0px_0px_#cccccc] p-6">
              <h3 className="font-bold text-[#38332c] mb-4 flex items-center space-x-2">
                <Palette size={20} />
                <span>Customização</span>
              </h3>
              
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium border-2 transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-[#b0e0e6] text-[#1a1a1a] border-[#66b0bb]'
                        : 'bg-[#eaddc7] text-[#38332c] border-[#d1c6b3] hover:bg-[#f0e6da]'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {categories.find(c => c.id === selectedCategory)?.items.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => updateLook(item)}
                    className="p-3 bg-[#f0ede6] rounded-lg border-2 border-[#d1c6b3] hover:border-[#66b0bb] hover:bg-[#e8e5de] transition-all duration-200"
                  >
                    <div className="w-12 h-12 mx-auto bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-600">
                      {item.split('-')[1]}
                    </div>
                  </button>
                ))}
              </div>

              {/* Look Code */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-[#38332c] mb-2">Código do Visual:</h4>
                <input
                  type="text"
                  value={currentLook}
                  onChange={(e) => setCurrentLook(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#5a5a5a] rounded-lg focus:outline-none focus:border-[#007bff] text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </PanelCard>
    </div>
  );
};
