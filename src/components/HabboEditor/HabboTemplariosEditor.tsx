
import React, { useState, useMemo } from 'react';
// import { useTemplariosData } from '@/hooks/useTemplariosData'; // Hook removido
// import { useTemplariosPreview } from '@/hooks/useTemplariosPreview'; // Hook removido
// import { useTemplariosFigure } from '@/hooks/useTemplariosFigure'; // Hook removido
import { Copy, Download, Share2, RotateCcw } from 'lucide-react';
import TemplariosCategoryNavigation from './TemplariosCategoryNavigation';
import TemplariosCategoryGrid from './TemplariosCategoryGrid';

const HabboTemplariosEditor: React.FC = () => {
  // Hooks removidos - usando fallbacks
  const getPaletteForCategory = (category: string) => [];
  const getFullAvatarUrl = (figure: string, gender: string, hotel: string, size: string, direction: string, headDirection: string) => '';
  
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [selection, setSelection] = useState<{ [type: string]: { setId: string; colorId?: string } | undefined }>({});
  const [direction, setDirection] = useState('l');
  const [figureString, setFigureString] = useState('hr-828-45.ch-665-92.lg-700-1.sh-705-1.hd-180-2');
  
  const updateSelection = (type: string, setId: string) => {
    setSelection(prev => ({ ...prev, [type]: { setId } }));
  };
  
  const updateColor = (type: string, colorId: string) => {
    setSelection(prev => ({ ...prev, [type]: { ...prev[type], colorId } }));
  };
  
  const resetSelection = () => {
    setSelection({});
    setFigureString('hr-828-45.ch-665-92.lg-700-1.sh-705-1.hd-180-2');
  };

  const [activeType, setActiveType] = useState<string>('hr');

  // Generate avatar URL
  const avatarUrl = useMemo(() => {
    const safeFigure = figureString || 'hr-828-45.ch-665-92.lg-700-1.sh-705-1.hd-180-2';
    return getFullAvatarUrl(safeFigure, gender, 'com', 'l', direction, '3');
  }, [figureString, gender, direction, getFullAvatarUrl]);

  // Handle item selection
  const onSelectItem = (type: string, setId: string) => {
    const palette = getPaletteForCategory(type);
    const firstSelectableColor = palette
      ? Object.entries(palette).find(([_, c]) => c.selectable === 1)?.[0]
      : '0';
    updateSelection(type, setId, firstSelectableColor);
  };

  // Copy figure string to clipboard
  const copyFigureString = async () => {
    try {
      await navigator.clipboard.writeText(figureString);
      // Could add toast notification here
    } catch (error) {
          }
  };

  // Copy avatar URL to clipboard
  const copyAvatarUrl = async () => {
    try {
      await navigator.clipboard.writeText(avatarUrl);
      // Could add toast notification here
    } catch (error) {
          }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-4 bg-white/50 p-3 rounded-lg">
        <div className="flex items-center gap-4">
          {/* Gender Toggle */}
          <div className="inline-flex rounded-lg overflow-hidden border border-gray-300">
            <button
              className={`px-3 py-2 text-sm transition-colors ${
                gender === 'M' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => setGender('M')}
            >
              Masculino
            </button>
            <button
              className={`px-3 py-2 text-sm transition-colors ${
                gender === 'F' ? 'bg-pink-500 text-white' : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => setGender('F')}
            >
              Feminino
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direction Controls */}
          <div className="flex gap-1">
            <button 
              className={`px-2 py-1 border rounded text-sm ${direction === '2' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => setDirection('2')}
              title="Direção Nordeste"
            >
              ↖
            </button>
            <button 
              className={`px-2 py-1 border rounded text-sm ${direction === '3' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => setDirection('3')}
              title="Direção Oeste"
            >
              ←
            </button>
            <button 
              className={`px-2 py-1 border rounded text-sm ${direction === '4' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => setDirection('4')}
              title="Direção Sudoeste"
            >
              ↙
            </button>
          </div>
          
          {/* Action Buttons */}
          <button 
            className="flex items-center gap-1 px-3 py-2 border rounded hover:bg-gray-100 text-sm"
            onClick={resetSelection}
            title="Resetar Avatar"
          >
            <RotateCcw className="w-4 h-4" />
            Resetar
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="flex items-start gap-6 bg-white/50 p-4 rounded-lg">
        {/* Avatar Preview */}
        <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg grid place-items-center bg-white/60">
          <img 
            src={avatarUrl} 
            alt="Preview do Avatar" 
            className="max-h-44 object-contain" 
            loading="lazy" 
          />
        </div>

        {/* Preview Info & Actions */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Preview do Avatar</h3>
            <p className="text-sm text-gray-600">
              Visualize seu avatar e copie o código ou a imagem para usar no Habbo.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyFigureString}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
            >
              <Copy className="w-4 h-4" />
              Copiar Código
            </button>
            
            <button
              onClick={copyAvatarUrl}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Copiar Imagem
            </button>
            
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm">
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <TemplariosCategoryNavigation
        activeType={activeType}
        onCategorySelect={setActiveType}
      />

      {/* Items Grid */}
      <TemplariosCategoryGrid
        activeType={activeType}
        gender={gender}
        selection={selection}
        onSelectItem={onSelectItem}
        onChangeColor={updateColor}
      />

      {/* Figure String Display */}
      <div className="mt-4 p-3 rounded-lg border bg-white/50 text-xs break-all">
        <div className="flex items-center justify-between mb-2">
          <strong className="text-sm">Código do Avatar:</strong>
          <button
            onClick={copyFigureString}
            className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Copiar
          </button>
        </div>
        <div className="font-mono text-gray-600">
          {figureString || '(vazio)'}
        </div>
      </div>
    </div>
  );
};

export default HabboTemplariosEditor;
