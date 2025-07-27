import { Tools } from '../components/Tools';
import { AdSpace } from '../components/AdSpace';
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
          <div className="flex gap-6 mb-6 justify-center">
            <AdSpace type="square" />
            <AdSpace type="square" />
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
            <Tools />
          </div>
          
          <AdSpace type="horizontal" className="mt-6" />
        </main>
      </div>
    </div>
  );
};

export default Ferramentas;