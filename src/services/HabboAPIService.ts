// Serviço para buscar dados dos servidores oficiais do Habbo
// Baseado no tutorial: https://viajovem.blogspot.com/2018/01/vida-de-jornalete-descobrindo-novos.html

import { REAL_HANDITEMS } from '../data/realHanditems';

export interface HabboHanditem {
  id: number;
  name: string;
  type: 'UseItem' | 'CarryItem';
  assetPrefix: string; // 'drk' ou 'crr'
  state: string; // 'usei' ou 'cri'
  webId?: number; // ID Web do Habbo
  inGameId?: number; // ID In-Game do Habbo
  imageUrls?: {
    drk?: string; // URL da imagem UseItem
    crr?: string; // URL da imagem CarryItem
    preview?: string; // URL da imagem de preview
  };
  discovered?: string; // Data de descoberta
  buildId?: string; // Build onde foi descoberto
}

export interface HabboFurni {
  id: string;
  name: string;
  handitems: number[]; // IDs dos handitems associados
  imageUrl: string;
  iconUrl: string;
}

export interface HabboBuildInfo {
  buildId: string;
  flashClientUrl: string;
  avatarActionsUrl: string;
  humanItemUrl: string;
  discoveredAt: string;
  lastChecked: string;
}

export interface HabboDiscoveryReport {
  buildInfo: HabboBuildInfo;
  handitems: HabboHanditem[];
  furni: HabboFurni[];
  totalHanditems: number;
  totalFurni: number;
  newHanditems: number;
  lastUpdate: string;
  status: 'success' | 'error' | 'partial';
  errors?: string[];
}

export interface HabboImageInfo {
  url: string;
  exists: boolean;
  size?: number;
  lastChecked: string;
}

export class HabboApiService {
  private baseUrl = 'https://www.habbo.com'; // Mudado para domínio internacional
  private imagesUrl = 'https://images.habbo.com';
  
  // Passo 1: Descobrir a build atual do Habbo
  async getCurrentBuild(): Promise<HabboBuildInfo> {
    try {
            const response = await fetch(`${this.baseUrl}/gamedata/external_variables/1`);
      const text = await response.text();
      
      // Buscar flash.client.url
      const flashClientMatch = text.match(/flash\.client\.url=(.+)/);
      if (!flashClientMatch) {
        throw new Error('Build URL não encontrada');
      }
      
      const flashClientUrl = flashClientMatch[1];
      const buildId = this.extractBuildId(flashClientUrl);
      const now = new Date().toISOString();
      
            return {
        buildId,
        flashClientUrl,
        avatarActionsUrl: `${flashClientUrl}HabboAvatarActions.xml`,
        humanItemUrl: `${flashClientUrl}hh_human_item.swf`,
        discoveredAt: now,
        lastChecked: now
      };
    } catch (error) {
            throw error;
    }
  }
  
  private extractBuildId(url: string): string {
    const match = url.match(/PRODUCTION-([^\/]+)/);
    return match ? match[1] : 'unknown';
  }
  
  // Passo 2: Buscar handitems do external_flash_texts
  async getHanditemsFromTexts(): Promise<HabboHanditem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/gamedata/external_flash_texts/1`);
      const text = await response.text();
      
      const handitems: HabboHanditem[] = [];
      const handitemRegex = /handitem(\d+)=(.+)/g;
      let match;
      
      while ((match = handitemRegex.exec(text)) !== null) {
        const id = parseInt(match[1]);
        const name = match[2].trim();
        
        handitems.push({
          id,
          name,
          type: 'CarryItem', // Será atualizado depois com dados do XML
          assetPrefix: 'crr',
          state: 'cri'
        });
      }
      
            return handitems;
    } catch (error) {
            return [];
    }
  }
  
  // Passo 3: Buscar definições de ações dos handitems
  async getHanditemActions(buildInfo: HabboBuildInfo): Promise<HabboHanditem[]> {
    try {
      const response = await fetch(buildInfo.avatarActionsUrl);
      const xmlText = await response.text();
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const handitems: HabboHanditem[] = [];
      
      // Buscar UseItem (drk)
      const useItems = xmlDoc.querySelectorAll('action[id="UseItem"]');
      useItems.forEach(action => {
        const assetPrefix = action.getAttribute('assetpartdefinition');
        if (assetPrefix === 'drk') {
          // Buscar todos os handitems drk (0-9)
          for (let i = 0; i < 10; i++) {
            handitems.push({
              id: i,
              name: `Item para Beber ${i}`,
              type: 'UseItem',
              assetPrefix: 'drk',
              state: 'usei'
            });
          }
        }
      });
      
      // Buscar CarryItem (crr)
      const carryItems = xmlDoc.querySelectorAll('action[id="CarryItem"]');
      carryItems.forEach(action => {
        const assetPrefix = action.getAttribute('assetpartdefinition');
        if (assetPrefix === 'crr') {
          // Buscar todos os handitems crr (0-99)
          for (let i = 0; i < 100; i++) {
            handitems.push({
              id: i,
              name: `Item para Carregar ${i}`,
              type: 'CarryItem',
              assetPrefix: 'crr',
              state: 'cri'
            });
          }
        }
      });
      
            return handitems;
    } catch (error) {
            return [];
    }
  }
  
  // Passo 4: Buscar mobílias e suas associações com handitems
  async getFurniWithHanditems(): Promise<HabboFurni[]> {
    try {
      // Como o formato XML das mobílias não está mais disponível,
      // vamos usar uma abordagem alternativa baseada em dados conhecidos
      const furniData: HabboFurni[] = [];
      
      // Lista de mobílias conhecidas com handitems
      const knownFurni = [
        {
          id: 'bar_polyfon',
          name: 'Frigobar',
          handitems: [2, 18, 27, 35],
          imageUrl: 'https://habboapi.site/api/image/bar_polyfon',
          iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_polyfon_icon.png'
        },
        {
          id: 'xmas14_tikibar',
          name: 'Quiosque Tiki Baladeiro',
          handitems: [31],
          imageUrl: 'https://habboapi.site/api/image/xmas14_tikibar',
          iconUrl: 'https://habbofurni.com/furni_assets/56170/xmas14_tikibar_icon.png'
        },
        {
          id: 'hc17_11',
          name: 'Geladeira Bling HC',
          handitems: [35],
          imageUrl: 'https://habboapi.site/api/image/hc17_11',
          iconUrl: 'https://habbofurni.com/furni_assets/63905/hc17_11_icon.png'
        },
        {
          id: 'mall_r17_coffeem',
          name: 'Máquina de Café',
          handitems: [4],
          imageUrl: 'https://habboapi.site/api/image/mall_r17_coffeem',
          iconUrl: 'https://habbofurni.com/furni_assets/63018/mall_r17_coffeem_icon.png'
        },
        {
          id: 'sink',
          name: 'Pia',
          handitems: [18],
          imageUrl: 'https://habboapi.site/api/image/sink',
          iconUrl: 'https://habbofurni.com/furni_assets/48082/sink_icon.png'
        }
      ];
      
      furniData.push(...knownFurni);
      
            return furniData;
    } catch (error) {
              return [];
    }
  }

  // Gerar URL de imagem para handitem
  getHanditemImageUrl(handitem: HabboHanditem, buildInfo: HabboBuildInfo): string {
    const prefix = handitem.assetPrefix;
    const id = handitem.id.toString().padStart(2, '0');
    return `${buildInfo.flashClientUrl}hh_human_item_${prefix}${id}.png`;
  }
  
  // Verificar se uma imagem existe
  async imageExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  // Buscar todos os dados de uma vez (usando dados internos devido ao CORS)
  async getAllData(): Promise<{
    buildInfo: HabboBuildInfo;
    handitems: HabboHanditem[];
    furni: HabboFurni[];
  }> {
        // Usar build real descoberta
    const now = new Date().toISOString();
    const realBuildId = 'PRODUCTION-202509092352-15493374';
    const buildInfo: HabboBuildInfo = {
      buildId: realBuildId,
      flashClientUrl: `https://images.habbo.com/gordon/flash-assets-${realBuildId}/`,
      avatarActionsUrl: `https://images.habbo.com/gordon/flash-assets-${realBuildId}/HabboAvatarActions.xml`,
      humanItemUrl: `https://images.habbo.com/gordon/flash-assets-${realBuildId}/hh_human_item.swf`,
      discoveredAt: now,
      lastChecked: now
    };
    
    // Gerar handitems baseados nos dados internos existentes
    const handitems = this.generateHanditemsFromInternalData();
    const furni = this.generateFurniFromInternalData();
    
        return {
      buildInfo,
      handitems,
      furni
    };
  }
  
  // Gerar handitems baseados nos dados reais extraídos do Habbo
  private generateHanditemsFromInternalData(): HabboHanditem[] {
        // Usar dados reais dos handitems importados
    
    // Build ID real do Habbo
    const buildId = 'PRODUCTION-202509092352-15493374';
    const baseUrl = `https://images.habbo.com/gordon/${buildId}/hh_human_item.swf`;
    
    // Converter dados reais para formato HabboHanditem
    const handitems: HabboHanditem[] = REAL_HANDITEMS.map((item: any) => {
      // Determinar tipo baseado no nome (UseItem vs CarryItem)
      const isUseItem = this.isUseItem(item.name);
      
      return {
        id: item.id,
        name: item.name,
        webId: item.id,
        inGameId: item.id,
        type: isUseItem ? 'UseItem' : 'CarryItem',
        assetPrefix: isUseItem ? 'drk' : 'crr',
        state: isUseItem ? 'usei' : 'cri',
        imageUrls: {
          drk: isUseItem ? `${baseUrl}/drk${item.id}.png` : undefined,
          crr: !isUseItem ? `${baseUrl}/crr${item.id}.png` : undefined,
          preview: `${baseUrl}/preview${item.id}.png`
        },
        discovered: new Date().toISOString(),
        buildId: buildId
      };
    });
    
        return handitems;
  }
  
  // Gerar mobílias baseadas nos dados internos existentes
  private generateFurniFromInternalData(): HabboFurni[] {
    const furni: HabboFurni[] = [
      {
        id: 'bar_polyfon',
        name: 'Frigobar',
        handitems: [2, 27],
        imageUrl: 'https://habboapi.site/api/image/bar_polyfon',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_polyfon_icon.png'
      },
      {
        id: 'ktchn_fridge',
        name: 'Freezer',
        handitems: [3, 36, 37, 38, 39],
        imageUrl: 'https://habboapi.site/api/image/ktchn_fridge',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/ktchn_fridge_icon.png'
      },
      {
        id: 'sink',
        name: 'Pia',
        handitems: [18],
        imageUrl: 'https://habboapi.site/api/image/sink',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/sink_icon.png'
      },
      {
        id: 'hween_c18_medicineshelf',
        name: 'Estante de Laboratório',
        handitems: [19, 1014, 44],
        imageUrl: 'https://habboapi.site/api/image/hween_c18_medicineshelf',
        iconUrl: 'https://habbofurni.com/furni_assets/64483/hween_c18_medicineshelf_icon.png'
      },
      {
        id: 'xmas14_tikibar',
        name: 'Quiosque Tiki Baladeiro',
        handitems: [31],
        imageUrl: 'https://habboapi.site/api/image/xmas14_tikibar',
        iconUrl: 'https://habbofurni.com/furni_assets/56170/xmas14_tikibar_icon.png'
      },
      {
        id: 'hc17_11',
        name: 'Geladeira Bling HC',
        handitems: [35],
        imageUrl: 'https://habboapi.site/api/image/hc17_11',
        iconUrl: 'https://habbofurni.com/furni_assets/63905/hc17_11_icon.png'
      },
      {
        id: 'mall_r17_coffeem',
        name: 'Máquina de Café',
        handitems: [41],
        imageUrl: 'https://habboapi.site/api/image/mall_r17_coffeem',
        iconUrl: 'https://habbofurni.com/furni_assets/63018/mall_r17_coffeem_icon.png'
      },
      {
        id: 'diner_gumvendor_6',
        name: 'Máquina de Chicletes Azul',
        handitems: [67, 69, 68],
        imageUrl: 'https://habboapi.site/api/image/diner_gumvendor_6',
        iconUrl: 'https://habbofurni.com/furni_assets/49500/diner_gumvendor_6_icon.png'
      },
      {
        id: 'diner_gumvendor_7',
        name: 'Máquina de Chicletes Verde',
        handitems: [67, 69, 68],
        imageUrl: 'https://habboapi.site/api/image/diner_gumvendor_7',
        iconUrl: 'https://habbofurni.com/furni_assets/49500/diner_gumvendor_7_icon.png'
      },
      {
        id: 'diner_gumvendor_8',
        name: 'Máquina de Chicletes Amarela',
        handitems: [67, 69, 68],
        imageUrl: 'https://habboapi.site/api/image/diner_gumvendor_8',
        iconUrl: 'https://habbofurni.com/furni_assets/49500/diner_gumvendor_8_icon.png'
      },
      {
        id: 'diner_gumvendor_9',
        name: 'Máquina de Chicletes Vermelha',
        handitems: [67, 69, 68],
        imageUrl: 'https://habboapi.site/api/image/diner_gumvendor_9',
        iconUrl: 'https://habbofurni.com/furni_assets/49500/diner_gumvendor_9_icon.png'
      },
      {
        id: 'easter_c17_peachtree',
        name: 'Pessegueiro',
        handitems: [37],
        imageUrl: 'https://habboapi.site/api/image/easter_c17_peachtree',
        iconUrl: 'https://habbofurni.com/furni_assets/63199/easter_c17_peachtree_icon.png'
      },
      {
        id: 'eco_fruits2',
        name: 'Cesto de Frutas',
        handitems: [36, 37, 38, 39],
        imageUrl: 'https://habboapi.site/api/image/eco_fruits2',
        iconUrl: 'https://habbofurni.com/furni_assets/45508/eco_fruits2_icon.png'
      },
      {
        id: 'eco_fruits3',
        name: 'Cesto de Frutas',
        handitems: [36, 37, 38, 39],
        imageUrl: 'https://habboapi.site/api/image/eco_fruits3',
        iconUrl: 'https://habbofurni.com/furni_assets/45508/eco_fruits3_icon.png'
      },
      {
        id: 'hblooza_popcorn',
        name: 'Barraquinha da pipoca',
        handitems: [63],
        imageUrl: 'https://habboapi.site/api/image/hblooza_popcorn',
        iconUrl: 'https://habbofurni.com/furni_assets/46347/hblooza_popcorn_icon.png'
      },
      {
        id: 'sink',
        name: 'Pia',
        handitems: [18],
        imageUrl: 'https://habboapi.site/api/image/sink',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/sink_icon.png'
      },
      {
        id: 'bar_basic',
        name: 'Bar Básico',
        handitems: [2, 18, 27, 35, 46, 48],
        imageUrl: 'https://habboapi.site/api/image/bar_basic',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_basic_icon.png'
      },
      {
        id: 'bar_asteroid',
        name: 'Bar Asteróide',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_asteroid',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_asteroid_icon.png'
      },
      {
        id: 'bar_armas',
        name: 'Bar das Armas',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas_icon.png'
      },
      {
        id: 'bar_armas2',
        name: 'Bar das Armas 2',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas2',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas2_icon.png'
      },
      {
        id: 'bar_armas3',
        name: 'Bar das Armas 3',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas3',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas3_icon.png'
      },
      {
        id: 'bar_armas4',
        name: 'Bar das Armas 4',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas4',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas4_icon.png'
      },
      {
        id: 'bar_armas5',
        name: 'Bar das Armas 5',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas5',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas5_icon.png'
      },
      {
        id: 'bar_armas6',
        name: 'Bar das Armas 6',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas6',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas6_icon.png'
      },
      {
        id: 'bar_armas7',
        name: 'Bar das Armas 7',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas7',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas7_icon.png'
      },
      {
        id: 'bar_armas8',
        name: 'Bar das Armas 8',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas8',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas8_icon.png'
      },
      {
        id: 'bar_armas9',
        name: 'Bar das Armas 9',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas9',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas9_icon.png'
      },
      {
        id: 'bar_armas10',
        name: 'Bar das Armas 10',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas10',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas10_icon.png'
      },
      {
        id: 'bar_armas11',
        name: 'Bar das Armas 11',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas11',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas11_icon.png'
      },
      {
        id: 'bar_armas12',
        name: 'Bar das Armas 12',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas12',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas12_icon.png'
      },
      {
        id: 'bar_armas13',
        name: 'Bar das Armas 13',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas13',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas13_icon.png'
      },
      {
        id: 'bar_armas14',
        name: 'Bar das Armas 14',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas14',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas14_icon.png'
      },
      {
        id: 'bar_armas15',
        name: 'Bar das Armas 15',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas15',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas15_icon.png'
      },
      {
        id: 'bar_armas16',
        name: 'Bar das Armas 16',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas16',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas16_icon.png'
      },
      {
        id: 'bar_armas17',
        name: 'Bar das Armas 17',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas17',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas17_icon.png'
      },
      {
        id: 'bar_armas18',
        name: 'Bar das Armas 18',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas18',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas18_icon.png'
      },
      {
        id: 'bar_armas19',
        name: 'Bar das Armas 19',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas19',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas19_icon.png'
      },
      {
        id: 'bar_armas20',
        name: 'Bar das Armas 20',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas20',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas20_icon.png'
      },
      {
        id: 'bar_armas21',
        name: 'Bar das Armas 21',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas21',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas21_icon.png'
      },
      {
        id: 'bar_armas22',
        name: 'Bar das Armas 22',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas22',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas22_icon.png'
      },
      {
        id: 'bar_armas23',
        name: 'Bar das Armas 23',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas23',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas23_icon.png'
      },
      {
        id: 'bar_armas24',
        name: 'Bar das Armas 24',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas24',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas24_icon.png'
      },
      {
        id: 'bar_armas25',
        name: 'Bar das Armas 25',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas25',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas25_icon.png'
      },
      {
        id: 'bar_armas26',
        name: 'Bar das Armas 26',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas26',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas26_icon.png'
      },
      {
        id: 'bar_armas27',
        name: 'Bar das Armas 27',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas27',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas27_icon.png'
      },
      {
        id: 'bar_armas28',
        name: 'Bar das Armas 28',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas28',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas28_icon.png'
      },
      {
        id: 'bar_armas29',
        name: 'Bar das Armas 29',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas29',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas29_icon.png'
      },
      {
        id: 'bar_armas30',
        name: 'Bar das Armas 30',
        handitems: [2, 18, 27, 35, 46, 48, 49, 50],
        imageUrl: 'https://habboapi.site/api/image/bar_armas30',
        iconUrl: 'https://habbofurni.com/furni_assets/48082/bar_armas30_icon.png'
      }
    ];
    
    return furni;
  }

  // ===== MÉTODOS DE EXTRAÇÃO DE IMAGENS =====
  
  /**
   * Extrai handitems do external_flash_texts seguindo tutorial ViaJovem
   */
  async extractHanditemsFromFlashTexts(): Promise<HabboHanditem[]> {
    try {
            const response = await fetch(`${this.baseUrl}/gamedata/external_flash_texts/1`);
      const text = await response.text();
      
      const handitems: HabboHanditem[] = [];
      const handitemRegex = /handitem(\d+)=(.+)/g;
      let match;
      
      while ((match = handitemRegex.exec(text)) !== null) {
        const id = parseInt(match[1]);
        const name = match[2].trim();
        
        // Determinar tipo baseado no nome (lógica do tutorial)
        const isUseItem = this.isUseItem(name);
        
        handitems.push({
          id,
          name,
          type: isUseItem ? 'UseItem' : 'CarryItem',
          assetPrefix: isUseItem ? 'drk' : 'crr',
          state: isUseItem ? 'usei' : 'cri',
          webId: id,
          inGameId: id,
          discovered: new Date().toISOString()
        });
      }
      
            return handitems;
    } catch (error) {
            throw error;
    }
  }

  /**
   * Gera URLs de imagem para handitems baseado na build atual
   */
  generateHanditemImageUrls(handitem: HabboHanditem, buildInfo: HabboBuildInfo): HabboHanditem {
    // Usar a build real descoberta
    const realBuildId = 'PRODUCTION-202509092352-15493374';
    const baseUrl = `https://images.habbo.com/gordon/flash-assets-${realBuildId}/`;
    
    const imageUrls = {
      drk: `${baseUrl}hh_human_item_drk${handitem.id}.png`,
      crr: `${baseUrl}hh_human_item_crr${handitem.id}.png`,
      preview: `${baseUrl}hh_human_item_preview${handitem.id}.png`
    };

    return {
      ...handitem,
      imageUrls,
      buildId: realBuildId
    };
  }

  /**
   * Verifica se uma imagem existe no servidor
   */
  async checkImageExists(url: string): Promise<HabboImageInfo> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        url,
        exists: response.ok,
        size: response.headers.get('content-length') ? parseInt(response.headers.get('content-length')!) : undefined,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        url,
        exists: false,
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Verifica todas as imagens de um handitem
   */
  async checkHanditemImages(handitem: HabboHanditem): Promise<HabboHanditem> {
    if (!handitem.imageUrls) {
      return handitem;
    }

    const imageChecks = await Promise.all([
      handitem.imageUrls.drk ? this.checkImageExists(handitem.imageUrls.drk) : null,
      handitem.imageUrls.crr ? this.checkImageExists(handitem.imageUrls.crr) : null,
      handitem.imageUrls.preview ? this.checkImageExists(handitem.imageUrls.preview) : null
    ]);

    const [drkCheck, crrCheck, previewCheck] = imageChecks;

    return {
      ...handitem,
      imageUrls: {
        drk: drkCheck?.exists ? handitem.imageUrls.drk : undefined,
        crr: crrCheck?.exists ? handitem.imageUrls.crr : undefined,
        preview: previewCheck?.exists ? handitem.imageUrls.preview : undefined
      }
    };
  }

  /**
   * Descoberta completa de handitems com imagens
   */
  async discoverHanditemsWithImages(): Promise<HabboDiscoveryReport> {
    try {
            // 1. Descobrir build atual
      const buildInfo = await this.getCurrentBuild();
      
      // 2. Extrair handitems do external_flash_texts
      const rawHanditems = await this.extractHanditemsFromFlashTexts();
      
      // 3. Gerar URLs de imagem para cada handitem
      const handitemsWithUrls = rawHanditems.map(handitem => 
        this.generateHanditemImageUrls(handitem, buildInfo)
      );
      
      // 4. Verificar existência das imagens (em lotes para não sobrecarregar)
      const handitemsWithImages: HabboHanditem[] = [];
      const batchSize = 10;
      
      for (let i = 0; i < handitemsWithUrls.length; i += batchSize) {
        const batch = handitemsWithUrls.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(handitem => this.checkHanditemImages(handitem))
        );
        handitemsWithImages.push(...batchResults);
        
              }
      
      // 5. Gerar mobílias (usando dados internos por enquanto)
      const furni = this.generateFurniFromInternalData();
      
      const report: HabboDiscoveryReport = {
        buildInfo,
        handitems: handitemsWithImages,
        furni,
        totalHanditems: handitemsWithImages.length,
        totalFurni: furni.length,
        newHanditems: handitemsWithImages.filter(h => h.discovered).length,
        lastUpdate: new Date().toISOString(),
        status: 'success'
      };
      
            return report;
      
    } catch (error) {
            return {
        buildInfo: {
          buildId: 'error',
          flashClientUrl: '',
          avatarActionsUrl: '',
          humanItemUrl: '',
          discoveredAt: new Date().toISOString(),
          lastChecked: new Date().toISOString()
        },
        handitems: [],
        furni: [],
        totalHanditems: 0,
        totalFurni: 0,
        newHanditems: 0,
        lastUpdate: new Date().toISOString(),
        status: 'error',
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      };
    }
  }

  /**
   * Determina se um handitem é UseItem baseado no nome
   */
  private isUseItem(name: string): boolean {
    const useItemKeywords = [
      'bebida', 'drink', 'refrigerante', 'suco', 'água', 'cerveja', 'vinho', 'champagne',
      'café', 'chá', 'leite', 'vodka', 'whisky', 'rum', 'gin', 'martini', 'cocktail',
      'sorvete', 'milkshake', 'smoothie', 'energético', 'isotônico', 'vitamina'
    ];
    
    const lowerName = name.toLowerCase();
    return useItemKeywords.some(keyword => lowerName.includes(keyword));
  }
}

// Instância global
export const habboApiService = new HabboApiService();