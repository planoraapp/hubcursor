// src/hooks/useOfficialHabboClothing.tsx
// Hook que acessa diretamente as APIs oficiais do Habbo

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface OfficialHabboClothingItem {
  id: string;
  figureId: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  colors: string[];
  club: 'FREE' | 'HC';
  name: string;
  source: 'official-habbo';
  thumbnailUrl: string;
  scientificCode?: string;
  isRare?: boolean;
  isLTD?: boolean;
  isNFT?: boolean;
  isHC?: boolean;
  isSellable?: boolean;
  isNormal?: boolean;
  rarity?: 'normal' | 'rare' | 'ltd' | 'nft' | 'hc' | 'sellable';
  isDuotone?: boolean;
  colorable?: boolean;
  selectable?: boolean;
  sellable?: boolean;
  paletteId?: string;
}

export interface OfficialClothingData {
  [category: string]: OfficialHabboClothingItem[];
}

export interface ColorPalette {
  id: string;
  hex: string;
}

export interface ColorPalettes {
  [paletteId: string]: ColorPalette[];
}

// Função para acessar diretamente as APIs oficiais do Habbo
const fetchOfficialHabboData = async () => {
    try {
    // 1. Buscar figuredata.xml oficial do Habbo
    const figureDataResponse = await fetch('https://www.habbo.com/gamedata/figuredata.xml');
    if (!figureDataResponse.ok) {
      throw new Error(`Figuredata API failed: ${figureDataResponse.status}`);
    }
    const figureDataXml = await figureDataResponse.text();
    
    // 2. Buscar furnidata.json oficial do Habbo
    const furniDataResponse = await fetch('https://www.habbo.com/gamedata/furnidata.json');
    if (!furniDataResponse.ok) {
      throw new Error(`Furnidata API failed: ${furniDataResponse.status}`);
    }
    const furniData = await furniDataResponse.json();
    
    // 3. Buscar figuremap.xml oficial do Habbo
    const figureMapResponse = await fetch('https://www.habbo.com/gamedata/figuremap.xml');
    if (!figureMapResponse.ok) {
      throw new Error(`Figuremap API failed: ${figureMapResponse.status}`);
    }
    const figureMapXml = await figureMapResponse.text();
    
        // Processar dados oficiais
    const processedData = processOfficialHabboData(figureDataXml, furniData, figureMapXml);
    
    return processedData;
    
  } catch (error) {
        throw error;
  }
};

// Função para processar dados oficiais do Habbo
const processOfficialHabboData = (figureDataXml: string, furniData: any, figureMapXml: string) => {
    // Parsear figuredata.xml
  const figureData = parseFigureDataXml(figureDataXml);
  
  // Parsear figuremap.xml
  const figureMap = parseFigureMapXml(figureMapXml);
  
  // Processar furnidata.json
  const clothingRarity = processFurniData(furniData);
  
  // Unificar dados
  const unifiedData: OfficialClothingData = {};
  const colorPalettes: ColorPalettes = {};
  
  // Processar cada categoria
  Object.entries(figureData).forEach(([category, items]) => {
    if (!Array.isArray(items)) return;
    
    unifiedData[category] = items.map(item => {
      // Buscar código científico
      const scientificCode = findScientificCode(figureMap, category, item.id);
      
      // Buscar classificação de raridade
      const rarityInfo = findClothingClassification(clothingRarity, category, item.id);
      
      // Gerar thumbnail URL oficial
      const thumbnailUrl = generateOfficialThumbnailUrl(category, item.id, item.colors?.[0] || '1', item.gender);
      
      return {
        id: `${category}-${item.id}`,
        figureId: item.id,
        category: category,
        gender: item.gender || 'U',
        colors: item.colors || ['1'],
        club: item.club === '2' ? 'HC' : 'FREE',
        name: scientificCode || `${getCategoryDisplayName(category)} ${item.id}`,
        source: 'official-habbo' as const,
        thumbnailUrl: thumbnailUrl,
        scientificCode: scientificCode,
        isRare: rarityInfo?.isRare || false,
        isLTD: rarityInfo?.isLTD || false,
        isNFT: rarityInfo?.isNFT || false,
        isHC: item.club === '2' || rarityInfo?.isHC || false,
        isSellable: rarityInfo?.isSellable || false,
        isNormal: !rarityInfo?.isRare && !rarityInfo?.isLTD && !rarityInfo?.isNFT && item.club !== '2',
        rarity: rarityInfo?.rarity || (item.club === '2' ? 'hc' : 'normal'),
        isDuotone: item.isDuotone || false,
        colorable: item.colorable || false,
        selectable: item.selectable || true,
        sellable: item.sellable || false,
        paletteId: getCorrectPaletteId(category)
      } as OfficialHabboClothingItem;
    });
  });
  
  console.log('✅ [OfficialHabboClothing] Official data processed:', {
    categories: Object.keys(unifiedData).length,
    totalItems: Object.values(unifiedData).reduce((sum, items) => sum + items.length, 0)
  });
  
  return { data: unifiedData, colorPalettes };
};

// Função para parsear figuredata.xml
const parseFigureDataXml = (xmlText: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const figureData: Record<string, any[]> = {};
  
  // Extrair paletas de cores
  const palettes = xmlDoc.querySelectorAll('palette');
  palettes.forEach(palette => {
    const paletteId = palette.getAttribute('id');
    if (paletteId) {
      // Processar cores da paleta
      const colors = Array.from(palette.querySelectorAll('color')).map(color => ({
        id: color.getAttribute('id') || '',
        hex: color.getAttribute('hex') || '#000000'
      }));
      // Armazenar paleta (implementar se necessário)
    }
  });
  
  // Extrair sets de roupas
  const sets = xmlDoc.querySelectorAll('set');
  sets.forEach(set => {
    const setId = set.getAttribute('id');
    const gender = set.getAttribute('gender') || 'U';
    const club = set.getAttribute('club') || '0';
    const colorable = set.getAttribute('colorable') || '0';
    const selectable = set.getAttribute('selectable') || '1';
    const sellable = set.getAttribute('sellable') || '0';
    
    // Extrair partes do set
    const parts = Array.from(set.querySelectorAll('part')).map(part => ({
      id: part.getAttribute('id') || '',
      type: part.getAttribute('type') || '',
      colorable: part.getAttribute('colorable') || '0',
      index: part.getAttribute('index') || '1',
      colorindex: part.getAttribute('colorindex') || '1'
    }));
    
    // Organizar por categoria
    parts.forEach(part => {
      if (part.type && part.id) {
        if (!figureData[part.type]) {
          figureData[part.type] = [];
        }
        
        figureData[part.type].push({
          id: part.id,
          gender: gender as 'M' | 'F' | 'U',
          club: club,
          colorable: colorable === '1',
          selectable: selectable === '1',
          sellable: sellable === '1',
          colors: ['1', '2', '3', '4', '5'], // Cores padrão
          isDuotone: part.colorindex === '2'
        });
      }
    });
  });
  
  return figureData;
};

// Função para parsear figuremap.xml
const parseFigureMapXml = (xmlText: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const figureMap: Record<string, any[]> = {};
  
  // Extrair bibliotecas
  const libs = xmlDoc.querySelectorAll('lib');
  libs.forEach(lib => {
    const libId = lib.getAttribute('id');
    if (libId) {
      const parts = Array.from(lib.querySelectorAll('part')).map(part => ({
        id: part.getAttribute('id') || '',
        type: part.getAttribute('type') || '',
        scientificCode: libId
      }));
      
      parts.forEach(part => {
        if (part.type && part.id) {
          if (!figureMap[part.type]) {
            figureMap[part.type] = [];
          }
          figureMap[part.type].push(part);
        }
      });
    }
  });
  
  return figureMap;
};

// Função para processar furnidata.json
const processFurniData = (furniData: any) => {
  const clothingRarity: Record<string, any[]> = {};
  
  if (furniData && furniData.roomitemtypes && furniData.roomitemtypes.furnitype) {
    furniData.roomitemtypes.furnitype.forEach((item: any) => {
      if (item.@attributes && item.@attributes.classname) {
        const className = item.@attributes.classname;
        
        // Detectar raridade baseada no classname
        let rarity = 'normal';
        let isRare = false;
        let isLTD = false;
        let isNFT = false;
        let isHC = false;
        let isSellable = false;
        
        if (className.includes('_r_')) {
          rarity = 'rare';
          isRare = true;
        } else if (className.includes('_ltd_')) {
          rarity = 'ltd';
          isLTD = true;
        } else if (className.includes('_nft_')) {
          rarity = 'nft';
          isNFT = true;
        } else if (className.includes('_hc_')) {
          rarity = 'hc';
          isHC = true;
        } else if (className.includes('_sellable_')) {
          rarity = 'sellable';
          isSellable = true;
        }
        
        // Extrair categoria do classname
        const categoryMatch = className.match(/clothing_([a-z]+)_/);
        if (categoryMatch) {
          const category = categoryMatch[1];
          if (!clothingRarity[category]) {
            clothingRarity[category] = [];
          }
          
          clothingRarity[category].push({
            itemId: item.@attributes.id,
            className: className,
            rarity: rarity,
            isRare,
            isLTD,
            isNFT,
            isHC,
            isSellable
          });
        }
      }
    });
  }
  
  return clothingRarity;
};

// Função para buscar código científico
const findScientificCode = (figureMap: Record<string, any[]>, category: string, itemId: string): string | null => {
  if (!figureMap[category]) return null;
  
  const item = figureMap[category].find(item => item.id === itemId);
  return item?.scientificCode || null;
};

// Função para buscar classificação de raridade
const findClothingClassification = (clothingRarity: Record<string, any[]>, category: string, itemId: string) => {
  if (!clothingRarity[category]) return null;
  
  const item = clothingRarity[category].find(item => item.itemId === itemId);
  return item ? {
    isRare: item.isRare || false,
    isLTD: item.isLTD || false,
    isNFT: item.isNFT || false,
    isHC: item.isHC || false,
    isSellable: item.isSellable || false,
    rarity: item.rarity || 'normal'
  } : null;
};

// Função para gerar URL de thumbnail oficial
const generateOfficialThumbnailUrl = (category: string, itemId: string, colorId: string, gender: 'M' | 'F' | 'U'): string => {
  // Para thumbnails nos grids, mostrar apenas a peça individual
  // Isso evita mostrar "mocks" e permite ver cada item isoladamente
  const figureString = `${category}-${itemId}-${colorId}`;

  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${gender}&direction=2&head_direction=2&size=m&img_format=png&gesture=std&action=std`;
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

// Função para determinar paleta correta
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

// Hook principal
export const useOfficialHabboClothing = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['official-habbo-clothing'],
    queryFn: fetchOfficialHabboData,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
    retryDelay: 1000,
  });

  return {
    data: data?.data || {},
    colorPalettes: data?.colorPalettes || {},
    isLoading,
    error,
    refetch
  };
};