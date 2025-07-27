import adsMetalImg from '/assets/adsmetal.png';
import adsWhiteLargeImg from '/assets/adswhitelarge.png';
import adsVertWhiteImg from '/assets/adsvertwhite.png';
import adsWideMetalImg from '/assets/adswidemetal.png';
import adBannerImg from '/assets/ad-banner-468x60.png';

interface AdSpaceProps {
  type: 'square' | 'horizontal' | 'vertical' | 'wide' | 'banner' | 'medium' | 'skyscraper';
  className?: string;
}

export const AdSpace = ({ type, className = "" }: AdSpaceProps) => {
  const getAdConfig = () => {
    switch (type) {
      case 'square':
        return {
          image: adsMetalImg,
          width: '200px',
          height: '200px',
          title: 'Advertisement'
        };
      case 'horizontal':
        return {
          image: adsWhiteLargeImg,
          width: '100%',
          height: '90px',
          title: 'Advertisement'
        };
      case 'vertical':
        return {
          image: adsVertWhiteImg,
          width: '160px',
          height: '600px',
          title: 'Advertisement'
        };
      case 'wide':
        return {
          image: adsWideMetalImg,
          width: '100%',
          height: '120px',
          title: 'Advertisement'
        };
      case 'banner':
        return {
          image: adBannerImg,
          width: '468px',
          height: '60px',
          title: 'Advertisement'
        };
      case 'medium':
        return {
          image: adsWhiteLargeImg,
          width: '300px',
          height: '250px',
          title: 'Advertisement'
        };
      case 'skyscraper':
        return {
          image: adsVertWhiteImg,
          width: '160px',
          height: '600px',
          title: 'Advertisement'
        };
      default:
        return {
          image: adsMetalImg,
          width: '200px',
          height: '200px',
          title: 'Advertisement'
        };
    }
  };

  const config = getAdConfig();

  return (
    <div 
      className={`habbo-ad-placeholder relative mx-auto ${className}`}
      style={{
        width: config.width,
        height: config.height,
        backgroundImage: `url(${config.image})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
        maxWidth: type === 'horizontal' || type === 'wide' ? '728px' : 'auto'
      }}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          margin: type === 'wide' ? '15px 25px' : type === 'horizontal' ? '12px 20px' : type === 'vertical' ? '20px 15px' : '15px',
          color: '#666',
          fontSize: '14px',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          border: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        {config.title}
      </div>
    </div>
  );
};