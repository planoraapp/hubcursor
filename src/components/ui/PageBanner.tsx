import React from 'react';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  className?: string;
}

const PageBanner: React.FC<PageBannerProps> = ({ 
  title, 
  subtitle, 
  backgroundImage = '/assets/gcreate_4_1.png',
  className = ''
}) => {
  return (
    <div className={`relative overflow-hidden rounded-lg mb-8 ${className}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-repeat bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: 'brightness(0.8) contrast(1.1)',
          backgroundSize: 'auto 100%'
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 px-8 py-6 text-center">
        <h1 className="volter-font text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="volter-font text-lg md:text-xl text-white/90 drop-shadow-md max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageBanner;
