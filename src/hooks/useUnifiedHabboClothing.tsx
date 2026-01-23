// src/hooks/useUnifiedHabboClothing.tsx
import { useState, useEffect } from 'react';
import { UnifiedClothingData, UnifiedHabboClothingItem, ColorPalettes } from '../types/clothing';
import { habboHubCompleteService } from '../services/HabboHubCompleteService';
import { mapSWFToHabboCategory, isValidHabboCategory } from '../utils/clothingCategoryMapper';

// Função para obter nome de exibição da categoria
const getCategoryDisplayName = (category: string): string => {
  const displayNames: Record<string, string> = {
    'hd': 'Rostos',
    'hr': 'Cabelos',
    'ch': 'Camisetas',
    'cc': 'Casacos',
    'lg': 'Calças',
    'sh': 'Sapatos',
    'ha': 'Chapéus',
    'ea': 'Óculos',
    'fa': 'Rosto',
    'he': 'Acess. Cabelo',
    'ca': 'Acessórios',
    'wa': 'Cintos',
    'cp': 'Estampas'
  };
  return displayNames[category] || category.toUpperCase();
};

// Função para gerar URL de thumbnail baseada na documentação oficial do Habbo
// Mostrar apenas a peça individual, não um avatar completo
const generateThumbnailUrl = (category: string, itemId: string, color: string, gender: string): string => {
  // Para thumbnails nos grids, mostrar apenas a peça individual
  // Isso evita mostrar "mocks" e permite ver cada item isoladamente
  const figureString = `${category}-${itemId}-${color}`;

  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${gender}&direction=2&head_direction=2&size=m&img_format=png`;
};

// Função para gerar URL SWF baseada no tutorial
const generateSwfUrl = (scientificCode: string | null): string => {
  if (!scientificCode) return '';
  const baseUrl = 'https://images.habbo.com/gordon/flash-assets-PRODUCTION-202504241358-338970472';
  return `${baseUrl}/${scientificCode}.swf`;
};

// Função para gerar URL do ícone baseada no tutorial
const generateIconUrl = (scientificCode: string | null): string => {
  if (!scientificCode) return '';
  const baseUrl = 'https://images.habbo.com/dcr/hof_furni/64917';
  return `${baseUrl}/clothing_${scientificCode}_icon.png`;
};

export const useUnifiedHabboClothing = () => {
  const [data, setData] = useState<UnifiedClothingData>({});
  const [colorPalettes, setColorPalettes] = useState<ColorPalettes>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // USAR APENAS DADOS REAIS DO HABBO via HabboHubCompleteService
        const habboHubData = await habboHubCompleteService.getCategories();
        const convertedData = convertHabboHubCompleteToUnified(habboHubData);

        // Filtrar apenas categorias que têm itens
        const filteredData = filterCategoriesWithItems(convertedData);
        console.log('🎯 [useUnifiedHabboClothing] Categorias filtradas (apenas com itens):', Object.keys(filteredData));

        setData(filteredData);
        setColorPalettes({});
        setError(null);

      } catch (error) {
        console.error('❌ [useUnifiedHabboClothing] Erro ao carregar dados reais:', error);
        setError('Erro ao carregar dados oficiais do Habbo');
        setData({});
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []); // Executar apenas uma vez

  return {
    data,
    colorPalettes,
    isLoading,
    error,
    refetch: () => {
      // Recarregar dados reais do Habbo
      window.location.reload();
    }
  };
};

// Função para filtrar apenas categorias que têm itens
const filterCategoriesWithItems = (data: UnifiedClothingData): UnifiedClothingData => {
  const filtered: UnifiedClothingData = {};

  Object.keys(data).forEach(categoryId => {
    if (data[categoryId] && data[categoryId].length > 0) {
      filtered[categoryId] = data[categoryId];
    }
  });

  return filtered;
};

// Função para converter dados completos do HabboHub para formato unificado
const convertHabboHubCompleteToUnified = (habboHubData: any[]): UnifiedClothingData => {
  const unifiedData: UnifiedClothingData = {};

  habboHubData.forEach(category => {
    if (category && category.items) {
      // Aplicar mapeamento correto para a categoria
      const mappedCategory = mapSWFToHabboCategory(category.id);

      // Validar categoria usando o mapeamento
      if (!isValidHabboCategory(mappedCategory)) {
        console.log(`⚠️ [convert] Categoria inválida pulada: ${mappedCategory}`);
        return; // Pular categoria inválida
      }
      
      unifiedData[mappedCategory] = category.items.map((item: any) => ({
        id: item.id,
        figureId: item.figureId,
        category: mappedCategory, // Usar categoria mapeada
        gender: item.gender,
        colors: item.colors,
        name: item.name,
        source: 'habbohub-complete',
        imageUrl: item.imageUrl,
        isColorable: item.isColorable,
        isSelectable: item.isSelectable,
        club: item.club === '2' ? 'HC' : 'FREE',
        // Propriedades de raridade baseadas na categorização do HabboHub
        isNFT: item.categoryType === 'NFT',
        isLTD: item.categoryType === 'LTD',
        isRare: item.categoryType === 'RARE',
        isHC: item.categoryType === 'HC',
        isSellable: item.categoryType === 'SELLABLE',
        isNormal: item.categoryType === 'NORMAL',
        rarity: item.categoryType === 'HC' ? 'hc' : 
                item.categoryType === 'NFT' ? 'nft' :
                item.categoryType === 'LTD' ? 'ltd' :
                item.categoryType === 'RARE' ? 'rare' : 'normal',
        colorable: item.isColorable,
        isDuotone: item.isDuotone,
        // Metadados adicionais do HabboHub
        furnidataClass: item.furnidataClass,
        furnidataFurniline: item.furnidataFurniline,
        duotoneImageUrl: item.duotoneImageUrl
      }));
    }
  });
  
  return unifiedData;
};