
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import EditorShell from '../components/Editor/EditorShell';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import HabboTemplariosEditor from '../components/HabboEditor/HabboTemplariosEditor';

const Editor = () => {
  const [activeSection, setActiveSection] = useState('editor');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'original' | 'templarios'>('original');
  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Editor de Avatar - HabboHub"
            icon="/assets/editorvisuais.png"
          />
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 shadow-lg overflow-hidden p-3">
            <div className="flex gap-2 mb-3">
              <button className={`px-3 py-2 rounded border ${activeTab === 'original' ? 'bg-white/70' : 'bg-white/30'}`} onClick={() => setActiveTab('original')}>Editor Atual</button>
              <button className={`px-3 py-2 rounded border ${activeTab === 'templarios' ? 'bg-white/70' : 'bg-white/30'}`} onClick={() => setActiveTab('templarios')}>HabboTemplarios</button>
            </div>
            {activeTab === 'original' ? (
              <EditorShell />
            ) : (
              <HabboTemplariosEditor />
            )}
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <PageHeader 
            title="🎨 Editor de Avatar - HabboHub"
            icon="/assets/editorvisuais.png"
          />
          <div className="bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-sm rounded-lg border-2 border-purple-200 shadow-xl p-4 md:p-6 h-full overflow-hidden">
            <div className="flex gap-2 mb-4">
              <button className={`px-3 py-2 rounded border ${activeTab === 'original' ? 'bg-white/70' : 'bg-white/30'}`} onClick={() => setActiveTab('original')}>Editor Atual</button>
              <button className={`px-3 py-2 rounded border ${activeTab === 'templarios' ? 'bg-white/70' : 'bg-white/30'}`} onClick={() => setActiveTab('templarios')}>HabboTemplarios</button>
            </div>
            {activeTab === 'original' ? (
              <EditorShell />
            ) : (
              <HabboTemplariosEditor />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Editor;
