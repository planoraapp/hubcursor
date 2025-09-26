interface ErrorLog {
  timestamp: string;
  error: string;
  context: string;
  userAgent: string;
  url: string;
}

class ErrorHandler {
  private static logs: ErrorLog[] = [];
  private static maxLogs = 100;

  static handle(error: Error | any, context: string = 'Unknown'): string {
    const errorMessage = error?.message || error?.toString() || 'Erro desconhecido';
    
    // Log do erro
    this.logError(errorMessage, context);
    
    // Console para desenvolvimento
        // Retornar mensagem amigável
    return this.getFriendlyMessage(errorMessage, context);
  }

  private static logError(error: string, context: string) {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.logs.unshift(log);
    
    // Manter apenas os últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Salvar no localStorage para debug
    try {
      localStorage.setItem('errorLogs', JSON.stringify(this.logs));
    } catch (e) {
          }
  }

  private static getFriendlyMessage(error: string, context: string): string {
    // Mensagens específicas por contexto
    const contextMessages: Record<string, string> = {
      'MarketplaceService': 'Erro ao carregar dados do marketplace. Tente novamente em alguns segundos.',
      'ImageLoader': 'Erro ao carregar imagem. Verifique sua conexão.',
      'Authentication': 'Erro de autenticação. Faça login novamente.',
      'Network': 'Erro de conexão. Verifique sua internet e tente novamente.',
      'Validation': 'Dados inválidos. Verifique as informações inseridas.'
    };
    
    // Verificar erros comuns
    if (error.includes('fetch')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    if (error.includes('timeout')) {
      return 'Tempo limite excedido. Tente novamente.';
    }
    
    if (error.includes('unauthorized') || error.includes('401')) {
      return 'Acesso negado. Verifique suas credenciais.';
    }
    
    if (error.includes('not found') || error.includes('404')) {
      return 'Recurso não encontrado.';
    }
    
    if (error.includes('server') || error.includes('500')) {
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    }
    
    // Retornar mensagem específica do contexto ou genérica
    return contextMessages[context] || 'Ocorreu um erro inesperado. Tente novamente.';
  }

  static getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  static clearLogs() {
    this.logs = [];
    localStorage.removeItem('errorLogs');
  }

  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const handleError = (error: Error | any, context: string = 'Unknown'): string => {
  return ErrorHandler.handle(error, context);
};

export const getErrorLogs = (): ErrorLog[] => {
  return ErrorHandler.getLogs();
};

export const clearErrorLogs = () => {
  ErrorHandler.clearLogs();
};

export const exportErrorLogs = (): string => {
  return ErrorHandler.exportLogs();
};