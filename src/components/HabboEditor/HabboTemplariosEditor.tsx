import React, { useMemo, useState } from 'react';
import { palettesJSON, setsJSON, HabboFigureSet } from '@/data/habboTemplariosData';
import { getFullAvatarUrl, getSinglePartPreviewUrl } from '@/utils/partPreview';

// Editor HabboTemplarios - versão mínima funcional em PT-BR
// - Alterna gênero
// - Lista categorias (type)
// - Lista itens por categoria (filtrados por gênero)
// - Seleção de cores quando disponível com base em paletteid
// - Preview do avatar com figure string gerado

export type Gender = 'M' | 'F';

type Selection = {
  [type: string]: { setId: string; colorId?: string } | undefined;
};

const ORDER_HINT = ['hd', 'hr', 'ch', 'lg', 'sh', 'fa', 'ha', 'he', 'ea', 'wa'];

const HabboTemplariosEditor: React.FC = () => {
  const [gender, setGender] = useState<Gender>('M');
  const [activeType, setActiveType] = useState<string>('hr');
  const [selection, setSelection] = useState<Selection>({});
  const [direction, setDirection] = useState<'2' | '3' | '4'>('2');

  const categories = useMemo(() => {
    const types = setsJSON.map(s => s.type);
    // ordenar por dica + alfabético
    return [...types].sort((a, b) => {
      const ai = ORDER_HINT.indexOf(a);
      const bi = ORDER_HINT.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
  }, []);

  const setsByType: Record<string, HabboFigureSet> = useMemo(() => {
    const map: Record<string, HabboFigureSet> = {};
    setsJSON.forEach(s => (map[s.type] = s));
    return map;
  }, []);

  const currentSet = setsByType[activeType];

  const filteredItems = useMemo(() => {
    if (!currentSet) return [] as Array<{ id: string; data: any }>;
    return Object.entries(currentSet.sets)
      .filter(([_, data]) => data.selectable === 1)
      .filter(([_, data]) => data.gender === 'U' || data.gender === gender)
      .map(([id, data]) => ({ id, data }));
  }, [currentSet, gender]);

  const figureString = useMemo(() => {
    const parts: string[] = [];
    Object.entries(selection).forEach(([type, sel]) => {
      if (!sel) return;
      const colorId = sel.colorId ?? '0';
      parts.push(`${type}-${sel.setId}-${colorId}`);
    });
    return parts.join('.');
  }, [selection]);

  const avatarUrl = useMemo(() => {
    const safeFigure = figureString || `${activeType}-${filteredItems[0]?.id || '3090'}-0`;
    return getFullAvatarUrl(safeFigure, gender, 'com', 'l', direction, '3');
  }, [figureString, gender, direction, activeType, filteredItems]);

  const onSelectItem = (type: string, setId: string) => {
    const paletteId = currentSet?.paletteid?.toString();
    const palette = paletteId ? palettesJSON[paletteId] : undefined;
    const firstSelectableColor = palette
      ? Object.entries(palette).find(([_, c]) => c.selectable === 1)?.[0]
      : '0';
    setSelection(prev => ({ ...prev, [type]: { setId, colorId: firstSelectableColor } }));
  };

  const onChangeColor = (type: string, colorId: string) => {
    setSelection(prev => {
      const prevSel = prev[type];
      if (!prevSel) return prev;
      return { ...prev, [type]: { ...prevSel, colorId } };
    });
  };

  const onReset = () => setSelection({});

  return (
    <div className="space-y-4">
      {/* Controles superiores */}
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex rounded-lg overflow-hidden border">
          <button
            className={`px-3 py-2 text-sm ${gender === 'M' ? 'bg-white/70' : 'bg-white/30'}`}
            onClick={() => setGender('M')}
          >
            Masculino
          </button>
          <button
            className={`px-3 py-2 text-sm ${gender === 'F' ? 'bg-white/70' : 'bg-white/30'}`}
            onClick={() => setGender('F')}
          >
            Feminino
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-2 py-1 border rounded" onClick={() => setDirection('2')}>↖</button>
          <button className="px-2 py-1 border rounded" onClick={() => setDirection('3')}>←</button>
          <button className="px-2 py-1 border rounded" onClick={() => setDirection('4')}>↙</button>
          <button className="px-3 py-2 border rounded" onClick={onReset}>Resetar</button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-4">
        <div className="w-40 h-40 border rounded grid place-items-center bg-white/60">
          <img src={avatarUrl} alt="Prévia do avatar" className="max-h-36" loading="lazy" />
        </div>
        {/* Paleta de cores da categoria ativa (se aplicável) */}
        {currentSet?.paletteid && (
          <div className="flex-1">
            <p className="text-sm mb-2">Cores disponíveis:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(palettesJSON[currentSet.paletteid.toString()] || {}).map(([colorId, color]) => (
                <button
                  key={colorId}
                  className={`w-7 h-7 rounded-full border`} 
                  style={{ backgroundColor: `#${color.hex}` }}
                  title={`#${color.hex}`}
                  onClick={() => onChangeColor(activeType, colorId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Categorias */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-3 py-2 rounded border whitespace-nowrap ${activeType === type ? 'bg-white/70' : 'bg-white/30'}`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Itens da categoria */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredItems.map(item => {
          const isSelected = selection[activeType]?.setId === item.id;
          const colorId = selection[activeType]?.colorId ?? '0';
          const thumb = getSinglePartPreviewUrl(activeType, item.id, colorId, gender);
          return (
            <button
              key={item.id}
              onClick={() => onSelectItem(activeType, item.id)}
              className={`rounded-lg border bg-white/60 p-2 hover:bg-white/80 transition ${isSelected ? 'ring-2 ring-purple-400' : ''}`}
            >
              <div className="w-full aspect-square grid place-items-center">
                <img src={thumb} alt={`${activeType}-${item.id}`} className="max-h-full" loading="lazy" />
              </div>
              <div className="mt-2 text-xs text-center opacity-80">#{item.id}</div>
            </button>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="col-span-full text-center text-sm opacity-70">Sem itens para este gênero.</div>
        )}
      </div>

      {/* Figure string atual */}
      <div className="mt-2 p-3 rounded border bg-white/50 text-xs break-all">
        <strong>Figure atual:</strong> {figureString || '(vazio)'}
      </div>
    </div>
  );
};

export default HabboTemplariosEditor;
