/**
 * Utilitários para formatação de timestamps no estilo do Habbo
 */

export interface TimestampFormatOptions {
  locale?: string;
  timeZone?: string;
  showSeconds?: boolean;
}

/**
 * Formata timestamp como o Habbo faz
 * @param timestamp - Timestamp em string ou número
 * @param options - Opções de formatação
 * @returns String formatada no estilo do Habbo
 */
export const formatHabboTimestamp = (
  timestamp: string | number | Date, 
  options: TimestampFormatOptions = {}
): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / (7 * 86400000));
  const months = Math.floor(diff / (30 * 86400000));
  
  // Formatação relativa (como o Habbo)
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `${minutes}m atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;
  if (weeks < 4) return `${weeks}sem atrás`;
  if (months < 12) return `${months}meses atrás`;
  
  // Formato do Habbo para datas antigas: DD/MM/YY
  return date.toLocaleDateString(options.locale || 'pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    timeZone: options.timeZone
  });
};

/**
 * Formata timestamp para exibição detalhada
 * @param timestamp - Timestamp em string ou número
 * @param options - Opções de formatação
 * @returns String formatada com data e hora
 */
export const formatDetailedTimestamp = (
  timestamp: string | number | Date,
  options: TimestampFormatOptions = {}
): string => {
  const date = new Date(timestamp);
  
  return date.toLocaleString(options.locale || 'pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: options.showSeconds ? '2-digit' : undefined,
    timeZone: options.timeZone
  });
};

/**
 * Gera timestamp Unix em milissegundos
 * @param date - Data (opcional, padrão: agora)
 * @returns Timestamp Unix em milissegundos
 */
export const generateUnixTimestamp = (date?: Date): number => {
  return (date || new Date()).getTime();
};

/**
 * Converte timestamp Unix para Date
 * @param timestamp - Timestamp Unix em milissegundos
 * @returns Objeto Date
 */
export const unixToDate = (timestamp: number): Date => {
  return new Date(timestamp);
};

/**
 * Verifica se um timestamp é recente (últimas 24 horas)
 * @param timestamp - Timestamp para verificar
 * @returns true se for recente
 */
export const isRecentTimestamp = (timestamp: string | number | Date): boolean => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = diff / 3600000;
  
  return hours < 24;
};

/**
 * Calcula a diferença entre dois timestamps
 * @param timestamp1 - Timestamp mais antigo
 * @param timestamp2 - Timestamp mais recente (opcional, padrão: agora)
 * @returns Objeto com diferenças em diferentes unidades
 */
export const calculateTimeDifference = (
  timestamp1: string | number | Date,
  timestamp2?: string | number | Date
) => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2 || new Date());
  const diff = Math.abs(date2.getTime() - date1.getTime());
  
  return {
    milliseconds: diff,
    seconds: Math.floor(diff / 1000),
    minutes: Math.floor(diff / 60000),
    hours: Math.floor(diff / 3600000),
    days: Math.floor(diff / 86400000),
    weeks: Math.floor(diff / (7 * 86400000)),
    months: Math.floor(diff / (30 * 86400000)),
    years: Math.floor(diff / (365 * 86400000))
  };
};

/**
 * Formata timestamp para cache key
 * @param timestamp - Timestamp
 * @returns String formatada para usar como chave de cache
 */
export const formatCacheKey = (timestamp: string | number | Date): string => {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

/**
 * Valida se um timestamp é válido
 * @param timestamp - Timestamp para validar
 * @returns true se for válido
 */
export const isValidTimestamp = (timestamp: any): timestamp is string | number | Date => {
  if (!timestamp) return false;
  
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
};

/**
 * Converte timestamp para formato ISO string
 * @param timestamp - Timestamp
 * @returns String ISO formatada
 */
export const toISOString = (timestamp: string | number | Date): string => {
  return new Date(timestamp).toISOString();
};

/**
 * Converte timestamp para formato UTC
 * @param timestamp - Timestamp
 * @returns String UTC formatada
 */
export const toUTCString = (timestamp: string | number | Date): string => {
  return new Date(timestamp).toUTCString();
};
