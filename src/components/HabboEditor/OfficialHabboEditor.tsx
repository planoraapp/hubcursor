
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import FlashAssetsTab from './FlashAssetsTab';
import ViaJovemEditorRedesigned from '../ViaJovemEditor/ViaJovemEditorRedesigned';

interface OfficialHabboEditorProps {
  className?: string;
}

const OfficialHabboEditor = ({ className = '' }: OfficialHabboEditorProps) => {
  const [figureString, setFigureString] = useState('hd-180-1.hr-100-61.ch-210-66.lg-270-82.sh-305-62');

  return (
    <div className={`${className} w-full h-full`}>
      <Tabs defaultValue="flash" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="flash" className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <div className="text-left">
              <div className="text-sm font-semibold">Flash Assets</div>
              <div className="text-xs text-gray-500">Database</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="viajovem" className="flex items-center gap-2">
            <span className="text-lg">🎨</span>
            <div className="text-left">
              <div className="text-sm font-semibold">ViaJovem</div>
              <div className="text-xs text-gray-500">Redesigned</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="oficial" className="flex items-center gap-2">
            <span className="text-lg">🏢</span>
            <div className="text-left">
              <div className="text-sm font-semibold">Habbo Oficial</div>
              <div className="text-xs text-gray-500">Soon</div>
            </div>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="flash" className="h-full mt-0">
            <Card className="h-full">
              <CardContent className="p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Flash Assets - Database</h3>
                    <p className="text-sm text-gray-600">Roupas carregadas da base de dados Flash Assets</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    ✅ Funcional
                  </Badge>
                </div>
                
                <FlashAssetsTab 
                  figureString={figureString}
                  onFigureChange={setFigureString}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="viajovem" className="h-full mt-0">
            <Card className="h-full">
              <CardContent className="p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">ViaJovem Editor Redesigned</h3>
                    <p className="text-sm text-gray-600">Interface redesenhada com estética ViaJovem</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                    🚧 Em Desenvolvimento
                  </Badge>
                </div>
                
                <ViaJovemEditorRedesigned />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="oficial" className="h-full mt-0">
            <Card className="h-full">
              <CardContent className="p-4 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Habbo Oficial</h3>
                  <p className="text-gray-500 mb-4">
                    Editor com roupas oficiais do Habbo será implementado em breve
                  </p>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                    🚀 Em Breve
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default OfficialHabboEditor;
