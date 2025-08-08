import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OfficialHabboEditor from '@/components/PuhekuplaEditor/OfficialHabboEditor';
import ViaJovemEditorRedesigned from '@/components/ViaJovemEditor/ViaJovemEditorRedesigned';
import HabboWidgetsEditor from '@/components/HabboEditor/HabboWidgetsEditor';
import { useEffect, useState } from 'react';

interface EditorShellProps {
  className?: string;
}

const EditorShell = ({ className = '' }: EditorShellProps) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qp = params.get('tab');
      const stored = localStorage.getItem('editor.activeTab');
      return (qp || stored || 'widgets');
    } catch {
      return 'widgets';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('editor.activeTab', activeTab);
    } catch {}
  }, [activeTab]);

  return (
    <div className={`w-full h-full ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="oficial" className="habbo-text">Oficial</TabsTrigger>
          <TabsTrigger value="viajovem" className="habbo-text">ViaJovem</TabsTrigger>
          <TabsTrigger value="widgets" className="habbo-text">Widgets</TabsTrigger>
        </TabsList>

        <TabsContent value="oficial" className="h-full">
          <OfficialHabboEditor />
        </TabsContent>

        <TabsContent value="viajovem" className="h-full">
          <ViaJovemEditorRedesigned />
        </TabsContent>

        <TabsContent value="widgets" className="h-full">
          <HabboWidgetsEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditorShell;
