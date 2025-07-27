import { CatalogEnhanced } from '../components/CatalogEnhanced';
import { AdSpace } from '../components/AdSpace';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';

const Catalogo = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileLayout>
        <CatalogEnhanced />
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection="catalogo" setActiveSection={() => {}} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <PageHeader 
            title="Catálogo Habbo"
            icon="/assets/Image 2422.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          
          <AdSpace type="horizontal" className="mb-6" />
          
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
            <CatalogEnhanced />
          </div>
          
          <AdSpace type="wide" className="mt-6" />
        </main>
      </div>
    </div>
  );
};

export default Catalogo;