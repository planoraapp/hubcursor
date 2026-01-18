// src/hooks/useHabboDataComplete.ts
// Hook que combina dados oficiais do Habbo com lógica de compatibilidade

import { useMemo } from 'react';
import { HABBO_CLOTHING_SETS, getCategoryByType, filterSetsByGender, generateHabboImageUrl, type HabboClothingCategory, type HabboClothingSet } from '../services/HabboData';
import { useHabboHubComplete } from './useHabboHubComplete';

export interface UseHabboDataCompleteOptions {
  selectedCategory?: string;
  selectedGender?: 'M' | 'F' | 'U' | 'all';
  showClubOnly?: boolean;
  useOfficialData?: boolean; // Se true, usa dados oficiais; se false, usa dados do serviço antigo
}

export const useHabboDataComplete = (options: UseHabboDataCompleteOptions = {}) => {
  const {
    selectedCategory,
    selectedGender = 'all',
    showClubOnly = false,
    useOfficialData = true
  } = options;

  // Hook antigo para compatibilidade
  const { data: legacyCategories, isLoading, error } = useHabboHubComplete();

  // Dados oficiais
  const officialCategories = useMemo(() => HABBO_CLOTHING_SETS, []);

  // Decide qual fonte de dados usar
  const categories = useMemo(() => {
    if (useOfficialData) {
      return officialCategories;
    }
    return legacyCategories || [];
  }, [useOfficialData, officialCategories, legacyCategories]);

  // Retorna a categoria selecionada
  const selectedCategoryData = useMemo(() => {
    if (!selectedCategory) return null;

    if (useOfficialData) {
      return getCategoryByType(selectedCategory);
    }

    // Modo legado
    return categories.find(cat => cat.type === selectedCategory);
  }, [selectedCategory, categories, useOfficialData]);

  // Filtra os sets/itens da categoria selecionada
  const filteredItems = useMemo(() => {
    if (!selectedCategoryData) return [];

    if (useOfficialData) {
      // Dados oficiais
      const categoryData = selectedCategoryData as HabboClothingCategory;
      let sets = categoryData.sets;

      // Filtrar por gênero
      sets = filterSetsByGender(sets, selectedGender);

      // Filtrar por status HC se necessário
      if (showClubOnly) {
        sets = sets.filter(set => set.club === true);
      }

      return sets;
    }

    // Modo legado
    const categoryData = selectedCategoryData as any;
    let items = categoryData.items || [];

    // Filter by gender if not 'all'
    if (selectedGender !== 'all') {
      items = items.filter((item: any) =>
        item.gender === 'U' || item.gender === selectedGender
      );
    }

    return items;
  }, [selectedCategoryData, selectedGender, showClubOnly, useOfficialData]);

  // Gera URLs de imagem para os itens
  const generateImageUrl = (itemId: string | number, color: string = "7", gender: 'M' | 'F' | 'U' = 'M') => {
    if (!selectedCategory) return '';

    const id = typeof itemId === 'string' ? parseInt(itemId) : itemId;

    if (useOfficialData) {
      return generateHabboImageUrl(selectedCategory, id, color, gender);
    }

    // Modo legado - compatibilidade
    const genderParam = selectedGender === 'all' ? 'M' : selectedGender;
    const headOnly = ['hr', 'hd', 'fa'].includes(selectedCategory) ? '&headonly=1' : '';

    // Para itens duotone ou camisetas, usar duas cores padrão
    const isDuotone = selectedCategory === 'ch';
    const figureString = isDuotone
      ? `${selectedCategory}-${itemId}-66-61`
      : `${selectedCategory}-${itemId}-${color}`;

    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${genderParam}&direction=2&head_direction=2&size=l${headOnly}&img_format=png`;
  };

  return {
    categories,
    selectedCategoryData,
    filteredItems,
    generateImageUrl,
    isLoading: useOfficialData ? false : isLoading,
    error: useOfficialData ? null : error,
    // Utilitários
    getCategoryByType,
    filterSetsByGender,
    generateHabboImageUrl,
    // Flag para saber qual modo está sendo usado
    isUsingOfficialData: useOfficialData
  };
};