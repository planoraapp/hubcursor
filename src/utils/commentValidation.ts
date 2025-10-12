/**
 * Validação e segurança para comentários
 */

export interface CommentValidationResult {
  isValid: boolean;
  error?: string;
}

// Configurações de segurança
export const COMMENT_CONFIG = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 500,
  MIN_INTERVAL_MS: 3000, // 3 segundos entre comentários
  MAX_COMMENTS_PER_MINUTE: 10,
  FORBIDDEN_PATTERNS: [
    /\b(fuck|shit|bitch|ass|dick|pussy|porn|sex)\b/gi, // Palavrões em inglês
    /\b(porra|merda|caralho|puta|fdp|cu|buceta|piroca)\b/gi, // Palavrões em português
    /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/g, // Telefones
    /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{2}\b/g, // CPF
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // E-mails
    /\b(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?\b/g, // URLs
    /\b(?:whats?app|telegram|discord|skype|facebook|instagram|twitter|tiktok)\b/gi, // Redes sociais
  ],
  SPAM_PATTERNS: [
    /(.)\1{10,}/g, // Repetição excessiva do mesmo caractere
    /\b(\w+)\s+\1\s+\1/gi, // Repetição da mesma palavra 3+ vezes
  ]
};

/**
 * Valida o conteúdo de um comentário
 */
export function validateComment(text: string): CommentValidationResult {
  // Remover espaços extras
  const trimmedText = text.trim();

  // Verificar tamanho mínimo
  if (trimmedText.length < COMMENT_CONFIG.MIN_LENGTH) {
    return {
      isValid: false,
      error: 'Comentário muito curto'
    };
  }

  // Verificar tamanho máximo
  if (trimmedText.length > COMMENT_CONFIG.MAX_LENGTH) {
    return {
      isValid: false,
      error: `Comentário muito longo (máximo ${COMMENT_CONFIG.MAX_LENGTH} caracteres)`
    };
  }

  // Verificar padrões proibidos
  for (const pattern of COMMENT_CONFIG.FORBIDDEN_PATTERNS) {
    if (pattern.test(trimmedText)) {
      return {
        isValid: false,
        error: 'Comentário contém conteúdo proibido (informações pessoais, palavrões ou links externos)'
      };
    }
  }

  // Verificar padrões de spam
  for (const pattern of COMMENT_CONFIG.SPAM_PATTERNS) {
    if (pattern.test(trimmedText)) {
      return {
        isValid: false,
        error: 'Comentário identificado como spam'
      };
    }
  }

  // Verificar se é apenas espaços
  if (trimmedText.replace(/\s/g, '').length === 0) {
    return {
      isValid: false,
      error: 'Comentário vazio'
    };
  }

  return { isValid: true };
}

/**
 * Sanitiza o texto do comentário
 */
export function sanitizeComment(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Múltiplos espaços -> 1 espaço
    .substring(0, COMMENT_CONFIG.MAX_LENGTH);
}

