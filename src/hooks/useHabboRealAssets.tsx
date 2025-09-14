
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HabboRealClothingItem {
  id: string;
  category: string;
  name: string;
  gender: 'M' | 'F' | 'U';
  club: 'normal' | 'hc';
  rarity: 'normal' | 'rare' | 'ltd' | 'nft';
  colorable: boolean;
  sellable: boolean;
  colors: string[];
  swfUrl: string;
  iconUrl: string;
  revision: string;
}

export interface HabboColorPalette {
  id: string;
  index: number;
  club: '0' | '1' | '2';
  hex: string;
}

export interface HabboRealAssetsData {
  clothing: Record<string, HabboRealClothingItem[]>;
  palettes: {
    skin: HabboColorPalette[];
    hair: HabboColorPalette[];
    clothes: HabboColorPalette[];
  };
  metadata: {
    buildUrl: string;
    hotel: string;
    fetchedAt: string;
    totalItems: number;
  };
}

const fetchHabboRealAssets = async (hotel: string = 'com.br'): Promise<HabboRealAssetsData | null> => {
    try {
    const { data, error } = await supabase.functions.invoke('habbo-real-assets', {
      body: { hotel }
    });
    
    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }
    
    if (!data?.success || !data?.data) {
      throw new Error('Invalid response from assets API');
    }
    
    console.log('✅ [useHabboRealAssets] Real assets loaded:', {
      totalItems: data.data.metadata.totalItems,
      categories: Object.keys(data.data.clothing).length,
      buildUrl: data.data.metadata.buildUrl,
      hotel: data.data.metadata.hotel
    });
    
    return data.data;
    
  } catch (error) {
        throw error;
  }
};

export const useHabboRealAssets = (hotel: string = 'com.br') => {
  return useQuery({
    queryKey: ['habbo-real-assets', hotel],
    queryFn: () => fetchHabboRealAssets(hotel),
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Helper functions for filtering and organizing data
export const filterClothingByCategory = (
  clothing: Record<string, HabboRealClothingItem[]>,
  category: string
): HabboRealClothingItem[] => {
  return clothing[category] || [];
};

export const filterClothingByGender = (
  items: HabboRealClothingItem[],
  gender: 'M' | 'F' | 'U'
): HabboRealClothingItem[] => {
  if (gender === 'U') return items;
  return items.filter(item => item.gender === 'U' || item.gender === gender);
};

export const filterClothingByRarity = (
  items: HabboRealClothingItem[],
  rarity?: string
): HabboRealClothingItem[] => {
  if (!rarity || rarity === 'all') return items;
  return items.filter(item => item.rarity === rarity);
};

export const filterClothingByClub = (
  items: HabboRealClothingItem[],
  showHCOnly: boolean = false
): HabboRealClothingItem[] => {
  if (!showHCOnly) return items;
  return items.filter(item => item.club === 'hc');
};

export const generateOfficialAvatarUrl = (
  figureString: string,
  hotel: string = 'com.br',
  direction: string = '2',
  size: string = 'l'
): string => {
  return `https://www.habbo.${hotel}/habbo-imaging/avatarimage?figure=${figureString}&gender=M&direction=${direction}&head_direction=${direction}&img_format=png&action=gesture=nrm&size=${size}`;
};

export const generateOfficialClothingUrl = (
  category: string,
  itemId: string,
  colorId: string = '1',
  hotel: string = 'com.br',
  size: string = 'l'
): string => {
  const figureString = `${category}-${itemId}-${colorId}`;
  return generateOfficialAvatarUrl(figureString, hotel, '2', size);
};
