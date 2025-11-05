/**
 * Gerador de Animações Habbo - Baseado no Guia Técnico
 * Implementa a lógica descrita em docs/habbo-animation-guide.md
 */

import { parseFigureString, CurrentFigure } from './hybridFigureMapper';

/**
 * Mapeamento de Actions para prefixos de assets
 * Conforme documentação: mv → wlk, wave → wave, etc.
 */
export const ACTION_TO_ASSET_PREFIX: Record<string, string> = {
  'std': 'std',      // Padrão/Estático
  'mv': 'wlk',       // Movimento/Caminhada
  'wave': 'wave',    // Acenar
  'sit': 'sit',      // Sentado
  'dance': 'dance',  // Dança
  'laugh': 'laugh', // Riso
  'idle': 'idle',    // Inativo
};

/**
 * Número de frames para cada tipo de animação
 */
export const ANIMATION_FRAME_COUNTS: Record<string, number> = {
  'std': 1,          // Estático - 1 frame
  'wlk': 8,          // Caminhada - 8 frames (ciclo completo)
  'wave': 5,         // Acenar - 5 frames (sequencial)
  'sit': 1,          // Sentado - 1 frame
  'dance': 8,       // Dança - 8 frames (loop)
  'laugh': 3,       // Riso - 3 frames
  'idle': 4,        // Inativo - 4 frames
};

/**
 * Ordem de Z-ordering para composição de sprites
 * Partes distantes primeiro, partes próximas depois
 */
export const Z_ORDERING: string[] = [
  'lg',  // Calças (camada de fundo)
  'sh',  // Sapatos
  'hd',  // Corpo base
  'ch',  // Camisa
  'cc',  // Casaco
  'hr',  // Cabelo (pode ter partes traseiras e frontais)
  'ha',  // Acessórios de cabeça
  'ea',  // Acessórios de olhos
  'fa',  // Acessórios faciais
  'ca',  // Acessórios de peito
  'wa',  // Acessórios de cintura
  'cp',  // Acessórios de peito (print)
];

/**
 * Direções do Habbo (0-7) com nomes
 */
export const DIRECTIONS = [
  { code: 0, name: 'Sul', angle: 180 },
  { code: 1, name: 'Sudeste', angle: 135 },
  { code: 2, name: 'Leste', angle: 90 },
  { code: 3, name: 'Nordeste', angle: 45 },
  { code: 4, name: 'Norte', angle: 0 },
  { code: 5, name: 'Noroeste', angle: 315 },
  { code: 6, name: 'Oeste', angle: 270 },
  { code: 7, name: 'Sudoeste', angle: 225 },
];

/**
 * Interface para configuração de animação
 */
export interface AnimationConfig {
  figureString: string;
  action: string;
  direction: number;
  headDirection?: number;
  hotel?: string;
  size?: 's' | 'm' | 'l';
  frameCount?: number;
  loop?: boolean;
  userName?: string; // Nome do usuário para usar no lugar de figureString
}

/**
 * Interface para um frame de animação
 */
export interface AnimationFrame {
  frameIndex: number;
  direction: number;
  headDirection: number;
  action: string;
  url: string;
}

/**
 * Parse da figureString em componentes
 */
export function parseFigureStringToParts(figureString: string): CurrentFigure {
  return parseFigureString(figureString);
}

/**
 * Obtém o prefixo de asset baseado na action
 */
export function getAssetPrefix(action: string): string {
  return ACTION_TO_ASSET_PREFIX[action] || 'std';
}

/**
 * Obtém o número de frames para uma animação
 */
export function getFrameCount(action: string): number {
  const prefix = getAssetPrefix(action);
  return ANIMATION_FRAME_COUNTS[prefix] || 1;
}

/**
 * Gera nome de asset seguindo a fórmula do guia:
 * [Library Name]_[Size]_[Action]_[Figure Part]_[ID]_[Direction]_[Frame]
 * 
 * Nota: Para uso com Habbo Imager API, usamos URLs em vez de nomes de arquivos
 */
export function generateAssetName(
  library: string,
  size: string,
  action: string,
  part: string,
  id: string,
  direction: number,
  frame: number
): string {
  return `${library}_${size}_${action}_${part}_${id}_${direction}_${frame}`;
}

/**
 * Gera URL do Habbo Imager para um frame específico
 * Esta é a implementação prática usando a API oficial do Habbo
 * 
 * Nota: O Habbo Imager oficial não suporta frame diretamente.
 * Para animações quadro a quadro, seria necessário um renderizador customizado.
 * Por enquanto, geramos URLs diferentes para demonstrar o conceito.
 */
export function generateHabboImagerUrl(config: AnimationConfig, frameIndex: number): string {
  const params = new URLSearchParams();
  
  // Usar user (nome) se disponível, senão usar figure
  // O Habbo Imager aceita ambos, mas 'user' é mais confiável
  if (config.userName && config.userName.trim()) {
    params.set('user', config.userName);
  } else if (config.figureString) {
    params.set('figure', config.figureString);
  }
  
  // Direction (corpo)
  params.set('direction', config.direction.toString());
  
  // Head Direction (cabeça)
  if (config.headDirection !== undefined) {
    params.set('head_direction', config.headDirection.toString());
  } else {
    params.set('head_direction', config.direction.toString());
  }
  
  // Action (comportamento)
  // Mapear mv para wlk (conforme o guia)
  let actionParam = config.action;
  if (actionParam === 'mv') {
    // Para caminhada, o Habbo usa 'action=mv' mas internamente busca 'wlk'
    // Vamos manter mv para o Habbo Imager
    actionParam = 'mv';
  }
  
  if (actionParam && actionParam !== 'std' && actionParam !== 'None') {
    params.set('action', actionParam);
  }
  
  // Size
  params.set('size', config.size || 'l');
  
  // Frame (para animações sequenciais)
  // Nota: O Habbo Imager não suporta frame diretamente.
  // Para demonstrar o conceito, adicionamos um parâmetro que seria usado
  // em um renderizador customizado. O Habbo Imager vai ignorar este parâmetro.
  // Em uma implementação real com Nitro-Imager, este parâmetro seria válido.
  if (frameIndex > 0) {
    // Adicionar timestamp ou índice para diferenciar frames
    // Isso não funciona com Habbo Imager oficial, mas demonstra o conceito
    params.set('_frame', frameIndex.toString());
  }
  
  const hotel = config.hotel || 'com.br';
  return `https://www.habbo.${hotel}/habbo-imaging/avatarimage?${params.toString()}`;
}

/**
 * Gera sequência completa de frames para uma animação
 * 
 * IMPORTANTE: O Habbo Imager oficial retorna apenas um frame por vez baseado em action/gesture.
 * Para animações quadro a quadro completas, seria necessário:
 * 1. Um renderizador customizado (Nitro-Imager) que aceita frame como parâmetro
 * 2. Ou usar múltiplas actions/gestures para simular diferentes frames
 * 
 * Esta implementação gera URLs que demonstram o conceito, mas todas retornarão
 * o mesmo frame do Habbo Imager (já que ele não suporta frame diretamente).
 */
export function generateAnimationSequence(config: AnimationConfig): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  const frameCount = config.frameCount || getFrameCount(config.action);
  
  // Para actions estáticas (std, sit), apenas 1 frame
  const actualFrameCount = frameCount > 1 && config.action !== 'std' && config.action !== 'sit' 
    ? frameCount 
    : 1;
  
  for (let frameIndex = 0; frameIndex < actualFrameCount; frameIndex++) {
    const frame: AnimationFrame = {
      frameIndex,
      direction: config.direction,
      headDirection: config.headDirection ?? config.direction,
      action: config.action,
      url: generateHabboImagerUrl(config, frameIndex)
    };
    
    frames.push(frame);
  }
  
  return frames;
}

/**
 * Gera frames para uma animação de caminhada em múltiplas direções
 */
export function generateWalkingAnimation(
  figureString: string,
  directions: number[],
  hotel: string = 'com.br',
  loop: boolean = true
): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  
  const frameCount = getFrameCount('mv'); // 8 frames para caminhada
  
  directions.forEach(direction => {
    for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
      const config: AnimationConfig = {
        figureString,
        action: 'mv',
        direction,
        hotel,
        frameCount: 1, // Um frame por vez
        loop: false
      };
      
      frames.push({
        frameIndex,
        direction,
        headDirection: direction,
        action: 'mv',
        url: generateHabboImagerUrl(config, frameIndex)
      });
    }
  });
  
  return frames;
}

/**
 * Gera sequência de gestos (wave, laugh, etc.)
 */
export function generateGestureSequence(
  figureString: string,
  gesture: string,
  direction: number = 2,
  hotel: string = 'com.br'
): AnimationFrame[] {
  const config: AnimationConfig = {
    figureString,
    action: gesture,
    direction,
    hotel,
    frameCount: getFrameCount(gesture),
    loop: false
  };
  
  return generateAnimationSequence(config);
}

/**
 * Valida se uma action é válida
 */
export function isValidAction(action: string): boolean {
  return action in ACTION_TO_ASSET_PREFIX || action === 'None' || action === '';
}

/**
 * Valida se uma direction é válida (0-7)
 */
export function isValidDirection(direction: number): boolean {
  return direction >= 0 && direction <= 7;
}

/**
 * Obtém informações sobre uma direção
 */
export function getDirectionInfo(direction: number) {
  return DIRECTIONS.find(d => d.code === direction) || DIRECTIONS[2]; // Default: Leste
}

