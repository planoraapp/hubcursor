// Sistema de preview de avatar com handitems
import { handitemActionMapper } from './handitemActionMapper';

export class AvatarPreview {
  private baseUrl = 'https://www.habbo.com.br/habbo-imaging/avatarimage'; // Usando .com.br por padrão
  
  // Gerar URL de avatar com handitem
  // Prioriza figurestring quando disponível (formato correto do Habbo)
  generateAvatarUrl(
    habboName: string, 
    handitemId: number | null, 
    options: AvatarOptions = {}
  ): string {
    const {
      size = 'm',
      direction = 2,
      headDirection = 2,
      gesture = 'nrm',
      gender = 'M',
      hotel = 'com.br',
      figureString
    } = options;
    
    // Usar domínio do hotel especificado
    const hotelDomain = hotel === 'com.br' ? 'habbo.com.br' : `habbo.${hotel}`;
    const baseUrl = `https://www.${hotelDomain}/habbo-imaging/avatarimage`;
    
    // Construir parâmetros manualmente para ter controle total sobre o formato
    // Isso garante que a vírgula na action seja literal, não codificada
    const params: string[] = [];
    
    params.push(`direction=${direction}`);
    params.push(`head_direction=${headDirection}`);
    
    // Quando há handitem, usar gesture=std (padrão do Habbo)
    // Quando não há handitem, usar o gesture fornecido (ou nrm como padrão)
    const actualGesture = handitemId && handitemId !== 0 ? 'std' : gesture;
    params.push(`gesture=${actualGesture}`);
    
    params.push(`size=${size}`);
    
    // Priorizar figurestring quando disponível (formato correto)
    if (figureString && figureString.trim()) {
      params.push(`figure=${encodeURIComponent(figureString.trim())}`);
      // Adicionar gender se disponível (M ou F)
      if (gender) {
        params.push(`gender=${gender}`);
      }
    } else {
      // Fallback para user se figurestring não estiver disponível
      const userName = habboName && habboName.trim() ? habboName.trim() : 'habbohub';
      params.push(`user=${encodeURIComponent(userName)}`);
    }
    
    // Adicionar action
    if (handitemId && handitemId !== 0) {
      // Para UseItems (ID < 1000), usar drk com animação de drink
      // Para CarryItems (ID >= 1000), usar crr com animação de carry
      const isCarryItem = handitemId >= 1000;
      const actionType = isCarryItem ? 'crr' : 'drk';
      
      // Obter o valor mapeado do ID (o Habbo usa valores mapeados, não IDs diretos)
      const mappedValue = handitemActionMapper.getMappedValue(handitemId, actionType);
      
      // Formato correto: action=std,drk=VALOR ou action=std,crr=VALOR
      // Deve começar com "std" e depois adicionar a ação do handitem com o valor mapeado
      params.push(`action=std,${actionType}=${mappedValue}`);
    } else {
      // Se não houver handitem, usar action=std
      params.push(`action=std`);
    }
    
    const queryString = params.join('&');
    const finalUrl = `${baseUrl}?${queryString}`;
    
    // Debug: logar URL gerada para verificação
    if (handitemId && handitemId !== 0) {
      const actionType = handitemId >= 1000 ? 'crr' : 'drk';
      const mappedValue = handitemActionMapper.getMappedValue(handitemId, actionType);
      console.log(`🎯 Avatar URL gerada:`, {
        handitemId,
        mappedValue,
        actionType,
        isCarryItem: handitemId >= 1000,
        hasMapping: handitemActionMapper.hasMapping(handitemId, actionType),
        hasFigureString: !!figureString,
        figureString: figureString ? figureString.substring(0, 100) + '...' : 'N/A',
        gender,
        hotel,
        actionValue: `std,${actionType}=${mappedValue}`,
        gesture: actualGesture,
        url: finalUrl,
        queryString: queryString
      });
    }
    
    return finalUrl;
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
  
  // Gerar URLs de animação para drink/carry (múltiplos frames)
  // No Habbo, as animações de drink e carry têm múltiplos frames
  // Como o Habbo Imaging não suporta frame diretamente, vamos usar diferentes
  // combinações de gesture para simular os diferentes frames da animação
  generateAnimationFrames(
    habboName: string,
    handitemId: number | null,
    options: AvatarOptions = {}
  ): string[] {
    if (!handitemId || handitemId === 0) {
      return [this.generateAvatarUrl(habboName, null, options)];
    }

    const isCarryItem = handitemId >= 1000;
    // Para drink (drk), a animação mostra o avatar bebendo (movimento de levar à boca)
    // Para carry (crr), a animação mostra o avatar carregando o item (movimento de segurar)
    
    const frames: string[] = [];
    const frameCount = 6; // 6 frames para animação suave e performática
    
    // Sequência de gestures que simula a animação de drink/carry
    // Para drink: nrm -> spk (levar à boca) -> nrm -> sml (sorrir após beber) -> nrm -> spk
    // Para carry: nrm -> nrm (segurar) -> sml -> nrm -> nrm -> sml
    const gestureSequence = isCarryItem 
      ? ['nrm', 'nrm', 'sml', 'nrm', 'nrm', 'sml'] // Carry: movimento mais sutil
      : ['nrm', 'spk', 'nrm', 'sml', 'nrm', 'spk']; // Drink: movimento mais pronunciado
    
    for (let i = 0; i < frameCount; i++) {
      const frameOptions: AvatarOptions = {
        ...options,
        gesture: gestureSequence[i] as any,
        // Manter direção consistente para não distrair da animação do handitem
        direction: options.direction || 2,
        headDirection: options.headDirection || 2,
      };
      
      const baseUrl = this.generateAvatarUrl(habboName, handitemId, frameOptions);
      // Adicionar índice de frame e timestamp para cache busting
      // Isso força o navegador a recarregar a imagem
      frames.push(`${baseUrl}&_f=${i}&_t=${Date.now()}`);
    }
    
    return frames;
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
  hotel?: 'com' | 'com.br' | 'es' | 'com.tr' | 'nl' | 'de' | 'fr' | 'fi' | 'it';
  figureString?: string; // Figurestring completa do avatar
}

export interface AvatarVariation {
  size: string;
  direction: number;
  url: string;
}

// Instância global para uso em componentes
export const avatarPreview = new AvatarPreview();
