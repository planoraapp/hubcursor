import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OfficialHabboEditor from '@/components/PuhekuplaEditor/OfficialHabboEditor';
import ViaJovemEditorRedesigned from '@/components/ViaJovemEditor/ViaJovemEditorRedesigned';
import HabboWidgetsEditor from '@/components/HabboEditor/HabboWidgetsEditor';

interface EditorShellProps {
  className?: string;
}

const EditorShell = ({ className = '' }: EditorShellProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Tabs defaultValue="oficial" className="w-full h-full">
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
