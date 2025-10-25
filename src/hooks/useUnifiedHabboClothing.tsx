// src/hooks/useUnifiedHabboClothing.tsx
import { useState, useEffect } from 'react';
import { UnifiedClothingData, UnifiedHabboClothingItem, ColorPalettes } from '../types/clothing';
import { viaJovemCompleteService } from '../services/ViaJovemCompleteService';
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
const generateThumbnailUrl = (category: string, itemId: string, color: string, gender: string): string => {
  const baseAvatars: Record<string, string> = {
    'hd': 'hr-828-45.hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92',
    'hr': 'hr-828-45.hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92',
    'sh': 'hr-828-45.hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92',
    'lg': 'hr-828-45.hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92',
    'ha': 'hr-828-45.hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92',
    'he': 'hr-828-45.hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92',
    'ea': 'hr-828-45.hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92',
    'fa': 'hr-828-45.hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92',
    'cp': 'hr-828-45.hd-180-1.lg-3116-92.sh-3297-92',
    'cc': 'hr-828-45.hd-180-1.lg-3116-92.sh-3297-92',
    'ca': 'hr-828-45.hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92',
    'wa': 'hr-828-45.hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92'
  };
  return baseAvatars[category] || 'hr-828-45.hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92';
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
        // USAR APENAS DADOS REAIS DO HABBO via ViaJovemCompleteService
        console.log('🎯 [useUnifiedHabboClothing] Carregando apenas dados reais do Habbo...');
        const viaJovemData = await viaJovemCompleteService.getCategories();
        const convertedData = convertViaJovemCompleteToUnified(viaJovemData);
        
        setData(convertedData);
        setColorPalettes({});
        setError(null);
        
        // Log de estatísticas por categoria
        console.log(`📊 [useUnifiedHabboClothing] Estatísticas por categoria:`);
        Object.entries(convertedData).forEach(([category, items]) => {
          console.log(`  ${category} (${getCategoryDisplayName(category)}): ${items.length} itens`);
        });
        
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

// Função para converter dados completos da ViaJovem para formato unificado
const convertViaJovemCompleteToUnified = (viaJovemData: any[]): UnifiedClothingData => {
  const unifiedData: UnifiedClothingData = {};
  
  viaJovemData.forEach(category => {
    if (category && category.items) {
      // Aplicar mapeamento correto para a categoria
      const mappedCategory = mapSWFToHabboCategory(category.id);
      
      // Validar categoria usando o mapeamento
      if (!isValidHabboCategory(mappedCategory)) {
        return; // Pular categoria inválida
      }
      
      unifiedData[mappedCategory] = category.items.map((item: any) => ({
        id: item.id,
        figureId: item.figureId,
        category: mappedCategory, // Usar categoria mapeada
        gender: item.gender,
        colors: item.colors,
        name: item.name,
        source: 'viajovem-complete',
        imageUrl: item.imageUrl,
        isColorable: item.isColorable,
        isSelectable: item.isSelectable,
        club: item.club === '2' ? 'HC' : 'FREE',
        // Propriedades de raridade baseadas na categorização da ViaJovem
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
        // Metadados adicionais da ViaJovem
        furnidataClass: item.furnidataClass,
        furnidataFurniline: item.furnidataFurniline,
        duotoneImageUrl: item.duotoneImageUrl
      }));
    }
  });
  
  return unifiedData;
};