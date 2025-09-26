import { useState, useCallback } from 'react';

// Sistema Avançado de Gerenciamento de Look String
export interface LookStringPart {
  category: string;
  figureId: string;
  colorId: string;
  fullString: string;
}

export interface LookStringState {
  parts: Map<string, LookStringPart>;
  order: string[];
}

export class LookStringManager {
  private static readonly CATEGORY_ORDER = [
    'hd', 'hr', 'ch', 'cc', 'lg', 'sh', 'ha', 'ea', 'ca', 'wa', 'cp'
  ];

  private state: LookStringState = {
    parts: new Map(),
    order: [...LookStringManager.CATEGORY_ORDER]
  };

  // Adicionar ou atualizar uma parte do avatar
  addPart(category: string, figureId: string, colorId: string = '1'): void {
    const part: LookStringPart = {
      category,
      figureId,
      colorId,
      fullString: `${category}-${figureId}-${colorId}`
    };

    this.state.parts.set(category, part);
    
    // Manter ordem correta
    if (!this.state.order.includes(category)) {
      const insertIndex = LookStringManager.CATEGORY_ORDER.indexOf(category);
      if (insertIndex !== -1) {
        this.state.order.splice(insertIndex, 0, category);
      }
    }

      }

  // Remover uma parte do avatar
  removePart(category: string): void {
    this.state.parts.delete(category);
    this.state.order = this.state.order.filter(cat => cat !== category);
      }

  // Obter look string completa
  getLookString(): string {
    const parts = this.state.order
      .filter(category => this.state.parts.has(category))
      .map(category => this.state.parts.get(category)!.fullString);
    
    return parts.join('.');
  }

  // Obter parte específica
  getPart(category: string): LookStringPart | null {
    return this.state.parts.get(category) || null;
  }

  // Verificar se categoria existe
  hasPart(category: string): boolean {
    return this.state.parts.has(category);
  }

  // Obter todas as partes
  getAllParts(): LookStringPart[] {
    return this.state.order
      .filter(category => this.state.parts.has(category))
      .map(category => this.state.parts.get(category)!);
  }

  // Limpar todas as partes
  clear(): void {
    this.state.parts.clear();
    this.state.order = [...LookStringManager.CATEGORY_ORDER];
      }

  // Carregar look string existente
  loadFromString(lookString: string): void {
    this.clear();
    
    if (!lookString || lookString.trim() === '') {
      return;
    }

    const parts = lookString.split('.');
    parts.forEach(part => {
      const [category, figureId, colorId] = part.split('-');
      if (category && figureId && colorId) {
        this.addPart(category, figureId, colorId);
      }
    });

      }

  // Validar look string
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const [category, part] of this.state.parts.entries()) {
      if (!part.figureId || part.figureId === '') {
        errors.push(`Category ${category} has invalid figureId`);
      }
      if (!part.colorId || part.colorId === '') {
        errors.push(`Category ${category} has invalid colorId`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Obter estatísticas
  getStats() {
    return {
      totalParts: this.state.parts.size,
      categories: Array.from(this.state.parts.keys()),
      lookString: this.getLookString(),
      isValid: this.validate().isValid
    };
  }
}

// Hook para usar o LookStringManager
export const useLookStringManager = () => {
  const [manager] = useState(() => new LookStringManager());
  const [lookString, setLookString] = useState('');

  const addPart = useCallback((category: string, figureId: string, colorId: string = '1') => {
    manager.addPart(category, figureId, colorId);
    setLookString(manager.getLookString());
  }, [manager]);

  const removePart = useCallback((category: string) => {
    manager.removePart(category);
    setLookString(manager.getLookString());
  }, [manager]);

  const loadFromString = useCallback((lookString: string) => {
    manager.loadFromString(lookString);
    setLookString(manager.getLookString());
  }, [manager]);

  const clear = useCallback(() => {
    manager.clear();
    setLookString('');
  }, [manager]);

  return {
    manager,
    lookString,
    addPart,
    removePart,
    loadFromString,
    clear,
    getPart: manager.getPart.bind(manager),
    hasPart: manager.hasPart.bind(manager),
    getAllParts: manager.getAllParts.bind(manager),
    validate: manager.validate.bind(manager),
    getStats: manager.getStats.bind(manager)
  };
};
