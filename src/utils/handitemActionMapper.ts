/**
 * Utilitário para mapear IDs de handitems para valores de ação
 * baseado no HabboAvatarActions.xml
 */

interface ActionMapping {
  drk: Map<number, number>; // UseItem: ID -> valor
  crr: Map<number, number>; // CarryItem: ID -> valor
}

class HanditemActionMapper {
  private mappings: ActionMapping = {
    drk: new Map(),
    crr: new Map()
  };
  private initialized = false;

  /**
   * Carrega os mapeamentos do HabboAvatarActions.xml
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Tentar carregar do arquivo local primeiro
      const response = await fetch('/handitems/gordon/flash-assets-PRODUCTION-202509092352-15493374/HabboAvatarActions.xml');
      const xmlText = await response.text();
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Mapear UseItem (drk)
      const useItemAction = xmlDoc.querySelector('action[id="UseItem"]');
      if (useItemAction) {
        const params = useItemAction.querySelectorAll('param');
        params.forEach(param => {
          const id = param.getAttribute('id');
          const value = param.getAttribute('value');
          if (id && value && id !== 'default') {
            this.mappings.drk.set(parseInt(id, 10), parseInt(value, 10));
          }
        });
      }
      
      // Mapear CarryItem (crr)
      const carryItemAction = xmlDoc.querySelector('action[id="CarryItem"]');
      if (carryItemAction) {
        const params = carryItemAction.querySelectorAll('param');
        params.forEach(param => {
          const id = param.getAttribute('id');
          const value = param.getAttribute('value');
          if (id && value && id !== 'default') {
            this.mappings.crr.set(parseInt(id, 10), parseInt(value, 10));
          }
        });
      }
      
      this.initialized = true;
      console.log(`✅ HanditemActionMapper inicializado: ${this.mappings.drk.size} drk, ${this.mappings.crr.size} crr`);
    } catch (error) {
      console.warn('⚠️ Erro ao carregar HabboAvatarActions.xml, usando fallback:', error);
      // Fallback: se não conseguir carregar, usar o ID direto
      this.initialized = true;
    }
  }

  /**
   * Obtém o valor mapeado para um ID de handitem
   * @param handitemId ID do handitem
   * @param actionType Tipo de ação ('drk' ou 'crr')
   * @returns Valor mapeado ou o ID original se não houver mapeamento
   */
  getMappedValue(handitemId: number, actionType: 'drk' | 'crr'): number {
    if (!this.initialized) {
      // Se não foi inicializado, retornar o ID direto
      return handitemId;
    }

    const mapping = this.mappings[actionType];
    const mappedValue = mapping.get(handitemId);
    
    // Se não houver mapeamento, usar o ID direto
    return mappedValue !== undefined ? mappedValue : handitemId;
  }

  /**
   * Verifica se um ID existe no mapeamento para uma ação específica
   */
  hasMapping(handitemId: number, actionType: 'drk' | 'crr'): boolean {
    if (!this.initialized) return false;
    return this.mappings[actionType].has(handitemId);
  }

  /**
   * Obtém todos os IDs mapeados para uma ação
   */
  getMappedIds(actionType: 'drk' | 'crr'): number[] {
    if (!this.initialized) return [];
    return Array.from(this.mappings[actionType].keys());
  }
}

// Instância singleton
export const handitemActionMapper = new HanditemActionMapper();

// Inicializar automaticamente
handitemActionMapper.initialize().catch(console.error);
