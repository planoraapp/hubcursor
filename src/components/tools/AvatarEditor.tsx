import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  RotateCcw, 
  RotateCw, 
  Search,
  RefreshCw,
  Palette,
  Shirt
} from 'lucide-react';
import ClothingGrid from './ClothingGrid';
import { PuhekuplaClothingItem } from '@/services/puhekuplaService';
import AvatarEditorWithTemplarios from './AvatarEditorWithTemplarios';

interface AvatarFigure {
  hr: string;
  hd: string;
  ch: string;
  lg: string;
  sh: string;
  ha: string;
  he: string;
  ea: string;
  fa: string;
  cp: string;
  cc: string;
  ca: string;
  wa: string;
  gesture: string;
  actions: string[];
  item: string;
  direction: number;
  headDirection: number;
  gender: 'M' | 'F' | 'U';
  size: string;
}

const AvatarEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templarios');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Editor Básico</TabsTrigger>
          <TabsTrigger value="templarios">HabboTemplarios (1.738 itens)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <div className="container mx-auto p-6 space-y-6">
            <div className="text-center">
              <h1 className="volter-font text-4xl font-bold text-[#8B4513] mb-2">
                🎨 Editor de Visuais Habbo
              </h1>
              <p className="text-lg text-gray-600">
                Crie e personalize seu avatar do Habbo com milhares de roupas disponíveis!
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500">
                  Editor básico em desenvolvimento. Use a aba HabboTemplarios para acessar os 1.738 itens extraídos!
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="templarios">
          <AvatarEditorWithTemplarios />
        </TabsContent>
      </Tabs>
    </div>
  );
};

  export default AvatarEditor;
