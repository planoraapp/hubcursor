// Sistema de descoberta automática de handitems
export class HanditemDiscovery {
  private baseUrl = 'https://images.habbotemplarios.com';
  private currentYear = new Date().getFullYear();
  private currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Descobrir handitems automaticamente
  async discoverHanditems(startId = 1, endId = 200): Promise<DiscoveredHanditem[]> {
    const discovered: DiscoveredHanditem[] = [];
    
    console.log(`🔍 Iniciando descoberta de handitems (${startId}-${endId})...`);
    
    for (let id = startId; id <= endId; id++) {
      try {
        const handitem = await this.checkHanditem(id);
        if (handitem) {
          discovered.push(handitem);
          console.log(`✅ Handitem ${id} encontrado: ${handitem.images.length} variações`);
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar handitem ${id}:`, error);
      }
      
      // Pequena pausa para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`🎉 Descoberta concluída: ${discovered.length} handitems encontrados`);
    return discovered;
  }
  
  // Verificar se um handitem específico existe
  private async checkHanditem(id: number): Promise<DiscoveredHanditem | null> {
    const variations = [0, 1, 2, 3];
    const images: HanditemImage[] = [];
    
    for (const variation of variations) {
      const url = `${this.baseUrl}/${this.currentYear}/${this.currentMonth}/handitem${id}_${variation}.png`;
      if (await this.imageExists(url)) {
        images.push({ variation, url });
      }
    }
    
    return images.length > 0 ? { id, images, discovered: new Date().toISOString() } : null;
  }
  
  // Verificar se uma imagem existe
  private async imageExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  // Obter URL de imagem para handitem específico
  getHanditemImageUrl(id: number, variation = 0): string {
    return `${this.baseUrl}/${this.currentYear}/${this.currentMonth}/handitem${id}_${variation}.png`;
  }
  
  // Obter todas as variações de um handitem
  async getHanditemVariations(id: number): Promise<HanditemImage[]> {
    const variations = [0, 1, 2, 3];
    const images: HanditemImage[] = [];
    
    for (const variation of variations) {
      const url = this.getHanditemImageUrl(id, variation);
      if (await this.imageExists(url)) {
        images.push({ variation, url });
      }
    }
    
    return images;
  }
}

// Interfaces para tipagem
export interface HanditemImage {
  variation: number;
  url: string;
}

export interface DiscoveredHanditem {
  id: number;
  images: HanditemImage[];
  discovered: string;
}

// Instância global para uso em componentes
export const handitemDiscovery = new HanditemDiscovery();
