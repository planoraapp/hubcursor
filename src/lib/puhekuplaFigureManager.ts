
export interface FigurePart {
  category: string;
  id: string;
  colors: string[];
}

export interface PuhekuplaFigure {
  hd?: FigurePart; // head
  hr?: FigurePart; // hair
  ch?: FigurePart; // chest/shirt
  lg?: FigurePart; // legs
  sh?: FigurePart; // shoes
  ha?: FigurePart; // hat
  ea?: FigurePart; // eye accessories
  fa?: FigurePart; // face accessories
  cc?: FigurePart; // coat/jacket
  ca?: FigurePart; // chest accessories
  wa?: FigurePart; // waist accessories
  cp?: FigurePart; // chest print
}

export class PuhekuplaFigureManager {
  private static readonly CATEGORY_MAPPING: Record<string, string> = {
    'hat': 'ha',
    'hair': 'hr',
    'shirt': 'ch',
    'top': 'ch',
    'chest': 'ch',
    'trousers': 'lg',
    'pants': 'lg',
    'legs': 'lg',
    'shoes': 'sh',
    'footwear': 'sh',
    'jacket': 'cc',
    'coat': 'cc',
    'acc_eye': 'ea',
    'eye_accessories': 'ea',
    'acc_head': 'ha',
    'acc_chest': 'ca',
    'acc_waist': 'wa',
    'acc_print': 'cp',
    'acc_face': 'fa',
    'face_accessories': 'fa',
    'head': 'hd',
    'face': 'hd'
  };

  static parseFigureString(figureString: string): PuhekuplaFigure {
    const figure: PuhekuplaFigure = {};
    
    if (!figureString) return figure;

    const parts = figureString.split('.');
    
    for (const part of parts) {
      const match = part.match(/^([a-z]{2})-(\d+)-(.+)$/);
      if (match) {
        const [_, category, id, colorsStr] = match;
        const colors = colorsStr.split('.');
        
        figure[category as keyof PuhekuplaFigure] = {
          category,
          id,
          colors
        };
      }
    }
    
    return figure;
  }

  static figureToString(figure: PuhekuplaFigure): string {
    const parts = Object.entries(figure)
      .filter(([_, part]) => part && part.id !== '0' && part.id !== '')
      .map(([category, part]) => {
        if (!part) return '';
        return `${category}-${part.id}-${part.colors.join('.')}`;
      })
      .filter(part => part.length > 0)
      .join('.');
    
    return parts;
  }

  static applyClothingItem(
    currentFigure: PuhekuplaFigure,
    item: any,
    colorId: string = '1'
  ): PuhekuplaFigure {
    console.log('🎨 [PuhekuplaFigureManager] Aplicando item HabboEmotion:', {
      item: {
        name: item.name,
        code: item.code,
        category: item.category,
        part: item.part
      },
      colorId,
      currentFigure: this.figureToString(currentFigure)
    });

    // Usar category ou part do item
    let category = item.category || item.part;
    
    // Map category to figure part if needed
    const figureCategory = this.CATEGORY_MAPPING[category] || category;
    
    // Ensure we have a valid 2-letter category
    let finalCategory = figureCategory;
    if (!finalCategory || finalCategory.length !== 2) {
      // Try to extract from code
      const codeMatch = item.code?.match(/^([a-z]{2})/i);
      if (codeMatch) {
        finalCategory = codeMatch[1].toLowerCase();
      } else {
        console.warn('❌ [PuhekuplaFigureManager] Could not determine category for item:', item);
        return currentFigure;
      }
    }

    // Extract item ID from code or use id directly
    let itemId = item.id?.toString() || item.code?.replace(/[^0-9]/g, '') || '1';

    const newPart: FigurePart = {
      category: finalCategory,
      id: itemId,
      colors: [colorId]
    };

    const updatedFigure = {
      ...currentFigure,
      [finalCategory]: newPart
    };

    console.log('✅ [PuhekuplaFigureManager] Item HabboEmotion aplicado:', {
      category: finalCategory,
      id: itemId,
      colors: [colorId],
      itemName: item.name,
      newFigureString: this.figureToString(updatedFigure)
    });

    return updatedFigure;
  }

  static generateRandomFigure(gender: 'M' | 'F' = 'M'): PuhekuplaFigure {
    const baseFigure: PuhekuplaFigure = {
      hd: { category: 'hd', id: '180', colors: ['1'] },
      hr: { category: 'hr', id: Math.floor(Math.random() * 1000).toString(), colors: [Math.floor(Math.random() * 50).toString()] },
      ch: { category: 'ch', id: Math.floor(Math.random() * 300).toString(), colors: [Math.floor(Math.random() * 100).toString()] },
      lg: { category: 'lg', id: Math.floor(Math.random() * 300).toString(), colors: [Math.floor(Math.random() * 100).toString()] },
      sh: { category: 'sh', id: Math.floor(Math.random() * 400).toString(), colors: [Math.floor(Math.random() * 100).toString()] }
    };

    // Add optional accessories (30% chance each)
    if (Math.random() < 0.3) {
      baseFigure.ha = { category: 'ha', id: Math.floor(Math.random() * 200).toString(), colors: [Math.floor(Math.random() * 20).toString()] };
    }
    
    if (Math.random() < 0.2) {
      baseFigure.ea = { category: 'ea', id: Math.floor(Math.random() * 50).toString(), colors: [Math.floor(Math.random() * 10).toString()] };
    }

    return baseFigure;
  }

  static getDefaultFigure(gender: 'M' | 'F' = 'M'): PuhekuplaFigure {
    return {
      hd: { category: 'hd', id: '180', colors: ['2'] },
      hr: { category: 'hr', id: gender === 'M' ? '828' : '595', colors: ['45'] },
      ch: { category: 'ch', id: gender === 'M' ? '665' : '667', colors: ['92'] },
      lg: { category: 'lg', id: gender === 'M' ? '700' : '701', colors: ['1'] },
      sh: { category: 'sh', id: '705', colors: ['1'] }
    };
  }

  static removeCategory(figure: PuhekuplaFigure, category: string): PuhekuplaFigure {
    const updatedFigure = { ...figure };
    delete updatedFigure[category as keyof PuhekuplaFigure];
    return updatedFigure;
  }
}
