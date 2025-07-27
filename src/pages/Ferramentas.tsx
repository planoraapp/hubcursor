import { Tools } from '../components/Tools';
import { AdSpace } from '../components/AdSpace';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';

const Ferramentas = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileLayout>
        <Tools />
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection="ferramentas" setActiveSection={() => {}} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">Ferramentas</h1>
            <PageHeader 
              title="Ferramentas"
              icon="/assets/ferramentas.png"
              backgroundImage="/assets/1360__-3C7.png"
            />
          </div>
          
          <AdSpace type="horizontal" className="mb-6" />
          
          <div className="flex gap-6">
            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
              <Tools />
            </div>
            <div className="flex flex-col gap-4">
              <AdSpace type="medium" />
              <AdSpace type="banner" />
            </div>
          </div>
          
          <AdSpace type="wide" className="mt-6" />
        </main>
      </div>
    </div>
  );
};

export default Ferramentas;