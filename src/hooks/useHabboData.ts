// src/hooks/useHabboData.ts
// Hook para acessar dados oficiais do Habbo

import { useMemo } from 'react';
import { HABBO_CLOTHING_SETS, getCategoryByType, filterSetsByGender, generateHabboImageUrl, type HabboClothingCategory, type HabboClothingSet } from '../services/HabboData';

export interface UseHabboDataOptions {
  selectedCategory?: string;
  selectedGender?: 'M' | 'F' | 'U' | 'all';
  showClubOnly?: boolean;
}

export const useHabboData = (options: UseHabboDataOptions = {}) => {
  const {
    selectedCategory,
    selectedGender = 'all',
    showClubOnly = false
  } = options;

  // Retorna todas as categorias
  const categories = useMemo(() => HABBO_CLOTHING_SETS, []);

  // Retorna a categoria selecionada
  const selectedCategoryData = useMemo(() => {
    if (!selectedCategory) return null;
    return getCategoryByType(selectedCategory);
  }, [selectedCategory]);

  // Filtra os sets da categoria selecionada
  const filteredSets = useMemo(() => {
    if (!selectedCategoryData) return [];
    let sets = selectedCategoryData.sets;

    // Filtrar por gênero
    sets = filterSetsByGender(sets, selectedGender);

    // Filtrar por status HC se necessário
    if (showClubOnly) {
      sets = sets.filter(set => set.club === true);
    }

    return sets;
  }, [selectedCategoryData, selectedGender, showClubOnly]);

  // Gera URLs de imagem para os itens
  const generateImageUrl = (itemId: number, color: string = "7", gender: 'M' | 'F' | 'U' = 'M') => {
    if (!selectedCategory) return '';
    return generateHabboImageUrl(selectedCategory, itemId, color, gender);
  };

  return {
    categories,
    selectedCategoryData,
    filteredSets,
    generateImageUrl,
    // Utilitários
    getCategoryByType,
    filterSetsByGender,
    generateHabboImageUrl
  };
};