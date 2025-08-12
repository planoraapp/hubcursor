
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Palette, Sparkles, User, Download } from 'lucide-react';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileLayout from '@/layouts/MobileLayout';
import { UnifiedClothingItem } from '@/hooks/useUnifiedClothingAPI';
import { HybridClothingSelectorV3 } from '@/components/HabboEditor/HybridClothingSelectorV3';
import PuhekuplaEditor from '@/components/PuhekuplaEditor/PuhekuplaEditor';

const Editor: React.FC = () => {
  const [selectedClothingItem, setSelectedClothingItem] = useState<UnifiedClothingItem | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const handleClothingItemSelected = (item: UnifiedClothingItem) => {
    setSelectedClothingItem(item);
    console.log('Selected clothing item:', item);
  };

  React.useEffect(() => {
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
        <div className="container mx-auto py-10">
          <Card className="habbo-panel">
            <CardHeader className="habbo-header">
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5" />
                Editor de Visual Híbrido
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  <User className="w-3 h-3 mr-1" />
                  Beta
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="clothing" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="clothing" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Roupas
                  </TabsTrigger>
                  <TabsTrigger value="puhekupla" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Puhekupla
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="clothing" className="mt-4">
                  <HybridClothingSelectorV3 onItemSelect={handleClothingItemSelected} />
                </TabsContent>
                <TabsContent value="puhekupla" className="mt-4">
                  <PuhekuplaEditor />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection="editor" setActiveSection={() => {}} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="container mx-auto py-10">
            <Card className="habbo-panel">
              <CardHeader className="habbo-header">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5" />
                  Editor de Visual Híbrido
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    <User className="w-3 h-3 mr-1" />
                    Beta
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="clothing" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="clothing" className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Roupas
                    </TabsTrigger>
                    <TabsTrigger value="puhekupla" className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Puhekupla
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="clothing" className="mt-4">
                    <HybridClothingSelectorV3 onItemSelect={handleClothingItemSelected} />
                  </TabsContent>
                  <TabsContent value="puhekupla" className="mt-4">
                    <PuhekuplaEditor />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Editor;
