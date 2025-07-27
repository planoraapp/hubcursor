
interface FlagIconProps {
  country: 'brazil' | 'spain';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FlagIcon = ({ country, size = 'md', className = '' }: FlagIconProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const flagSrc = country === 'brazil' ? '/images/brazil-flag.png' : '/images/spain-flag.png';
  const altText = country === 'brazil' ? 'Bandeira do Brasil' : 'Bandeira da Espanha';

  return (
    <img 
      src={flagSrc}
      alt={altText}
      className={`${sizeClasses[size]} ${className} rounded-sm object-cover`}
      onError={(e) => {
        // Fallback para emoji se a imagem não carregar
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};
