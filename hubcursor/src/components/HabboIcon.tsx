
interface HabboIconProps {
  icon: 'credits' | 'diamonds' | 'hc' | 'chat' | 'cart' | 'elevator' | 'check' | 'close';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

export const HabboIcon = ({ icon, size = 'md', className = '', animated = false }: HabboIconProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const iconFiles: Record<string, string> = {
    'credits': 'credits_icon.gif',
    'diamonds': 'Diamantes.png',
    'hc': 'HC.png',
    'chat': 'BatePapo1.png',
    'cart': 'Carrinho.png',
    'elevator': 'Elevador.png',
    'check': 'Check2.png',
    'close': 'Xis3.png'
  };

  const fileName = iconFiles[icon];
  
  return (
    <img 
      src={`/assets/${fileName}`}
      alt={`Ícone ${icon}`}
      className={`${sizeClasses[size]} ${className} ${animated ? 'animate-pulse' : ''}`}
      onError={(e) => {
        // Fallback para um ícone padrão se a imagem não carregar
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};
