import { useState, useCallback } from 'react';

interface HanditemImageOptions {
  name?: string;
  id?: number;
  idWeb?: string;
  idInGame?: string;
  category?: string;
}

export const useHanditemImage = () => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const generateImageUrls = useCallback((options: HanditemImageOptions): string[] => {
    const { name, id, idWeb, idInGame, category } = options;
    
    const urls: string[] = [];
    
    // 1. URL original (se fornecida)
    // Esta será adicionada pelo componente que usa o hook
    
    // 2. Padrões do Viajovem (Imgur)
    const nameSlug = (name || 'handitem').toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9_]/g, '');
    
    urls.push(`https://i.imgur.com/${nameSlug}.png`);
    
    // 3. Padrões específicos por categoria
    if (category === 'bebidas') {
      urls.push(`https://i.imgur.com/drink_${nameSlug}.png`);
      urls.push(`https://i.imgur.com/beverage_${nameSlug}.png`);
    } else if (category === 'alimentos') {
      urls.push(`https://i.imgur.com/food_${nameSlug}.png`);
      urls.push(`https://i.imgur.com/eat_${nameSlug}.png`);
    } else if (category === 'utensílios') {
      urls.push(`https://i.imgur.com/tool_${nameSlug}.png`);
      urls.push(`https://i.imgur.com/utensil_${nameSlug}.png`);
    }
    
    // 4. Padrões com IDs
    if (idWeb) {
      urls.push(`https://i.imgur.com/handitem_${idWeb}.png`);
    }
    if (idInGame) {
      urls.push(`https://i.imgur.com/handitem_${idInGame}.png`);
    }
    if (id) {
      urls.push(`https://i.imgur.com/handitem_${id}.png`);
    }
    
    // 5. Padrões do HabboTemplarios (como fallback)
    urls.push(`https://images.habbotemplarios.com/web/avatargen/hand_${nameSlug}.png`);
    if (id) {
      urls.push(`https://images.habbotemplarios.com/web/avatargen/handitem${id}.png`);
      urls.push(`https://images.habbotemplarios.com/web/avatargen/handitem${id}_0.png`);
    }
    
    // 6. URLs oficiais do Habbo (como último recurso)
    if (id) {
      urls.push(`https://www.habbo.com/habbo-imaging/handitem?handitem=${id}`);
      urls.push(`https://images.habbo.com/c_images/handitems/${id}.png`);
    }
    
    return urls;
  }, []);

  const handleImageError = useCallback((urls: string[]) => {
    if (currentImageIndex < urls.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setImageError(true);
    }
  }, [currentImageIndex]);

  const resetImageState = useCallback(() => {
    setImageError(false);
    setCurrentImageIndex(0);
  }, []);

  return {
    imageError,
    currentImageIndex,
    generateImageUrls,
    handleImageError,
    resetImageState
  };
};
