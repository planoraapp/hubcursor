
import { useState, useEffect } from 'react';
import { useFlashAssetsViaJovem, ViaJovemFlashItem, useFlashViaJovemCategory } from './useFlashAssetsViaJovem';

export interface EditorHabboClothingItem extends ViaJovemFlashItem {
  // Usando a mesma estrutura do ViaJovem que já funciona
}

export const useEditorHabboClothing = () => {
  const { items, categoryStats, isLoading, error, totalItems } = useFlashAssetsViaJovem();
  
  console.log('🎯 [EditorHabboClothing] Total items carregados:', totalItems);
  console.log('📊 [EditorHabboClothing] Estatísticas por categoria:', categoryStats);
  
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
  
  console.log(`🔍 [EditorHabboCategory] Categoria: ${categoryId}, Gênero: ${gender}, Items: ${result.items.length}`);
  
  return {
    ...result,
    items: result.items
  };
};
