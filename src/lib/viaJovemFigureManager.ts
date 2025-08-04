
export interface ViaJovemFigure {
  [key: string]: {
    id: string;
    color: string;
  };
}

export class ViaJovemFigureManager {
  static getDefaultFigure(gender: 'M' | 'F' | 'U'): ViaJovemFigure {
    const baseFigure: ViaJovemFigure = {
      hd: { id: '180', color: '1' },
      ch: { id: '255', color: '66' },
      lg: { id: '280', color: '110' },
      sh: { id: '305', color: '62' }
    };

    if (gender === 'F') {
      return {
        ...baseFigure,
        hr: { id: '600', color: '61' }
      };
    }

    return {
      ...baseFigure,
      hr: { id: '205', color: '61' }
    };
  }

  static parseFigureString(figureString: string): ViaJovemFigure {
    const parts = figureString.split('.');
    const figure: ViaJovemFigure = {};

    parts.forEach(part => {
      const [type, details] = part.split('-');
      if (details) {
        const [id, color] = details.split('.');
        figure[type] = { id, color: color || '1' };
      }
    });

    return figure;
  }

  static applyClothingItem(
    currentFigure: ViaJovemFigure, 
    item: any, 
    colorId: string
  ): ViaJovemFigure {
    const category = item.category || 'ch';
    
    return {
      ...currentFigure,
      [category]: {
        id: item.figureId || item.id,
        color: colorId
      }
    };
  }

  static getFigureString(figure: ViaJovemFigure): string {
    return Object.entries(figure)
      .map(([type, data]) => `${type}-${data.id}-${data.color}`)
      .join('.');
  }
}
