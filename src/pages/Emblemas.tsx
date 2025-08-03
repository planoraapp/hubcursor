
import React from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { CleanBadgesGrid } from '../components/CleanBadgesGrid';
import { useLanguage } from '../hooks/useLanguage';

const Emblemas = () => {
  const { t } = useLanguage();

  return (
    <div 
      className="min-h-screen w-full" 
      style={{ 
        backgroundImage: "url('/assets/bghabbohub.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }}
    >
      <CollapsibleSidebar activeSection="emblemas" setActiveSection={() => {}} />
      
      <div className="transition-all duration-300 ml-20">
        <PageHeader 
          title={t('badgesEnhancedTitle')}
          icon="/assets/emblemas.png"
        />
        
        <div className="p-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <CleanBadgesGrid />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emblemas;
