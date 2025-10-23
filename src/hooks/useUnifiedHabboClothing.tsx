import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { usePuhekuplaClothing } from './usePuhekuplaData';
import { realFigureDataService } from '@/services/RealFigureDataService';
import { viaJovemCompleteService } from '@/services/ViaJovemCompleteService';
import { mapSWFToHabboCategory, isValidHabboCategory } from '@/utils/clothingCategoryMapper';

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
  isSellable?: boolean;
  isNormal?: boolean;
  swfUrl?: string;
  iconUrl?: string;
  rarity?: 'normal' | 'rare' | 'ltd' | 'nft' | 'hc' | 'sellable';
  // Sistema duotone do tutorial
  isDuotone?: boolean;
  colorIndex?: string;
  // Propriedades do figuredata
  colorable?: boolean;
  selectable?: boolean;
  preselectable?: boolean;
  sellable?: boolean;
  paletteId?: string;
  // Propriedades do furnidata para detecção automática
  furniline?: string;
  classname?: string;
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

// Função para obter nome da categoria baseado na documentação oficial do Habbo
const getCategoryDisplayName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    // CORPO - Rostos
    'hd': 'Rostos',
    
    // CABEÇA - Cabelos
    'hr': 'Cabelos',
    
    // CABEÇA - Chapéus
    'ha': 'Chapéus',
    
    // CABEÇA - Acessórios de Cabelo
    'he': 'Acess. Cabelo',
    
    // CABEÇA - Óculos
    'ea': 'Óculos',
    
    // CABEÇA - Rosto (acessórios faciais)
    'fa': 'Rosto',
    
    // TORSO - Camisetas
    'ch': 'Camisetas',
    
    // TORSO - Casacos
    'cc': 'Casacos',
    
    // TORSO - Estampas/Impressões
    'cp': 'Estampas',
    
    // TORSO - Acessórios
    'ca': 'Acessórios',
    
    // PERNAS - Calça
    'lg': 'Calças',
    
    // PERNAS - Sapato
    'sh': 'Sapatos',
    
    // PERNAS - Cintos (acessórios para a parte inferior)
    'wa': 'Cintos',
    
    // Categorias adicionais (não oficiais mas encontradas nos dados)
    'bd': 'Corpos',
    'rh': 'Mão Direita',
    'lh': 'Mão Esquerda',
    'dr': 'Vestidos',
    'sk': 'Saias',
    'su': 'Trajes'
  };
  return categoryNames[category] || category;
};

// Função para determinar paleta correta baseada na documentação oficial do Habbo
const getCorrectPaletteId = (category: string): string => {
  const paletteMapping: Record<string, string> = {
    // Paleta 1 - Cores para pele (Rosto e Corpo)
    'hd': '1', // Rosto e Corpo - Paleta 1
    
    // Paleta 2 - Cores para cabelo
    'hr': '2', // Cabelo/Penteados - Paleta 2
    
    // Paleta 3 - Cores para roupas de 1 ou 2 cores
    'ch': '3', // Camisas - Paleta 3
    'cc': '3', // Casacos/Vestidos/Jaquetas - Paleta 3
    'cp': '3', // Estampas/Impressões - Paleta 3
    'ca': '3', // Bijuteria/Jóias (acessórios de topo) - Paleta 3
    'ea': '3', // Óculos - Paleta 3
    'fa': '3', // Máscaras (acessórios faciais) - Paleta 3
    'ha': '3', // Chapéus - Paleta 3
    'he': '3', // Acessórios de Cabeça - Paleta 3
    'lg': '3', // Calça - Paleta 3
    'sh': '3', // Sapato - Paleta 3
    'wa': '3'  // Cintos (acessórios para a parte inferior) - Paleta 3
  };
  return paletteMapping[category] || '3';
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
    'ch': 'hr-828-45.hd-180-1.lg-3116-92.sh-3297-92',
    'lg': 'hr-828-45.hd-180-1.ch-3216-92.sh-3297-92',
    'sh': 'hr-828-45.hd-180-1.ch-3216-92.lg-3116-92',
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
  
  // Buscar dados do Puhekupla para todas as categorias
  const puhekuplaData = usePuhekuplaClothing(1);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // PRIORIDADE 1: Tentar carregar dados completos da ViaJovem (figuredata.xml + furnidata.json)
                const viaJovemData = await viaJovemCompleteService.getCategories();
        const convertedData = convertViaJovemCompleteToUnified(viaJovemData);
        setError(null);
        setData(convertedData);
        setColorPalettes({});
                return; // Sucesso, não tentar outros métodos
        
      } catch (viaJovemError) {
                try {
          // PRIORIDADE 2: Tentar carregar dados do Puhekupla
          if (puhekuplaData.data?.result?.clothing) {
                        const puhekuplaUnified = convertPuhekuplaToUnified(puhekuplaData.data.result.clothing);
            setData(puhekuplaUnified);
            setColorPalettes({});
            return; // Sucesso, não tentar outros métodos
          }
        } catch (puhekuplaError) {
                  }
        
        try {
          // PRIORIDADE 3: Tentar carregar dados reais do figuredata.json
                    const realData = await realFigureDataService.loadRealFigureData();
          const convertedData = convertRealFigureDataToUnified(realData);
          setError(null);
          setData(convertedData);
          setColorPalettes({});
                    return; // Sucesso, não tentar outros métodos
          
        } catch (realDataError) {
                    try {
            // PRIORIDADE 4: Tentar APIs do Supabase (que estão com erro 500)
            const result = await fetchUnifiedClothingData();
            setData(result);
            setColorPalettes({});
                        return; // Sucesso, não tentar outros métodos
            
          } catch (supabaseError) {
                        setError(null);
            setData(generateMockUnifiedData());
            setColorPalettes({});
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [puhekuplaData.data]);

const fetchUnifiedClothingData = async (): Promise<UnifiedClothingData> => {
        try {
      // Verificar se o Supabase está configurado
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Buscar dados de múltiplas fontes oficiais em paralelo
      const [figureDataResult, figureMapResult, furniDataResult] = await Promise.allSettled([
        supabase.functions.invoke('get-habbo-figuredata').catch(err => {
                    throw err;
        }),
        supabase.functions.invoke('get-habbo-figuremap').catch(err => {
                    throw err;
        }),
        supabase.functions.invoke('get-habbo-furnidata').catch(err => {
                    throw err;
        })
      ]);

            // Processar figuredata (base principal)
      let figureData: Record<string, any[]> = {};
      let colorPalettes: ColorPalettes = {};
      if (figureDataResult.status === 'fulfilled' && figureDataResult.value.data?.figureParts) {
        figureData = figureDataResult.value.data.figureParts;
        colorPalettes = figureDataResult.value.data.colorPalettes || {};
        console.log('✅ [UnifiedHabboClothing] Figuredata loaded:', Object.keys(figureData).length, 'categories');
        console.log('🎨 [UnifiedHabboClothing] Color palettes loaded:', Object.keys(colorPalettes).length, 'palettes');
      } else {
        // Fallback: usar dados locais
                try {
          const localFigureData = await fetch('/figuredata.json').then(res => res.json());
          figureData = localFigureData;
          console.log('✅ [UnifiedHabboClothing] Local figuredata loaded:', Object.keys(figureData).length, 'categories');
        } catch (localError) {
                  }
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
      } else {
        // Fallback: carregar figuremap local
                try {
          const localFigureMapResponse = await fetch('/handitems/gamedata/figuremap.xml');
          if (localFigureMapResponse.ok) {
            const figureMapXml = await localFigureMapResponse.text();
            figureMapData = parseFigureMapXml(figureMapXml);
            console.log('✅ [UnifiedHabboClothing] Local figuremap loaded:', Object.keys(figureMapData).length, 'categories');
          }
        } catch (localError) {
                  }
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
        if (!Array.isArray(items)) {
                    unifiedData[category] = [];
          return;
        }
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
            name: scientificCode || `${getCategoryDisplayName(category)} ${item.id}`,
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
          // Retornar dados vazios em caso de erro para não quebrar a UI
      return {};
    }
};

  // Função para parsear o XML do figuremap e extrair nomes científicos
  const parseFigureMapXml = (xmlText: string): Record<string, any[]> => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const figureMapData: Record<string, any[]> = {};
    
    // Extrair todas as bibliotecas (libs) que contêm os nomes científicos
    const libs = xmlDoc.querySelectorAll('lib');
    
    libs.forEach(lib => {
      const libId = lib.getAttribute('id');
      if (libId) {
        // Extrair partes da biblioteca
        const parts = lib.querySelectorAll('part');
        
        parts.forEach(part => {
          const partId = part.getAttribute('id');
          const partType = part.getAttribute('type');
          
          if (partId && partType) {
            // Criar entrada no figureMapData
            if (!figureMapData[partType]) {
              figureMapData[partType] = [];
            }
            
            figureMapData[partType].push({
              id: partId,
              scientificCode: libId, // O nome científico é o ID da lib
              swfUrl: `/handitems/dcr/${libId}.swf`
            });
          }
        });
      }
    });
    
    console.log('📋 [UnifiedHabboClothing] Parsed figuremap XML:', Object.keys(figureMapData).length, 'categories');
    return figureMapData;
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

  // Helper functions are now defined outside the hook
  
  return {
    data,
    colorPalettes,
    isLoading,
    error,
    refetch: fetchUnifiedClothingData
  };
};

// Função para converter dados do Puhekupla para formato unificado
const convertPuhekuplaToUnified = (puhekuplaClothing: any[]): UnifiedClothingData => {
  const unifiedData: UnifiedClothingData = {};
  
    puhekuplaClothing.forEach((item, index) => {
    // Extrair categoria do código (ex: 'ch-665' -> 'ch')
    let category = '';
    let figureId = '';
    
    if (item.code && typeof item.code === 'string') {
      const codeParts = item.code.split('-');
      category = codeParts[0];
      figureId = codeParts.slice(1).join('-') || codeParts[0];
    } else {
            return; // Pular item inválido
    }
    
    // Aplicar mapeamento correto baseado nos padrões SWF do Habbo
    const mappedCategory = mapSWFToHabboCategory(item.code || category);
    
    // Validar categoria usando o mapeamento
    if (!isValidHabboCategory(mappedCategory)) {
            return; // Pular categoria inválida
    }
    
    // Usar a categoria mapeada
    category = mappedCategory;
    
    if (!unifiedData[category]) {
      unifiedData[category] = [];
    }
    
    
    // Detectar raridade baseada no nome real do Puhekupla
    const assetName = (item.name || '').toLowerCase();
    const itemCode = item.code.toLowerCase();
    
    // Sistema de detecção automática baseado nos nomes reais do Puhekupla
    const nftCollections = ['nft2025', 'nft2024', 'nft2023', 'nft', 'nftmint', 'testing'];
    const isNFT = assetName.includes('nft') || 
                  nftCollections.some(collection => assetName.includes(collection)) ||
                  itemCode.includes('nft');
    
    const isLTD = assetName.includes('ltd') || 
                  assetName.includes('limited') || 
                  assetName.includes('loyalty') ||
                  itemCode.includes('ltd');
    
    const isRare = assetName.includes('_r_') || 
                   assetName.includes('rare') ||
                   itemCode.includes('_r_');
    
    const isHC = assetName.includes('_hc') || 
                 assetName.includes('club') ||
                 itemCode.includes('hc');
    
    const isSellable = assetName.includes('sellable') || 
                       assetName.includes('vend') ||
                       itemCode.includes('sellable');
    
    const isNormal = !isNFT && !isLTD && !isRare && !isHC && !isSellable;
    
    // Determinar rarity final
    let finalRarity: 'normal' | 'rare' | 'ltd' | 'nft' | 'hc' | 'sellable' = 'normal';
    if (isNFT) finalRarity = 'nft';
    else if (isLTD) finalRarity = 'ltd';
    else if (isRare) finalRarity = 'rare';
    else if (isHC) finalRarity = 'hc';
    else if (isSellable) finalRarity = 'sellable';
    
    // Gerar thumbnailUrl baseada na documentação oficial do Habbo se não disponível
    const thumbnailUrl = item.image || 
      generateThumbnailUrl(category, figureId, '1', item.gender || 'U');
    
    // Converter para formato unificado
      const unifiedItem: UnifiedHabboClothingItem = {
      id: `${category}-${figureId}`,
      figureId: figureId,
      category: category,
        gender: item.gender || 'U',
      club: isHC ? 'HC' : 'FREE',
      name: item.name || `${getCategoryDisplayName(category)} ${figureId}`,
      scientificCode: item.name || `${category.toUpperCase()}-${figureId}`,
      source: 'habbo-official',
      thumbnailUrl: thumbnailUrl,
      colorable: true,
      selectable: true,
      colors: item.colors ? item.colors.split(',') : ['1', '2', '3', '4', '5', '6', '7'],
      isDuotone: false,
      rarity: finalRarity,
      furniline: undefined,
      classname: undefined,
      // Propriedades de raridade detectadas
      isNFT,
      isLTD,
      isRare,
      isHC,
      isSellable,
      isNormal,
      // Paleta correta baseada na documentação oficial
      paletteId: getCorrectPaletteId(category)
    };
    
    unifiedData[category].push(unifiedItem);
    
    // Debug: mostrar detecção de badges para itens especiais
    if (isNFT || isLTD || isRare || isHC || isSellable) {
          }
  });
  
  return unifiedData;
};

// Função para converter dados reais do figuredata para formato unificado
const convertRealFigureDataToUnified = (realData: any): UnifiedClothingData => {
  const unifiedData: UnifiedClothingData = {};
  
  Object.entries(realData).forEach(([categoryId, categoryData]: [string, any]) => {
    if (categoryData && categoryData.items) {
      // Aplicar mapeamento correto para a categoria
      const mappedCategory = mapSWFToHabboCategory(categoryId);
      
      // Validar categoria usando o mapeamento
      if (!isValidHabboCategory(mappedCategory)) {
        return; // Pular categoria inválida
      }
      
      unifiedData[mappedCategory] = categoryData.items.map((item: any) => ({
        id: item.id,
        figureId: item.figureId,
        category: mappedCategory, // Usar categoria mapeada
        gender: item.gender,
        colors: item.colors,
        name: item.name,
        source: 'real-figuredata',
        imageUrl: item.imageUrl,
        isColorable: item.isColorable,
        isSelectable: item.isSelectable,
        club: item.club,
        // Propriedades de raridade (detectar baseado no nome e club)
        isNFT: item.name.toLowerCase().includes('nft') || item.club === 'NFT',
        isLTD: item.name.toLowerCase().includes('ltd') || item.club === 'LTD',
        isRare: item.name.toLowerCase().includes('rare') || item.club === 'RARE',
        isHC: item.club === 'HC',
        isSellable: item.name.toLowerCase().includes('sellable') || item.club === 'SELLABLE',
        isNormal: !item.name.toLowerCase().includes('nft') && 
                  !item.name.toLowerCase().includes('ltd') && 
                  !item.name.toLowerCase().includes('rare') && 
                  item.club === 'FREE',
        rarity: item.club === 'HC' ? 'hc' : 
                item.name.toLowerCase().includes('nft') ? 'nft' :
                item.name.toLowerCase().includes('ltd') ? 'ltd' :
                item.name.toLowerCase().includes('rare') ? 'rare' : 'normal',
        colorable: item.isColorable,
        isDuotone: item.colors && item.colors.length > 1
      }));
    }
  });
  
  return unifiedData;
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

// Função para gerar dados mock quando as APIs falharem
const generateMockUnifiedData = (): UnifiedClothingData => {
  const mockData: UnifiedClothingData = {};
  
  const categories = ['hd', 'hr', 'ch', 'cc', 'lg', 'sh', 'ha', 'ea', 'fa', 'he', 'ca', 'wa', 'cp'];
  const genders: Array<'M' | 'F' | 'U'> = ['M', 'F', 'U'];
  
  categories.forEach(category => {
    mockData[category] = [];
    
    if (category === 'lg') {
      // Dados específicos de calças baseados no exemplo fornecido
      const pantsData = [
        // HC (Habbo Club) - 22 calças
        { id: '3006', name: 'Calça HC 3006', rarity: 'hc', isDuotone: true },
        { id: '3017', name: 'Calça HC 3017', rarity: 'hc', isDuotone: true },
        { id: '3018', name: 'Calça HC 3018', rarity: 'hc', isDuotone: false },
        { id: '3019', name: 'Calça HC 3019', rarity: 'hc', isDuotone: false },
        { id: '3047', name: 'Calça HC 3047', rarity: 'hc', isDuotone: false },
        { id: '3057', name: 'Calça HC 3057', rarity: 'hc', isDuotone: false },
        { id: '3058', name: 'Calça HC 3058', rarity: 'hc', isDuotone: false },
        { id: '3061', name: 'Calça HC 3061', rarity: 'hc', isDuotone: false },
        { id: '3136', name: 'Calça HC 3136', rarity: 'hc', isDuotone: false },
        { id: '3138', name: 'Calça HC 3138', rarity: 'hc', isDuotone: true },
        { id: '3166', name: 'Calça HC 3166', rarity: 'hc', isDuotone: false },
        { id: '3174', name: 'Calça HC 3174', rarity: 'hc', isDuotone: true },
        { id: '3190', name: 'Calça HC 3190', rarity: 'hc', isDuotone: true },
        { id: '3191', name: 'Calça HC 3191', rarity: 'hc', isDuotone: true },
        { id: '3192', name: 'Calça HC 3192', rarity: 'hc', isDuotone: false },
        { id: '3202', name: 'Calça HC 3202', rarity: 'hc', isDuotone: true },
        { id: '3235', name: 'Calça HC 3235', rarity: 'hc', isDuotone: false },
        { id: '3257', name: 'Calça HC 3257', rarity: 'hc', isDuotone: false },
        { id: '3267', name: 'Calça HC 3267', rarity: 'hc', isDuotone: true },
        { id: '3282', name: 'Calça HC 3282', rarity: 'hc', isDuotone: false },
        { id: '3283', name: 'Calça HC 3283', rarity: 'hc', isDuotone: true },
        { id: '3502', name: 'Calça HC 3502', rarity: 'hc', isDuotone: false },
        
        // Sellable (Vendáveis) - 80 calças
        { id: '3320', name: 'Jeans pula-brejo', rarity: 'sellable', isDuotone: true },
        { id: '3328', name: 'Jeans rasgados', rarity: 'sellable', isDuotone: true },
        { id: '3333', name: 'Fantasia de Sereia', rarity: 'sellable', isDuotone: false },
        { id: '3337', name: 'Fantasia Felina', rarity: 'sellable', isDuotone: false },
        { id: '3341', name: 'Saia tribal', rarity: 'sellable', isDuotone: true },
        { id: '3353', name: 'Leggings de estampa animal', rarity: 'sellable', isDuotone: false },
        { id: '3355', name: 'Saia máxi floral', rarity: 'sellable', isDuotone: true },
        { id: '3361', name: 'Mocky Maus', rarity: 'sellable', isDuotone: false },
        { id: '3364', name: 'Kimono Floral', rarity: 'sellable', isDuotone: true },
        { id: '3365', name: 'Kimono Azul', rarity: 'sellable', isDuotone: false },
        { id: '3384', name: 'Cybertraje', rarity: 'sellable', isDuotone: true },
        { id: '3387', name: 'Saia de skatista', rarity: 'sellable', isDuotone: true },
        { id: '3391', name: 'Short de bala', rarity: 'sellable', isDuotone: true },
        { id: '3401', name: 'Menina gulosa', rarity: 'sellable', isDuotone: true },
        { id: '3407', name: 'Uniforme militar de desfile', rarity: 'sellable', isDuotone: true },
        { id: '3408', name: 'Uniforme militar de desfile', rarity: 'sellable', isDuotone: true },
        { id: '3418', name: 'Uniforme de recruta', rarity: 'sellable', isDuotone: false },
        { id: '3434', name: 'Roupa Dino', rarity: 'sellable', isDuotone: true },
        { id: '3449', name: 'Armadura do Cavaleiro Brilhante', rarity: 'sellable', isDuotone: false },
        { id: '3460', name: 'Calça do papai Noel', rarity: 'sellable', isDuotone: false },
        { id: '3483', name: 'Calça do Pijama', rarity: 'sellable', isDuotone: true },
        { id: '3521', name: 'Calça Esportiva', rarity: 'sellable', isDuotone: true },
        { id: '3526', name: 'Roupa Conforto Máximo', rarity: 'sellable', isDuotone: true },
        { id: '3596', name: 'Visual Princesa do Deserto', rarity: 'sellable', isDuotone: true },
        { id: '3607', name: 'Pernas Armadura Medieval de Aço', rarity: 'sellable', isDuotone: true },
        { id: '3626', name: 'Calças Vitorianas', rarity: 'sellable', isDuotone: true },
        { id: '3695', name: 'Saia Harajuku', rarity: 'sellable', isDuotone: false },
        { id: '3787', name: 'Calça Rasgada Grunge', rarity: 'sellable', isDuotone: true },
        { id: '3842', name: 'Saia Hippie', rarity: 'sellable', isDuotone: true },
        { id: '3864', name: 'Traje Boneco de Neve', rarity: 'sellable', isDuotone: false },
        { id: '3915', name: 'Calça Yoga', rarity: 'sellable', isDuotone: true },
        { id: '3933', name: 'Traje Chef Chocolatier', rarity: 'sellable', isDuotone: false },
        { id: '3950', name: 'Sari', rarity: 'sellable', isDuotone: true },
        { id: '3968', name: 'Toalha na Cintura', rarity: 'sellable', isDuotone: false },
        { id: '4012', name: 'Saia Teia de Aranha', rarity: 'sellable', isDuotone: false },
        { id: '4017', name: 'Calça Cyberpunk', rarity: 'sellable', isDuotone: true },
        { id: '4034', name: 'Kilt Tartan', rarity: 'sellable', isDuotone: true },
        { id: '4066', name: 'Calça Cintura Alta', rarity: 'sellable', isDuotone: false },
        { id: '4081', name: 'Calça Moletom Camuflada', rarity: 'sellable', isDuotone: false },
        { id: '4082', name: 'Calça Moletom Tie-Dye Dark', rarity: 'sellable', isDuotone: false },
        { id: '4083', name: 'Calça Moletom Tie-Dye Arco-Íris', rarity: 'sellable', isDuotone: false },
        { id: '4092', name: 'Calças Couro Vegano', rarity: 'sellable', isDuotone: false },
        { id: '4102', name: 'Calça Moletom Geométrica', rarity: 'sellable', isDuotone: true },
        { id: '4113', name: 'Calça Hip-Hop', rarity: 'sellable', isDuotone: true },
        { id: '4114', name: 'Calça Moletom Básica', rarity: 'sellable', isDuotone: true },
        { id: '4119', name: 'Saia Holográfica', rarity: 'sellable', isDuotone: false },
        { id: '4125', name: 'Calça Moletom Multicor', rarity: 'sellable', isDuotone: false },
        { id: '4167', name: 'Traje Disco', rarity: 'sellable', isDuotone: false },
        { id: '4306', name: 'Teletubbies - Visual Tinky Winky', rarity: 'sellable', isDuotone: false },
        { id: '4309', name: 'Teletubbies - Visual Dipsy', rarity: 'sellable', isDuotone: false },
        { id: '4312', name: 'Teletubbies - Visual Laa-Laa', rarity: 'sellable', isDuotone: false },
        { id: '4315', name: 'Teletubbies - Visual Po', rarity: 'sellable', isDuotone: false },
        { id: '4341', name: 'Visual Explorador da Vida Selvagem', rarity: 'sellable', isDuotone: false },
        { id: '4358', name: 'Saia My Melody', rarity: 'sellable', isDuotone: false },
        { id: '4369', name: 'Saia Punk H-Pop Idols', rarity: 'sellable', isDuotone: true },
        { id: '4373', name: 'Calça Grunge H-Pop Idols', rarity: 'sellable', isDuotone: false },
        { id: '4375', name: 'Saia Hanbok', rarity: 'sellable', isDuotone: false },
        { id: '4934', name: 'Traje Feudal', rarity: 'sellable', isDuotone: true },
        { id: '5119', name: 'Calça Patchwork Customizada', rarity: 'sellable', isDuotone: true },
        { id: '5152', name: 'Calça Sellable 5152', rarity: 'sellable', isDuotone: false },
        { id: '5163', name: 'Calça Sellable 5163', rarity: 'sellable', isDuotone: false },
        { id: '5312', name: 'Traje Mamãe Noel Tropical', rarity: 'sellable', isDuotone: true },
        { id: '5332', name: 'Calça Sellable 5332', rarity: 'sellable', isDuotone: false },
        { id: '5363', name: 'Traje Biscoito Natalino', rarity: 'sellable', isDuotone: false },
        { id: '5545', name: 'Calça Cargo Tech', rarity: 'sellable', isDuotone: true },
        { id: '5582', name: 'Conjunto Moletom Habbo Couture', rarity: 'sellable', isDuotone: true },
        { id: '5594', name: 'Calça Cargo Baggy', rarity: 'sellable', isDuotone: false },
        { id: '5632', name: 'Traje de Líder', rarity: 'sellable', isDuotone: false },
        { id: '5732', name: 'Smoking de Baile Sangrento', rarity: 'sellable', isDuotone: true },
        { id: '5745', name: 'Traje Mariachi', rarity: 'sellable', isDuotone: true },
        { id: '5909', name: 'Biquíni de Crochê', rarity: 'sellable', isDuotone: true },
        { id: '5927', name: 'Shortinho Suspensório Coelhinho', rarity: 'sellable', isDuotone: true },
        { id: '5970', name: 'Calças Bratz Eitan', rarity: 'sellable', isDuotone: false },
        { id: '5974', name: 'Saia Bratz Jade', rarity: 'sellable', isDuotone: true },
        { id: '6000', name: 'Biquíni Ombro Único', rarity: 'sellable', isDuotone: false },
        { id: '6017', name: 'Traje do Boto', rarity: 'sellable', isDuotone: true },
        { id: '6088', name: 'Biquíni Babados', rarity: 'sellable', isDuotone: true },
        { id: '6089', name: 'Traje de Banho', rarity: 'sellable', isDuotone: true },
        { id: '6123', name: 'Skatista Pro', rarity: 'sellable', isDuotone: true },
        
        // LTD (Limited) - 2 calças
        { id: '5113', name: 'Traje Coelhinho Eco-Solar LTD', rarity: 'ltd', isDuotone: false },
        { id: '5190', name: 'Traje Entidade do Fogo', rarity: 'ltd', isDuotone: false },
        
        // Raro - 10 calças
        { id: '3781', name: 'Saia Plissada Romântica', rarity: 'rare', isDuotone: true },
        { id: '3924', name: 'Macacão Coelhinho', rarity: 'rare', isDuotone: true },
        { id: '4002', name: 'Visual Elegância Gótica', rarity: 'rare', isDuotone: true },
        { id: '4011', name: 'Visual Abóbora', rarity: 'rare', isDuotone: false },
        { id: '4138', name: 'Traje Muay Thai', rarity: 'rare', isDuotone: false },
        { id: '4191', name: 'Traje Shinobi', rarity: 'rare', isDuotone: true },
        { id: '5022', name: 'Look Árvore de Natal', rarity: 'rare', isDuotone: true },
        { id: '5165', name: 'Visual Estudante de Artes', rarity: 'rare', isDuotone: true },
        { id: '5243', name: 'Look Urbano', rarity: 'rare', isDuotone: false },
        { id: '6013', name: 'Traje Sereia Iara', rarity: 'rare', isDuotone: true },
        
        // NFT - 14 calças
        { id: '5106', name: 'Traje Fogos de Artifício 2023', rarity: 'nft', isDuotone: false },
        { id: '5226', name: 'Bermuda Girassol', rarity: 'nft', isDuotone: false },
        { id: '5261', name: 'Biquini Azul', rarity: 'nft', isDuotone: false },
        { id: '5264', name: 'Biquini Pink', rarity: 'nft', isDuotone: false },
        { id: '5265', name: 'Bermuda de Praia Azul', rarity: 'nft', isDuotone: false },
        { id: '5266', name: 'Bermuda de Praia Pink', rarity: 'nft', isDuotone: false },
        { id: '5398', name: 'Jeans de Roqueiro Rasgados', rarity: 'nft', isDuotone: true },
        { id: '5399', name: 'Shorts de Roqueiro Estripador', rarity: 'nft', isDuotone: true },
        { id: '5546', name: 'Camiseta Framboesa', rarity: 'nft', isDuotone: false },
        { id: '5547', name: 'Camiseta Mirtilo', rarity: 'nft', isDuotone: false },
        { id: '5548', name: 'Camiseta Morango', rarity: 'nft', isDuotone: false },
        { id: '5584', name: 'Calça Grafite', rarity: 'nft', isDuotone: true },
        { id: '5623', name: 'Calça Listrada', rarity: 'nft', isDuotone: true },
        { id: '6137', name: 'Short Jeans', rarity: 'nft', isDuotone: false },
        
        // NonHC (Básicas) - 12 calças
        { id: '270', name: 'Calça Básica 270', rarity: 'normal', isDuotone: false },
        { id: '275', name: 'Calça Básica 275', rarity: 'normal', isDuotone: false },
        { id: '280', name: 'Calça Básica 280', rarity: 'normal', isDuotone: false },
        { id: '281', name: 'Calça Básica 281', rarity: 'normal', isDuotone: false },
        { id: '285', name: 'Calça Básica 285', rarity: 'normal', isDuotone: false },
        { id: '3023', name: 'Calça Básica 3023', rarity: 'normal', isDuotone: false },
        { id: '3078', name: 'Calça Básica 3078', rarity: 'normal', isDuotone: false },
        { id: '3088', name: 'Calça Básica 3088', rarity: 'normal', isDuotone: true },
        { id: '3116', name: 'Calça Básica 3116', rarity: 'normal', isDuotone: true },
        { id: '3201', name: 'Calça Básica 3201', rarity: 'normal', isDuotone: true },
        { id: '3216', name: 'Calça Básica 3216', rarity: 'normal', isDuotone: false },
        { id: '3290', name: 'Calça Básica 3290', rarity: 'normal', isDuotone: false }
      ];
      
      pantsData.forEach((pants, index) => {
        const gender = genders[index % 3];
        const colors = pants.isDuotone ? ['82', '61'] : ['82'];
        
        mockData[category].push({
          id: `lg_${pants.id}`,
          figureId: pants.id,
          category: 'lg',
          gender,
          colors,
          club: pants.rarity === 'hc' ? 'HC' : 'FREE',
          name: pants.name,
          source: 'official-habbo',
          thumbnailUrl: `https://www.habbo.com/habbo-imaging/avatarimage?figure=lg-${pants.id}-${colors[0]}${pants.isDuotone ? `-${colors[1]}` : ''}&gender=${gender}&direction=2&head_direction=2&size=m`,
          isValidated: false,
          rarity: pants.rarity,
          isDuotone: pants.isDuotone,
          isNFT: pants.rarity === 'nft',
          isLTD: pants.rarity === 'ltd',
          isRare: pants.rarity === 'rare',
          isHC: pants.rarity === 'hc',
          isSellable: pants.rarity === 'sellable'
        });
      });
    } else {
      // Gerar dados mock padrão para outras categorias
      for (let i = 0; i < 20; i++) {
        const figureId = (100 + i).toString();
        const gender = genders[i % 3];
        
        mockData[category].push({
          id: `mock_${category}_${figureId}`,
          figureId,
          category,
          gender,
          colors: ['1', '2', '3', '45', '61', '92'],
          club: i % 5 === 0 ? 'HC' : 'FREE',
          name: `${category.toUpperCase()} Mock ${figureId}`,
          source: 'official-habbo',
          thumbnailUrl: `https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92.${category}-${figureId}-1&gender=${gender}&direction=2&head_direction=2&size=s`,
          isValidated: false
        });
      }
    }
  });
  
  return mockData;
};