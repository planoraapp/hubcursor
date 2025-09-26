// Sistema de preview de avatar com handitems
export class AvatarPreview {
  private baseUrl = 'https://www.habbo.com/habbo-imaging/avatarimage'; // Mudado para domínio internacional
  
  // Gerar URL de avatar com handitem
  generateAvatarUrl(
    habboName: string, 
    handitemId: number | null, 
    options: AvatarOptions = {}
  ): string {
    const {
      size = 'l',
      direction = 2,
      headDirection = 2,
      gesture = 'nrm',
      gender = 'M'
    } = options;
    
    const params = new URLSearchParams({
      user: habboName,
      action: handitemId ? `,crr=${handitemId}` : 'none',
      direction: direction.toString(),
      head_direction: headDirection.toString(),
      gesture: gesture,
      size: size,
      gender: gender
    });
    
    return `${this.baseUrl}?${params.toString()}`;
  }
  
  // Testar se um handitem funciona com um avatar
  async testHanditem(habboName: string, handitemId: number): Promise<boolean> {
    try {
      const url = this.generateAvatarUrl(habboName, handitemId);
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }
  
  // Gerar múltiplas variações de avatar
  generateAvatarVariations(habboName: string, handitemId: number): AvatarVariation[] {
    const sizes = ['s', 'm', 'l', 'xl'];
    const directions = [2, 4, 6, 8];
    
    const variations: AvatarVariation[] = [];
    
    sizes.forEach(size => {
      directions.forEach(direction => {
        variations.push({
          size,
          direction,
          url: this.generateAvatarUrl(habboName, handitemId, { size, direction })
        });
      });
    });
    
    return variations;
  }
  
  // Validar se um nome de Habbo é válido
  async validateHabboName(habboName: string): Promise<boolean> {
    try {
      const url = this.generateAvatarUrl(habboName, null);
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Interfaces para tipagem
export interface AvatarOptions {
  size?: 's' | 'm' | 'l' | 'xl';
  direction?: number;
  headDirection?: number;
  gesture?: string;
  gender?: 'M' | 'F';
}

export interface AvatarVariation {
  size: string;
  direction: number;
  url: string;
}

// Instância global para uso em componentes
export const avatarPreview = new AvatarPreview();
