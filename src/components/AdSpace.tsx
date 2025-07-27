interface AdSpaceProps {
  type: 'square' | 'horizontal' | 'vertical' | 'wide';
  className?: string;
}

export const AdSpace = ({ type, className = "" }: AdSpaceProps) => {
  const getAdConfig = () => {
    switch (type) {
      case 'square':
        return {
          image: '/assets/adsmetal.png',
          width: '200px',
          height: '200px',
          title: 'Advertisement'
        };
      case 'horizontal':
        return {
          image: '/assets/adswhitelarge.png',
          width: '100%',
          height: '90px',
          title: 'Advertisement'
        };
      case 'vertical':
        return {
          image: '/assets/adsvertwhite.png',
          width: '160px',
          height: '600px',
          title: 'Advertisement'
        };
      case 'wide':
        return {
          image: '/assets/adswidemetal.png',
          width: '100%',
          height: '120px',
          title: 'Advertisement'
        };
      default:
        return {
          image: '/assets/adsmetal.png',
          width: '200px',
          height: '200px',
          title: 'Advertisement'
        };
    }
  };

  const config = getAdConfig();

  return (
    <div 
      className={`habbo-ad-placeholder mx-auto ${className}`}
      style={{
        width: config.width,
        height: config.height,
        backgroundImage: `url(${config.image})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '14px',
        fontWeight: 'bold',
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
        maxWidth: type === 'horizontal' || type === 'wide' ? '728px' : 'auto'
      }}
    >
      {config.title}
    </div>
  );
};