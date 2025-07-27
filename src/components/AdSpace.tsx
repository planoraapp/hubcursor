// Using actual asset imports that exist
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

  const getCSSBackground = () => {
    switch (type) {
      case 'square':
        return 'linear-gradient(135deg, #c4c4c4, #e0e0e0), repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)';
      case 'horizontal':
        return 'linear-gradient(90deg, #f5f5f5, #e8e8e8), repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)';
      case 'vertical':
        return 'linear-gradient(180deg, #f0f0f0, #d5d5d5), repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.05) 8px, rgba(0,0,0,0.05) 16px)';
      case 'wide':
        return 'linear-gradient(135deg, #e8e8e8, #f5f5f5), repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(0,0,0,0.08) 12px, rgba(0,0,0,0.08) 24px)';
      case 'banner':
        return 'linear-gradient(90deg, #f8f8f8, #e5e5e5), repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.06) 6px, rgba(0,0,0,0.06) 12px)';
      case 'medium':
        return 'linear-gradient(135deg, #f2f2f2, #e0e0e0), repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0,0,0,0.04) 8px, rgba(0,0,0,0.04) 16px)';
      case 'skyscraper':
        return 'linear-gradient(180deg, #eeeeee, #d8d8d8), repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)';
      default:
        return 'linear-gradient(135deg, #c4c4c4, #e0e0e0)';
    }
  };

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
          color: '#555',
          fontSize: '14px',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
          backgroundColor: 'rgba(255,255,255,0.8)',
          borderRadius: '4px',
          border: '1px solid rgba(0,0,0,0.2)'
        }}
      >
        {config.title}
      </div>
    </div>
  );
};