import React, { useState, useEffect, useRef } from 'react';
import { avatarPreview } from '@/utils/avatarPreview';

interface AnimatedAvatarPreviewProps {
  habboName: string;
  handitemId: number | null;
  size?: 's' | 'm' | 'l' | 'xl';
  className?: string;
  alt?: string;
  figureString?: string;
  gender?: 'M' | 'F';
}

/**
 * Componente que exibe um avatar com animação de drink/carry
 * Alterna entre múltiplos frames para simular a animação
 */
export const AnimatedAvatarPreview: React.FC<AnimatedAvatarPreviewProps> = ({
  habboName,
  handitemId,
  size = 'm',
  className = 'w-full h-full object-contain',
  alt = 'Avatar com handitem',
  figureString,
  gender
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [animationFrames, setAnimationFrames] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Gerar frames de animação apenas se houver handitem
    // Usar figurestring quando disponível (formato correto do Habbo)
    const options = {
      size,
      figureString,
      gender
    };
    
    if (handitemId && handitemId !== 0) {
      const frames = avatarPreview.generateAnimationFrames(habboName, handitemId, options);
      setAnimationFrames(frames);
      setIsAnimating(true);
    } else {
      // Se não houver handitem, usar apenas uma imagem estática
      const staticUrl = avatarPreview.generateAvatarUrl(habboName, null, options);
      setAnimationFrames([staticUrl]);
      setIsAnimating(false);
    }
  }, [habboName, handitemId, size, figureString, gender]);

  useEffect(() => {
    // Limpar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Se houver animação e múltiplos frames, alternar entre eles
    if (isAnimating && animationFrames.length > 1) {
      // Velocidade da animação: 150ms por frame para animação fluida
      // Isso cria uma animação de aproximadamente 1.2 segundos por ciclo completo
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % animationFrames.length);
      }, 150);
    } else {
      setCurrentFrame(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAnimating, animationFrames.length]);

  const currentUrl = animationFrames[currentFrame] || animationFrames[0] || '';

  if (!currentUrl) {
    return null;
  }

  return (
    <img
      src={currentUrl}
      alt={alt}
      className={`${className} transition-opacity duration-150`}
      key={`${currentFrame}-${handitemId}-${Date.now()}`} // Force re-render para animação
      style={{
        imageRendering: 'auto',
      }}
      onError={(e) => {
        // Fallback para imagem estática se a animação falhar
        const target = e.currentTarget;
        const fallbackUrl = avatarPreview.generateAvatarUrl(habboName, handitemId, { 
          size, 
          figureString, 
          gender 
        });
        if (target.src !== fallbackUrl) {
          target.src = fallbackUrl;
        }
      }}
      onLoad={(e) => {
        // Garantir que a imagem seja exibida corretamente
        e.currentTarget.style.opacity = '1';
      }}
    />
  );
};
