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
  backgroundImage = 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/backgroundshome/bg_pattern_clouds.gif',
  className = ''
}) => {
    return (
    <div className={`relative overflow-hidden rounded-lg mb-8 ${className}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: 'brightness(0.7) contrast(1.1)',
          backgroundSize: '120px 120px'
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 px-6 py-4 text-left">
        <h1 className="sidebar-font-option-4 text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg"
          style={{
            letterSpacing: '0.3px'
          }}>
          {title}
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
