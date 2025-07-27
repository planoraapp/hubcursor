import { CatalogEnhanced } from '../components/CatalogEnhanced';
import { AdSpace } from '../components/AdSpace';
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
          <AdSpace type="horizontal" className="mb-6" />
          
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
            <CatalogEnhanced />
          </div>
          
          <div className="flex gap-6 mt-6 justify-center">
            <AdSpace type="square" />
            <AdSpace type="square" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Catalogo;