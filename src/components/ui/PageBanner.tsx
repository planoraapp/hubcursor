import React from 'react';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  className?: string;
  icon?: string;
}

const PageBanner: React.FC<PageBannerProps> = ({ 
  title, 
  subtitle, 
  backgroundImage = 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/backgroundshome/bg_pattern_clouds.gif',
  className = '',
  icon
}) => {
  // Detect if this is an extended banner (web_view_bg) or a repeat pattern
  const isExtendedBanner = backgroundImage?.includes('web_view_bg');
  
  const backgroundStyle = isExtendedBanner 
    ? {
        backgroundImage: `url(${backgroundImage})`,
        filter: 'brightness(0.7) contrast(1.1)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {
        backgroundImage: `url(${backgroundImage})`,
        filter: 'brightness(0.7) contrast(1.1)',
        backgroundSize: '120px 120px',
        backgroundRepeat: 'repeat'
      };
  
    return (
    <div className={`relative overflow-hidden rounded-lg mb-8 ${className}`}>
      {/* Background Image */}
      <div 
        className={isExtendedBanner ? "absolute inset-0" : "absolute inset-0 bg-repeat"}
        style={backgroundStyle}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" style={{ zIndex: 1 }} />
      
      {/* Content */}
      <div className="relative px-6 py-4 text-left" style={{ zIndex: 10 }}>
        <h1 className="sidebar-font-option-4 text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg flex items-center gap-3"
          style={{
            letterSpacing: '0.3px',
            textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px'
          }}>
          {icon && (
            <img 
              src={icon} 
              alt="" 
              className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain flex-shrink-0"
              style={{ 
                imageRendering: 'pixelated',
                display: 'block',
                maxWidth: '100%',
                height: 'auto',
                filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.8))',
                position: 'relative'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <span>{title}</span>
        </h1>
        {subtitle && (
          <p className="volter-font text-sm md:text-base text-white/90 drop-shadow-md max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageBanner;
