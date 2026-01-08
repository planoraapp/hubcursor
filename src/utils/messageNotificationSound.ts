/**
 * Sistema de notificação sonora para mensagens
 * Controla execução do som com limites para evitar spam
 */

class MessageNotificationSound {
  private audio: HTMLAudioElement | null = null;
  private lastPlayTime: number = 0;
  private playCount: number = 0;
  private resetTime: number = 0;
  private readonly COOLDOWN_MS = 10000; // 10 segundos entre execuções repetidas
  private readonly MAX_REPEATED_PLAYS = 3; // Máximo de 3 execuções repetidas
  private hasUserInteracted: boolean = false;
  private pendingPlay: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Tentar ambos os caminhos possíveis
      this.audio = new Audio('/habbo_mensage.mp3');
      this.audio.volume = 1.0; // Volume 100%
      this.audio.preload = 'auto';
      
      // Detectar interação do usuário para habilitar autoplay
      const enableAudio = () => {
        if (!this.hasUserInteracted) {
          this.hasUserInteracted = true;
          
          // Tentar tocar um som silencioso para "unlock" o autoplay
          if (this.audio && this.pendingPlay) {
            this.audio.play().catch(() => {
              // Ignorar erro - apenas tentamos desbloquear
            });
            this.audio.pause();
            this.audio.currentTime = 0;
            this.pendingPlay = false;
          }
        }
      };
      
      // Listener para qualquer interação do usuário
      window.addEventListener('click', enableAudio, { once: true });
      window.addEventListener('keydown', enableAudio, { once: true });
      window.addEventListener('touchstart', enableAudio, { once: true });
      
      // Tratamento de erros
      this.audio.addEventListener('error', (e) => {
        console.error('[SOUND] ❌ Erro ao carregar som de notificação. Verifique se o arquivo /habbo_mensage.mp3 existe em public/', e);
        console.error('[SOUND] Audio error details:', {
          error: this.audio?.error,
          networkState: this.audio?.networkState,
          readyState: this.audio?.readyState,
          src: this.audio?.src
        });
      });
    }
  }

  /**
   * Toca o som de notificação respeitando limites
   * - Toca 1x quando receber mensagem
   * - Máximo de 3 execuções em um intervalo de 10 segundos
   * - Após 10 segundos sem novas mensagens, reseta o contador
   * @returns true se o som foi tocado, false caso contrário
   */
  play(): boolean {
    if (!this.audio) {
      return false;
    }

    const now = Date.now();

    // Se passou mais de 10 segundos desde a primeira execução da janela, resetar
    if (this.resetTime > 0 && now - this.resetTime > this.COOLDOWN_MS) {
      this.playCount = 0;
      this.resetTime = 0;
    }

    // Se já tocou 3 vezes na janela atual (últimos 10 segundos), não tocar
    if (this.playCount >= this.MAX_REPEATED_PLAYS) {
      return false;
    }

    // Primeira execução na janela? Iniciar timer
    if (this.resetTime === 0) {
      this.resetTime = now;
    }

    // Tocar o som
    this.playCount++;
    this.lastPlayTime = now;
    this.audio.currentTime = 0; // Resetar para tocar do início
    
    // Se o usuário ainda não interagiu, marcar como pendente
    if (!this.hasUserInteracted) {
      this.pendingPlay = true;
    }
    
    const playPromise = this.audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.hasUserInteracted = true; // Se tocou com sucesso, marcar como interagido
          this.pendingPlay = false;
        })
        .catch(err => {
          console.error('[SOUND] ❌ Erro ao tocar som de notificação:', err);
          console.error('[SOUND] Error details:', {
            name: err.name,
            message: err.message,
            audioReadyState: this.audio.readyState,
            audioNetworkState: this.audio.networkState,
            audioSrc: this.audio.src,
            audioPaused: this.audio.paused,
            audioVolume: this.audio.volume
          });
          
          // Se o erro for por autoplay policy
          if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError') {
            this.pendingPlay = true;
          }
        });
    }
    
    return true;
  }

  /**
   * Reseta o contador de execuções
   */
  reset(): void {
    this.playCount = 0;
    this.resetTime = 0;
    this.lastPlayTime = 0;
  }

  /**
   * Verifica se o som está habilitado nas configurações do usuário
   */
  isEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('habbo-hub-notification-sound-enabled');
    return saved !== null ? saved === 'true' : true; // Padrão é true (ativado)
  }
}

// Instância global
export const messageNotificationSound = new MessageNotificationSound();

