import React, { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface HabboToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
}

const toastVariants: Record<ToastVariant, { color: string; bg: string; icon: string }> = {
  success: {
    color: '#03a65a',
    bg: '#005e38',
    icon: '✓'
  },
  error: {
    color: '#db3056',
    bg: '#851d41',
    icon: '✕'
  },
  warning: {
    color: '#fc8621',
    bg: '#c24914',
    icon: '!'
  },
  info: {
    color: '#0070e0',
    bg: '#05478a',
    icon: '?'
  }
};

export const HabboToast: React.FC<HabboToastProps> = ({
  id,
  title,
  description,
  variant = 'info',
  open = true,
  onOpenChange,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(open);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onOpenChange?.(false);
    }, 400);
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      // Primeiro tornar visível
      setIsVisible(true);
      // Depois animar após um pequeno delay
      const animTimer = setTimeout(() => {
        setIsAnimating(true);
      }, 50);
      
      // Timer para fechar automaticamente
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(timer);
        clearTimeout(animTimer);
      };
    } else {
      // Se open mudou para false, fechar
      if (isVisible) {
        handleClose();
      }
    }
  }, [open, duration, handleClose, isVisible, id]);

  if (!isVisible) return null;

  const variantStyle = toastVariants[variant];

  return (
    <div
      className={cn(
        "toast-item transition-all duration-500 ease-in-out",
        variant,
        isAnimating ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}
      style={{
        '--clr': variantStyle.color,
        '--bg': variantStyle.bg,
      } as React.CSSProperties}
    >
      <div
        className="toast bg-white text-gray-800 p-4 pr-12 rounded-2xl relative shadow-xl border-2 border-black max-w-md mx-auto"
      >
        {/* Barra lateral colorida */}
        <div
          className="absolute left-2 top-3 bottom-3 w-1 rounded-full"
          style={{ backgroundColor: variantStyle.color }}
        />

        {/* Ícone */}
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: variantStyle.color }}
        >
          {variant === 'success' && '✓'}
          {variant === 'error' && '✕'}
          {variant === 'warning' && '!'}
          {variant === 'info' && '?'}
        </div>

        {/* Conteúdo */}
        <div className="ml-10">
          {title && (
            <h3
              className="text-lg font-semibold m-0 leading-tight volter-font"
              style={{ color: variantStyle.color }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1 m-0 leading-relaxed volter-font">
              {description}
            </p>
          )}
        </div>

        {/* Botão de fechar */}
        <button
          onClick={handleClose}
          className="close absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer hover:bg-gray-200"
          style={{
            '--clr': variantStyle.color,
          } as React.CSSProperties}
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

