// Serviço para acessar a HabboFurni API e obter dados corretos dos mobis
export interface HabboFurniItem {
  id: number;
  classname: string;
  name: string;
  description: string;
  category: string;
  type: string;
  revision: number;
  furni_line: string;
  rare: boolean;
  icon: {
    exists: boolean;
    url: string;
    path: string;
  };
  swf: {
    exists: boolean;
    url: string;
    path: string;
  };
  swf_data?: {
    animation_count: number;
    xdim: number;
    ydim: number;
    zdim: number;
    visualization: string;
    logic: string;
  };
}

export interface HabboFurniResponse {
  data: HabboFurniItem[];
  hotel: {
    id: number;
    domain: string;
    name: string;
    language: string;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export class HabboFurniService {
  private static readonly BASE_URL = 'https://habbofurni.com/api/v1';
  private static readonly HOTEL_ID = 2; // Habbo Brasil
  private static readonly API_TOKEN = '140|Vfir9f5bgqsLkCMDrgXz6rC6lssEpHNVEu45kkK006bdd0de';

  /**
   * Busca um mobi específico por classname
   */
  static async getFurnitureByClassname(classname: string): Promise<HabboFurniItem | null> {
    try {
      const url = `${this.BASE_URL}/furniture/${classname}`;
      
      console.log(`🔍 [HabboFurniService] Buscando mobi: ${classname}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.API_TOKEN}`,
          'X-Hotel-ID': this.HOTEL_ID.toString(),
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`⚠️ [HabboFurniService] Mobi não encontrado: ${classname}`);
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ [HabboFurniService] Mobi encontrado: ${data.data?.name || classname}`);
      
      return data.data;
      
    } catch (error) {
      console.error(`❌ [HabboFurniService] Erro ao buscar ${classname}:`, error);
      return null;
    }
  }

  /**
   * Busca múltiplos mobis por classnames
   */
  static async getMultipleFurniture(classnames: string[]): Promise<Map<string, HabboFurniItem>> {
    const results = new Map<string, HabboFurniItem>();
    
    console.log(`🔍 [HabboFurniService] Buscando ${classnames.length} mobis...`);
    
    for (const classname of classnames) {
      try {
        const mobi = await this.getFurnitureByClassname(classname);
        if (mobi) {
          results.set(classname, mobi);
        }
        
        // Pequena pausa para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ [HabboFurniService] Erro ao buscar ${classname}:`, error);
      }
    }
    
    console.log(`✅ [HabboFurniService] ${results.size} mobis encontrados de ${classnames.length} solicitados`);
    return results;
  }

  /**
   * Busca mobis por categoria
   */
  static async searchFurniture(params: {
    category?: string;
    type?: string;
    search?: string;
    per_page?: number;
    page?: number;
  } = {}): Promise<HabboFurniResponse | null> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.category) queryParams.append('category', params.category);
      if (params.type) queryParams.append('type', params.type);
      if (params.search) queryParams.append('search', params.search);
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      
      const url = `${this.BASE_URL}/furniture?${queryParams.toString()}`;
      
      console.log(`🔍 [HabboFurniService] Buscando: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.API_TOKEN}`,
          'X-Hotel-ID': this.HOTEL_ID.toString(),
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`📊 [HabboFurniService] Resposta recebida: ${data.data?.length || 0} itens`);
      
      return data;
      
    } catch (error) {
      console.error('❌ [HabboFurniService] Erro na busca:', error);
      return null;
    }
  }

  /**
   * Testa se a API está acessível
   */
  static async testApiAccess(): Promise<boolean> {
    try {
      console.log('🧪 [HabboFurniService] Testando acesso à API...');
      
      const response = await this.searchFurniture({ per_page: 1, page: 1 });
      
      if (response && response.data && response.data.length > 0) {
        console.log('✅ [HabboFurniService] API acessível!');
        return true;
      } else {
        console.log('❌ [HabboFurniService] API retornou dados vazios');
        return false;
      }
      
    } catch (error) {
      console.error('❌ [HabboFurniService] Erro ao testar API:', error);
      return false;
    }
  }
}
