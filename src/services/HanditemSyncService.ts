/**
 * Serviço para sincronizar handitems de múltiplos hotéis Habbo
 * Busca external_flash_texts de .com, .com.br e .es para manter traduções atualizadas
 */

export interface HanditemTranslation {
  id: number;
  name: string;
  hotel: 'com' | 'com.br' | 'es';
  lastUpdated: string;
}

export interface HanditemData {
  id: number;
  names: {
    pt: string; // Português (com.br)
    en: string; // Inglês (com)
    es: string; // Espanhol (es)
  };
  isNew?: boolean;
  addedDate?: string;
}

class HanditemSyncService {
  private readonly HOTELS = {
    com: 'https://www.habbo.com',
    'com.br': 'https://www.habbo.com.br',
    es: 'https://www.habbo.es'
  };

  /**
   * Busca external_flash_texts de um hotel específico
   */
  async fetchExternalFlashTexts(hotel: keyof typeof this.HOTELS): Promise<HanditemTranslation[]> {
    try {
      const baseUrl = this.HOTELS[hotel];
      const response = await fetch(`${baseUrl}/gamedata/external_flash_texts/1`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from ${hotel}: ${response.status}`);
      }

      const text = await response.text();
      const handitems: HanditemTranslation[] = [];
      
      // Regex para extrair handitems: handitem123=Nome do Item
      const handitemRegex = /handitem(\d+)=(.+)/g;
      let match;

      while ((match = handitemRegex.exec(text)) !== null) {
        const id = parseInt(match[1], 10);
        const name = match[2].trim();
        
        if (id !== undefined && name) {
          handitems.push({
            id,
            name,
            hotel,
            lastUpdated: new Date().toISOString()
          });
        }
      }

      return handitems;
    } catch (error) {
      console.error(`Error fetching from ${hotel}:`, error);
      return [];
    }
  }

  /**
   * Busca handitems de todos os hotéis e mescla as traduções
   */
  async syncAllHotels(): Promise<HanditemData[]> {
    console.log('🔄 Sincronizando handitems de todos os hotéis...');
    
    const [comItems, brItems, esItems] = await Promise.all([
      this.fetchExternalFlashTexts('com'),
      this.fetchExternalFlashTexts('com.br'),
      this.fetchExternalFlashTexts('es')
    ]);

    console.log(`✅ Encontrados: ${comItems.length} (com), ${brItems.length} (com.br), ${esItems.length} (es)`);

    // Criar mapa de handitems por ID
    const handitemsMap = new Map<number, HanditemData>();

    // Processar itens do .com (inglês - base)
    comItems.forEach(item => {
      if (!handitemsMap.has(item.id)) {
        handitemsMap.set(item.id, {
          id: item.id,
          names: {
            en: item.name,
            pt: item.name, // Fallback
            es: item.name  // Fallback
          }
        });
      } else {
        handitemsMap.get(item.id)!.names.en = item.name;
      }
    });

    // Processar itens do .com.br (português)
    brItems.forEach(item => {
      if (!handitemsMap.has(item.id)) {
        handitemsMap.set(item.id, {
          id: item.id,
          names: {
            en: item.name, // Fallback
            pt: item.name,
            es: item.name  // Fallback
          }
        });
      } else {
        handitemsMap.get(item.id)!.names.pt = item.name;
      }
    });

    // Processar itens do .es (espanhol)
    esItems.forEach(item => {
      if (!handitemsMap.has(item.id)) {
        handitemsMap.set(item.id, {
          id: item.id,
          names: {
            en: item.name, // Fallback
            pt: item.name, // Fallback
            es: item.name
          }
        });
      } else {
        handitemsMap.get(item.id)!.names.es = item.name;
      }
    });

    const result = Array.from(handitemsMap.values()).sort((a, b) => a.id - b.id);
    console.log(`✅ Total de handitems sincronizados: ${result.length}`);
    
    return result;
  }

  /**
   * Carrega handitems do arquivo JSON local (fallback)
   * Tenta carregar primeiro do handitems-full.json (com traduções e isNew)
   * Se não existir, usa handitems.json (formato simples)
   */
  async loadLocalHanditems(): Promise<HanditemData[]> {
    try {
      // Tentar carregar do arquivo completo primeiro
      try {
        const fullResponse = await fetch('/handitems/handitems-full.json');
        if (fullResponse.ok) {
          const fullData: HanditemData[] = await fullResponse.json();
          console.log('📦 Carregados handitems do arquivo completo (com traduções e novos)');
          return fullData;
        }
      } catch (fullError) {
        console.warn('Arquivo handitems-full.json não encontrado, tentando formato simples...');
      }

      // Fallback: carregar do arquivo simples
      const response = await fetch('/handitems/handitems.json');
      const data: Array<{ id: number; name: string }> = await response.json();
      
      return data.map(item => ({
        id: item.id,
        names: {
          pt: item.name,
          en: item.name,
          es: item.name
        }
      }));
    } catch (error) {
      console.error('Error loading local handitems:', error);
      return [];
    }
  }

  /**
   * Identifica novos handitems comparando com a lista anterior
   */
  identifyNewHanditems(
    currentHanditems: HanditemData[],
    previousHanditems: HanditemData[],
    maxNew: number = 5
  ): HanditemData[] {
    const previousIds = new Set(previousHanditems.map(h => h.id));
    const newHanditems = currentHanditems
      .filter(h => !previousIds.has(h.id))
      .sort((a, b) => b.id - a.id) // Mais recentes primeiro (IDs maiores)
      .slice(0, maxNew);

    // Marcar como novos
    newHanditems.forEach(item => {
      item.isNew = true;
      item.addedDate = new Date().toISOString();
    });

    return newHanditems;
  }

  /**
   * Salva handitems sincronizados no localStorage
   */
  saveToLocalStorage(handitems: HanditemData[]): void {
    try {
      const data = {
        handitems,
        lastSync: new Date().toISOString()
      };
      localStorage.setItem('habbo-handitems-sync', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Carrega handitems do localStorage
   */
  loadFromLocalStorage(): { handitems: HanditemData[]; lastSync: string } | null {
    try {
      const data = localStorage.getItem('habbo-handitems-sync');
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  /**
   * Verifica se precisa sincronizar (última sincronização foi há mais de 24h)
   */
  shouldSync(): boolean {
    const cached = this.loadFromLocalStorage();
    if (!cached) return true;

    const lastSync = new Date(cached.lastSync);
    const now = new Date();
    const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

    return hoursSinceSync >= 24; // Sincronizar a cada 24 horas
  }

  /**
   * Verifica se está rodando no browser (frontend)
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof fetch !== 'undefined';
  }

  /**
   * Sincroniza handitems (com cache de 24h)
   * No browser, apenas carrega dados locais (não faz fetch devido a CORS)
   */
  async sync(force: boolean = false): Promise<HanditemData[]> {
    // No browser, sempre usar apenas dados locais (não fazer fetch devido a CORS)
    if (this.isBrowser()) {
      console.log('🌐 Browser detectado: usando apenas dados locais (sem sincronização de hotéis)');
      
      // Tentar carregar do arquivo primeiro
      try {
        const fileData = await this.loadLocalHanditems();
        if (fileData.length > 0) {
          console.log(`📦 Carregados ${fileData.length} handitems do arquivo local`);
          const newCount = fileData.filter(h => h.isNew).length;
          if (newCount > 0) {
            console.log(`🆕 ${newCount} handitems marcados como novos no arquivo local`);
          }
          // Salvar no cache para uso futuro
          this.saveToLocalStorage(fileData);
          return fileData;
        }
      } catch (fileError) {
        console.warn('Não foi possível carregar do arquivo, tentando localStorage...');
      }
      
      // Fallback: usar localStorage
      const cached = this.loadFromLocalStorage();
      if (cached && cached.handitems.length > 0) {
        console.log('📦 Usando handitems em cache', cached.handitems.length, 'handitems');
        const newCount = cached.handitems.filter(h => h.isNew).length;
        if (newCount > 0) {
          console.log(`🆕 ${newCount} handitems marcados como novos no cache`);
        }
        return cached.handitems;
      }
      
      // Se não há dados, retornar array vazio
      console.warn('⚠️ Nenhum dado local encontrado. Execute o script de sincronização primeiro.');
      return [];
    }

    // No Node.js, fazer sincronização completa
    // Verificar cache primeiro (a menos que seja forçado)
    if (!force && !this.shouldSync()) {
      const cached = this.loadFromLocalStorage();
      if (cached) {
        console.log('📦 Usando handitems em cache', cached.handitems.length, 'handitems');
        // Verificar se há handitems novos no cache
        const newCount = cached.handitems.filter(h => h.isNew).length;
        if (newCount > 0) {
          console.log(`🆕 ${newCount} handitems marcados como novos no cache`);
        }
        // Mesmo usando cache, verificar se o arquivo tem dados mais atualizados
        try {
          const fileData = await this.loadLocalHanditems();
          const fileNewCount = fileData.filter(h => h.isNew).length;
          if (fileNewCount > newCount && fileData.length >= cached.handitems.length) {
            console.log(`📦 Arquivo tem mais handitems novos (${fileNewCount} vs ${newCount}), usando arquivo`);
            return fileData;
          }
        } catch (fileError) {
          // Se não conseguir carregar arquivo, usar cache
        }
        return cached.handitems;
      }
    }

    try {
      // Tentar sincronizar de todos os hotéis (apenas no Node.js)
      const syncedHanditems = await this.syncAllHotels();
      
      if (syncedHanditems.length > 0) {
        // Carregar handitems anteriores para identificar novos
        // Priorizar arquivo handitems-full.json que tem os dados mais atualizados
        let previous = null;
        
        // Sempre tentar carregar do arquivo primeiro (mais confiável)
        try {
          const localData = await this.loadLocalHanditems();
          if (localData.length > 0) {
            previous = { handitems: localData, lastSync: new Date().toISOString() };
            console.log(`📦 Carregados ${localData.length} handitems anteriores do arquivo para comparação`);
            const fileNewCount = localData.filter(h => h.isNew).length;
            if (fileNewCount > 0) {
              console.log(`📦 Arquivo tem ${fileNewCount} handitems marcados como novos`);
            }
          }
        } catch (fileError) {
          console.warn('Não foi possível carregar handitems anteriores do arquivo, tentando localStorage...');
        }
        
        // Se não conseguiu carregar do arquivo, tentar localStorage
        if (!previous) {
          previous = this.loadFromLocalStorage();
          if (previous) {
            console.log(`📦 Carregados ${previous.handitems.length} handitems anteriores do localStorage para comparação`);
          }
        }
        
        if (previous && previous.handitems.length > 0) {
          // Identificar novos handitems comparando com dados anteriores
          const newHanditems = this.identifyNewHanditems(syncedHanditems, previous.handitems);
          console.log(`🆕 ${newHanditems.length} novos handitems identificados:`, newHanditems.map(h => `ID ${h.id}`).join(', '));
        } else {
          // Se não há dados anteriores, marcar os 5 mais recentes (por ID) como novos
          const sortedById = [...syncedHanditems].sort((a, b) => b.id - a.id);
          // Marcar os 5 com IDs maiores como novos
          sortedById.slice(0, 5).forEach(item => {
            item.isNew = true;
            if (!item.addedDate) {
              item.addedDate = new Date().toISOString();
            }
          });
          console.log('🆕 Marcados 5 handitems mais recentes como novos (sem dados anteriores)');
        }

        // Salvar no cache
        this.saveToLocalStorage(syncedHanditems);
        return syncedHanditems;
      }
    } catch (error) {
      console.error('Error syncing handitems:', error);
    }

    // Fallback: usar arquivo local
    console.log('📦 Usando handitems do arquivo local (fallback)');
    const localHanditems = await this.loadLocalHanditems();
    console.log(`📦 Carregados ${localHanditems.length} handitems do arquivo local`);
    const newCount = localHanditems.filter(h => h.isNew).length;
    if (newCount > 0) {
      console.log(`🆕 ${newCount} handitems marcados como novos no arquivo local`);
    }
    return localHanditems;
  }
}

export const handitemSyncService = new HanditemSyncService();
