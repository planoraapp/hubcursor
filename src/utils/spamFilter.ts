/**
 * Sistema de filtros anti-spam para mensagens e comentários
 * Detecta e bloqueia padrões de spam comuns
 */

interface SpamCheckResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Verifica se uma mensagem contém apenas um único caractere repetido
 * @param message Mensagem a ser verificada
 * @returns true se a mensagem contém apenas um caractere repetido
 */
function isSingleCharacterMessage(message: string): boolean {
  const trimmed = message.trim();
  if (trimmed.length === 0) return false;
  
  // Verifica se todos os caracteres são iguais
  const firstChar = trimmed[0];
  return trimmed.split('').every(char => char === firstChar);
}

/**
 * Armazena histórico de mensagens com caractere único
 */
class SingleCharacterSpamTracker {
  private recentMessages: Map<string, { count: number; lastTime: number; char: string }> = new Map();
  private readonly MAX_REPEATED_SINGLE_CHAR = 3; // Máximo de 3 mensagens com mesmo caractere
  private readonly RESET_WINDOW_MS = 30000; // Reset após 30 segundos sem mensagens do mesmo tipo

  /**
   * Verifica se uma mensagem com caractere único pode ser enviada
   * @param userId ID do usuário
   * @param message Mensagem a ser verificada
   * @returns Resultado da verificação
   */
  checkSingleCharacterSpam(userId: string, message: string): SpamCheckResult {
    if (!isSingleCharacterMessage(message)) {
      // Não é mensagem de caractere único, permitir
      return { isValid: true };
    }

    const char = message.trim()[0];
    const key = `${userId}_${char}`;
    const now = Date.now();
    const entry = this.recentMessages.get(key);

    // Limpar entradas antigas
    if (entry && now - entry.lastTime > this.RESET_WINDOW_MS) {
      this.recentMessages.delete(key);
    }

    const currentEntry = this.recentMessages.get(key);

    if (!currentEntry) {
      // Primeira mensagem com este caractere
      this.recentMessages.set(key, {
        count: 1,
        lastTime: now,
        char
      });
      return { isValid: true };
    }

    // Verifica se excedeu o limite
    if (currentEntry.count >= this.MAX_REPEATED_SINGLE_CHAR) {
      return {
        isValid: false,
        reason: `Você enviou muitas mensagens com "${char}". Aguarde alguns segundos antes de enviar novamente.`
      };
    }

    // Incrementa contador
    currentEntry.count++;
    currentEntry.lastTime = now;

    return { isValid: true };
  }

  /**
   * Reseta o tracker para um usuário específico
   */
  reset(userId: string): void {
    const keysToDelete: string[] = [];
    for (const [key] of this.recentMessages.entries()) {
      if (key.startsWith(`${userId}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.recentMessages.delete(key));
  }

  /**
   * Limpa entradas antigas (limpeza periódica)
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.recentMessages.entries()) {
      if (now - entry.lastTime > this.RESET_WINDOW_MS) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.recentMessages.delete(key));
  }
}

/**
 * Tracker de cooldown individual (1 segundo entre mensagens)
 */
class MessageCooldownTracker {
  private lastMessageTime: Map<string, number> = new Map();
  private readonly COOLDOWN_MS = 1000; // 1 segundo

  /**
   * Verifica se o usuário pode enviar mensagem (cooldown de 1 segundo)
   */
  checkCooldown(userId: string): SpamCheckResult {
    const now = Date.now();
    const lastTime = this.lastMessageTime.get(userId);

    if (!lastTime) {
      this.lastMessageTime.set(userId, now);
      return { isValid: true };
    }

    const timeSinceLastMessage = now - lastTime;

    if (timeSinceLastMessage < this.COOLDOWN_MS) {
      const remaining = Math.ceil((this.COOLDOWN_MS - timeSinceLastMessage) / 1000);
      return {
        isValid: false,
        reason: `Aguarde ${remaining} segundo(s) antes de enviar outra mensagem.`
      };
    }

    this.lastMessageTime.set(userId, now);
    return { isValid: true };
  }

  /**
   * Reseta o cooldown para um usuário
   */
  reset(userId: string): void {
    this.lastMessageTime.delete(userId);
  }
}

// Instâncias globais
export const singleCharacterSpamTracker = new SingleCharacterSpamTracker();
export const messageCooldownTracker = new MessageCooldownTracker();

/**
 * Verifica se uma mensagem passa em todos os filtros anti-spam
 * @param userId ID do usuário
 * @param message Mensagem a ser verificada
 * @returns Resultado da verificação
 */
export function checkMessageSpam(userId: string, message: string): SpamCheckResult {
  // 1. Verificar cooldown de 1 segundo
  const cooldownCheck = messageCooldownTracker.checkCooldown(userId);
  if (!cooldownCheck.isValid) {
    return cooldownCheck;
  }

  // 2. Verificar spam de caractere único
  const singleCharCheck = singleCharacterSpamTracker.checkSingleCharacterSpam(userId, message);
  if (!singleCharCheck.isValid) {
    return singleCharCheck;
  }

  return { isValid: true };
}

/**
 * Limpa trackers para um usuário específico
 */
export function resetUserSpamTrackers(userId: string): void {
  singleCharacterSpamTracker.reset(userId);
  messageCooldownTracker.reset(userId);
}

// Limpeza automática a cada 2 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    singleCharacterSpamTracker.cleanup();
  }, 2 * 60 * 1000);
}

