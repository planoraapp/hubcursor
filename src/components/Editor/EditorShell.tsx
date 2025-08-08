
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Database, Shield } from 'lucide-react';
import ViaJovemEditorRedesigned from '../ViaJovemEditor/ViaJovemEditorRedesigned';
import PuhekuplaEditor from '../PuhekuplaEditor/PuhekuplaEditor';
import HabboWidgetsEditor from '../HabboEditor/HabboWidgetsEditor';
import OfficialHabboEditor from '../HabboEditor/OfficialHabboEditor';

const EditorShell = () => {
  const [activeEditor, setActiveEditor] = useState('official');

  return (
    <div className="w-full h-full">
      <Tabs value={activeEditor} onValueChange={setActiveEditor} className="w-full h-full flex flex-col">
        <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="official" className="text-xs px-2 py-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Shield className="w-4 h-4" />
                  <Badge variant="secondary" className="text-[10px] px-1">NOVO</Badge>
                </div>
                <div className="text-[10px] font-medium">Editor Oficial</div>
                <div className="text-[9px] text-gray-600">Dados 100% oficiais</div>
              </div>
            </TabsTrigger>
            <TabsTrigger value="viajovem" className="text-xs px-2 py-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Database className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-medium">ViaJovem</div>
                <div className="text-[9px] text-gray-600">Flash Assets</div>
              </div>
            </TabsTrigger>
            <TabsTrigger value="puhekupla" className="text-xs px-2 py-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-medium">Puhekupla</div>
                <div className="text-[9px] text-gray-600">HabboEmotion</div>
              </div>
            </TabsTrigger>
            <TabsTrigger value="widgets" className="text-xs px-2 py-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Database className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-medium">Widgets</div>
                <div className="text-[9px] text-gray-600">Unificado</div>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0">
          <TabsContent value="official" className="h-full m-0">
            <OfficialHabboEditor className="h-full" />
          </TabsContent>
          
          <TabsContent value="viajovem" className="h-full m-0">
            <ViaJovemEditorRedesigned className="h-full" />
          </TabsContent>
          
          <TabsContent value="puhekupla" className="h-full m-0">
            <PuhekuplaEditor />
          </TabsContent>
          
          <TabsContent value="widgets" className="h-full m-0">
            <HabboWidgetsEditor />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default EditorShell;
