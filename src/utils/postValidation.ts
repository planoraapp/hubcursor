/**
 * Validação e segurança para posts e comentários do feed
 */

export interface PostValidationResult {
  isValid: boolean;
  error?: string;
}

// Configurações de segurança para posts e comentários do feed
export const POST_CONFIG = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 300, // Limite de 300 caracteres conforme solicitado
  FORBIDDEN_PATTERNS: [
    /\b(fuck|shit|bitch|ass|dick|pussy|porn|sex|nude|naked)\b/gi, // Palavrões e conteúdo adulto em inglês
    /\b(porra|merda|caralho|puta|fdp|cu|buceta|piroca|pau|rola|pinto|vagina|peito|bunda)\b/gi, // Palavrões em português
    /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/g, // Telefones
    /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{2}\b/g, // CPF
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // E-mails
    /\b(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?\b/g, // URLs
    /\b(?:whats?app|telegram|discord|skype|facebook|instagram|twitter|tiktok|youtube)\b/gi, // Redes sociais
    /\b(?:compre|comprar|vendo|venda|promoção|desconto|oferta|grátis|free|gratis)\b/gi, // Spam comercial básico
  ],
  SPAM_PATTERNS: [
    /(.)\1{20,}/g, // Repetição excessiva do mesmo caractere (20+ vezes)
    /\b(\w+)(\s+\1){4,}/gi, // Repetição da mesma palavra 5+ vezes consecutivas
  ],
  // Palavras que podem ser permitidas mas com contexto (implementação futura)
  ALLOWED_CONTEXT: [
    // Pode expandir no futuro para permitir certas palavras em contexto específico
  ]
};

/**
 * Valida o conteúdo de um post ou comentário
 */
export function validatePost(text: string): PostValidationResult {
  // Remover espaços extras
  const trimmedText = text.trim();

  // Verificar tamanho mínimo
  if (trimmedText.length < POST_CONFIG.MIN_LENGTH) {
    return {
      isValid: false,
      error: 'Post muito curto'
    };
  }

  // Verificar tamanho máximo
  if (trimmedText.length > POST_CONFIG.MAX_LENGTH) {
    return {
      isValid: false,
      error: `Post muito longo (máximo ${POST_CONFIG.MAX_LENGTH} caracteres)`
    };
  }

  // Verificar padrões proibidos
  for (const pattern of POST_CONFIG.FORBIDDEN_PATTERNS) {
    if (pattern.test(trimmedText)) {
      return {
        isValid: false,
        error: 'Post contém conteúdo proibido (informações pessoais, palavrões ou links externos)'
      };
    }
  }

  // Verificar padrões de spam
  for (const pattern of POST_CONFIG.SPAM_PATTERNS) {
    if (pattern.test(trimmedText)) {
      return {
        isValid: false,
        error: 'Post identificado como spam'
      };
    }
  }

  // Verificar se é apenas espaços
  if (trimmedText.replace(/\s/g, '').length === 0) {
    return {
      isValid: false,
      error: 'Post vazio'
    };
  }

  return { isValid: true };
}

/**
 * Sanitiza o texto do post ou comentário
 */
export function sanitizePost(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Múltiplos espaços -> 1 espaço
    .substring(0, POST_CONFIG.MAX_LENGTH);
}

/**
 * Valida comentário (usa as mesmas regras de post)
 */
export function validateComment(text: string): PostValidationResult {
  const result = validatePost(text);
  if (!result.isValid && result.error) {
    // Ajustar mensagem de erro para comentário
    result.error = result.error.replace('Post', 'Comentário');
  }
  return result;
}

/**
 * Sanitiza comentário (usa as mesmas regras de post)
 */
export function sanitizeComment(text: string): string {
  return sanitizePost(text);
}
