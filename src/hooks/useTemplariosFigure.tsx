
import { useState, useMemo } from 'react';

export type Gender = 'M' | 'F';

type Selection = {
  [type: string]: { setId: string; colorId?: string } | undefined;
};

export const useTemplariosFigure = () => {
  const [gender, setGender] = useState<Gender>('M');
  const [selection, setSelection] = useState<Selection>({});
  const [direction, setDirection] = useState<'2' | '3' | '4'>('2');

  // Generate figure string from selection
  const figureString = useMemo(() => {
    const parts: string[] = [];
    Object.entries(selection).forEach(([type, sel]) => {
      if (!sel) return;
      const colorId = sel.colorId ?? '0';
      parts.push(`${type}-${sel.setId}-${colorId}`);
    });
    return parts.join('.');
  }, [selection]);

  // Update selection for a category
  const updateSelection = (type: string, setId: string, colorId?: string) => {
    setSelection(prev => ({ 
      ...prev, 
      [type]: { setId, colorId: colorId || '0' } 
    }));
  };

  // Update color for existing selection
  const updateColor = (type: string, colorId: string) => {
    setSelection(prev => {
      const prevSel = prev[type];
      if (!prevSel) return prev;
      return { ...prev, [type]: { ...prevSel, colorId } };
    });
  };

  // Reset selection
  const resetSelection = () => setSelection({});

  // Remove category from selection
  const removeCategory = (type: string) => {
    setSelection(prev => {
      const newSelection = { ...prev };
      delete newSelection[type];
      return newSelection;
    });
  };

  return {
    gender,
    setGender,
    selection,
    direction,
    setDirection,
    figureString,
    updateSelection,
    updateColor,
    resetSelection,
    removeCategory
  };
};
