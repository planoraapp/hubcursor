// Utility para descobrir URLs de imagens de handitems e mobis
export class ImageDiscovery {
  private static readonly HABBO_TEMPLARIOS_BASE = 'https://images.habbotemplarios.com';
  private static readonly HABBO_IMAGING_BASE = 'https://www.habbo.com/habbo-imaging';
  
  // URLs conhecidas que funcionam
  private static readonly WORKING_HANDITEM_URLS = {
    1: 'https://images.habbotemplarios.com/web/avatargen/hand_carrot.png',
    2: 'https://images.habbotemplarios.com/web/avatargen/hand_tomato.png',
    3: 'https://images.habbotemplarios.com/web/avatargen/hand_apple.png',
    4: 'https://images.habbotemplarios.com/web/avatargen/hand_banana.png',
    5: 'https://images.habbotemplarios.com/web/avatargen/hand_bread.png',
    6: 'https://images.habbotemplarios.com/web/avatargen/hand_coffee.png',
    7: 'https://images.habbotemplarios.com/web/avatargen/hand_japanesetea.png',
    8: 'https://images.habbotemplarios.com/web/avatargen/hand_habbocola.png',
    9: 'https://images.habbotemplarios.com/web/avatargen/hand_water.png',
    10: 'https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png',
    11: 'https://images.habbotemplarios.com/web/avatargen/hand_lovepotion.png',
    12: 'https://images.habbotemplarios.com/web/avatargen/hand_radioactive.png',
    13: 'https://images.habbotemplarios.com/web/avatargen/hand_icecream.png',
    14: 'https://images.habbotemplarios.com/web/avatargen/hand_calippo.png'
  };
  
  private static readonly WORKING_MOBI_URLS = {
    1001: 'https://images.habbotemplarios.com/furni/1001.png',
    1002: 'https://images.habbotemplarios.com/furni/1002.png',
    1003: 'https://images.habbotemplarios.com/furni/1003.png',
    1004: 'https://images.habbotemplarios.com/furni/1004.png',
    1005: 'https://images.habbotemplarios.com/furni/1005.png'
  };
  
  /**
   * Gera URLs de fallback para handitems
   */
  static getHanditemImageUrls(id: number, name: string): string[] {
    const urls: string[] = [];
    
    // URL conhecida que funciona
    if (this.WORKING_HANDITEM_URLS[id]) {
      urls.push(this.WORKING_HANDITEM_URLS[id]);
    }
    
    // Gerar URLs baseadas no nome
    const nameSlug = this.createSlug(name);
    
    // Padrões do HabboTemplarios
    urls.push(`${this.HABBO_TEMPLARIOS_BASE}/web/avatargen/hand_${nameSlug}.png`);
    urls.push(`${this.HABBO_TEMPLARIOS_BASE}/web/avatargen/handitem${id}.png`);
    urls.push(`${this.HABBO_TEMPLARIOS_BASE}/web/avatargen/handitem${id}_0.png`);
    urls.push(`${this.HABBO_TEMPLARIOS_BASE}/web/avatargen/handitem${id}_1.png`);
    
    // Padrões alternativos
    urls.push(`${this.HABBO_TEMPLARIOS_BASE}/2025/09/handitem${id}.png`);
    urls.push(`${this.HABBO_TEMPLARIOS_BASE}/2025/09/handitem${id}_0.png`);
    urls.push(`${this.HABBO_TEMPLARIOS_BASE}/2025/09/handitem${id}_1.png`);
    
    // URLs do Habbo Imaging (para avatar com handitem)
    urls.push(`${this.HABBO_IMAGING_BASE}/avatarimage?figure=hr-100-undefined-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-&gender=M&direction=2&head_direction=2&action=,crr=${id}&gesture=nrm&size=l`);
    
    return urls;
  }
  
  /**
   * Gera URLs de fallback para mobis
   */
  static getMobiImageUrls(id: number, name: string): string[] {
    const urls: string[] = [];
    
    // URL conhecida que funciona
    if (this.WORKING_MOBI_URLS[id]) {
      urls.push(this.WORKING_MOBI_URLS[id]);
    }
    
    // Gerar URLs baseadas no nome
    const nameSlug = this.createSlug(name);
    
    // Padrões do HabboTemplarios
    urls.push(`${this.HABBO_TEMPLARIOS_BASE}/furni/${nameSlug}.png`);
    urls.push(`${this.HABBO_TEMPLARIOS_BASE}/furni/${id}.png`);
    urls.push(`${this.HABBO_TEMPLARIOS_BASE}/furni/${id}_0.png`);
    urls.push(`${this.HABBO_TEMPLARIOS_BASE}/furni/${id}_1.png`);
    
    // Padrões alternativos
    urls.push(`${this.HABBO_TEMPLARIOS_BASE}/2025/09/furni${id}.png`);
    urls.push(`${this.HABBO_TEMPLARIOS_BASE}/2025/09/furni${id}_0.png`);
    urls.push(`${this.HABBO_TEMPLARIOS_BASE}/2025/09/furni${id}_1.png`);
    
    return urls;
  }
  
  /**
   * Cria um slug a partir do nome
   */
  private static createSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }
  
  /**
   * Testa se uma URL de imagem é válida
   */
  static async testImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  /**
   * Encontra a primeira URL válida de uma lista
   */
  static async findValidImageUrl(urls: string[]): Promise<string | null> {
    for (const url of urls) {
      if (await this.testImageUrl(url)) {
        return url;
      }
    }
    return null;
  }
}

// Hook para descobrir imagens automaticamente
export const useImageDiscovery = () => {
  const discoverHanditemImage = async (id: number, name: string): Promise<string> => {
    const urls = ImageDiscovery.getHanditemImageUrls(id, name);
    const validUrl = await ImageDiscovery.findValidImageUrl(urls);
    return validUrl || '/placeholder.svg';
  };
  
  const discoverMobiImage = async (id: number, name: string): Promise<string> => {
    const urls = ImageDiscovery.getMobiImageUrls(id, name);
    const validUrl = await ImageDiscovery.findValidImageUrl(urls);
    return validUrl || '/placeholder.svg';
  };
  
  return {
    discoverHanditemImage,
    discoverMobiImage
  };
};
