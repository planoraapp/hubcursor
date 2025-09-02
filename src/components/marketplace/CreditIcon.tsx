
interface CreditIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CreditIcon = ({ size = 'sm', className = '' }: CreditIconProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <img 
      src="/assets/credits_icon.gif" 
      alt="Credits"
      className={`${sizeClasses[size]} ${className} inline-block`}
    />
  );
};
