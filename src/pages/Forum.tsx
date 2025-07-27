import { Forum as ForumComponent } from '../components/Forum';
import { AdSpace } from '../components/AdSpace';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';

const Forum = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileLayout>
        <ForumComponent />
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection="forum" setActiveSection={() => {}} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <AdSpace type="wide" className="mb-6" />
          
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
            <ForumComponent />
          </div>
          
          <div className="flex gap-6 mt-6 justify-center">
            <AdSpace type="square" />
            <AdSpace type="vertical" className="hidden lg:block" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Forum;