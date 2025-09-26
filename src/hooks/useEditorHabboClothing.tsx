
import { useState, useEffect } from 'react';
import { useFlashAssetsViaJovem, ViaJovemFlashItem, useFlashViaJovemCategory } from './useFlashAssetsViaJovem';

export interface EditorHabboClothingItem extends ViaJovemFlashItem {
  // Usando a mesma estrutura do ViaJovem que já funciona
}

export const useEditorHabboClothing = () => {
  const { items, categoryStats, isLoading, error, totalItems } = useFlashAssetsViaJovem();
  
      return {
    items,
    categoryStats,
    isLoading,
    error,
    totalItems,
    source: 'flash-assets-viajovem'
  };
};

export const useEditorHabboCategory = (categoryId: string, gender: 'M' | 'F') => {
  const result = useFlashViaJovemCategory(categoryId, gender);
  
    return {
    ...result,
    items: result.items
  };
};
