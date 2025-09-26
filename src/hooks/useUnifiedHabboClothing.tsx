import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { usePuhekuplaClothing } from './usePuhekuplaData';
import { realFigureDataService } from '@/services/RealFigureDataService';
import { viaJovemCompleteService } from '@/services/ViaJovemCompleteService';

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
    // CORPO - Rosto e Corpo
    'hd': 'Rosto e Corpo',
    
    // CABEÇA - Cabelo/Penteados
    'hr': 'Cabelo/Penteados',
    
    // CABEÇA - Chapéus
    'ha': 'Chapéus',
    
    // CABEÇA - Acessórios de Cabeça
    'he': 'Acessórios de Cabeça',
    
    // CABEÇA - Óculos
    'ea': 'Óculos',
    
    // CABEÇA - Máscaras (acessórios faciais)
    'fa': 'Máscaras',
    
    // TORSO - Camisas
    'ch': 'Camisas',
    
    // TORSO - Casacos/Vestidos/Jaquetas
    'cc': 'Casacos/Vestidos',
    
    // TORSO - Estampas/Impressões
    'cp': 'Estampas',
    
    // TORSO - Bijuteria/Jóias (acessórios de topo)
    'ca': 'Acessórios do Peito',
    
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
        console.log('📊 [useUnifiedHabboClothing] ViaJovem data received:', {
          totalCategories: viaJovemData.length,
          categories: viaJovemData.map(cat => ({ id: cat.id, name: cat.displayName, itemCount: cat.items.length }))
        });
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
            console.log('📊 [useUnifiedHabboClothing] Puhekupla converted data:', {
              totalCategories: Object.keys(puhekuplaUnified).length,
              categories: Object.entries(puhekuplaUnified).map(([key, value]) => ({ id: key, itemCount: value.length }))
            });
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
    
    // Validar categoria baseada na documentação oficial
    const validCategories = ['hd', 'hr', 'ch', 'lg', 'sh', 'ha', 'he', 'ea', 'fa', 'cp', 'cc', 'ca', 'wa', 'bd', 'rh', 'lh', 'dr', 'sk', 'su'];
    if (!validCategories.includes(category)) {
            return; // Pular categoria inválida
    }
    
    if (!unifiedData[category]) {
      unifiedData[category] = [];
    }
    
    console.log('✅ [convertPuhekuplaToUnified] Processing item:', { 
      code: item.code, 
      category, 
      figureId, 
      name: item.name?.substring(0, 30) || 'unnamed' 
    });
    
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
  
  console.log('✅ [convertPuhekuplaToUnified] Converted to unified format:', Object.keys(unifiedData).length, 'categories');
  return unifiedData;
};

// Função para converter dados reais do figuredata para formato unificado
const convertRealFigureDataToUnified = (realData: any): UnifiedClothingData => {
  const unifiedData: UnifiedClothingData = {};
  
  Object.entries(realData).forEach(([categoryId, categoryData]: [string, any]) => {
    if (categoryData && categoryData.items) {
      unifiedData[categoryId] = categoryData.items.map((item: any) => ({
        id: item.id,
        figureId: item.figureId,
        category: item.category,
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
  
  console.log('✅ [convertRealFigureDataToUnified] Converted to unified format:', Object.keys(unifiedData).length, 'categories');
  return unifiedData;
};

// Função para converter dados completos da ViaJovem para formato unificado
const convertViaJovemCompleteToUnified = (viaJovemData: any[]): UnifiedClothingData => {
  const unifiedData: UnifiedClothingData = {};
  
  viaJovemData.forEach(category => {
    if (category && category.items) {
      unifiedData[category.id] = category.items.map((item: any) => ({
        id: item.id,
        figureId: item.figureId,
        category: item.category,
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
  
  console.log('✅ [convertViaJovemCompleteToUnified] Converted to unified format:', Object.keys(unifiedData).length, 'categories');
  return unifiedData;
};

// Função para gerar dados mock quando as APIs falharem
const generateMockUnifiedData = (): UnifiedClothingData => {
  const mockData: UnifiedClothingData = {};
  
  const categories = ['hd', 'hr', 'ch', 'cc', 'lg', 'sh', 'ha', 'ea', 'ca', 'wa', 'cp'];
  const genders: Array<'M' | 'F' | 'U'> = ['M', 'F', 'U'];
  
  categories.forEach(category => {
    mockData[category] = [];
    
    // Gerar 20 itens mock por categoria
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
  });
  
  console.log('🎭 [MockData] Generated mock unified data:', Object.keys(mockData).length, 'categories');
  return mockData;
};