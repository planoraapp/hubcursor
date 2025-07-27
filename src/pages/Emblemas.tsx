import { BadgesEnhanced } from '../components/BadgesEnhanced';
import { AdSpace } from '../components/AdSpace';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';

const Emblemas = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileLayout>
        <BadgesEnhanced />
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection="emblemas" setActiveSection={() => {}} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <PageHeader 
            title="Emblemas Habbo"
            icon="/assets/1876__-6Ie.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          
          <AdSpace type="horizontal" className="mb-6" />
          
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
            <BadgesEnhanced />
          </div>
          
          <AdSpace type="wide" className="mt-6" />
        </main>
      </div>
    </div>
  );
};

export default Emblemas;