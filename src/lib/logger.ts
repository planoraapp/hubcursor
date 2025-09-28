/**
 * Sistema de Logging Inteligente
 * Remove logs em produção automaticamente
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Erros sempre são logados, mesmo em produção
    console.error(...args);
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  }
};

// Função helper para substituir console.log facilmente
export const devLog = logger.log;
export const devWarn = logger.warn;
export const devDebug = logger.debug;
export const devInfo = logger.info;
