import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface UnifiedHabboClothingItem {
  id: string;
  figureId: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  colors: string[];
  club: 'FREE' | 'HC';
  name: string;
  source: 'viajovem' | 'habbowidgets' | 'official-habbo' | 'flash-assets' | 'habbo-official';
  thumbnailUrl: string;
  isValidated?: boolean;
  // Informações adicionais do tutorial
  scientificCode?: string | null;
  isRare?: boolean;
  isLTD?: boolean;
  isNFT?: boolean;
  isHC?: boolean;
  swfUrl?: string;
  iconUrl?: string;
  rarity?: 'normal' | 'rare' | 'ltd' | 'nft' | 'hc';
  // Sistema duotone do tutorial
  isDuotone?: boolean;
  colorIndex?: string;
  // Propriedades do figuredata
  colorable?: boolean;
  selectable?: boolean;
  preselectable?: boolean;
  sellable?: boolean;
  paletteId?: string;
}

export interface UnifiedClothingData {
  [category: string]: UnifiedHabboClothingItem[];
}

export interface ColorPalette {
  id: string;
  hex: string;
}

export interface ColorPalettes {
  [paletteId: string]: ColorPalette[];
}

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
        const data = await fetchUnifiedClothingData();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load clothing data');
        setData({});
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

const fetchUnifiedClothingData = async (): Promise<UnifiedClothingData> => {
    console.log('🌐 [UnifiedHabboClothing] Fetching unified clothing data with OFFICIAL Habbo sources...');

    try {
      // Verificar se o Supabase está configurado
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Buscar dados de múltiplas fontes oficiais em paralelo
      const [figureDataResult, figureMapResult, furniDataResult] = await Promise.allSettled([
        supabase.functions.invoke('get-habbo-figuredata'),
        supabase.functions.invoke('get-habbo-figuremap'),
        supabase.functions.invoke('get-habbo-furnidata')
      ]);

      console.log('📊 [UnifiedHabboClothing] All sources fetched, processing...');

      // Processar figuredata (base principal)
      let figureData: Record<string, any[]> = {};
      let colorPalettes: ColorPalettes = {};
      if (figureDataResult.status === 'fulfilled' && figureDataResult.value.data?.figureParts) {
        figureData = figureDataResult.value.data.figureParts;
        colorPalettes = figureDataResult.value.data.colorPalettes || {};
        console.log('✅ [UnifiedHabboClothing] Figuredata loaded:', Object.keys(figureData).length, 'categories');
        console.log('🎨 [UnifiedHabboClothing] Color palettes loaded:', Object.keys(colorPalettes).length, 'palettes');
      }

      // Processar figuremap (códigos científicos e URLs SWF)
      let figureMapData: Record<string, any[]> = {};
      let swfUrls: Record<string, string> = {};
      let iconUrls: Record<string, string> = {};
      if (figureMapResult.status === 'fulfilled' && figureMapResult.value.data?.figureMapData) {
        figureMapData = figureMapResult.value.data.figureMapData;
        swfUrls = figureMapResult.value.data.swfUrls || {};
        iconUrls = figureMapResult.value.data.iconUrls || {};
        console.log('✅ [UnifiedHabboClothing] Figuremap loaded:', Object.keys(figureMapData).length, 'categories');
      }

      // Processar furnidata (classificação de raridade)
      let clothingRarity: Record<string, any[]> = {};
      let nftCollections: Record<string, any[]> = {};
      if (furniDataResult.status === 'fulfilled' && furniDataResult.value.data?.clothingRarity) {
        clothingRarity = furniDataResult.value.data.clothingRarity;
        nftCollections = furniDataResult.value.data.nftCollections || {};
        console.log('✅ [UnifiedHabboClothing] Furnidata loaded:', Object.keys(clothingRarity).length, 'categories');
      }

      // Unificar todos os dados
      const unifiedData: UnifiedClothingData = {};

      // Processar cada categoria do figuredata
      Object.entries(figureData).forEach(([category, items]) => {
        unifiedData[category] = items.map(item => {
          // Buscar código científico do figuremap
          const scientificCode = findScientificCode(figureMapData, category, item.id);
          
          // Buscar classificação de raridade do furnidata
          const rarityInfo = findClothingClassification(clothingRarity, category, item.id);
          
          // Gerar URLs baseadas no tutorial
          const swfUrl = swfUrls[`${category}-${item.id}`] || generateSwfUrl(scientificCode);
          const iconUrl = iconUrls[`${category}-${item.id}`] || generateIconUrl(scientificCode);

          return {
            id: `${category}-${item.id}`,
            figureId: item.id,
            category: category,
        gender: item.gender || 'U',
        colors: item.colors || ['1'],
            club: item.club === '2' ? 'HC' : 'FREE',
            name: `${getCategoryDisplayName(category)} ${item.id}`,
            source: 'habbo-official',
            thumbnailUrl: item.thumbnailUrl || generateThumbnailUrl(category, item.id, item.colors?.[0] || '1', item.gender),
            isValidated: true,
            // Informações do tutorial
            scientificCode: scientificCode,
            isRare: rarityInfo?.isRare || false,
            isLTD: rarityInfo?.isLTD || false,
            isNFT: rarityInfo?.isNFT || false,
            isHC: item.club === '2' || rarityInfo?.isHC || false,
            swfUrl: swfUrl,
            iconUrl: iconUrl,
            rarity: rarityInfo?.rarity || 'normal',
            // Sistema duotone
            isDuotone: item.isDuotone || false,
            colorIndex: item.colorIndex || '1',
            // Propriedades do figuredata
            colorable: item.colorable || false,
            selectable: item.selectable || true,
            preselectable: item.preselectable || false,
            sellable: item.sellable || false,
            paletteId: item.paletteId || getCorrectPaletteId(category)
          } as UnifiedHabboClothingItem;
        });
      });

      console.log('🎉 [UnifiedHabboClothing] Unified data created:', {
        categories: Object.keys(unifiedData).length,
        totalItems: Object.values(unifiedData).reduce((sum, items) => sum + items.length, 0)
      });

      return unifiedData;
    
  } catch (error) {
    console.error('❌ [UnifiedHabboClothing] Error:', error);
      
      // Retornar dados vazios em caso de erro para não quebrar a UI
      return {};
    }
};

  // Função para buscar código científico no figuremap
  const findScientificCode = (figureMapData: Record<string, any[]>, category: string, itemId: string): string | null => {
    if (!figureMapData[category]) return null;
    
    const item = figureMapData[category].find(item => item.id === itemId);
    return item?.scientificCode || null;
  };

  // Função para buscar classificação de raridade no furnidata
  const findClothingClassification = (clothingRarity: Record<string, any[]>, category: string, itemId: string) => {
    if (!clothingRarity[category]) return null;
    
    const item = clothingRarity[category].find(item => item.itemId === itemId);
    return item ? {
      isRare: item.isRare || false,
      isLTD: item.isLTD || false,
      isNFT: item.isNFT || false,
      isHC: item.isHC || false,
      rarity: item.rarity || 'normal'
    } : null;
  };

  // Função para obter nome da categoria
  const getCategoryDisplayName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      'hd': 'Rosto',
      'hr': 'Cabelo',
      'ch': 'Camisa',
      'cc': 'Casaco',
      'cp': 'Estampa',
      'ca': 'Acessório',
      'ea': 'Óculos',
      'fa': 'Máscara',
      'ha': 'Chapéu',
      'he': 'Acessório',
      'lg': 'Calça',
      'sh': 'Sapato',
      'wa': 'Cinto'
    };
    return categoryNames[category] || category;
  };

  // Função para determinar paleta correta baseada no tutorial
  const getCorrectPaletteId = (category: string): string => {
    const paletteMapping: Record<string, string> = {
      'hd': '1', // Rosto e Corpo - Paleta 1
      'hr': '2', // Cabelo/Penteados - Paleta 2
      'ch': '3', // Camisas - Paleta 3
      'cc': '3', // Casacos/Vestidos/Jaquetas - Paleta 3
      'cp': '3', // Estampas/Impressões - Paleta 3
      'ca': '3', // Bijuteria/Jóias - Paleta 3
      'ea': '3', // Óculos - Paleta 3
      'fa': '3', // Máscaras - Paleta 3
      'ha': '3', // Chapéus - Paleta 3
      'he': '3', // Acessórios - Paleta 3
      'lg': '3', // Calça - Paleta 3
      'sh': '3', // Sapato - Paleta 3
      'wa': '3'  // Cintos - Paleta 3
    };
    return paletteMapping[category] || '3';
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

  // Função para gerar URL de thumbnail usando habbo-imaging
  const generateThumbnailUrl = (category: string, itemId: string, colorId: string, gender: 'M' | 'F' | 'U'): string => {
    const baseAvatar = getBaseAvatarForCategory(category);
    const fullFigure = `${baseAvatar}.${category}-${itemId}-${colorId}`;
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${fullFigure}&gender=${gender}&direction=2&head_direction=2&size=s&img_format=png&gesture=std&action=std`;
  };

  // Função para gerar avatar base focado na categoria específica
  const getBaseAvatarForCategory = (category: string): string => {
    const baseAvatars: Record<string, string> = {
      'hd': 'hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'hr': 'hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92',
      'ch': 'hd-180-1.hr-828-45.lg-3116-92.sh-3297-92',
      'cc': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'lg': 'hd-180-1.hr-828-45.ch-3216-92.sh-3297-92',
      'sh': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92',
      'ha': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'ea': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'fa': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'he': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'ca': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'cp': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'wa': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92'
    };
    return baseAvatars[category] || 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92';
  };

  return {
    data,
    colorPalettes,
    isLoading,
    error,
    refetch: fetchUnifiedClothingData
  };
};