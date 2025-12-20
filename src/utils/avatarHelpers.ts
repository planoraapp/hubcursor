/**
 * Helpers para URLs de Avatar
 * Centraliza a geração de URLs de avatar com suporte multi-hotel
 */

/**
 * Normaliza o código do hotel para o domínio correto
 */
function normalizeHotelDomain(hotel: string): string {
  if (hotel === 'br') return 'com.br';
  if (hotel === 'tr') return 'com.tr';
  if (hotel === 'us' || hotel === 'com') return 'com';
  return hotel; // es, fr, de, it, nl, fi já são domínios corretos
}

/**
 * Gera URL do avatar do Habbo
 * @param userName - Nome do usuário Habbo
 * @param hotel - Código do hotel (br, com, es, etc.) ou domínio completo
 * @param figureString - String da figura (opcional, prioridade sobre userName)
 * @param options - Opções adicionais
 */
export function getAvatarUrl(
  userName?: string,
  hotel: string = 'br',
  figureString?: string,
  options: {
    size?: 'xs' | 's' | 'm' | 'l' | 'xl';
    direction?: number;
    headDirection?: number;
    headOnly?: boolean;
    gesture?: string;
    action?: string;
  } = {}
): string {
  const domain = normalizeHotelDomain(hotel);
  const baseUrl = `https://www.habbo.${domain}/habbo-imaging/avatarimage`;
  
  const params = new URLSearchParams();
  
  // Prioridade: figureString > userName
  if (figureString) {
    params.append('figure', figureString);
  } else if (userName) {
    params.append('user', userName);
  }
  
  // Opções padrão
  params.append('size', options.size || 'm');
  params.append('direction', String(options.direction ?? 2));
  params.append('head_direction', String(options.headDirection ?? 3));
  
  if (options.headOnly) {
    params.append('headonly', '1');
  }
  
  if (options.gesture) {
    params.append('gesture', options.gesture);
  }
  
  if (options.action) {
    params.append('action', options.action);
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Gera URL do avatar apenas da cabeça (headonly)
 */
export function getAvatarHeadUrl(
  userName: string,
  hotel: string = 'br',
  figureString?: string,
  size: 's' | 'm' | 'l' = 'm'
): string {
  return getAvatarUrl(userName, hotel, figureString, {
    size,
    headOnly: true,
    direction: 2,
    headDirection: 3
  });
}

/**
 * URL de fallback para avatar (usado em onError)
 */
export function getAvatarFallbackUrl(userName: string, size: 's' | 'm' | 'l' = 'm'): string {
  // Tentar usar AWS S3 como fallback
  return `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${encodeURIComponent(userName)}&size=${size}&direction=2&head_direction=3&headonly=1`;
}

